import "server-only";
import { exchangeClock, marketStatus } from "@/lib/market/calendar";
import { GROWTH_RULES, growthEntries, vigourOf } from "@/lib/market/growth";
import type { ChartPoint, DataStatus, MarketChart, MarketQuote, MarketRange, MarketSnapshot } from "@/lib/market/types";
import { stockLinkOf, type StockLink } from "@/server/market/stockLinks";
import { MarketDataError } from "./provider";
import type { TdBar, TdQuote, TwelveDataClient } from "./twelvedata";

/**
 * Live market snapshots straight from Twelve Data, with no database: prices, history and
 * Market Vigour are worked out from the provider's own daily closes on each (cached) read.
 * Vigour is deterministic for a given history, so this gives the same value the ledger would.
 *
 * Budget: the free Basic plan allows 8 credits a minute and 800 a day (one credit per symbol
 * per request). Reads are cached per server instance, identical in-flight requests share one
 * call, and the budget is enforced before calling, so a burst can't exhaust the day's quota.
 * A rate-limit answer is remembered for a minute instead of being retried at once.
 *
 * Status comes from the provider's timestamps: "realtime" only for an intraday price at most
 * two minutes old while the market is open; otherwise delayed, stale or the last close.
 */

export interface LiveMarketOptions {
  client: TwelveDataClient;
  now?: () => number;
  creditsPerMinute?: number;
  creditsPerDay?: number;
  planLabel?: string;
}

const RANGE_SESSIONS: Record<Exclude<MarketRange, "1D">, number> = { "1W": 5, "1M": 21, "3M": 63, "1Y": 252 };
const DAILY_BARS = 270;
const REALTIME_MS = 2 * 60_000;
const STALE_MS = 60 * 60_000;

const TTL = { daily: 30 * 60_000, quoteOpen: 60_000, quoteClosed: 15 * 60_000, intraday: 5 * 60_000, rateLimited: 60_000 };

export function createLiveMarket(opts: LiveMarketOptions) {
  const now = opts.now ?? Date.now;
  const perMinute = opts.creditsPerMinute ?? 8;
  const perDay = opts.creditsPerDay ?? 800;
  const cache = new Map<string, { at: number; ttl: number; value?: unknown; error?: MarketDataError }>();
  const inflight = new Map<string, Promise<unknown>>();
  const spent: number[] = [];
  let day = "";
  let dayCount = 0;
  let calls = 0;

  function take() {
    const t = now();
    const d = new Date(t).toISOString().slice(0, 10);
    if (d !== day) {
      day = d;
      dayCount = 0;
    }
    while (spent.length && spent[0] <= t - 60_000) spent.shift();
    if (spent.length >= perMinute || dayCount >= perDay) throw new MarketDataError("RATE_LIMITED", "The market data budget for this minute or day is used up.");
    spent.push(t);
    dayCount++;
    calls++;
  }

  async function cached<T>(key: string, ttl: (v: T) => number, load: () => Promise<T>): Promise<T> {
    const hit = cache.get(key);
    if (hit && now() - hit.at < hit.ttl) {
      if (hit.error) throw hit.error;
      return hit.value as T;
    }
    const running = inflight.get(key);
    if (running) return running as Promise<T>;
    const p = (async () => {
      try {
        take();
        const value = await load();
        cache.set(key, { at: now(), ttl: ttl(value), value });
        return value;
      } catch (e) {
        const err = e instanceof MarketDataError ? e : new MarketDataError("UNAVAILABLE", "The market data provider couldn't be reached.");
        if (err.code === "RATE_LIMITED") cache.set(key, { at: now(), ttl: TTL.rateLimited, error: err });
        throw err;
      }
    })();
    inflight.set(key, p);
    // Cleared after registration even when the call fails synchronously (e.g. budget refused).
    const clear = () => void (inflight.get(key) === p && inflight.delete(key));
    p.then(clear, clear);
    return p;
  }

  const daily = (l: StockLink) => cached<TdBar[]>(`d:${l.exchange}:${l.ticker}`, () => TTL.daily, () => opts.client.timeSeries(l.ticker, l.exchange, "1day", DAILY_BARS));
  const quote = (l: StockLink) => cached<TdQuote>(`q:${l.exchange}:${l.ticker}`, (q) => (q.isMarketOpen ? TTL.quoteOpen : TTL.quoteClosed), () => opts.client.quote(l.ticker, l.exchange));
  const intraday = (l: StockLink) => cached<TdBar[]>(`i:${l.exchange}:${l.ticker}`, () => TTL.intraday, () => opts.client.timeSeries(l.ticker, l.exchange, "5min", 90));

  async function snapshot(speciesId: string, range: MarketRange = "1M"): Promise<MarketSnapshot> {
    const link = stockLinkOf(speciesId);
    if (!link) throw new MarketDataError("NOT_FOUND", "Unknown species.");
    const t = now();
    const market = marketStatus(t);
    const bars = await daily(link);
    const q = await quote(link).catch(() => null);

    // Completed sessions only: while the market is open, today's daily bar is still moving.
    const today = exchangeClock(t).date;
    const closes = bars.filter((b) => /^\d{4}-\d{2}-\d{2}$/.test(b.datetime) && !(market.state !== "closed" && market.state !== "after_hours" && b.datetime === today)).map((b) => ({ date: b.datetime, close: b.close }));
    if (closes.length < 2 && !q) throw new MarketDataError("NOT_FOUND", "The market data provider has no usable history for this symbol.");

    let status: DataStatus;
    let statusDetail: string;
    let delayMinutes: number | null = null;
    let quoteOut: MarketQuote | null;
    const last = closes.at(-1) ?? null;
    const before = (date: string) => [...closes].reverse().find((c) => c.date < date) ?? null;

    if (q && q.isMarketOpen && market.state === "open") {
      const age = q.lastQuoteAt !== null ? Math.max(0, t - q.lastQuoteAt) : null;
      delayMinutes = age !== null ? Math.round(age / 60_000) : null;
      if (age !== null && age <= REALTIME_MS) {
        status = "realtime";
        statusDetail = `Real-time price from Twelve Data, as of ${fmtEt(q.lastQuoteAt!)} ET.`;
      } else if (age !== null && age > STALE_MS) {
        status = "stale";
        statusDetail = `The newest price is from ${fmtEt(q.lastQuoteAt!)} ET, over an hour old while the market is open.`;
      } else {
        status = "delayed";
        statusDetail = age !== null ? `Delayed about ${delayMinutes} min (price as of ${fmtEt(q.lastQuoteAt!)} ET).` : "Delayed: the provider didn't report when this price was traded.";
      }
      const prevClose = q.previousClose ?? last?.close ?? null;
      const change = q.change ?? (prevClose !== null ? round4(q.close - prevClose) : null);
      const changePct = q.changePct ?? (prevClose !== null ? round4(((q.close - prevClose) / prevClose) * 100) : null);
      quoteOut = { price: q.close, previousClose: prevClose, change, changePct, direction: dir(changePct), sessionDate: q.date, previousSessionDate: last && last.date < q.date ? last.date : (before(q.date)?.date ?? null), asOf: q.lastQuoteAt };
    } else {
      // Closed (or the quote failed): the latest official close, from the quote when it has one.
      const sessionDate = q && (!last || q.date >= last.date) ? q.date : last?.date;
      const price = q && sessionDate === q.date ? q.close : last?.close;
      if (!sessionDate || price === undefined) throw new MarketDataError("UNAVAILABLE", "The market data provider returned no usable close.");
      const prev = before(sessionDate);
      const prevClose = q && sessionDate === q.date && q.previousClose !== null ? q.previousClose : (prev?.close ?? null);
      const changePct = prevClose !== null ? round4(((price - prevClose) / prevClose) * 100) : null;
      quoteOut = { price, previousClose: prevClose, change: prevClose !== null ? round4(price - prevClose) : null, changePct, direction: dir(changePct), sessionDate, previousSessionDate: prev?.date ?? null, asOf: null };
      status = "previous_close";
      statusDetail = `Official close of the ${sessionDate} session (end-of-day price, not live).`;
    }

    const chart = await chartOf(link, range, closes, quoteOut.sessionDate);
    const vig = closes.length >= 2 ? vigourOf(growthEntries(closes.slice(-(GROWTH_RULES.windowSessions + 1)))) : null;

    return {
      speciesId,
      stock: { ticker: link.ticker, company: link.company, exchange: link.exchange, sector: link.sector, connection: link.connection },
      status,
      statusDetail,
      quote: quoteOut,
      chart,
      growth: vig && { value: vig.value, band: vig.band, label: vig.label, window: vig.window, rulesVersion: vig.rulesVersion, rules: { pointsPerPercent: GROWTH_RULES.pointsPerPercent, dailyCap: GROWTH_RULES.dailyCap, windowSessions: GROWTH_RULES.windowSessions, neutral: GROWTH_RULES.neutral } },
      market,
      source: { name: "Twelve Data", plan: opts.planLabel ?? "Basic (free) plan", fetchedAt: t, delayMinutes },
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
      const bars = await intraday(link);
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

  return { snapshot, stats: () => ({ calls, creditsThisMinute: spent.length, creditsToday: dayCount, perMinute, perDay }) };
}

export type LiveMarket = ReturnType<typeof createLiveMarket>;

const round4 = (n: number) => Math.round(n * 10_000) / 10_000;
const dir = (pct: number | null): MarketQuote["direction"] => (pct === null ? "unknown" : pct > 0 ? "up" : pct < 0 ? "down" : "flat");
const fmtEt = (ms: number) => new Date(ms).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });

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
