import "server-only";
import { exchangeClock, latestCompletedSession, marketStatus, previousTradingDay } from "@/lib/market/calendar";
import { GROWTH_RULES, growthEntries, vigourOf } from "@/lib/market/growth";
import type { ChartPoint, DataStatus, MarketChart, MarketQuote, MarketRange, MarketSnapshot } from "@/lib/market/types";
import { stockLinkOf, type StockLink } from "@/server/market/stockLinks";
import { MarketDataError, type MarketErrorCode } from "./provider";
import type { TdBar, TdQuote, TwelveDataClient } from "./twelvedata";

/**
 * Live market snapshots straight from Twelve Data, with no database: prices, history and
 * Market Vigour are worked out from the provider's own daily closes on each (cached) read.
 * Used by Developer Mode only while public display is off (see marketPublicDisplay()).
 *
 * Budget: the free Basic plan allows 8 credits a minute and 800 a day (one credit per symbol
 * per request). The budget here is PER SERVER INSTANCE: on Vercel several instances can run
 * at once, so it cannot enforce the account-wide limit by itself. It is backed by caching,
 * shared in-flight calls, caching "not found"/"forbidden" answers, and an instance-wide
 * back-off whenever the provider itself answers 429 (doubling up to an hour, so a daily cap
 * isn't retried every minute).
 *
 * Labels never claim real-time: the Basic feed's venues and the meaning of last_quote_at are
 * unverified, so an intraday price is "delayed" (with its age when the provider gives a
 * usable timestamp) or "stale"; a close is "previous_close" or, if the newest completed
 * session is missing, "stale". A session's daily bar counts as a close only once the
 * calendar says that session is complete.
 */

export interface LiveMarketOptions {
  client: TwelveDataClient;
  now?: () => number;
  creditsPerMinute?: number;
  creditsPerDay?: number;
  planLabel?: string;
}

/** Coverage seen per ticker in this instance: "unverified" until a live answer arrives. */
export type Coverage = "unverified" | "ok" | MarketErrorCode;

const RANGE_SESSIONS: Record<Exclude<MarketRange, "1D">, number> = { "1W": 5, "1M": 21, "3M": 63, "1Y": 252 };
const DAILY_BARS = 270;
const STALE_MS = 60 * 60_000;
const TTL = { daily: 30 * 60_000, quoteOpen: 60_000, quoteClosed: 15 * 60_000, intraday: 5 * 60_000, refused: 15 * 60_000 };
const BACKOFF_FIRST_MS = 60_000;
const BACKOFF_MAX_MS = 60 * 60_000;

class BudgetRefused extends MarketDataError {
  constructor() {
    super("RATE_LIMITED", "The market data budget for this minute or day is used up.");
  }
}

export function createLiveMarket(opts: LiveMarketOptions) {
  const now = opts.now ?? Date.now;
  const perMinute = opts.creditsPerMinute ?? 8;
  const perDay = opts.creditsPerDay ?? 800;
  const cache = new Map<string, { at: number; ttl: number; value?: unknown; error?: MarketDataError }>();
  const inflight = new Map<string, Promise<unknown>>();
  const coverage = new Map<string, Coverage>();
  const spent: number[] = [];
  let day = "";
  let dayCount = 0;
  let calls = 0;
  let backoffUntil = 0;
  let backoffMs = 0;

  function take() {
    const t = now();
    if (t < backoffUntil) throw new MarketDataError("RATE_LIMITED", "The market data provider asked us to slow down; waiting before trying again.");
    const d = new Date(t).toISOString().slice(0, 10);
    if (d !== day) {
      day = d;
      dayCount = 0;
    }
    while (spent.length && spent[0] <= t - 60_000) spent.shift();
    if (spent.length >= perMinute || dayCount >= perDay) throw new BudgetRefused();
    spent.push(t);
    dayCount++;
    calls++;
  }

  async function cached<T>(key: string, ticker: string, ttl: (v: T) => number, load: () => Promise<T>): Promise<{ value: T; at: number }> {
    const hit = cache.get(key);
    if (hit && now() - hit.at < hit.ttl) {
      if (hit.error) throw hit.error;
      return { value: hit.value as T, at: hit.at };
    }
    const running = inflight.get(key);
    if (running) return running as Promise<{ value: T; at: number }>;
    const p = (async () => {
      try {
        take();
        const value = await load();
        const at = now();
        cache.set(key, { at, ttl: ttl(value), value });
        coverage.set(ticker, "ok");
        backoffMs = 0;
        return { value, at };
      } catch (e) {
        const err = e instanceof MarketDataError ? e : new MarketDataError("UNAVAILABLE", "The market data provider couldn't be reached.");
        if (err instanceof BudgetRefused) throw err; // our own budget: refills by itself, nothing to remember
        coverage.set(ticker, err.code);
        if (err.code === "RATE_LIMITED" && now() >= backoffUntil) {
          // The provider said 429: back off for the whole instance, doubling up to an hour.
          backoffMs = Math.min(backoffMs ? backoffMs * 2 : BACKOFF_FIRST_MS, BACKOFF_MAX_MS);
          backoffUntil = now() + backoffMs;
        }
        // An uncovered or refused symbol shouldn't spend a credit on every view.
        if (err.code === "NOT_FOUND" || err.code === "FORBIDDEN") cache.set(key, { at: now(), ttl: TTL.refused, error: err });
        throw err;
      }
    })();
    inflight.set(key, p);
    // Cleared after registration even when the call fails synchronously (e.g. budget refused).
    const clear = () => void (inflight.get(key) === p && inflight.delete(key));
    p.then(clear, clear);
    return p;
  }

  const daily = (l: StockLink) => cached<TdBar[]>(`d:${l.exchange}:${l.ticker}`, l.ticker, () => TTL.daily, () => opts.client.timeSeries(l.ticker, l.exchange, "1day", DAILY_BARS));
  const quote = (l: StockLink) => cached<TdQuote>(`q:${l.exchange}:${l.ticker}`, l.ticker, (q) => (q.isMarketOpen ? TTL.quoteOpen : TTL.quoteClosed), () => opts.client.quote(l.ticker, l.exchange));
  const intraday = (l: StockLink) => cached<TdBar[]>(`i:${l.exchange}:${l.ticker}`, l.ticker, () => TTL.intraday, () => opts.client.timeSeries(l.ticker, l.exchange, "5min", 90));

  async function snapshot(speciesId: string, range: MarketRange = "1M"): Promise<MarketSnapshot> {
    const link = stockLinkOf(speciesId);
    if (!link) throw new MarketDataError("NOT_FOUND", "Unknown species.");
    const t = now();
    const market = marketStatus(t);
    const d = await daily(link);
    const qr = await quote(link).catch(() => null);
    const q = qr?.value ?? null;

    // Completed sessions only: a daily bar counts as a close once the calendar says its session
    // is over (and the provider's figures have had time to settle), never while still moving.
    const completed = latestCompletedSession(t);
    const closes = d.value.filter((b) => /^\d{4}-\d{2}-\d{2}$/.test(b.datetime) && b.datetime <= completed).map((b) => ({ date: b.datetime, close: b.close }));
    if (closes.length < 2 && !q) throw new MarketDataError("NOT_FOUND", "The market data provider has no usable history for this symbol.");

    let status: DataStatus;
    let statusDetail: string;
    let delayMinutes: number | null = null;
    let quoteOut: MarketQuote;
    const last = closes.at(-1) ?? null;
    const before = (date: string) => [...closes].reverse().find((c) => c.date < date) ?? null;

    if (q && q.isMarketOpen && market.state === "open") {
      // A timestamp in the future (or missing) means the age is unknown, not zero.
      const age = q.lastQuoteAt !== null && q.lastQuoteAt <= t ? t - q.lastQuoteAt : null;
      delayMinutes = age !== null ? Math.round(age / 60_000) : null;
      if (age !== null && age > STALE_MS) {
        status = "stale";
        statusDetail = `Twelve Data (Basic): the newest price is from ${fmtEtDateTime(q.lastQuoteAt!)} ET, over an hour old while the market is open.`;
      } else {
        status = "delayed";
        statusDetail = age !== null ? `Twelve Data (Basic), as of ${fmtEtDateTime(q.lastQuoteAt!)} ET; may be delayed.` : `Twelve Data (Basic), session of ${q.date}; the provider didn't give a usable time for this price, so treat it as delayed.`;
      }
      const prevClose = q.previousClose ?? last?.close ?? null;
      const change = q.change ?? (prevClose !== null ? round4(q.close - prevClose) : null);
      const changePct = q.changePct ?? (prevClose !== null ? round4(((q.close - prevClose) / prevClose) * 100) : null);
      quoteOut = { price: q.close, previousClose: prevClose, change, changePct, direction: dir(changePct), sessionDate: q.date, previousSessionDate: last && last.date < q.date ? last.date : (before(q.date)?.date ?? null), asOf: age !== null ? q.lastQuoteAt : null };
    } else {
      // Closed (or no usable quote): the latest completed session's close.
      const useQuote = q !== null && q.date <= completed && (!last || q.date >= last.date);
      const sessionDate = useQuote ? q!.date : last?.date;
      const price = useQuote ? q!.close : last?.close;
      if (!sessionDate || price === undefined) throw new MarketDataError("UNAVAILABLE", "The market data provider returned no usable close.");
      const prev = before(sessionDate);
      const prevClose = useQuote && q!.previousClose !== null ? q!.previousClose : (prev?.close ?? null);
      const changePct = prevClose !== null ? round4(((price - prevClose) / prevClose) * 100) : null;
      quoteOut = { price, previousClose: prevClose, change: prevClose !== null ? round4(price - prevClose) : null, changePct, direction: dir(changePct), sessionDate, previousSessionDate: prev?.date ?? null, asOf: null };
      if (sessionDate < completed) {
        status = "stale";
        statusDetail = `Twelve Data (Basic): the newest close is from the ${sessionDate} session; the ${completed} session's close hasn't arrived.`;
      } else {
        status = "previous_close";
        statusDetail = `Twelve Data (Basic): official close of the ${sessionDate} session (end-of-day price).`;
      }
    }

    const chart = await chartOf(link, range, closes, quoteOut.sessionDate);
    // Only true day-over-day moves count: a change across a missing session is not one day's move.
    const entries = growthEntries(closes.slice(-(GROWTH_RULES.windowSessions + 1))).filter((e) => e.previousDate === previousTradingDay(e.date));
    const vig = entries.length ? vigourOf(entries) : null;

    return {
      speciesId,
      stock: { ticker: link.ticker, company: link.company, exchange: link.exchange, sector: link.sector, connection: link.connection },
      status,
      statusDetail,
      quote: quoteOut,
      chart,
      growth: vig && { value: vig.value, band: vig.band, label: vig.label, window: vig.window, rulesVersion: vig.rulesVersion, rules: { pointsPerPercent: GROWTH_RULES.pointsPerPercent, dailyCap: GROWTH_RULES.dailyCap, windowSessions: GROWTH_RULES.windowSessions, neutral: GROWTH_RULES.neutral } },
      market,
      source: { name: "Twelve Data", plan: opts.planLabel ?? "Basic (free) plan", fetchedAt: Math.min(d.at, qr?.at ?? d.at), delayMinutes },
      generatedAt: t,
      review: link.review ?? null,
    };
  }

  async function chartOf(link: StockLink, range: MarketRange, closes: { date: string; close: number }[], session: string): Promise<MarketChart> {
    if (range !== "1D") {
      const pts: ChartPoint[] = closes.slice(-(RANGE_SESSIONS[range] + 1)).map((c) => ({ t: Date.parse(`${c.date}T20:00:00Z`), date: c.date, close: c.close }));
      return { range, interval: "1day", points: pts, unavailable: pts.length >= 2 ? null : "Not enough trading sessions to draw this range." };
    }
    try {
      const { value: bars } = await intraday(link);
      const pts: ChartPoint[] = [];
      for (const b of bars) {
        if (b.datetime.slice(0, 10) !== session) continue;
        const ms = etToEpoch(b.datetime);
        if (ms !== null) pts.push({ t: ms, date: session, close: b.close });
      }
      return { range, interval: "5min", points: pts, unavailable: pts.length >= 2 ? null : "No intraday prices for this session yet." };
    } catch (e) {
      const code = e instanceof MarketDataError ? e.code : "UNAVAILABLE";
      return { range, interval: "5min", points: [], unavailable: code === "RATE_LIMITED" ? "The 1D chart is busy right now; try again in a minute." : code === "FORBIDDEN" ? "Intraday prices aren't included in the current market data plan." : "The 1D chart couldn't be loaded from the market data provider." };
    }
  }

  return {
    snapshot,
    coverageOf: (ticker: string): Coverage => coverage.get(ticker) ?? "unverified",
    stats: () => ({ calls, creditsThisMinute: spent.length, creditsToday: dayCount, perMinute, perDay, backoffUntil: backoffUntil > now() ? backoffUntil : null }),
  };
}

export type LiveMarket = ReturnType<typeof createLiveMarket>;

const round4 = (n: number) => Math.round(n * 10_000) / 10_000;
const dir = (pct: number | null): MarketQuote["direction"] => (pct === null ? "unknown" : pct > 0 ? "up" : pct < 0 ? "down" : "flat");
const fmtEtDateTime = (ms: number) => `${exchangeClock(ms).date} ${new Date(ms).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" })}`;

/** "YYYY-MM-DD HH:mm[:ss]" in New York time → epoch ms (handles both EST and EDT). */
export function etToEpoch(local: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(local);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  for (const offsetH of [4, 5]) {
    const ms = Date.UTC(y, mo - 1, d, h + offsetH, mi);
    const c = exchangeClock(ms);
    if (c.date === local.slice(0, 10) && c.minute === h * 60 + mi) return ms;
  }
  return null;
}
