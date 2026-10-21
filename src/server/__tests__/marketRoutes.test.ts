import { beforeAll, describe, expect, it } from "vitest";
import type { MarketSnapshot } from "@/lib/market/types";
import { keypairFromSeed } from "../fixtures/keys";
import { getRuntime } from "../runtime";

/** Market routes on the local fixture runtime: in-memory database, sample prices labelled as such. */
beforeAll(() => {
  process.env.SOLANITES_FIXTURES = "1";
  process.env.CRON_SECRET = "cron-secret-for-tests";
  delete process.env.MASSIVE_API_KEY;
  delete process.env.STUDIO_BASIC_AUTH;
  delete process.env.DEVELOPER_MODE;
});

const req = (url: string, init?: RequestInit) => new Request(`http://localhost:3000${url}`, init);
const params = (speciesId: string) => ({ params: Promise.resolve({ speciesId }) });

describe("market routes", () => {
  it("the scheduled refresh needs the cron secret, then records the latest session", async () => {
    const { GET } = await import("@/app/api/cron/market/route");
    expect((await GET(req("/api/cron/market"))).status).toBe(401);
    expect((await GET(req("/api/cron/market", { headers: { authorization: "Bearer wrong" } }))).status).toBe(401);
    const res = await GET(req("/api/cron/market", { headers: { authorization: "Bearer cron-secret-for-tests" } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionsRecorded.length).toBeGreaterThan(0);
  });

  it("a public species returns its stock, labelled as sample data in fixture mode", async () => {
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    const res = await GET(req("/api/market/pyraurum?range=1M"), params("pyraurum"));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toMatch(/public/);
    const snap = (await res.json()) as MarketSnapshot;
    expect(snap.stock).toMatchObject({ ticker: "AMD", exchange: "Nasdaq" });
    expect(snap.status).toBe("sample");
    expect(snap.statusDetail).toMatch(/not real market prices/);
    expect(snap.quote?.price).toBeGreaterThan(0);
    expect(snap.growth?.window.length).toBeGreaterThan(0);
  });

  it("rejects unknown ranges", async () => {
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    expect((await GET(req("/api/market/pyraurum?range=5Y"), params("pyraurum"))).status).toBe(400);
  });

  it("Mythic and Secret species answer like any other species; unknown ids are 404", async () => {
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    expect((await GET(req("/api/market/nothing"), params("nothing"))).status).toBe(404);
    const res = await GET(req("/api/market/astravex"), params("astravex"));
    expect(res.status).toBe(200);
    expect(((await res.json()) as MarketSnapshot).stock.ticker).toBe("GOOGL");
  });

  const STUDIO = "owner:correct-horse-battery-staple-test";
  const basic = (v: string) => ({ authorization: `Basic ${btoa(v)}` });

  it("Developer Mode market diagnostics: owner credentials see all 28 species, read-only", async () => {
    const { GET } = await import("@/app/studio/dev/market/route");
    process.env.STUDIO_BASIC_AUTH = STUDIO;
    try {
      const res = await GET(req("/studio/dev/market", { headers: basic(STUDIO) }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.links).toHaveLength(28);
      expect(body.links.map((l: { ticker: string }) => l.ticker)).toContain("COIN");
      expect(body.links.find((l: { speciesId: string }) => l.speciesId === "genesis")).toMatchObject({ name: "GENESIS", rarity: "secret" });
      const sim = await (await GET(req("/studio/dev/market?simulate=2.5,-1.8", { headers: basic(STUDIO) }))).json();
      expect(sim.entries.map((e: { points: number }) => e.points)).toEqual([10, -7.2]);
      expect(sim.vigour.value).toBe(52.8);
    } finally {
      delete process.env.STUDIO_BASIC_AUTH;
    }
  });

  it("Developer Mode market diagnostics reuse the studio gate: 404 when off or unconfigured, 401 for wrong credentials", async () => {
    const { GET } = await import("@/app/studio/dev/market/route");
    // No secret configured: invisible, even in fixture mode.
    expect((await GET(req("/studio/dev/market?simulate=1"))).status).toBe(404);
    process.env.STUDIO_BASIC_AUTH = STUDIO;
    try {
      expect((await GET(req("/studio/dev/market?simulate=1"))).status).toBe(401);
      expect((await GET(req("/studio/dev/market?simulate=1", { headers: basic("owner:wrong-password-wrong-password") }))).status).toBe(401);
      expect((await GET(req("/studio/dev/market?simulate=1", { headers: { authorization: "Bearer anything" } }))).status).toBe(401);
      process.env.DEVELOPER_MODE = "off";
      expect((await GET(req("/studio/dev/market?simulate=1", { headers: basic(STUDIO) }))).status).toBe(404);
    } finally {
      delete process.env.STUDIO_BASIC_AUTH;
      delete process.env.DEVELOPER_MODE;
    }
  });
});

describe("market runtime is off by default outside local sample mode", () => {
  it("never opens or migrates a database without MARKET_DATA_ENABLED=1, even with DATABASE_URL set", async () => {
    const { buildMarketRuntime } = await import("@/server/market/runtime");
    const { ConfigError } = await import("@/server/config");
    // An unreachable URL: if the runtime tried to connect or migrate, this would fail differently.
    const env = { NODE_ENV: "production", DATABASE_URL: "postgres://nobody:none@127.0.0.1:1/none" };
    await expect(buildMarketRuntime(env)).rejects.toBeInstanceOf(ConfigError);
    await expect(buildMarketRuntime({ ...env, MARKET_DATA_ENABLED: "0" })).rejects.toBeInstanceOf(ConfigError);
  });
});
