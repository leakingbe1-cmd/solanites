import { existsSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { eggProgression } from "@/config/eggProgression";
import { stageAsset } from "@/lib/creatureAssets";
import { SPECIES } from "@/lib/species";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db, Sql } from "../db/types";
import { keypairFromSeed } from "../fixtures/keys";
import { createLedgerChain, programAddress } from "../fixtures/ledgerChain";
import { createSharedRateLimiter } from "../rateLimitShared";
import { createRpcClient, RpcUnavailableError } from "../solana/rpc";
import { TOKEN_2022_PROGRAM_ID } from "../solana/token";
import { createTracker } from "../tracker/service";

const MIN = 60_000;
const HOUR = 60 * MIN;
const W = (n: number) => keypairFromSeed(n).address;
const open: Db[] = [];
afterEach(async () => {
  while (open.length) await open.pop()!.close();
});

async function setup(opts: { program?: string; configMint?: string; wrapDb?: (db: Db) => Db } = {}) {
  const clock = { t: 1_900_000_000_000, now: () => clock.t, advance: (ms: number) => (clock.t += ms) };
  const chain = createLedgerChain({ now: clock.now, program: opts.program });
  const raw = await createPgliteDb();
  open.push(raw);
  await migrate(raw);
  const db = opts.wrapDb ? opts.wrapDb(raw) : raw;
  const pool = programAddress("pool");
  chain.mintTo(pool, chain.tokens(900_000_000));
  let seed = 7;
  const make = () =>
    createTracker({
      db,
      rpc: chain.rpc,
      config: { mint: opts.configMint ?? chain.mint, excludedOwners: new Set(), excludeOffCurveOwners: true, source: "fixture", maxSignaturesPerAccount: 500, progression: eggProgression },
      now: clock.now,
      randomSeed: () => seed++,
    });
  return { chain, db, raw, clock, pool, tracker: make(), make, buy: (o: string, n: number) => chain.transfer(pool, o, chain.tokens(n)) };
}

describe("token configuration", () => {
  it("tracks a Token-2022 mint (program detected from chain, not assumed)", async () => {
    const { tracker, buy } = await setup({ program: TOKEN_2022_PROGRAM_ID });
    buy(W(1), 2_000_000);
    expect((await tracker.runSync({ force: true })).status).toBe("ok");
    expect((await tracker.holderView(W(1))).counts.earned).toBe(2);
  });

  it("a wrong mint fails the sync and grants nothing", async () => {
    const { tracker, buy, db } = await setup({ configMint: W(999) });
    buy(W(2), 5_000_000);
    const r = await tracker.runSync({ force: true });
    expect(r.status).toBe("failed");
    expect(r.errors.join(" ")).toMatch(/does not exist/);
    // The view refuses to answer rather than guess decimals for an unverified mint, and no eggs exist.
    await expect(tracker.holderView(W(2))).rejects.toThrow(/does not exist/);
    expect((await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM eggs`)).rows[0].n).toBe(0);
  });

  it("reports on /health whether the on-chain supply matches the configured supply", async () => {
    const { tracker, buy } = await setup();
    buy(W(3), 1_000_000);
    await tracker.runSync({ force: true });
    const h = await tracker.health();
    expect(h).toMatchObject({ mintSupplyMatchesConfig: true, syncStale: false, trackedHolders: 1, lastRun: { status: "ok", failed: false } });
  });
});

describe("incubation and evolution boundaries (server clock only)", () => {
  it("eggs 2 and 3 become ready exactly 5 min and 15 min after they start, not a millisecond before", async () => {
    const { tracker, buy, clock } = await setup();
    const h = W(10);
    buy(h, 3_000_000);
    await tracker.runSync({ force: true });
    const [e1, e2, e3] = (await tracker.holderView(h)).eggs;
    for (const [egg, ms] of [
      [e2, 5 * MIN],
      [e3, 15 * MIN],
    ] as const) {
      expect(egg.readyAt - egg.incubationStartedAt).toBe(ms);
      clock.t = egg.readyAt - 1;
      expect((await tracker.holderView(h)).eggs.find((e) => e.id === egg.id)!.status).toBe("incubating");
      expect(await tracker.hatch(egg.id)).toMatchObject({ ok: false, code: "NOT_READY" });
      clock.t = egg.readyAt;
      expect((await tracker.holderView(h)).eggs.find((e) => e.id === egg.id)!.status).toBe("ready");
    }
    expect(e1.readyAt - e1.incubationStartedAt).toBe(1 * MIN);
  });

  it("the server decides growth and each evolution stage: grown 1 min after hatching, Evolved 30 min and Ascended 2 h after that", async () => {
    const { tracker, buy, clock } = await setup();
    const h = W(11);
    buy(h, 1_000_000);
    await tracker.runSync({ force: true });
    clock.advance(1 * MIN);
    const egg = (await tracker.holderView(h)).eggs[0];
    await tracker.hatch(egg.id);
    const hatchedAt = egg.readyAt;
    const at = async (ms: number) => {
      clock.t = hatchedAt + ms;
      return (await tracker.holderView(h)).eggs[0].evolution;
    };
    expect(await at(1 * MIN - 1)).toMatchObject({ stage: 0, label: "Eggling", phase: "growing", matured: false, toNextMs: 1 });
    expect(await at(1 * MIN)).toMatchObject({ stage: 1, label: "Hatchling", phase: "mature", matured: true, nextLabel: "Evolved" });
    expect(await at(31 * MIN - 1)).toMatchObject({ stage: 1, label: "Hatchling" });
    expect(await at(31 * MIN)).toMatchObject({ stage: 2, label: "Evolved", phase: "evolved" });
    expect(await at(121 * MIN - 1)).toMatchObject({ stage: 2, label: "Evolved" });
    expect(await at(121 * MIN)).toMatchObject({ stage: 3, label: "Ascended", phase: "ascended" });
    expect(await at(1 * MIN + 8 * HOUR)).toMatchObject({ stage: 3, label: "Ascended II" });
    // Repeated reads don't advance anything on their own.
    expect(await at(121 * MIN)).toMatchObject({ stage: 3, label: "Ascended" });
  });

  it("concurrent hatch requests reveal one outcome exactly once", async () => {
    const { tracker, make, buy, clock } = await setup();
    const h = W(12);
    buy(h, 1_000_000);
    await tracker.runSync({ force: true });
    clock.advance(5 * MIN);
    const id = (await tracker.holderView(h)).eggs[0].id;
    const results = await Promise.all([tracker, make(), make(), make(), make()].map((t) => t.hatch(id)));
    const ok = results.filter((r) => r.ok) as { ok: true; result: { speciesId: string; alreadyHatched: boolean } }[];
    expect(ok).toHaveLength(5);
    expect(new Set(ok.map((r) => r.result.speciesId)).size).toBe(1);
    expect(ok.filter((r) => !r.result.alreadyHatched)).toHaveLength(1);
  });
});

describe("idempotency and failure recovery", () => {
  const snapshot = async (db: Db) => ({
    eggs: (await db.query(`SELECT id, owner, sequence, incubation_started_ms, incubation_ms, ready_ms, species_id, hatched_ms FROM eggs ORDER BY id`)).rows,
    holders: (await db.query(`SELECT owner, balance_base, credit_base, eggs_earned FROM holders ORDER BY owner`)).rows,
    txs: (await db.query(`SELECT count(*)::int AS n FROM processed_transactions`)).rows,
  });

  it("repeated syncs with no chain changes produce identical records", async () => {
    const { tracker, buy, chain, db, clock } = await setup();
    buy(W(20), 3_500_000);
    buy(W(21), 1_000_000);
    chain.transfer(W(21), W(22), chain.tokens(1_000_000));
    await tracker.runSync({ force: true });
    const first = await snapshot(db);
    for (let i = 0; i < 3; i++) {
      clock.advance(MIN);
      await tracker.runSync({ force: true });
    }
    expect(await snapshot(db)).toEqual(first);
  });

  it("a database failure mid-award rolls back cleanly and the next sync recovers exactly", async () => {
    let failEggInsert = true;
    const wrap = (db: Db): Db => {
      const guard = (sql: Sql): Sql => ({
        query: (text, params) => {
          if (failEggInsert && text.includes("INSERT INTO eggs")) return Promise.reject(new Error("simulated database failure"));
          return sql.query(text, params);
        },
      });
      return { ...db, query: db.query.bind(db), tx: (fn) => db.tx((sql) => fn(guard(sql))), close: () => db.close() };
    };
    const { tracker, buy, db } = await setup({ wrapDb: wrap });
    const h = W(23);
    buy(h, 2_000_000);
    const r = await tracker.runSync({ force: true });
    expect(r.status).toBe("partial");
    expect(r.errors.join(" ")).toMatch(/simulated database failure/);
    expect((await tracker.health()).lastRun).toMatchObject({ status: "partial", failed: true });
    let v = await tracker.holderView(h);
    expect(v.counts.earned).toBe(0);
    expect(v.holdings.creditedAmount).toBe("0");
    failEggInsert = false;
    await tracker.runSync({ force: true });
    v = await tracker.holderView(h);
    expect(v.counts.earned).toBe(2);
    expect((await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM eggs`)).rows[0].n).toBe(2);
  });

  it("RPC rate limiting (HTTP 429) is retried with backoff, and a persistent 429 fails safely", async () => {
    let calls = 0;
    const ok = createRpcClient({
      url: "https://rpc.example",
      sleep: async () => {},
      fetch: (async () => {
        calls++;
        return calls < 3 ? new Response("", { status: 429 }) : Response.json({ jsonrpc: "2.0", id: 1, result: 42 });
      }) as typeof fetch,
    });
    expect(await ok.call("getSlot", [])).toBe(42);
    expect(calls).toBe(3);
    const down = createRpcClient({ url: "https://rpc.example", retries: 2, sleep: async () => {}, fetch: (async () => new Response("", { status: 429 })) as typeof fetch });
    await expect(down.call("getSlot", [])).rejects.toBeInstanceOf(RpcUnavailableError);
  });
});

describe("shared rate limiting", () => {
  it("counts across separate limiter instances (as on separate serverless instances) and stores no raw IPs", async () => {
    const db = await createPgliteDb();
    open.push(db);
    await migrate(db);
    const t = 1_000_000;
    const a = createSharedRateLimiter(db, () => t);
    const b = createSharedRateLimiter(db, () => t);
    expect((await a.take("x", "203.0.113.9", 2, 60_000)).allowed).toBe(true);
    expect((await b.take("x", "203.0.113.9", 2, 60_000)).allowed).toBe(true);
    const third = await a.take("x", "203.0.113.9", 2, 60_000);
    expect(third).toMatchObject({ allowed: false });
    expect(third.retryAfterMs).toBeGreaterThan(0);
    const keys = await db.query<{ key: string }>(`SELECT key FROM rate_limits`);
    expect(keys.rows.every((r) => !r.key.includes("203.0.113.9"))).toBe(true);
  });

  it("still limits (per instance) if the shared store is down", async () => {
    const broken = { query: () => Promise.reject(new Error("db down")), tx: () => Promise.reject(new Error("db down")), close: async () => {} } as unknown as Db;
    const l = createSharedRateLimiter(broken, () => 5);
    expect((await l.take("y", "k", 1, 60_000)).allowed).toBe(true);
    expect((await l.take("y", "k", 1, 60_000)).allowed).toBe(false);
  });
});

describe("artwork: painted where supplied, vector otherwise", () => {
  it("every species and stage renders either its existing painted file or its vector drawing, never a broken image", () => {
    for (const s of SPECIES) {
      for (const stage of [0, 1, 2, 3]) {
        const html = renderToString(createElement(CreatureArt, { species: s, stage, animated: false }));
        const asset = stageAsset(s.id, stage);
        if (asset) {
          expect(html, `${s.id} stage ${stage}`).toContain(`src="${asset.src}"`);
          for (const f of [asset.src, asset.thumb]) expect(existsSync(path.join(process.cwd(), "public", f)), `${f} exists`).toBe(true);
        } else {
          expect(html, `${s.id} stage ${stage}`).toContain("<svg");
          expect(html, `${s.id} stage ${stage}`).not.toContain("<img");
        }
      }
    }
  });
});
