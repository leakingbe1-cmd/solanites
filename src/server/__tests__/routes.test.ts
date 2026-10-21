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
    // Fast track: the first five eggs hatch in a minute and grow a stage a minute.
    expect(v.eggs.map((e) => e.incubationMs)).toEqual([1 * 60_000, 1 * 60_000, 1 * 60_000]);
    expect(v.eggs.map((e) => e.maturityMs)).toEqual([1 * 60_000, 1 * 60_000, 1 * 60_000]);
    expect(v.fastTrack).toMatchObject({ total: 5, issued: 3, used: 0, remaining: 5, complete: false }); // none hatched yet
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

  it("demo data can never reach real tracking: the demo wallet address is refused and unknown eggs can't be hatched", async () => {
    const { demoWallet } = await import("@/services/wallet/demoWallet");
    const demo = (await demoWallet.connect()).address;
    const { GET } = await import("@/app/api/holders/[address]/route");
    expect((await GET(req(`/api/holders/${demo}`), { params: Promise.resolve({ address: demo }) })).status).toBe(400);
    const { POST } = await import("@/app/api/eggs/[id]/hatch/route");
    const fake = `egg_${demo}_1`;
    const res = await POST(req(`/api/eggs/${fake}/hatch`, { method: "POST" }), { params: Promise.resolve({ id: fake }) });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("POST /api/eggs/:id/hatch ignores any species, rarity or seed the client sends and returns the stored result", async () => {
    const { POST } = await import("@/app/api/eggs/[id]/hatch/route");
    const rt = await getRuntime();
    const owner = keypairFromSeed(1003).address; // 10,000,000 fixture holder
    const egg = (await rt.tracker.holderView(owner)).eggs[2];
    // Make this test egg ready on the server (test database only).
    await rt.db.query(`UPDATE eggs SET incubation_started_ms = 0, ready_ms = 0 WHERE id = $1`, [egg.id]);
    const stored = (await rt.db.query<{ species_id: string }>(`SELECT species_id FROM eggs WHERE id = $1`, [egg.id])).rows[0].species_id;
    const wanted = stored === "genesis" ? "nullborn" : "genesis";
    const body = JSON.stringify({ speciesId: wanted, rarity: "secret", seed: 1 });
    const url = `/api/eggs/${egg.id}/hatch?speciesId=${wanted}&rarity=secret&seed=1`;
    for (let i = 0; i < 2; i++) {
      const res = await POST(req(url, { method: "POST", body, headers: { "content-type": "application/json", origin: "http://localhost:3000" } }), { params: Promise.resolve({ id: egg.id }) });
      expect(res.status).toBe(200);
      expect((await res.json()).speciesId).toBe(stored);
    }
    expect((await rt.db.query<{ species_id: string }>(`SELECT species_id FROM eggs WHERE id = $1`, [egg.id])).rows[0].species_id).toBe(stored);
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

describe("GET /api/home-stats", () => {
  it("serves real fixture holders and eggs, an honest unavailable market cap, and a shared CDN cache", async () => {
    const { GET } = await import("@/app/api/home-stats/route");
    const res = await GET();
    expect(res.headers.get("cache-control")).toContain("s-maxage=30");
    const b = await res.json();
    expect(b.holders.status).toBe("live");
    expect(b.holders.value).toBeGreaterThan(0);
    expect(b.eggs.status).toBe("live");
    expect(b.eggs.value).toBeGreaterThan(0);
    expect(b.marketCap).toMatchObject({ value: null, status: "unavailable" });
  });
});

describe("scheduler and webhook endpoints", () => {
  it("require their secrets", async () => {
    const cron = await import("@/app/api/cron/sync/route");
    expect((await cron.GET(req("/api/cron/sync"))).status).toBe(401);
    expect((await cron.GET(req("/api/cron/sync", { headers: { authorization: "Bearer wrong" } }))).status).toBe(401);
    const ok = await cron.GET(req("/api/cron/sync", { headers: { authorization: "Bearer cron-secret-for-tests" } }));
    expect(ok.status).toBe(200);
    // Vercel Preview (behind Deployment Protection, no Vercel Cron) lets the owner run a pass from the browser; Production never does.
    try {
      process.env.VERCEL_ENV = "preview";
      expect((await cron.GET(req("/api/cron/sync"))).status).toBe(200);
      process.env.VERCEL_ENV = "production";
      expect((await cron.GET(req("/api/cron/sync"))).status).toBe(401);
    } finally {
      delete process.env.VERCEL_ENV;
    }

    const hook = await import("@/app/api/webhooks/solana/route");
    expect((await hook.POST(req("/api/webhooks/solana", { method: "POST", body: "[]" }))).status).toBe(401);
    const res = await hook.POST(req("/api/webhooks/solana", { method: "POST", headers: { authorization: "webhook-secret-for-tests" }, body: JSON.stringify([{ signature: "not-a-signature" }]) }));
    expect(await res.json()).toMatchObject({ processed: 0 });
  });
});

describe("Workflow B routes", () => {
  it("claims stay unscheduled without a configured launch time, and nonces are refused", async () => {
    const status = await import("@/app/api/claims/status/route");
    expect(await (await status.GET()).json()).toMatchObject({ serviceReady: true, launchAt: null, open: false, policyConfigured: false });
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

describe("operations, demo isolation and request limits", () => {
  it("GET /api/health is public but reveals only status; details need the scheduler secret", async () => {
    const { GET } = await import("@/app/api/health/route");
    const pub = await (await GET(req("/api/health"))).json();
    expect(Object.keys(pub).sort()).toEqual(["holders", "lastSuccessfulSyncAt", "source", "status"]);
    expect(pub.holders).toBeTypeOf("number");
    expect(pub.source).toBe("fixture");
    const detailed = await (await GET(req("/api/health", { headers: { authorization: "Bearer cron-secret-for-tests" } }))).json();
    expect(detailed.settingsPresent).toMatchObject({ cronSecret: true, webhookSecret: true });
    expect(JSON.stringify(detailed)).not.toContain("cron-secret-for-tests");
  });

  it("a balance supplied by the browser is ignored: only the server's verified data counts", async () => {
    const { GET } = await import("@/app/api/holders/[address]/route");
    const a = keypairFromSeed(1004).address; // 999,999 fixture holder: no eggs
    const plain = (await (await GET(req(`/api/holders/${a}`), { params: Promise.resolve({ address: a }) })).json()) as TrackedHolderView;
    const spoofed = (await (await GET(req(`/api/holders/${a}?balance=999999999999&eggs=50`, { headers: { "x-balance": "999999999999" } }), { params: Promise.resolve({ address: a }) })).json()) as TrackedHolderView;
    expect(spoofed.holdings).toEqual(plain.holdings);
    expect(spoofed.counts.earned).toBe(0);
  });

  it("a duplicated webhook delivery is applied once", async () => {
    const rt = await getRuntime();
    const chain = rt.fixtureChain!;
    const sig = chain.transfer(keypairFromSeed(1003).address, keypairFromSeed(1007).address, chain.tokens(1));
    const hook = await import("@/app/api/webhooks/solana/route");
    const deliver = () => hook.POST(req("/api/webhooks/solana", { method: "POST", headers: { authorization: "webhook-secret-for-tests" }, body: JSON.stringify([{ signature: sig }]) }));
    expect(await (await deliver()).json()).toMatchObject({ processed: 1 });
    expect(await (await deliver()).json()).toMatchObject({ processed: 0 });
  });

  it("rejects oversized request bodies", async () => {
    const hook = await import("@/app/api/webhooks/solana/route");
    const big = JSON.stringify({ signatures: ["x".repeat(1_100_000)] });
    const res = await hook.POST(req("/api/webhooks/solana", { method: "POST", headers: { authorization: "webhook-secret-for-tests" }, body: big }));
    expect(res.status).toBe(413);
  });
});

describe("Mythic and Secret species through the public API", () => {
  it("an egg holding a Mythic species is named like any other, before and after it hatches", async () => {
    const holders = await import("@/app/api/holders/[address]/route");
    const { POST } = await import("@/app/api/eggs/[id]/hatch/route");
    const rt = await getRuntime();
    const owner = keypairFromSeed(1002).address; // 3,500,000 fixture holder (3 eggs)
    const egg = (await rt.tracker.holderView(owner)).eggs[0];
    // Test database only: give this egg a Mythic species and make it stir, then ready.
    await rt.db.query(`UPDATE eggs SET species_id = 'orbelith', incubation_started_ms = 0, ready_ms = $2, incubation_ms = $2 WHERE id = $1`, [egg.id, Date.now() + 60_000]);
    const view = async () => (await (await holders.GET(req(`/api/holders/${owner}`), { params: Promise.resolve({ address: owner }) })).json()) as TrackedHolderView;

    const before = await view();
    expect(before.eggs.find((e) => e.id === egg.id)?.speciesId).toBe("orbelith");

    await rt.db.query(`UPDATE eggs SET ready_ms = 0, incubation_ms = 1 WHERE id = $1`, [egg.id]);
    const hatched = await (await POST(req(`/api/eggs/${egg.id}/hatch`, { method: "POST" }), { params: Promise.resolve({ id: egg.id }) })).json();
    expect(hatched.speciesId).toBe("orbelith");
    expect(hatched.classified).toBeUndefined();

    const after = await view();
    expect(after.eggs.find((e) => e.id === egg.id)?.speciesId).toBe("orbelith");
  });
});
