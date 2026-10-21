import { afterEach, describe, expect, it } from "vitest";
import { eggProgression } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { rarityChances } from "@/lib/progression";
import { SPECIES_BY_ID } from "@/lib/species";
import { GET } from "@/app/api/proof/route";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { keypairFromSeed } from "../fixtures/keys";
import { createLedgerChain, programAddress } from "../fixtures/ledgerChain";
import { createTracker } from "../tracker/service";

/** /proof: sync position, egg and rarity counts from the tracker's own records, and the excluded wallets. */
const W = (n: number) => keypairFromSeed(n).address;
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
  return { chain, clock, pool, treasury, tracker, buy: (o: string, n: number) => chain.transfer(pool, o, chain.tokens(n)) };
}

describe("proof", () => {
  it("reports eggs, hatched rarity against the configured odds, and excluded wallets with reasons", async () => {
    const { tracker, buy, clock, pool, treasury } = await world();
    const a = W(301);
    buy(a, 3_000_000);
    await tracker.runSync({ force: true });
    clock.advance(10 * 60_000);
    const eggs = (await tracker.holderView(a)).eggs;
    await tracker.hatch(eggs[0].id);

    const p = await tracker.proof();
    expect(p.source).toBe("fixture");
    expect(p.eggs).toEqual({ issued: eggs.length, hatched: 1 });
    expect(p.lastSyncAt).not.toBeNull();
    expect(p.latestSlot).toBeGreaterThan(0);
    const hatched = (await tracker.holderView(a)).eggs.find((e) => e.hatchedAt !== null)!;
    const r = SPECIES_BY_ID[hatched.speciesId!].rarity;
    expect(p.rarity[r].hatched).toBe(1);
    expect(Object.values(p.rarity).reduce((n, x) => n + x.hatched, 0)).toBe(1);
    const chances = rarityChances(gameConfig);
    for (const k of Object.keys(chances) as (keyof typeof chances)[]) expect(p.rarity[k].configured).toBe(chances[k]);
    expect(p.excluded).toContainEqual({ address: treasury, reason: "project" });
    expect(p.excluded).toContainEqual({ address: pool, reason: "program" });
    expect(p.excluded.map((x) => x.address)).not.toContain(a);
    expect(p.excludedCount).toBe(p.excluded.length);
  });

  it("the route answers 503 NOT_CONFIGURED when tracking is off", async () => {
    const res = await GET(new Request("http://localhost/api/proof"));
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe("NOT_CONFIGURED");
  });
});
