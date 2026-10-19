import { beforeAll, describe, expect, it } from "vitest";
import type { MarketSnapshot } from "@/lib/market/types";
import { keypairFromSeed } from "../fixtures/keys";
import { getRuntime } from "../runtime";

/** Market routes on the local fixture runtime: in-memory database, sample prices labelled as such. */
beforeAll(() => {
  process.env.SOLANITES_FIXTURES = "1";
  process.env.CRON_SECRET = "cron-secret-for-tests";
  delete process.env.MASSIVE_API_KEY;
  delete process.env.SOLANITES_DEV_TOKEN;
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

  it("classified species stay classified: same 404 as an unknown species, unless the owner has hatched one", async () => {
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    const unknown = await GET(req("/api/market/nothing"), params("nothing"));
    const hidden = await GET(req("/api/market/astravex"), params("astravex"));
    expect(unknown.status).toBe(404);
    expect(hidden.status).toBe(404);
    expect(await hidden.json()).toEqual(await unknown.json());

    const owner = keypairFromSeed(1003).address;
    expect((await GET(req(`/api/market/astravex?owner=${owner}`), params("astravex"))).status).toBe(404); // hasn't hatched one

    const rt = await getRuntime();
    await rt.db.query(
      `INSERT INTO eggs (id, owner, sequence, source, earned_ms, earned_slot, incubation_started_ms, incubation_ms, ready_ms, seed, species_id, hatched_ms)
       VALUES ('egg-market-test', $1, 900, 'fixture', 0, 0, 0, 0, 0, 1, 'astravex', 1)`,
      [owner],
    );
    const res = await GET(req(`/api/market/astravex?owner=${owner}`), params("astravex"));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(((await res.json()) as MarketSnapshot).stock.ticker).toBe("GOOGL");
    // Proving ownership of one classified species reveals nothing about another.
    expect((await GET(req(`/api/market/orbelith?owner=${owner}`), params("orbelith"))).status).toBe(404);
  });

  it("owner diagnostics: open in local fixture mode, covering all 28 species, and read-only", async () => {
    const { GET } = await import("@/app/api/dev/market/route");
    const res = await GET(req("/api/dev/market"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.links).toHaveLength(28);
    expect(body.links.map((l: { ticker: string }) => l.ticker)).toContain("COIN");
    const sim = await (await GET(req("/api/dev/market?simulate=2.5,-1.8"))).json();
    expect(sim.entries.map((e: { points: number }) => e.points)).toEqual([10, -7.2]);
    expect(sim.vigour.value).toBe(52.8);
  });

  it("owner diagnostics are invisible elsewhere without the dev token, and refuse a wrong or empty one", async () => {
    const { GET } = await import("@/app/api/dev/market/route");
    process.env.SOLANITES_FIXTURES = "0";
    try {
      expect((await GET(req("/api/dev/market?simulate=1"))).status).toBe(404);
      expect((await GET(req("/api/dev/market?simulate=1", { headers: { authorization: "Bearer " } }))).status).toBe(404);
      process.env.SOLANITES_DEV_TOKEN = "dev-token-for-tests";
      expect((await GET(req("/api/dev/market?simulate=1", { headers: { authorization: "Bearer nope" } }))).status).toBe(404);
      expect((await GET(req("/api/dev/market?simulate=1", { headers: { authorization: "Bearer dev-token-for-tests" } }))).status).toBe(200);
    } finally {
      process.env.SOLANITES_FIXTURES = "1";
      delete process.env.SOLANITES_DEV_TOKEN;
    }
  });
});
