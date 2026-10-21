import { afterEach, describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { eggProgression } from "@/config/eggProgression";
import { freshness, sourceBadge, STALE_AFTER_MS } from "@/lib/leaderboard";
import type { Leaderboard } from "@/shared/leaderboard";
import { ConfigError } from "../config";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { keypairFromSeed } from "../fixtures/keys";
import { createLedgerChain, programAddress } from "../fixtures/ledgerChain";
import { continuousHoldingMs, rankEvolved, rankHolders, rankRarest, type Keeper, type KeeperCreature } from "../leaderboard/rank";
import { createLeaderboard } from "../leaderboard/service";
import { createTracker } from "../tracker/service";

const MIN = 60_000;
const HOUR = 60 * MIN;
const W = (n: number) => keypairFromSeed(n).address;
const c = (speciesId: string, stage: number, hatchedAt = 0, readyAt = hatchedAt): KeeperCreature => ({ speciesId, stage, hatchedAt, readyAt });
const k = (address: string, creatures: KeeperCreature[], heldMs: number | null = null): Keeper => ({ address, creatures, heldMs });

describe("ranking rules", () => {
  it("Most Evolved: stage total, then best single stage, then earliest at that stage, then address", () => {
    const rows = rankEvolved([
      k("D", [c("mossling", 1), c("driftfin", 1), c("pallow", 1)]), // total 3, best 1
      k("C", [c("mossling", 3)]), // total 3, best 3
      k("B", [c("mossling", 2, 0, 500)]), // total 2, ready later
      k("A", [c("mossling", 2, 0, 100)]), // total 2, ready earlier
      k("E", [c("mossling", 2, 0, 100)]), // identical to A: address decides
      k("F", []), // nothing hatched: not ranked
    ]);
    expect(rows.map((r) => r.keeper)).toEqual(["C", "D", "A", "E", "B"]);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(rows[0]).toMatchObject({ stageSum: 3, bestStage: 3, creature: { speciesId: "mossling", stage: 3 } });
  });

  it("Rarest Discoveries: secret > mythic > legendary > epic > rare > common, then count, then earliest hatch, then address", () => {
    const rows = rankRarest([
      k("A", [c("mossling", 3, 10)]),
      k("B", [c("aurelion", 0, 50), c("solvanth", 0, 60)]), // legendary ×2
      k("C", [c("pyraurum", 0, 20)]), // legendary ×1, earlier
      k("D", [c("pyraurum", 0, 30)]), // legendary ×1, later
      k("E", [c("genesis", 0, 99), c("mossling", 3, 1)]), // secret
      k("F", [c("astravex", 0, 5)]), // mythic
      k("G", [c("neonyx", 0, 5)]), // epic
      k("H", [c("stormquill", 0, 5)]), // rare
    ]);
    expect(rows.map((r) => r.keeper)).toEqual(["E", "F", "B", "C", "D", "G", "H", "A"]);
    expect(rows[0]).toMatchObject({ rarity: "secret", rarityCount: 1, creature: { speciesId: "genesis" } });
    expect(rows[2]).toMatchObject({ rarity: "legendary", rarityCount: 2 });
  });

  it("Longest Holders: only keepers with verified holding, longest first, ties on address", () => {
    const rows = rankHolders([k("B", [], 5 * HOUR), k("A", [], 5 * HOUR), k("C", [], 9 * HOUR), k("D", [], null)]);
    expect(rows.map((r) => r.keeper)).toEqual(["C", "A", "B"]);
    expect(rows.every((r) => r.creature === null)).toBe(true);
  });

  it("only short addresses leave the server", () => {
    const full = W(1);
    const [row] = rankEvolved([k(full, [c("mossling", 1)])]);
    expect(row.keeper).toBe(`${full.slice(0, 4)}…${full.slice(-4)}`);
    expect(JSON.stringify(row)).not.toContain(full);
  });
});

describe("verified continuous holding", () => {
  const unit = 100n;
  const now = 10 * HOUR;
  it("counts from first verification, never from a current balance alone", () => {
    expect(continuousHoldingMs(null, 500n, unit, [], now)).toBeNull(); // no history, never verified
    expect(continuousHoldingMs(2 * HOUR, 500n, unit, [], now)).toBe(8 * HOUR);
    expect(continuousHoldingMs(2 * HOUR, 50n, unit, [], now)).toBeNull(); // below now
  });
  it("starts at the earliest verified point and restarts after a recorded drop", () => {
    const changes = [
      { at: 1 * HOUR, preBase: 0n, postBase: 200n }, // recorded crossing: verified from here
      { at: 4 * HOUR, preBase: 200n, postBase: 50n }, // dropped below
      { at: 6 * HOUR, preBase: 50n, postBase: 300n }, // back above: restarts here
    ];
    expect(continuousHoldingMs(2 * HOUR, 300n, unit, changes, now)).toBe(4 * HOUR);
    expect(continuousHoldingMs(2 * HOUR, 300n, unit, changes.slice(0, 1), now)).toBe(9 * HOUR);
  });
  it("counts a wallet that received already-credited tokens from the recorded transfer", () => {
    expect(continuousHoldingMs(null, 300n, unit, [{ at: 3 * HOUR, preBase: 0n, postBase: 300n }], now)).toBe(7 * HOUR);
  });
  it("history that ends below the threshold isn't overridden by a newer balance", () => {
    expect(continuousHoldingMs(2 * HOUR, 300n, unit, [{ at: 4 * HOUR, preBase: 200n, postBase: 50n }], now)).toBeNull();
  });
});

const open: Db[] = [];
afterEach(async () => {
  while (open.length) await open.pop()!.close();
});

async function world() {
  const clock = { t: 1_900_000_000_000, now: () => clock.t, advance: (ms: number) => (clock.t += ms) };
  const chain = createLedgerChain({ now: clock.now });
  const db = await createPgliteDb();
  open.push(db);
  await migrate(db);
  const pool = programAddress("pool");
  const treasury = W(9000);
  chain.mintTo(pool, chain.tokens(900_000_000));
  chain.mintTo(treasury, chain.tokens(50_000_000));
  let seed = 1;
  const tracker = createTracker({
    db,
    rpc: chain.rpc,
    config: { mint: chain.mint, excludedOwners: new Set([treasury]), excludeOffCurveOwners: true, source: "fixture", maxSignaturesPerAccount: 500, progression: eggProgression },
    now: clock.now,
    randomSeed: () => seed++,
  });
  const board = (env: Record<string, string> = { NODE_ENV: "test" }) => createLeaderboard({ db, tracker, source: "fixture", now: clock.now, cacheMs: 0, env });
  const hatchAll = async (owner: string) => {
    for (const e of (await tracker.holderView(owner)).eggs) await tracker.hatch(e.id);
  };
  return { chain, db, clock, pool, treasury, tracker, board, hatchAll, buy: (o: string, n: number) => chain.transfer(pool, o, chain.tokens(n)) };
}

describe("leaderboard from tracker data", () => {
  it("ranks real tracked keepers, excludes project wallets and counts each egg once", async () => {
    const { tracker, board, buy, clock, hatchAll, treasury } = await world();
    const a = W(201);
    const b = W(202);
    buy(a, 2_000_000);
    buy(b, 1_000_000);
    await tracker.runSync({ force: true });
    await tracker.runSync({ force: true }); // duplicate pass
    clock.advance(10 * MIN);
    await hatchAll(a);
    await hatchAll(b);
    await hatchAll(a); // hatching again changes nothing
    clock.advance(3 * HOUR);
    const lb = await board().get();
    expect(lb.source).toBe("fixture");
    const evolved = lb.categories.evolved;
    expect(evolved.map((r) => r.keeper)).toEqual([a, b].map((x) => `${x.slice(0, 4)}…${x.slice(-4)}`));
    expect(evolved[0].creatures).toBe(2);
    expect(evolved[1].creatures).toBe(1);
    // Stages are the tracker's own (the same numbers the Hatchery shows).
    const viewA = await tracker.holderView(a);
    expect(evolved[0].stageSum).toBe(viewA.eggs.reduce((s, e) => s + (e.evolution?.stage ?? 0), 0));
    const all = JSON.stringify(lb);
    expect(all).not.toContain(treasury.slice(0, 4) + "…" + treasury.slice(-4));
    expect(all).not.toContain(a); // never a full address
    expect(lb.categories.holders.map((r) => r.keeper)).toHaveLength(2);
    expect(lb.categories.holders.every((r) => r.heldMs! > 0)).toBe(true);
  });

  it("sealed eggs never rank; a keeper with no hatched creature can still be a verified holder", async () => {
    const { tracker, board, buy, clock } = await world();
    const a = W(203);
    buy(a, 1_000_000);
    await tracker.runSync({ force: true });
    clock.advance(10 * MIN); // ready, but not hatched
    const lb = await board().get();
    expect(lb.categories.evolved).toEqual([]);
    expect(lb.categories.rarest).toEqual([]);
    expect(lb.categories.holders).toHaveLength(1);
    expect(lb.categories.holders[0].creature).toBeNull();
  });

  it("a wallet the tracker never verified at one egg's worth isn't a Longest Holder", async () => {
    const { tracker, board, buy } = await world();
    buy(W(204), 400_000);
    await tracker.runSync({ force: true });
    expect((await board().get()).categories.holders).toEqual([]);
  });

  it("podium is the table's top three: one ranked list per category", async () => {
    const { tracker, board, buy, clock, hatchAll } = await world();
    const owners = [W(211), W(212), W(213), W(214), W(215)];
    owners.forEach((o, i) => buy(o, (i + 1) * 1_000_000));
    await tracker.runSync({ force: true });
    clock.advance(2 * HOUR);
    for (const o of owners) await hatchAll(o);
    const rows = (await board().get()).categories.evolved;
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4, 5]);
  });

  it("fixture data can never be ranked on a production deployment", async () => {
    const { board } = await world();
    await expect(board({ VERCEL_ENV: "production" }).get()).rejects.toBeInstanceOf(ConfigError);
    await expect(board({ NODE_ENV: "production" }).get()).rejects.toBeInstanceOf(ConfigError);
  });
});

describe("leaderboard page", () => {
  const root = path.resolve(__dirname, "../../..");
  it("has no simulated data source left to render", () => {
    expect(existsSync(path.join(root, "src/data/leaderboard.ts"))).toBe(false);
    const page = readFileSync(path.join(root, "src/app/leaderboard/page.tsx"), "utf8");
    expect(page).not.toMatch(/mock|simulated/i);
    expect(page).toContain("/api/leaderboard");
  });

  it("reads as live only for chain data, and flags stale or failed refreshes", () => {
    const base: Leaderboard = { source: "chain", generatedAt: 1_000_000, lastSyncAt: null, categories: { evolved: [], holders: [], rarest: [] } };
    expect(sourceBadge(base).kind).toBe("live");
    expect(sourceBadge({ ...base, source: "fixture" })).toEqual({ kind: "fixture", text: "Fixture data · local test holders" });
    expect(freshness(base, base.generatedAt + 5_000, false)).toEqual({ text: "Updated just now · refreshes every 30 s", stale: false });
    expect(freshness(base, base.generatedAt + STALE_AFTER_MS + 1, false).stale).toBe(true);
    expect(freshness(base, base.generatedAt + 5_000, true).text).toMatch(/couldn't refresh/);
  });
});

describe("leaderboard: credited tokens", () => {
  it("a wallet that received already-credited tokens ranks as a holder from the recorded transfer, with no egg of its own", async () => {
    const { tracker, board, buy, chain, clock } = await world();
    const a = W(221);
    const b = W(222);
    buy(a, 1_000_000);
    await tracker.runSync({ force: true });
    clock.advance(30 * MIN);
    chain.transfer(a, b, chain.tokens(1_000_000)); // credit moves with the tokens
    await tracker.runSync({ force: true });
    clock.advance(2 * HOUR);
    expect((await tracker.holderView(b)).counts.earned).toBe(0);
    const holders = (await board().get()).categories.holders;
    expect(holders.map((r) => r.keeper)).toEqual([`${b.slice(0, 4)}…${b.slice(-4)}`]); // a dropped below and isn't listed
    expect(holders[0].heldMs).toBeGreaterThan(0);
  });
});
