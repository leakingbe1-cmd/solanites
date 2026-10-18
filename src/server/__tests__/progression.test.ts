import { afterEach, describe, expect, it } from "vitest";
import { eggProgression, initialGrowthMsFor, type EggProgressionConfig } from "@/config/eggProgression";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { keypairFromSeed } from "../fixtures/keys";
import { createLedgerChain, programAddress } from "../fixtures/ledgerChain";
import { createTracker } from "../tracker/service";

/**
 * The first two minutes and the early progression loop, end to end through
 * the real tracker (embedded Postgres + fixture chain, simulated server clock).
 */

const SEC = 1_000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const T0 = 1_900_000_000_000;
const W = (n: number) => keypairFromSeed(n).address;

const open: Db[] = [];
afterEach(async () => {
  while (open.length) await open.pop()!.close();
});

async function setup(o: { decimals?: number } = {}) {
  const clock = { t: T0, now: () => clock.t, advance: (ms: number) => (clock.t += ms) };
  const chain = createLedgerChain({ now: clock.now, decimals: o.decimals });
  const db = await createPgliteDb();
  open.push(db);
  await migrate(db);
  const pool = programAddress("pool");
  chain.mintTo(pool, chain.tokens(900_000_000));
  let seed = 1;
  const make = (progression: EggProgressionConfig = eggProgression) =>
    createTracker({
      db,
      rpc: chain.rpc,
      config: { mint: chain.mint, excludedOwners: new Set(), excludeOffCurveOwners: true, source: "fixture", maxSignaturesPerAccount: 500, progression },
      now: clock.now,
      randomSeed: () => seed++,
    });
  const tracker = make();
  const buy = (owner: string, amount: bigint) => chain.transfer(pool, owner, amount);
  return { chain, db, clock, tracker, make, buy };
}

describe("the first two minutes (server clock only)", () => {
  it("egg acquired at 0:00, hatches at 1:00, fully grown at 2:00", async () => {
    const { tracker, buy, chain, clock } = await setup();
    const h = W(100);
    buy(h, chain.tokens(1_000_000));
    await tracker.syncOwner(h); // what a first Hatchery visit does
    const view = async () => (await tracker.holderView(h)).eggs[0];
    const egg = await view();
    expect(egg).toMatchObject({ sequence: 1, earnedAt: T0, incubationStartedAt: T0, readyAt: T0 + 1 * MIN, maturityMs: 1 * MIN, status: "incubating" });

    clock.t = T0 + 1 * MIN - 1;
    expect((await view()).status).toBe("incubating");
    expect(await tracker.hatch(egg.id)).toMatchObject({ ok: false, code: "NOT_READY", readyAt: T0 + 1 * MIN });

    clock.t = T0 + 1 * MIN;
    expect((await view()).status).toBe("ready");
    expect((await tracker.hatch(egg.id)).ok).toBe(true);
    expect((await view()).evolution).toMatchObject({ stage: 0, label: "Eggling", phase: "growing", matured: false, toNextMs: 1 * MIN });

    clock.t = T0 + 2 * MIN - 1;
    expect((await view()).evolution).toMatchObject({ phase: "growing", toNextMs: 1 });

    clock.t = T0 + 2 * MIN;
    const grown = await view();
    expect(grown.growthMs).toBe(1 * MIN);
    expect(grown.evolution).toMatchObject({ stage: 1, label: "Hatchling", phase: "mature", matured: true, nextLabel: "Evolved", toNextMs: 30 * MIN });
  });

  it("growth counts from when the egg hatched, so a late reveal still finds the creature grown on time", async () => {
    const { tracker, buy, chain, clock } = await setup();
    const a = W(101);
    const b = W(102);
    buy(a, chain.tokens(1_000_000));
    buy(b, chain.tokens(1_000_000));
    await tracker.syncOwner(a);
    await tracker.syncOwner(b);

    // a opens the reveal 30 s after it hatched: still grown at 2:00.
    clock.t = T0 + 90 * SEC;
    const ea = (await tracker.holderView(a)).eggs[0];
    await tracker.hatch(ea.id);
    expect((await tracker.holderView(a)).eggs[0].evolution).toMatchObject({ phase: "growing", toNextMs: 30 * SEC });
    clock.t = T0 + 2 * MIN;
    expect((await tracker.holderView(a)).eggs[0].evolution).toMatchObject({ phase: "mature" });

    // b comes back after 10 minutes: the overdue milestones are already settled on reveal.
    clock.t = T0 + 10 * MIN;
    const eb = (await tracker.holderView(b)).eggs[0];
    expect(eb.status).toBe("ready");
    await tracker.hatch(eb.id);
    const cb = (await tracker.holderView(b)).eggs[0];
    expect(cb.growthMs).toBe(9 * MIN);
    expect(cb.evolution).toMatchObject({ phase: "mature", toNextMs: 22 * MIN });
  });

  it("survives a restart: a new tracker instance on the same database continues exactly", async () => {
    const { tracker, make, buy, chain, clock } = await setup();
    const h = W(103);
    buy(h, chain.tokens(1_000_000));
    await tracker.syncOwner(h);
    clock.t = T0 + 1 * MIN;
    await tracker.hatch((await tracker.holderView(h)).eggs[0].id);
    clock.t = T0 + 100 * SEC;
    const restarted = make();
    expect((await restarted.holderView(h)).eggs[0]).toMatchObject({ status: "hatched", growthMs: 40 * SEC, evolution: { phase: "growing", toNextMs: 20 * SEC } });
    clock.t = T0 + 2 * MIN;
    expect((await restarted.holderView(h)).eggs[0].evolution).toMatchObject({ phase: "mature" });
  });

  it("repeated and concurrent lookups never issue a second first egg", async () => {
    const { tracker, make, buy, chain } = await setup();
    const h = W(104);
    buy(h, chain.tokens(1_000_000));
    const results = await Promise.allSettled([tracker.syncOwner(h), make().syncOwner(h), make().syncOwner(h), tracker.syncOwner(h)]);
    expect(results.some((r) => r.status === "fulfilled")).toBe(true);
    await tracker.syncOwner(h);
    expect((await tracker.holderView(h)).counts.earned).toBe(1);
  });
});

describe("the early progression loop", () => {
  it("eggs incubate 1 min, 5 min, 15 min, 1 h, 6 h, then 12 h; creatures grow 1 min, 5 min, 15 min, 1 h, 3 h, then 6 h", async () => {
    const { tracker, buy, chain } = await setup();
    const h = W(110);
    buy(h, chain.tokens(7_000_000));
    await tracker.syncOwner(h);
    const eggs = (await tracker.holderView(h)).eggs;
    expect(eggs.map((e) => e.incubationMs)).toEqual([1 * MIN, 5 * MIN, 15 * MIN, 1 * HOUR, 6 * HOUR, 12 * HOUR, 12 * HOUR]);
    expect(eggs.map((e) => e.maturityMs)).toEqual([1 * MIN, 5 * MIN, 15 * MIN, 1 * HOUR, 3 * HOUR, 6 * HOUR, 6 * HOUR]);
    // One at a time: each starts when the previous one hatches.
    expect(eggs.map((e) => e.readyAt - T0)).toEqual([1, 6, 21, 81, 441, 1161, 1881].map((m) => m * MIN));
  });

  it("second creature: hatches at 6:00 and is fully grown 5 min later", async () => {
    const { tracker, buy, chain, clock } = await setup();
    const h = W(111);
    buy(h, chain.tokens(2_000_000));
    await tracker.syncOwner(h);
    const [e1, e2] = (await tracker.holderView(h)).eggs;
    clock.t = T0 + 6 * MIN;
    await tracker.hatch(e1.id);
    await tracker.hatch(e2.id);
    clock.t = T0 + 11 * MIN - 1;
    expect((await tracker.holderView(h)).eggs[1].evolution).toMatchObject({ phase: "growing", toNextMs: 1 });
    clock.t = T0 + 11 * MIN;
    const v = (await tracker.holderView(h)).eggs;
    expect(v[1].evolution).toMatchObject({ phase: "mature", label: "Hatchling" });
    expect(v[0].evolution).toMatchObject({ phase: "mature" }); // grown at 2:00, Evolved only at 31:00
  });

  it("changing the timer configuration does not touch eggs already issued", async () => {
    const { make, buy, chain, clock } = await setup();
    const h = W(112);
    const before = make();
    buy(h, chain.tokens(1_000_000));
    await before.syncOwner(h);
    const original = (await before.holderView(h)).eggs[0];

    const slower = make({ ...eggProgression, incubationScheduleMs: [10 * MIN], initialGrowthScheduleMs: [20 * MIN] });
    const same = (await slower.holderView(h)).eggs[0];
    expect(same).toMatchObject({ incubationMs: original.incubationMs, readyAt: original.readyAt, maturityMs: 1 * MIN });

    clock.t = T0 + 5 * MIN;
    buy(h, chain.tokens(1_000_000));
    await slower.syncOwner(h);
    const second = (await slower.holderView(h)).eggs[1];
    expect(second).toMatchObject({ sequence: 2, incubationMs: 10 * MIN, maturityMs: 20 * MIN });
  });

  it("eggs issued before growth times were stored use the configured value for their sequence", async () => {
    const { tracker, db, buy, chain } = await setup();
    const h = W(113);
    buy(h, chain.tokens(2_000_000));
    await tracker.syncOwner(h);
    await db.query(`UPDATE eggs SET maturity_ms = NULL WHERE owner = $1`, [h]);
    expect((await tracker.holderView(h)).eggs.map((e) => e.maturityMs)).toEqual([initialGrowthMsFor(1), initialGrowthMsFor(2)]);
  });

  it("the schema upgrade is safe to run again on an existing database", async () => {
    const { tracker, db, buy, chain } = await setup();
    const h = W(114);
    buy(h, chain.tokens(1_000_000));
    await tracker.syncOwner(h);
    await migrate(db);
    await migrate(db);
    expect((await tracker.holderView(h)).eggs[0].maturityMs).toBe(1 * MIN);
  });
});

describe("balance tracking edge cases", () => {
  it("counts exact base units: 9 decimals, one base unit short of the threshold earns nothing", async () => {
    const { tracker, buy, chain } = await setup({ decimals: 9 });
    const below = W(120);
    const exact = W(121);
    const above = W(122);
    buy(below, chain.tokens(1_000_000) - 1n);
    buy(exact, chain.tokens(1_000_000));
    buy(above, chain.tokens(1_000_000) + 1n);
    for (const a of [below, exact, above]) await tracker.syncOwner(a);
    const v = await Promise.all([below, exact, above].map((a) => tracker.holderView(a)));
    expect(v.map((x) => x.holdings.amount)).toEqual(["999999.999999999", "1000000", "1000000.000000001"]);
    expect(v.map((x) => x.counts.earned)).toEqual([0, 1, 1]);
    expect(v[0].holdings.toNextEgg).toBe("0.000000001");
  });

  it("a zero balance earns nothing and is reported as zero, not invented", async () => {
    const { tracker } = await setup();
    const h = W(123);
    await tracker.syncOwner(h);
    const v = await tracker.holderView(h);
    expect(v.holdings.amount).toBe("0");
    expect(v.counts.earned).toBe(0);
    expect(v.eggs).toEqual([]);
  });

  it("a balance not yet finalized on chain earns nothing until it is", async () => {
    const { tracker, buy, chain } = await setup();
    const h = W(124);
    chain.state.finalizedSlot = chain.state.slot; // the next transfer lands after the last finalized slot
    buy(h, chain.tokens(1_000_000));
    await tracker.syncOwner(h);
    expect((await tracker.holderView(h)).counts.earned).toBe(0);
    expect((await tracker.holderView(h)).holdings.amount).toBe("0");
    chain.state.finalizedSlot = Infinity;
    await tracker.syncOwner(h);
    expect((await tracker.holderView(h)).counts.earned).toBe(1);
  });

  it("an RPC outage during a lookup changes nothing and grants nothing", async () => {
    const { tracker, buy, chain } = await setup();
    const h = W(125);
    buy(h, chain.tokens(1_000_000));
    chain.state.down = true;
    await expect(tracker.syncOwner(h)).rejects.toThrow();
    chain.state.down = false;
    expect((await tracker.holderView(h)).counts.earned).toBe(0);
    expect((await tracker.holderView(h)).sync.lastSyncedAt).toBeNull();
  });
});
