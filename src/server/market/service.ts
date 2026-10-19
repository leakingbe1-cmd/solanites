import "server-only";
import { MARKET_DATA_SOURCE, STOCK_LINKS, stockLinkOf, type StockLink } from "@/config/stockLinks";
import { latestCompletedSession, marketStatus, previousTradingDay } from "@/lib/market/calendar";
import { GROWTH_RULES, growthEntries, vigourOf, type GrowthEntry } from "@/lib/market/growth";
import type { ChartPoint, DataStatus, MarketChart, MarketQuote, MarketRange, MarketSnapshot } from "@/lib/market/types";
import type { Db } from "../db/types";
import { log } from "../log";
import type { SharedRateLimiter } from "../rateLimitShared";
import { MarketDataError, type DailyBar, type MarketProvider } from "./provider";
import { ledgerCount, readBar, readBars, readIntraday, readLedger, readTickerState, recordGrowth, updateTickerState, upsertBars, writeIntraday, type StoredBar } from "./store";

/** Daily sessions shown per range; one extra session gives the line its starting point. */
const RANGE_SESSIONS: Record<Exclude<MarketRange, "1D">, number> = { "1W": 5, "1M": 21, "3M": 63, "1Y": 252 };

const PLAN_LABEL = { eod: "End-of-day prices", delayed: "Prices delayed 15 minutes", fixture: "Sample data for local development" } as const;

export interface MarketServiceDeps {
  db: Db;
  /** Null when no provider is configured: stored data is still served, nothing new is fetched. */
  provider: MarketProvider | null;
  /** Shared limiter so every instance together stays inside the provider's per-minute allowance. */
  limiter: SharedRateLimiter;
  now?: () => number;
  /** Provider calls allowed per minute across all instances (Massive's free plan allows 5; keep one spare). */
  callsPerMinute?: number;
}

export interface ScheduledResult {
  target: string;
  sessionsRecorded: string[];
  growthRows: number;
  historyRefreshed: string[];
  providerCalls: number;
  stoppedBy: string | null;
}

export function createMarketService(deps: MarketServiceDeps) {
  const { db, provider } = deps;
  const now = deps.now ?? Date.now;
  const callsPerMinute = deps.callsPerMinute ?? 4;
  const sourceName = provider?.name ?? "none";

  /** One provider call, counted against the shared per-minute budget. */
  async function call<T>(fn: (p: MarketProvider) => Promise<T>): Promise<T> {
    if (!provider) throw new MarketDataError("NOT_CONFIGURED", "No market data provider is configured.");
    const r = await deps.limiter.take("market-provider", "all", callsPerMinute, 60_000);
    if (!r.allowed) throw new MarketDataError("RATE_LIMITED", "The market data budget for this minute is used up.");
    return fn(provider);
  }

  /**
   * Records one session's move for every species from a pair of grouped results fetched together,
   * so both closes carry the same split/dividend adjustment. Rows already recorded stay as they were.
   */
  async function recordSession(session: string, prev: Map<string, DailyBar>, cur: Map<string, DailyBar>): Promise<number> {
    const t = now();
    let rows = 0;
    for (const link of STOCK_LINKS) {
      const a = prev.get(link.ticker);
      const b = cur.get(link.ticker);
      if (!a || !b) continue; // no fabricated moves: a missing price records nothing
      await db.tx(async (sql) => {
        // A stored previous close far from the freshly adjusted one means a split or similar: refresh history.
        const stored = await readBar(sql, link.ticker, a.date);
        if (stored && Math.abs(stored.close - a.close) / a.close > 0.02) await updateTickerState(sql, link.ticker, { needsHistory: true });
        await upsertBars(sql, link.ticker, [a, b], sourceName, t);
        rows += await recordGrowth(sql, link.speciesId, link.ticker, growthEntries([a, b]), GROWTH_RULES.version, sourceName, t);
      });
    }
    return rows;
  }

  /** Scheduled pass: record missing sessions (oldest first), then refresh stale history, within `maxCalls`. */
  async function runScheduled(opts: { maxCalls?: number; lookbackSessions?: number } = {}): Promise<ScheduledResult> {
    const maxCalls = opts.maxCalls ?? callsPerMinute;
    const target = latestCompletedSession(now());
    const result: ScheduledResult = { target, sessionsRecorded: [], growthRows: 0, historyRefreshed: [], providerCalls: 0, stoppedBy: null };
    if (!provider) return { ...result, stoppedBy: "NOT_CONFIGURED" };

    const sessions: string[] = [];
    for (let s = target, i = 0; i < (opts.lookbackSessions ?? 5); i++, s = previousTradingDay(s)) sessions.unshift(s);
    const grouped = new Map<string, Map<string, DailyBar>>();
    const groupedFor = async (date: string) => {
      if (!grouped.has(date)) {
        result.providerCalls++;
        grouped.set(date, await call((p) => p.groupedDaily(date)));
      }
      return grouped.get(date)!;
    };

    try {
      for (const s of sessions) {
        if ((await ledgerCount(db, s)) >= STOCK_LINKS.length) continue;
        const needed = [previousTradingDay(s), s].filter((d) => !grouped.has(d)).length;
        if (result.providerCalls + needed > maxCalls) {
          result.stoppedBy = "BUDGET";
          break;
        }
        const prev = await groupedFor(previousTradingDay(s));
        const cur = await groupedFor(s);
        if (cur.size === 0) {
          result.stoppedBy = "NOT_PUBLISHED"; // the provider hasn't published this session yet
          break;
        }
        result.growthRows += await recordSession(s, prev, cur);
        result.sessionsRecorded.push(s);
      }
      // Spend what's left on history: tickers flagged after a split, then the least recently refreshed.
      if (!result.stoppedBy) {
        const states = await Promise.all(STOCK_LINKS.map((l) => readTickerState(db, l.ticker)));
        const queue = states
          .filter((s) => s.needsHistory || !s.historyFetchedMs || now() - s.historyFetchedMs > 14 * 86_400_000)
          .sort((a, b) => Number(b.needsHistory) - Number(a.needsHistory) || (a.historyFetchedMs ?? 0) - (b.historyFetchedMs ?? 0));
        for (const st of queue) {
          if (result.providerCalls >= maxCalls) break;
          result.providerCalls++;
          await refreshHistory(st.ticker);
          result.historyRefreshed.push(st.ticker);
        }
      }
    } catch (e) {
      result.stoppedBy = e instanceof MarketDataError ? e.code : "ERROR";
      log.warn("market.scheduled_stopped", { reason: result.stoppedBy, error: (e as Error).message });
    }
    return result;
  }

  /** Refreshes about a year of daily history for one ticker and records growth for consecutive sessions. */
  async function refreshHistory(ticker: string): Promise<number> {
    const link = STOCK_LINKS.find((l) => l.ticker === ticker);
    if (!link) return 0;
    const to = latestCompletedSession(now());
    const from = new Date(Date.parse(`${to}T12:00:00Z`) - 380 * 86_400_000).toISOString().slice(0, 10);
    let bars: DailyBar[];
    try {
      bars = await call((p) => p.dailyBars(ticker, from, to));
    } catch (e) {
      const code = e instanceof MarketDataError ? e.code : "UNAVAILABLE";
      await updateTickerState(db, ticker, { lastErrorCode: code, lastErrorMs: now() });
      throw e;
    }
    const t = now();
    // Growth only between sessions that follow each other on the exchange calendar.
    const consecutive = growthEntries(bars).filter((e) => e.previousDate === previousTradingDay(e.date));
    return db.tx(async (sql) => {
      await upsertBars(sql, ticker, bars, sourceName, t);
      const rows = await recordGrowth(sql, link.speciesId, ticker, consecutive, GROWTH_RULES.version, sourceName, t);
      await updateTickerState(sql, ticker, { needsHistory: false, historyFetchedMs: t, lastErrorCode: null, lastErrorMs: null });
      return rows;
    });
  }

  function quoteOf(bars: StoredBar[], ledger: GrowthEntry[]): MarketQuote | null {
    const latest = bars.at(-1);
    if (!latest) return null;
    // Prefer the recorded pair (both closes adjusted together); otherwise only a true previous session counts.
    const recorded = ledger.find((e) => e.date === latest.date);
    const prev = bars.at(-2);
    const previousClose = recorded?.previousClose ?? (prev && prev.date === previousTradingDay(latest.date) ? prev.close : null);
    const previousSessionDate = recorded?.previousDate ?? (previousClose !== null ? prev!.date : null);
    const change = previousClose !== null ? Math.round((latest.close - previousClose) * 10_000) / 10_000 : null;
    const changePct = recorded?.changePct ?? (previousClose !== null ? Math.round(((latest.close - previousClose) / previousClose) * 1_000_000) / 10_000 : null);
    const direction = changePct === null ? "unknown" : changePct > 0 ? "up" : changePct < 0 ? "down" : "flat";
    return { price: latest.close, previousClose, change, changePct, direction, sessionDate: latest.date, previousSessionDate };
  }

  async function chartOf(link: StockLink, range: MarketRange, bars: StoredBar[]): Promise<MarketChart> {
    if (range !== "1D") {
      const n = RANGE_SESSIONS[range] + 1;
      const pts: ChartPoint[] = bars.slice(-n).map((b) => ({ t: Date.parse(`${b.date}T20:00:00Z`), date: b.date, close: b.close }));
      return { range, interval: "1day", points: pts, unavailable: pts.length >= 2 ? null : "Not enough recorded sessions to draw this range yet." };
    }
    const session = bars.at(-1)?.date;
    if (!session) return { range, interval: "5min", points: [], unavailable: "No recorded sessions yet." };
    const stored = await readIntraday(db, link.ticker, session);
    if (stored) return { range, interval: "5min", points: stored.points.map((p) => ({ t: p.t, date: session, close: p.close })), unavailable: null };
    const state = await readTickerState(db, link.ticker);
    if (state.intradayForbiddenMs) return { range, interval: "5min", points: [], unavailable: "Intraday prices aren't included in the current market data plan." };
    try {
      const pts = await call((p) => p.intradayBars(link.ticker, session));
      if (pts.length) await writeIntraday(db, link.ticker, session, pts, sourceName, now());
      return { range, interval: "5min", points: pts.map((p) => ({ t: p.t, date: session, close: p.close })), unavailable: pts.length ? null : "No intraday prices were published for this session." };
    } catch (e) {
      const code = e instanceof MarketDataError ? e.code : "UNAVAILABLE";
      if (code === "FORBIDDEN") await updateTickerState(db, link.ticker, { intradayForbiddenMs: now() });
      const why = code === "RATE_LIMITED" ? "The 1D chart is busy right now; try again in a minute." : code === "FORBIDDEN" ? "Intraday prices aren't included in the current market data plan." : code === "NOT_CONFIGURED" ? "Market data isn't connected on this server yet." : "The 1D chart couldn't be loaded from the market data provider.";
      return { range, interval: "5min", points: [], unavailable: why };
    }
  }

  async function snapshot(speciesId: string, range: MarketRange = "1M"): Promise<MarketSnapshot> {
    const link = stockLinkOf(speciesId);
    if (!link) throw new MarketDataError("NOT_FOUND", "Unknown species.");
    const t = now();
    const [bars, ledger] = await Promise.all([readBars(db, link.ticker, 270), readLedger(db, speciesId, GROWTH_RULES.windowSessions)]);
    const latest = bars.at(-1);
    const expected = latestCompletedSession(t);

    let status: DataStatus;
    let statusDetail: string;
    if (!latest) {
      status = "unavailable";
      statusDetail = provider ? `No prices have been recorded for ${link.ticker} yet.` : "Market data isn't connected on this server yet.";
    } else if (provider?.plan === "fixture" || latest.source === "Sample data") {
      status = "sample";
      statusDetail = "Sample prices for local development. These are not real market prices.";
    } else if (latest.date < previousTradingDay(expected)) {
      status = "stale";
      statusDetail = `The newest recorded close is from ${latest.date}; newer prices haven't arrived yet.`;
    } else {
      status = "previous_close";
      statusDetail = `Official close of the ${latest.date} session. End-of-day prices, not live.`;
    }

    const chart = status === "unavailable" ? { range, interval: range === "1D" ? ("5min" as const) : ("1day" as const), points: [], unavailable: statusDetail } : await chartOf(link, range, bars);
    if (provider?.plan === "delayed" && range === "1D" && chart.points.length && status === "previous_close") statusDetail += " The 1D chart is delayed 15 minutes.";
    const vig = ledger.length ? vigourOf(ledger) : null;

    return {
      speciesId,
      stock: { ticker: link.ticker, company: link.company, exchange: link.exchange, sector: link.sector, connection: link.connection },
      status,
      statusDetail,
      quote: status === "unavailable" ? null : quoteOf(bars, ledger),
      chart,
      growth: vig && { value: vig.value, band: vig.band, label: vig.label, window: vig.window, rulesVersion: vig.rulesVersion, rules: { pointsPerPercent: GROWTH_RULES.pointsPerPercent, dailyCap: GROWTH_RULES.dailyCap, windowSessions: GROWTH_RULES.windowSessions, neutral: GROWTH_RULES.neutral } },
      market: marketStatus(t),
      source: { name: latest ? `${latest.source === "Sample data" ? "Sample data" : MARKET_DATA_SOURCE}` : MARKET_DATA_SOURCE, plan: provider ? PLAN_LABEL[provider.plan] : "Not connected", fetchedAt: latest?.fetchedMs ?? null },
      generatedAt: t,
      review: link.review ?? null,
    };
  }

  /** Owner diagnostics: every link's data state and growth breakdown (classified species included). */
  async function diagnostics() {
    const t = now();
    const expected = latestCompletedSession(t);
    return Promise.all(
      STOCK_LINKS.map(async (l) => {
        const [bars, ledger, state] = await Promise.all([readBars(db, l.ticker, 2), readLedger(db, l.speciesId, GROWTH_RULES.windowSessions), readTickerState(db, l.ticker)]);
        const latest = bars.at(-1) ?? null;
        return {
          ...l,
          latestSession: latest?.date ?? null,
          latestClose: latest?.close ?? null,
          expectedSession: expected,
          upToDate: latest ? latest.date >= expected : false,
          growth: ledger.length ? vigourOf(ledger) : null,
          state,
        };
      }),
    );
  }

  return { runScheduled, refreshHistory, snapshot, diagnostics };
}

export type MarketService = ReturnType<typeof createMarketService>;

/** Identity and market status only, for when no database is configured: nothing invented. */
export function unavailableSnapshot(speciesId: string, range: MarketRange, nowMs: number, detail = "Market data isn't connected on this server yet."): MarketSnapshot {
  const link = stockLinkOf(speciesId);
  if (!link) throw new MarketDataError("NOT_FOUND", "Unknown species.");
  return {
    speciesId,
    stock: { ticker: link.ticker, company: link.company, exchange: link.exchange, sector: link.sector, connection: link.connection },
    status: "unavailable",
    statusDetail: detail,
    quote: null,
    chart: { range, interval: range === "1D" ? "5min" : "1day", points: [], unavailable: detail },
    growth: null,
    market: marketStatus(nowMs),
    source: { name: MARKET_DATA_SOURCE, plan: "Not connected", fetchedAt: null },
    generatedAt: nowMs,
    review: link.review ?? null,
  };
}
