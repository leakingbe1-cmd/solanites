import { beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import type { WalletLookupResult } from "@/shared/walletLookup";
import { launchIsPublic, publicWalletLookup } from "../disclosure";

/** Prelaunch disclosure: launch time and mint stay out of public responses until the launch is public. */
const LAUNCH = Date.parse("2031-01-01T12:00:00Z");

beforeAll(() => {
  process.env.SOLANITES_FIXTURES = "1";
  process.env.SOLANITES_LAUNCH_AT = new Date(LAUNCH).toISOString();
  delete process.env.SOLANITES_LAUNCH_PUBLIC;
  delete process.env.CRON_SECRET;
  delete process.env.SOLANITES_WEBHOOK_SECRET;
  delete process.env.STUDIO_BASIC_AUTH;
});

const req = (url: string, init?: RequestInit) => new Request(`http://localhost:3000${url}`, init);

describe("launch disclosure", () => {
  it("is private before the launch time and public after it, or when announced", () => {
    const env = { SOLANITES_LAUNCH_AT: new Date(LAUNCH).toISOString() };
    expect(launchIsPublic(env, LAUNCH - 1)).toBe(false);
    expect(launchIsPublic(env, LAUNCH)).toBe(true);
    expect(launchIsPublic({ ...env, SOLANITES_LAUNCH_PUBLIC: "1" }, LAUNCH - 1)).toBe(true);
    expect(launchIsPublic({}, LAUNCH)).toBe(false);
  });

  it("GET /api/claims/status hides a configured future launch time until it is announced", async () => {
    const status = await import("@/app/api/claims/status/route");
    const hidden = await (await status.GET()).json();
    expect(hidden).toMatchObject({ launchAt: null, opensAt: null, open: false });
    expect(JSON.stringify(hidden)).not.toContain(String(LAUNCH));

    process.env.SOLANITES_LAUNCH_PUBLIC = "1";
    try {
      expect(await (await status.GET()).json()).toMatchObject({ launchAt: LAUNCH, opensAt: LAUNCH + 6 * 3_600_000, open: false });
    } finally {
      delete process.env.SOLANITES_LAUNCH_PUBLIC;
    }
  });

  it("wallet lookups withhold the mint and token accounts before launch", () => {
    const result = {
      address: "owner",
      token: { mint: "MintAddress111", tokenProgram: "spl-token", decimals: 6 },
      balance: { amountBase: "1", amount: "1", frozenAmount: "0", tokenAccounts: [{ address: "Ata111", amount: "1", state: "initialized" }] },
    } as unknown as WalletLookupResult;
    const hidden = publicWalletLookup(result, false);
    expect(hidden.token.mint).toBeNull();
    expect(hidden.balance.tokenAccounts).toEqual([]);
    expect(hidden.balance.amount).toBe("1");
    expect(JSON.stringify(hidden)).not.toMatch(/MintAddress111|Ata111/);
    expect(publicWalletLookup(result, true)).toBe(result);
  });
});

describe("unconfigured secrets look like wrong secrets", () => {
  it("cron and webhook answer 401 without saying what is missing", async () => {
    const cron = await import("@/app/api/cron/sync/route");
    const c = await cron.GET(req("/api/cron/sync", { headers: { authorization: "Bearer anything" } }));
    expect(c.status).toBe(401);
    expect(await c.text()).not.toMatch(/CRON_SECRET|not set/i);
    const hook = await import("@/app/api/webhooks/solana/route");
    const h = await hook.POST(req("/api/webhooks/solana", { method: "POST", body: "[]" }));
    expect(h.status).toBe(401);
    expect(await h.text()).not.toMatch(/WEBHOOK_SECRET|not set/i);
  });
});

describe("/studio access", () => {
  const studio = (auth?: string) => new NextRequest("http://localhost:3000/studio", auth ? { headers: { authorization: auth } } : undefined);
  const basic = (s: string) => `Basic ${Buffer.from(s).toString("base64")}`;

  it("is 404 everywhere when no credentials are configured, whatever other switches say", async () => {
    const { middleware } = await import("@/middleware");
    process.env.SOLANITES_STUDIO = "1";
    try {
      expect(middleware(studio()).status).toBe(404);
      expect(middleware(studio(basic("admin:guess"))).status).toBe(404);
    } finally {
      delete process.env.SOLANITES_STUDIO;
    }
  });

  it("needs the exact Basic credentials when configured", async () => {
    const { middleware, config } = await import("@/middleware");
    expect(config.matcher).toContain("/studio/:path*");
    process.env.STUDIO_BASIC_AUTH = "studio:correct-horse-battery-staple";
    try {
      const none = middleware(studio());
      expect(none.status).toBe(401);
      expect(none.headers.get("www-authenticate")).toMatch(/^Basic/);
      expect(middleware(studio(basic("studio:wrong-password-of-same-len"))).status).toBe(401);
      expect(middleware(studio("Basic !!!not-base64"))).toBeTruthy();
      const ok = middleware(studio(basic("studio:correct-horse-battery-staple")));
      expect(ok.status).toBe(200);
      expect(ok.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    } finally {
      delete process.env.STUDIO_BASIC_AUTH;
    }
  });

  it("refuses a weak configured credential", async () => {
    const { middleware } = await import("@/middleware");
    process.env.STUDIO_BASIC_AUTH = "a:b";
    try {
      expect(middleware(studio(basic("a:b"))).status).toBe(404);
    } finally {
      delete process.env.STUDIO_BASIC_AUTH;
    }
  });
});
