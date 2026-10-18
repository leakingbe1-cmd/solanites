import { beforeAll, describe, expect, it } from "vitest";
import type { TrackedHolderView } from "@/shared/trackedHolder";
import { keypairFromSeed } from "../fixtures/keys";
import { ConfigError } from "../config";
import { buildRuntime, getRuntime } from "../runtime";

/** Route handlers wired to the local fixture runtime (in-memory database + fixture chain). */
beforeAll(() => {
  process.env.SOLANITES_FIXTURES = "1";
  process.env.CRON_SECRET = "cron-secret-for-tests";
  process.env.SOLANITES_WEBHOOK_SECRET = "webhook-secret-for-tests";
  delete process.env.SOLANITES_LAUNCH_AT;
});

const req = (url: string, init?: RequestInit) => new Request(`http://localhost:3000${url}`, init);

describe("Workflow A routes: no wallet connection anywhere", () => {
  it("GET /api/holders/:address returns tracked eggs for a public address, labelled as fixture data", async () => {
    const { GET } = await import("@/app/api/holders/[address]/route");
    const a = keypairFromSeed(1002).address; // 3,500,000 fixture holder
    const res = await GET(req(`/api/holders/${a}`), { params: Promise.resolve({ address: a }) });
    expect(res.status).toBe(200);
    const v = (await res.json()) as TrackedHolderView;
    expect(v).toMatchObject({ source: "fixture", tracked: true, counts: { earned: 3 } });
    expect(v.eggs.map((e) => e.incubationMs)).toEqual([5 * 60_000, 6 * 3_600_000, 24 * 3_600_000]);
    expect(v.eggs.every((e) => e.speciesId === null)).toBe(true); // sealed until hatch
  });

  it("the fixture transfer earned nothing for the receiving wallet", async () => {
    const { GET } = await import("@/app/api/holders/[address]/route");
    const a = keypairFromSeed(1006).address;
    const v = (await (await GET(req(`/api/holders/${a}`), { params: Promise.resolve({ address: a }) })).json()) as TrackedHolderView;
    expect(v.holdings.amount).toBe("1000000");
    expect(v.counts.earned).toBe(0);
  });

  it("rejects malformed addresses", async () => {
    const { GET } = await import("@/app/api/holders/[address]/route");
    const res = await GET(req(`/api/holders/0xabc`), { params: Promise.resolve({ address: "0xabc" }) });
    expect(res.status).toBe(400);
  });

  it("POST /api/eggs/:id/hatch refuses an egg that is still incubating, by the server clock", async () => {
    const { POST } = await import("@/app/api/eggs/[id]/hatch/route");
    const rt = await getRuntime();
    const egg = (await rt.tracker.holderView(keypairFromSeed(1003).address)).eggs[0];
    const res = await POST(req(`/api/eggs/${egg.id}/hatch`, { method: "POST" }), { params: Promise.resolve({ id: egg.id }) });
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe("NOT_READY");
  });
});

describe("scheduler and webhook endpoints", () => {
  it("require their secrets", async () => {
    const cron = await import("@/app/api/cron/sync/route");
    expect((await cron.GET(req("/api/cron/sync"))).status).toBe(401);
    expect((await cron.GET(req("/api/cron/sync", { headers: { authorization: "Bearer wrong" } }))).status).toBe(401);
    const ok = await cron.GET(req("/api/cron/sync", { headers: { authorization: "Bearer cron-secret-for-tests" } }));
    expect(ok.status).toBe(200);

    const hook = await import("@/app/api/webhooks/solana/route");
    expect((await hook.POST(req("/api/webhooks/solana", { method: "POST", body: "[]" }))).status).toBe(401);
    const res = await hook.POST(req("/api/webhooks/solana", { method: "POST", headers: { authorization: "webhook-secret-for-tests" }, body: JSON.stringify([{ signature: "not-a-signature" }]) }));
    expect(await res.json()).toMatchObject({ processed: 0 });
  });
});

describe("Workflow B routes", () => {
  it("claims stay unscheduled without a configured launch time, and nonces are refused", async () => {
    const status = await import("@/app/api/claims/status/route");
    expect(await (await status.GET()).json()).toMatchObject({ launchAt: null, open: false, policyConfigured: false });
    const nonce = await import("@/app/api/claims/nonce/route");
    const res = await nonce.POST(req("/api/claims/nonce", { method: "POST", body: JSON.stringify({ address: keypairFromSeed(1).address }) }));
    expect(res.status).toBe(403);
  });

  it("refuses cross-site POSTs", async () => {
    const nonce = await import("@/app/api/claims/nonce/route");
    const res = await nonce.POST(req("/api/claims/nonce", { method: "POST", headers: { origin: "https://evil.example", host: "localhost:3000" }, body: "{}" }));
    expect(res.status).toBe(403);
  });
});

describe("runtime safety", () => {
  it("refuses fixture mode in production", async () => {
    await expect(buildRuntime({ SOLANITES_FIXTURES: "1", NODE_ENV: "production" })).rejects.toBeInstanceOf(ConfigError);
  });

  it("needs a database, mint and RPC for real tracking", async () => {
    await expect(buildRuntime({})).rejects.toMatchObject({ missing: ["DATABASE_URL"] });
    await expect(buildRuntime({ DATABASE_URL: "postgres://localhost/x" })).rejects.toMatchObject({ missing: ["SOLANITES_MINT", "SOLANA_RPC_URL"] });
  });
});
