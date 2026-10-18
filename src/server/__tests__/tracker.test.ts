import { afterEach, describe, expect, it } from "vitest";
import { eggProgression, incubationMsFor, scheduleEgg } from "@/config/eggProgression";
import { SPECIES_BY_ID } from "@/lib/species";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { keypairFromSeed } from "../fixtures/keys";
import { createLedgerChain, programAddress } from "../fixtures/ledgerChain";
import { isOnCurve } from "../solana/curve";
import { qualifyingMs } from "../tracker/growth";
import { applyTransferCredit, eggsToAward } from "../tracker/ledger";
import { createTracker } from "../tracker/service";

const MIN = 60_000;
const HOUR = 60 * MIN;
const T0 = 1_900_000_000_000;
const W = (n: number) => keypairFromSeed(n).address;

const open: Db[] = [];
afterEach(async () => {
  while (open.length) await open.pop()!.close();
});

async function setup() {
  const clock = { t: T0, now: () => clock.t, advance: (ms: number) => (clock.t += ms) };
  const chain = createLedgerChain({ now: clock.now });
  const db = await createPgliteDb();
  open.push(db);
  await migrate(db);
  const pool = programAddress("pool");
  const treasury = W(9000);
  chain.mintTo(pool, chain.tokens(900_000_000));
  chain.mintTo(treasury, chain.tokens(50_000_000));
  let seed = 1;
  const make = () =>
    createTracker({
      db,
      rpc: chain.rpc,
      config: { mint: chain.mint, excludedOwners: new Set([treasury]), excludeOffCurveOwners: true, source: "fixture", maxSignaturesPerAccount: 500, progression: eggProgression },
      now: clock.now,
      randomSeed: () => seed++,
    });
  const tracker = make();
  const buy = (owner: string, whole: number | bigint) => chain.transfer(pool, owner, chain.tokens(whole));
  return { chain, db, clock, pool, treasury, tracker, make, buy };
}

describe("egg rule: 1,000,000 $SLNT = 1 egg", () => {
  it("is configured centrally", () => {
    expect(eggProgression.tokensPerEgg).toBe(1_000_000);
    expect(eggProgression.totalSupply).toBe(1_000_000_000);
    expect(eggProgression.incubationScheduleMs).toEqual([1 * MIN, 5 * MIN, 15 * MIN, 1 * HOUR, 6 * HOUR, 12 * HOUR]);
  });

  it.each([
    [0n, 0],
    [999_999_999_999n, 0], // 999,999.999999 $SLNT
    [1_000_000_000_000n, 1],
    [1_999_999_999_999n, 1],
    [2_000_000_000_000n, 2],
    [3_000_000_000_000n, 3],
    [5_000_000_000_000n, 5],
    [10_000_000_000_000n, 10],
  ])("balance %s base units → %i eggs", (balance, eggs) => {
    expect(eggsToAward({ balance, credit: 0n, eggsEarned: 0, unitBase: 1_000_000_000_000n, cap: null, excluded: false })).toBe(eggs);
  });
});

describe("Workflow A: automatic tracking, no wallet connection (tests 1, 2, 4)", () => {
  it("detects a holder reaching 1,000,000 $SLNT and issues the first egg on its own", async () => {
    const { tracker, buy, clock } = await setup();
    const holder = W(1);
    buy(holder, 1_000_000);
    const run = await tracker.runSync({ force: true });
    expect(run.status).toBe("ok");
    expect(run.eggsIssued).toBe(1);
    const v = await tracker.holderView(holder);
    expect(v.tracked).toBe(true);
    expect(v.source).toBe("fixture");
    expect(v.holdings.amount).toBe("1000000");
    expect(v.holdings.qualifyingUnits).toBe(1);
    expect(v.counts).toEqual({ earned: 1, queued: 0, incubating: 1, ready: 0, hatched: 0 });
    expect(v.eggs[0]).toMatchObject({ sequence: 1, status: "incubating", incubationMs: 1 * MIN, incubationStartedAt: clock.t, readyAt: clock.t + 1 * MIN, speciesId: null, maturityMs: 1 * MIN });
  });

  it("issues nothing below 1,000,000 and the next egg at each further million", async () => {
    const { tracker, chain, pool, clock } = await setup();
    const h = W(2);
    chain.transfer(pool, h, chain.tokens(1_000_000) - 1n);
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(h)).counts.earned).toBe(0);
    expect((await tracker.holderView(h)).holdings.toNextEgg).toBe("0.000001");

    chain.transfer(pool, h, 1n);
    clock.advance(MIN);
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(h)).counts.earned).toBe(1);

    chain.transfer(pool, h, chain.tokens(1_500_000)); // 2.5M
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(h)).counts.earned).toBe(2);

    chain.transfer(pool, h, chain.tokens(500_000)); // 3M
    await tracker.runSync({ force: true });
    const v = await tracker.holderView(h);
    expect(v.counts.earned).toBe(3);
    expect(v.eggs.map((e) => e.sequence)).toEqual([1, 2, 3]);
  });

  it("finds holders the tracker has never seen, without them visiting", async () => {
    const { tracker, buy } = await setup();
    const holders = [W(3), W(4), W(5)];
    holders.forEach((h, i) => buy(h, (i + 1) * 1_000_000));
    await tracker.runSync({ force: true });
    for (const [i, h] of holders.entries()) expect((await tracker.holderView(h)).counts.earned).toBe(i + 1);
  });
});

describe("multiple token accounts (test 3)", () => {
  it("sums every account a wallet owns and counts it once", async () => {
    const { tracker, chain, pool } = await setup();
    const h = W(6);
    const second = chain.openAccount(h);
    chain.transfer(pool, h, chain.tokens(600_000));
    chain.transfer(pool, h, chain.tokens(400_000), { toAccount: second });
    await tracker.runSync({ force: true });
    const v = await tracker.holderView(h);
    expect(v.holdings.amount).toBe("1000000");
    expect(v.counts.earned).toBe(1);
  });

  it("moving tokens between a wallet's own accounts earns nothing new", async () => {
    const { tracker, chain, pool } = await setup();
    const h = W(7);
    chain.transfer(pool, h, chain.tokens(1_000_000));
    await tracker.runSync({ force: true });
    const second = chain.openAccount(h);
    chain.transfer(h, h, chain.tokens(1_000_000), { fromAccount: chain.accountsOf(h)[0], toAccount: second });
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(h)).counts.earned).toBe(1);
  });

  it("does not count frozen accounts", async () => {
    const { tracker, chain, pool } = await setup();
    const h = W(8);
    chain.transfer(pool, h, chain.tokens(1_500_000));
    chain.freeze(chain.accountsOf(h)[0]);
    await tracker.runSync({ force: true });
    const v = await tracker.holderView(h);
    expect(v.counts.earned).toBe(0);
    expect(v.holdings.frozenAmount).toBe("1500000");
  });
});

describe("incubation schedule (tests 5, 6, 7)", () => {
  it("first egg: ready after exactly one minute of server time, then hatches through the existing roll", async () => {
    const { tracker, buy, clock } = await setup();
    const h = W(10);
    buy(h, 1_000_000);
    await tracker.runSync({ force: true });
    const egg = (await tracker.holderView(h)).eggs[0];

    clock.advance(1 * MIN - 1);
    expect((await tracker.holderView(h)).eggs[0].status).toBe("incubating");
    expect(await tracker.hatch(egg.id)).toEqual({ ok: false, code: "NOT_READY", readyAt: egg.readyAt });

    clock.advance(1);
    expect((await tracker.holderView(h)).eggs[0].status).toBe("ready");
    const r = await tracker.hatch(egg.id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(SPECIES_BY_ID[r.result.speciesId]).toBeDefined();
    expect(r.result.alreadyHatched).toBe(false);
    const again = await tracker.hatch(egg.id);
    expect(again.ok && again.result.speciesId).toBe(r.result.speciesId);
    expect(again.ok && again.result.alreadyHatched).toBe(true);
    const v = await tracker.holderView(h);
    expect(v.counts).toMatchObject({ earned: 1, hatched: 1 });
    expect(v.eggs[0].speciesId).toBe(r.result.speciesId);
  });

  it("second egg: queued behind the first, then incubates for five minutes", async () => {
    const { tracker, buy, clock } = await setup();
    const h = W(11);
    buy(h, 2_000_000);
    await tracker.runSync({ force: true });
    const [e1, e2] = (await tracker.holderView(h)).eggs;
    expect(e2).toMatchObject({ sequence: 2, status: "queued", incubationMs: 5 * MIN, incubationStartedAt: e1.readyAt, readyAt: e1.readyAt + 5 * MIN, maturityMs: 5 * MIN });
    clock.advance(1 * MIN);
    expect((await tracker.holderView(h)).eggs[1].status).toBe("incubating");
    clock.advance(5 * MIN);
    expect((await tracker.holderView(h)).eggs.map((e) => e.status)).toEqual(["ready", "ready"]);
  });

  it("later eggs: 15 min, 1 h, 6 h, then 12 h each", async () => {
    const { tracker, buy } = await setup();
    const h = W(12);
    buy(h, 7_000_000);
    await tracker.runSync({ force: true });
    const eggs = (await tracker.holderView(h)).eggs;
    expect(eggs.map((e) => e.incubationMs)).toEqual([1 * MIN, 5 * MIN, 15 * MIN, 1 * HOUR, 6 * HOUR, 12 * HOUR, 12 * HOUR]);
    expect(eggs.map((e) => e.maturityMs)).toEqual([1 * MIN, 5 * MIN, 15 * MIN, 1 * HOUR, 3 * HOUR, 6 * HOUR, 6 * HOUR]);
    for (let i = 1; i < eggs.length; i++) expect(eggs[i].incubationStartedAt).toBe(eggs[i - 1].readyAt);
  });

  it("an egg earned later starts when it is earned if the previous one is already ready", async () => {
    const { tracker, buy, clock } = await setup();
    const h = W(13);
    buy(h, 1_000_000);
    await tracker.runSync({ force: true });
    clock.advance(2 * HOUR);
    buy(h, 1_000_000);
    await tracker.runSync({ force: true });
    const e2 = (await tracker.holderView(h)).eggs[1];
    expect(e2).toMatchObject({ status: "incubating", incubationStartedAt: clock.t, readyAt: clock.t + 5 * MIN });
  });

  it("scheduleEgg and incubationMsFor follow the config", () => {
    expect([1, 2, 3, 4, 5, 6, 9].map((s) => incubationMsFor(s))).toEqual([1 * MIN, 5 * MIN, 15 * MIN, 1 * HOUR, 6 * HOUR, 12 * HOUR, 12 * HOUR]);
    expect(scheduleEgg(2, 100, 500)).toEqual({ incubationStartedAt: 500, incubationMs: 5 * MIN, readyAt: 500 + 5 * MIN });
    expect(scheduleEgg(2, 100, 500, { ...eggProgression, incubationMode: "parallel" }).incubationStartedAt).toBe(100);
    expect(() => incubationMsFor(0)).toThrow();
  });
});

describe("persistence and idempotency (tests 8, 9)", () => {
  it("timers survive a restart: a new tracker instance on the same database sees the same eggs", async () => {
    const { tracker, buy, make, clock } = await setup();
    const h = W(20);
    buy(h, 2_000_000);
    await tracker.runSync({ force: true });
    const before = await tracker.holderView(h);
    clock.advance(3 * MIN);
    const restarted = make();
    const after = await restarted.holderView(h);
    expect(after.eggs.map((e) => [e.id, e.readyAt, e.incubationStartedAt])).toEqual(before.eggs.map((e) => [e.id, e.readyAt, e.incubationStartedAt]));
    await restarted.runSync({ force: true });
    expect((await restarted.holderView(h)).counts.earned).toBe(2);
  });

  it("repeated syncs, duplicate events and concurrent workers never issue an egg twice", async () => {
    const { tracker, buy, make, db } = await setup();
    const h = W(21);
    const sig = buy(h, 1_000_000);
    await tracker.ingestSignatures([sig, sig]);
    await tracker.ingestSignatures([sig]);
    await tracker.runSync({ force: true });
    await tracker.runSync({ force: true });
    await Promise.all([tracker.syncOwner(h), make().syncOwner(h), make().syncOwner(h)]);
    expect((await tracker.holderView(h)).counts.earned).toBe(1);
    const processed = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM processed_transactions WHERE signature = $1`, [sig]);
    expect(processed.rows[0].n).toBe(1);
  });

  it("the database itself refuses a duplicate egg", async () => {
    const { tracker, buy, db } = await setup();
    const h = W(22);
    buy(h, 1_000_000);
    await tracker.runSync({ force: true });
    await expect(
      db.query(`INSERT INTO eggs (id, owner, sequence, source, earned_ms, earned_slot, incubation_started_ms, incubation_ms, ready_ms, seed, species_id) VALUES ('x', $1, 1, 'fixture', 0, 0, 0, 0, 0, 1, 'mossling')`, [h]),
    ).rejects.toThrow();
  });
});

describe("transfers and balance changes (test 10)", () => {
  it("moving a qualifying balance to another wallet does not create another first egg", async () => {
    const { tracker, chain, buy } = await setup();
    const a = W(30);
    const b = W(31);
    const c = W(32);
    buy(a, 1_000_000);
    await tracker.runSync({ force: true });
    chain.transfer(a, b, chain.tokens(1_000_000));
    await tracker.runSync({ force: true });
    chain.transfer(b, c, chain.tokens(1_000_000));
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(a)).counts.earned).toBe(1); // kept, not taken away
    expect((await tracker.holderView(b)).counts.earned).toBe(0);
    expect((await tracker.holderView(c)).counts.earned).toBe(0);
    expect((await tracker.holderView(c)).holdings).toMatchObject({ creditedAmount: "1000000", inheritedCreditAmount: "1000000" });
    expect((await tracker.holderView(a)).holdings.inheritedCreditAmount).toBe("0");
  });

  it("the receiving wallet still earns on tokens it buys itself", async () => {
    const { tracker, chain, buy } = await setup();
    const a = W(33);
    const b = W(34);
    buy(a, 1_000_000);
    await tracker.runSync({ force: true });
    chain.transfer(a, b, chain.tokens(1_000_000));
    buy(b, 1_000_000);
    await tracker.runSync({ force: true });
    const v = await tracker.holderView(b);
    expect(v.counts.earned).toBe(1);
    expect(v.eggs[0].incubationMs).toBe(1 * MIN); // b's own first egg
  });

  it("uncredited tokens leave first, so splitting a wallet is fair", async () => {
    const { tracker, chain, buy } = await setup();
    const a = W(35);
    const c = W(36);
    buy(a, 1_500_000); // 1 egg, 0.5M spare
    await tracker.runSync({ force: true });
    chain.transfer(a, c, chain.tokens(500_000));
    buy(c, 500_000);
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(a)).counts.earned).toBe(1);
    expect((await tracker.holderView(c)).counts.earned).toBe(1);
  });

  it("selling into a pool and buying back does not earn the same egg again; eggs are kept after selling", async () => {
    const { tracker, chain, pool, buy, clock } = await setup();
    const a = W(37);
    buy(a, 1_000_000);
    await tracker.runSync({ force: true });
    chain.transfer(a, pool, chain.tokens(1_000_000));
    await tracker.runSync({ force: true });
    let v = await tracker.holderView(a);
    expect(v.holdings.amount).toBe("0");
    expect(v.counts.earned).toBe(1);
    clock.advance(5 * MIN);
    expect((await tracker.holderView(a)).eggs[0].status).toBe("ready"); // the timer kept running
    buy(a, 1_000_000);
    await tracker.runSync({ force: true });
    v = await tracker.holderView(a);
    expect(v.counts.earned).toBe(1);
    buy(a, 1_000_000); // genuinely more than before
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(a)).counts.earned).toBe(2);
  });

  it("credit follows tokens through multi-leg transactions and ignores failed ones", async () => {
    const { tracker, chain, buy } = await setup();
    const a = W(38);
    const b = W(39);
    const c = W(40);
    buy(a, 2_000_000);
    await tracker.runSync({ force: true });
    chain.transfer(a, b, chain.tokens(2_000_000), { failed: true });
    chain.multi([
      { from: a, to: b, amount: chain.tokens(1_000_000) },
      { from: a, to: c, amount: chain.tokens(1_000_000) },
    ]);
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(a)).counts.earned).toBe(2);
    expect((await tracker.holderView(b)).counts.earned).toBe(0);
    expect((await tracker.holderView(c)).counts.earned).toBe(0);
  });

  it("the receiver is credited even when it is synced before the sender", async () => {
    const { tracker, chain, buy } = await setup();
    const a = W(41);
    const b = W(42);
    buy(a, 1_000_000);
    await tracker.runSync({ force: true });
    chain.transfer(a, b, chain.tokens(1_000_000));
    await tracker.syncOwner(b); // b's own history includes the incoming transfer
    expect((await tracker.holderView(b)).counts.earned).toBe(0);
  });
});

describe("exclusions", () => {
  it("never gives eggs to the configured treasury or to program-controlled (off-curve) owners", async () => {
    const { tracker, pool, treasury, chain } = await setup();
    expect(isOnCurve(pool)).toBe(false);
    expect(isOnCurve(treasury)).toBe(true);
    const vault = programAddress("vault");
    chain.transfer(pool, vault, chain.tokens(5_000_000));
    await tracker.runSync({ force: true });
    for (const o of [pool, treasury, vault]) {
      const v = await tracker.holderView(o);
      expect(v.holdings.excluded).toBe(true);
      expect(v.counts.earned).toBe(0);
    }
  });
});

describe("failures", () => {
  it("an RPC outage fails the run without changing any balance or egg", async () => {
    const { tracker, chain, buy } = await setup();
    const h = W(50);
    buy(h, 1_000_000);
    await tracker.runSync({ force: true });
    chain.state.down = true;
    const r = await tracker.runSync({ force: true });
    expect(r.status).toBe("failed");
    const v = await tracker.holderView(h);
    expect(v.holdings.amount).toBe("1000000");
    expect(v.counts.earned).toBe(1);
    chain.state.down = false;
    expect((await tracker.runSync({ force: true })).status).toBe("ok");
  });

  it("delayed indexing holds the award back instead of guessing, then catches up", async () => {
    const { tracker, chain, buy } = await setup();
    const a = W(51);
    const b = W(52);
    buy(a, 1_000_000);
    await tracker.runSync({ force: true });
    const sig = chain.transfer(a, b, chain.tokens(1_000_000));
    chain.state.hidden.add(sig);
    const r = await tracker.syncOwner(b);
    expect(r.complete).toBe(false);
    expect((await tracker.holderView(b)).counts.earned).toBe(0);
    expect((await tracker.holderView(b)).sync.pending).toBe(true);
    chain.state.hidden.delete(sig);
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(b)).counts.earned).toBe(0); // credited, correctly
    expect((await tracker.holderView(b)).sync.pending).toBe(false);
  });

  it("a missed webhook is caught by the reconciliation snapshot", async () => {
    const { tracker, buy } = await setup();
    const h = W(53);
    await tracker.runSync({ force: true });
    buy(h, 3_000_000); // no webhook delivered
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(h)).counts.earned).toBe(3);
  });

  it("closed token accounts drop out of the balance", async () => {
    const { tracker, chain, pool, buy } = await setup();
    const h = W(54);
    buy(h, 1_000_000);
    const extra = chain.openAccount(h);
    chain.transfer(pool, h, chain.tokens(10), { toAccount: extra });
    await tracker.runSync({ force: true });
    chain.transfer(h, pool, chain.tokens(10), { fromAccount: extra });
    chain.closeAccount(extra);
    await tracker.runSync({ force: true });
    expect((await tracker.holderView(h)).holdings.amount).toBe("1000000");
  });
});

describe("credit ledger unit rules", () => {
  const h = (credit: bigint, excluded = false) => ({ credit, excluded });
  it("moves credit only when the sender can no longer cover it", () => {
    const r = applyTransferCredit(
      [
        { owner: "A", preBase: 150n, postBase: 100n },
        { owner: "B", preBase: 0n, postBase: 50n },
      ],
      new Map([["A", h(100n)]]),
    );
    expect(r.moved).toBe(0n);
    const r2 = applyTransferCredit(
      [
        { owner: "A", preBase: 150n, postBase: 30n },
        { owner: "B", preBase: 0n, postBase: 120n },
      ],
      new Map([["A", h(100n)]]),
    );
    expect(r2.moved).toBe(70n);
    expect(r2.changes).toEqual([
      { owner: "A", before: 100n, after: 30n },
      { owner: "B", before: 0n, after: 70n },
    ]);
  });

  it("keeps credit with the seller when tokens go to an excluded address", () => {
    const r = applyTransferCredit(
      [
        { owner: "A", preBase: 100n, postBase: 0n },
        { owner: "POOL", preBase: 0n, postBase: 100n },
      ],
      new Map([
        ["A", h(100n)],
        ["POOL", h(0n, true)],
      ]),
    );
    expect(r.moved).toBe(0n);
    expect(r.changes.find((c) => c.owner === "A")!.after).toBe(100n);
  });

  it("splits moved credit pro rata without exceeding what each recipient received", () => {
    const r = applyTransferCredit(
      [
        { owner: "A", preBase: 10n, postBase: 0n },
        { owner: "B", preBase: 0n, postBase: 3n },
        { owner: "C", preBase: 0n, postBase: 7n },
      ],
      new Map([["A", h(10n)]]),
    );
    expect(r.changes.map((c) => [c.owner, c.after])).toEqual([
      ["A", 0n],
      ["B", 3n],
      ["C", 7n],
    ]);
  });
});

describe("evolution of tracked creatures uses verified holding only", () => {
  it("qualifyingMs counts only time at or above the threshold", () => {
    const changes = [
      { at: 100, preBase: 10n, postBase: 0n },
      { at: 300, preBase: 0n, postBase: 10n },
    ];
    expect(qualifyingMs(0, 500, 10n, changes, 10n)).toEqual({ ms: 100 + 200, growing: true });
    expect(qualifyingMs(150, 250, 10n, changes, 10n)).toEqual({ ms: 0, growing: false });
    expect(qualifyingMs(0, 500, 10n, [], 9n)).toEqual({ ms: 0, growing: false });
  });

  it("a hatched creature grows from when its egg hatched, then pauses while the holder has sold", async () => {
    const { tracker, buy, chain, pool, clock } = await setup();
    const h = W(60);
    buy(h, 1_000_000);
    await tracker.runSync({ force: true });
    clock.advance(1 * MIN);
    const id = (await tracker.holderView(h)).eggs[0].id;
    expect((await tracker.hatch(id)).ok).toBe(true);
    clock.advance(5 * MIN);
    let c = (await tracker.holderView(h)).eggs[0];
    expect(c).toMatchObject({ status: "hatched", growthMs: 5 * MIN, growing: true });

    // Sell everything: the sale is recorded at its block time and growth stops there.
    chain.transfer(h, pool, chain.tokens(1_000_000));
    await tracker.runSync({ force: true });
    clock.advance(60 * MIN);
    c = (await tracker.holderView(h)).eggs[0];
    expect(c.growing).toBe(false);
    expect(c.growthMs).toBe(5 * MIN); // the hour after selling does not count
  });
});
