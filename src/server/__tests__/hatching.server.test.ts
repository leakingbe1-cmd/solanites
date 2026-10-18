import { afterEach, describe, expect, it, vi } from "vitest";
import { eggProgression } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { rollSpecies } from "@/lib/progression";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { keypairFromSeed } from "../fixtures/keys";
import { createLedgerChain, programAddress } from "../fixtures/ledgerChain";
import { createTracker } from "../tracker/service";

/** Server-side hatch results: where the outcome comes from and that it never changes. */

const MIN = 60_000;
const T0 = 1_900_000_000_000;
const W = (n: number) => keypairFromSeed(n).address;

const open: Db[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  while (open.length) await open.pop()!.close();
});

async function setup(randomSeed?: () => number) {
  const clock = { t: T0, now: () => clock.t };
  const chain = createLedgerChain({ now: clock.now });
  const db = await createPgliteDb();
  open.push(db);
  await migrate(db);
  const pool = programAddress("pool");
  chain.mintTo(pool, chain.tokens(900_000_000));
  const make = () =>
    createTracker({
      db,
      rpc: chain.rpc,
      config: { mint: chain.mint, excludedOwners: new Set(), excludeOffCurveOwners: true, source: "fixture", maxSignaturesPerAccount: 500, progression: eggProgression },
      now: clock.now,
      ...(randomSeed ? { randomSeed } : {}),
    });
  return { db, clock, chain, tracker: make(), make, buy: (o: string, whole: number) => chain.transfer(pool, o, chain.tokens(whole)) };
}

/** First seeds (from 0) whose rolls give two different species, and two seeds giving the same species. */
function seedsFor() {
  const first = rollSpecies(0, gameConfig);
  const other = Array.from({ length: 100 }, (_, i) => i + 1).find((s) => rollSpecies(s, gameConfig) !== first)!;
  const same = Array.from({ length: 1000 }, (_, i) => i + 1).find((s) => s !== other && rollSpecies(s, gameConfig) === first)!;
  return { first: 0, other, same };
}

describe("where a hatch result comes from", () => {
  it("the server draws each egg's seed from the cryptographic random source and stores the rolled species", async () => {
    const fixed = ((a: Uint32Array) => {
      a[0] = 424242;
      return a;
    }) as unknown as typeof globalThis.crypto.getRandomValues;
    const spy = vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(fixed);
    const { db, tracker, buy } = await setup(); // no injected seed: the production default
    const h = W(200);
    buy(h, 1_000_000);
    await tracker.syncOwner(h);
    expect(spy).toHaveBeenCalled();
    const row = (await db.query<{ seed: string; species_id: string }>(`SELECT seed, species_id FROM eggs WHERE owner = $1`, [h])).rows[0];
    expect(Number(row.seed)).toBe(424242);
    expect(row.species_id).toBe(rollSpecies(424242, gameConfig));
  });

  it("different eggs can get different species, and the same species can be issued twice", async () => {
    const { first, other, same } = seedsFor();
    const seeds = [first, other, same];
    const { db, tracker, buy } = await setup(() => seeds.shift()!);
    const h = W(201);
    buy(h, 3_000_000);
    await tracker.syncOwner(h);
    const species = (await db.query<{ species_id: string }>(`SELECT species_id FROM eggs WHERE owner = $1 ORDER BY sequence`, [h])).rows.map((r) => r.species_id);
    expect(species[0]).not.toBe(species[1]);
    expect(species[2]).toBe(species[0]);
  });
});

describe("a hatch result never changes", () => {
  it("hatching again, reading again, or restarting the server returns the stored species; the database row is untouched", async () => {
    const { db, clock, tracker, make, buy } = await setup(() => 777);
    const h = W(202);
    buy(h, 1_000_000);
    await tracker.syncOwner(h);
    const stored = (await db.query<{ species_id: string }>(`SELECT species_id FROM eggs WHERE owner = $1`, [h])).rows[0].species_id;
    clock.t = T0 + 1 * MIN;
    const id = (await tracker.holderView(h)).eggs[0].id;
    const results = [await tracker.hatch(id), await tracker.hatch(id), await make().hatch(id)];
    for (const r of results) expect(r.ok && r.result.speciesId).toBe(stored);
    expect(results.map((r) => r.ok && r.result.alreadyHatched)).toEqual([false, true, true]);
    for (const t of [make(), make()]) expect((await t.holderView(h)).eggs[0].speciesId).toBe(stored);
    expect((await db.query<{ species_id: string }>(`SELECT species_id FROM eggs WHERE owner = $1`, [h])).rows[0].species_id).toBe(stored);
  });

  it("concurrent hatch requests from several server instances agree on one result and hatch once", async () => {
    const { db, clock, tracker, make, buy } = await setup(() => 31337);
    const h = W(203);
    buy(h, 1_000_000);
    await tracker.syncOwner(h);
    clock.t = T0 + 1 * MIN;
    const id = (await tracker.holderView(h)).eggs[0].id;
    const results = await Promise.all([tracker, make(), make(), make(), make()].map((t) => t.hatch(id)));
    const species = new Set(results.map((r) => r.ok && r.result.speciesId));
    expect(species.size).toBe(1);
    expect(results.filter((r) => r.ok && !r.result.alreadyHatched)).toHaveLength(1);
    const rows = (await db.query<{ hatched_ms: string }>(`SELECT hatched_ms FROM eggs WHERE owner = $1`, [h])).rows;
    expect(rows).toHaveLength(1);
  });
});
