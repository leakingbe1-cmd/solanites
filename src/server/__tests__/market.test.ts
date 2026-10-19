import { beforeEach, describe, expect, it } from "vitest";
import { STOCK_LINKS } from "@/config/stockLinks";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { createSharedRateLimiter } from "../rateLimitShared";
import { MarketDataError, type DailyBar, type MarketProvider } from "../market/provider";
import { createMarketService, unavailableSnapshot } from "../market/service";
import { ledgerCount, migrateMarket, ownsHatched, readBar, readLedger, readTickerState, upsertBars } from "../market/store";

// Monday 19 Oct 2026, 6:00 pm New York: the 19th's close is published, the previous session is Friday the 16th.
const NOW = Date.parse("2026-10-19T22:00:00Z");
const PREV = "2026-10-16";
const TODAY = "2026-10-19";

const bar = (date: string, close: number): DailyBar => ({ date, open: close, high: close, low: close, close, volume: 1000 });

/** A provider with prices we control, counting every call. */
function fakeProvider(closes: Record<string, Record<string, number>>, opts: { fail?: Partial<Record<"grouped" | "daily" | "intraday", MarketDataError>> } = {}) {
  const calls: string[] = [];
  const p: MarketProvider & { calls: string[]; closes: typeof closes } = {
    name: "Test feed",
    plan: "eod",
    calls,
    closes,
    async groupedDaily(date) {
      calls.push(`grouped:${date}`);
      if (opts.fail?.grouped) throw opts.fail.grouped;
      const out = new Map<string, DailyBar>();
      for (const [ticker, byDate] of Object.entries(closes)) if (byDate[date] !== undefined) out.set(ticker, bar(date, byDate[date]));
      return out;
    },
    async dailyBars(ticker, from, to) {
      calls.push(`daily:${ticker}`);
      if (opts.fail?.daily) throw opts.fail.daily;
      return Object.entries(closes[ticker] ?? {}).filter(([d]) => d >= from && d <= to).sort().map(([d, c]) => bar(d, c));
    },
    async intradayBars(ticker, date) {
      calls.push(`intraday:${ticker}`);
      if (opts.fail?.intraday) throw opts.fail.intraday;
      return [{ t: Date.parse(`${date}T14:00:00Z`), close: 10 }, { t: Date.parse(`${date}T19:00:00Z`), close: 11 }];
    },
  };
  return p;
}

/** Every ticker at 100 on the 16th; AMD +2.5% and NVDA −1.8% on the 19th, the rest flat. */
function standardCloses() {
  const c: Record<string, Record<string, number>> = {};
  for (const l of STOCK_LINKS) c[l.ticker] = { "2026-10-14": 98, "2026-10-15": 99, [PREV]: 100, [TODAY]: 100 };
  c.AMD[TODAY] = 102.5;
  c.NVDA[TODAY] = 98.2;
  return c;
}

let db: Db;
beforeEach(async () => {
  db = await createPgliteDb();
  await migrate(db); // the holder-tracking schema too, to prove market work never touches it
  await migrateMarket(db);
});

const service = (provider: MarketProvider | null, callsPerMinute = 4) => createMarketService({ db, provider, limiter: createSharedRateLimiter(db, () => NOW), now: () => NOW, callsPerMinute });

describe("scheduled refresh", () => {
  it("records the latest session for all 28 species from one pair of grouped requests", async () => {
    const p = fakeProvider(standardCloses());
    const r = await service(p).runScheduled({ lookbackSessions: 1 });
    expect(r.target).toBe(TODAY);
    expect(r.sessionsRecorded).toEqual([TODAY]);
    expect(r.growthRows).toBe(28);
    expect(p.calls.slice(0, 2)).toEqual([`grouped:${PREV}`, `grouped:${TODAY}`]);
    expect(r.providerCalls).toBeLessThanOrEqual(4); // the rest of the budget goes to history
    expect(await ledgerCount(db, TODAY)).toBe(28);
    const [amd] = await readLedger(db, "pyraurum", 1);
    expect(amd).toMatchObject({ date: TODAY, previousDate: PREV, changePct: 2.5, points: 10 });
    const [nvda] = await readLedger(db, "aurelion", 1);
    expect(nvda).toMatchObject({ changePct: -1.8, points: -7.2 });
  });

  it("is idempotent: running again, even with a changed price, records nothing new and rewrites nothing", async () => {
    const p = fakeProvider(standardCloses());
    const s = service(p, 100);
    await s.runScheduled({ lookbackSessions: 1 });
    p.closes.AMD[TODAY] = 150; // the provider later reports something different
    const again = await s.runScheduled({ lookbackSessions: 1 });
    expect(again.growthRows).toBe(0);
    expect(await ledgerCount(db, TODAY)).toBe(28);
    expect((await readLedger(db, "pyraurum", 1))[0].changePct).toBe(2.5);
  });

  it("stays inside the shared per-minute provider budget and stops cleanly when it is used up", async () => {
    const p = fakeProvider(standardCloses());
    const s = service(p, 2);
    const r = await s.runScheduled({ lookbackSessions: 3, maxCalls: 10 });
    expect(p.calls.length).toBe(2);
    expect(r.stoppedBy).toBe("RATE_LIMITED");
  });

  it("records nothing for a stock the provider has no price for", async () => {
    const c = standardCloses();
    delete c.GME;
    await service(fakeProvider(c)).runScheduled({ lookbackSessions: 1 });
    expect(await readLedger(db, "nullborn")).toEqual([]);
    expect(await ledgerCount(db, TODAY)).toBe(27);
  });

  it("waits when the session isn't published yet instead of guessing", async () => {
    const c = standardCloses();
    for (const t of Object.keys(c)) delete c[t][TODAY];
    const r = await service(fakeProvider(c)).runScheduled({ lookbackSessions: 1 });
    expect(r.stoppedBy).toBe("NOT_PUBLISHED");
    expect(await ledgerCount(db, TODAY)).toBe(0);
  });

  it("provider failures stop the run without writing anything", async () => {
    const p = fakeProvider(standardCloses(), { fail: { grouped: new MarketDataError("UNAVAILABLE", "down") } });
    const r = await service(p).runScheduled({ lookbackSessions: 1 });
    expect(r.stoppedBy).toBe("UNAVAILABLE");
    expect(await ledgerCount(db, TODAY)).toBe(0);
  });

  it("flags a ticker for a history refresh when its stored close no longer matches (a split)", async () => {
    await upsertBars(db, "TSLA", [bar(PREV, 300)], "Test feed", NOW); // pre-split close
    await service(fakeProvider(standardCloses())).runScheduled({ lookbackSessions: 1, maxCalls: 2 });
    expect((await readTickerState(db, "TSLA")).needsHistory).toBe(true);
    expect((await readBar(db, "TSLA", PREV))?.close).toBe(100); // replaced by the adjusted close
  });

  it("history refresh records growth only between sessions that follow each other", async () => {
    const c = standardCloses();
    delete c.AMD["2026-10-15"]; // a gap: 14 → 16 must not count as one day's move
    const s = service(fakeProvider(c), 100);
    await s.refreshHistory("AMD");
    expect((await readLedger(db, "pyraurum")).map((e) => e.date)).toEqual([TODAY]);
  });

  it("does nothing at all without a provider", async () => {
    expect((await service(null).runScheduled()).stoppedBy).toBe("NOT_CONFIGURED");
  });

  it("never touches holder tracking: eggs, holders and claims are unchanged", async () => {
    const snap = async () => (await db.query(`SELECT (SELECT count(*) FROM eggs) AS e, (SELECT count(*) FROM holders) AS h, (SELECT count(*) FROM fee_claims) AS f`)).rows[0];
    const before = await snap();
    await service(fakeProvider(standardCloses()), 100).runScheduled();
    expect(await snap()).toEqual(before);
  });
});

describe("snapshot", () => {
  it("shows the previous close, the daily change and the growth, labelled as end-of-day", async () => {
    const p = fakeProvider(standardCloses());
    const s = service(p, 100);
    await s.runScheduled({ lookbackSessions: 1 });
    await s.refreshHistory("AMD");
    const snap = await s.snapshot("pyraurum", "1W");
    expect(snap.stock).toMatchObject({ ticker: "AMD", company: "Advanced Micro Devices, Inc.", exchange: "Nasdaq" });
    expect(snap.status).toBe("previous_close");
    expect(snap.statusDetail).toMatch(/not live/);
    expect(snap.quote).toMatchObject({ price: 102.5, previousClose: 100, change: 2.5, changePct: 2.5, direction: "up", sessionDate: TODAY, previousSessionDate: PREV });
    expect(snap.chart.points.map((x) => x.close)).toEqual([98, 99, 100, 102.5]);
    // 98→99 (+1.02% → +4.1), 99→100 (+1.01% → +4.0), 100→102.5 (+2.5% → +10): 50 + 18.1
    expect(snap.growth).toMatchObject({ value: 68.1, band: "stirring" });
    expect((await s.snapshot("aurelion")).quote).toMatchObject({ changePct: -1.8, direction: "down" });
    expect((await s.snapshot("mossling")).quote?.direction).toBe("flat");
  });

  it("reading never calls the provider (except the cached 1D chart)", async () => {
    const p = fakeProvider(standardCloses());
    const s = service(p, 100);
    await s.runScheduled({ lookbackSessions: 1, maxCalls: 2 });
    const before = p.calls.length;
    for (let i = 0; i < 5; i++) await s.snapshot("pyraurum", "1M");
    expect(p.calls.length).toBe(before);
  });

  it("the 1D chart is fetched once per session, then served from the cache", async () => {
    const p = fakeProvider(standardCloses());
    const s = service(p, 100);
    await s.runScheduled({ lookbackSessions: 1, maxCalls: 2 });
    expect((await s.snapshot("pyraurum", "1D")).chart.points).toHaveLength(2);
    expect((await s.snapshot("pyraurum", "1D")).chart.points).toHaveLength(2);
    expect(p.calls.filter((c) => c.startsWith("intraday")).length).toBe(1);
  });

  it("explains a 1D chart the plan doesn't include, and stops asking", async () => {
    const p = fakeProvider(standardCloses(), { fail: { intraday: new MarketDataError("FORBIDDEN", "plan") } });
    const s = service(p, 100);
    await s.runScheduled({ lookbackSessions: 1, maxCalls: 2 });
    expect((await s.snapshot("pyraurum", "1D")).chart.unavailable).toMatch(/not included|aren't included/);
    await s.snapshot("pyraurum", "1D");
    expect(p.calls.filter((c) => c.startsWith("intraday")).length).toBe(1);
  });

  it("old data is labelled stale, not passed off as current", async () => {
    await upsertBars(db, "AMD", [bar("2026-10-13", 90), bar("2026-10-14", 91)], "Test feed", NOW);
    const snap = await service(fakeProvider({})).snapshot("pyraurum");
    expect(snap.status).toBe("stale");
    expect(snap.statusDetail).toMatch(/2026-10-14/);
  });

  it("with no data it shows nothing invented", async () => {
    const snap = await service(null).snapshot("pyraurum");
    expect(snap.status).toBe("unavailable");
    expect(snap.quote).toBeNull();
    expect(snap.chart.points).toEqual([]);
    expect(snap.growth).toBeNull();
    expect(unavailableSnapshot("pyraurum", "1M", NOW)).toMatchObject({ status: "unavailable", quote: null, growth: null, stock: { ticker: "AMD" } });
  });

  it("a change across a missing session is not reported as a daily change", async () => {
    await upsertBars(db, "AMD", [bar("2026-10-14", 90), bar(TODAY, 99)], "Test feed", NOW);
    expect((await service(null).snapshot("pyraurum")).quote).toMatchObject({ price: 99, changePct: null, direction: "unknown" });
  });
});

describe("ownership check for classified species", () => {
  it("only a wallet that has hatched the species counts", async () => {
    await db.query(`INSERT INTO holders (owner, source, first_seen_ms) VALUES ('Owner1111', 'fixture', 0)`);
    await db.query(`INSERT INTO eggs (id, owner, sequence, source, earned_ms, earned_slot, incubation_started_ms, incubation_ms, ready_ms, seed, species_id, hatched_ms)
      VALUES ('e1', 'Owner1111', 1, 'fixture', 0, 0, 0, 0, 0, 1, 'astravex', NULL), ('e2', 'Owner1111', 2, 'fixture', 0, 0, 0, 0, 0, 1, 'genesis', 5)`);
    expect(await ownsHatched(db, "Owner1111", "astravex")).toBe(false); // sealed egg: not hatched yet
    expect(await ownsHatched(db, "Owner1111", "genesis")).toBe(true);
    expect(await ownsHatched(db, "Someone", "genesis")).toBe(false);
  });
});
