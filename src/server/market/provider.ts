import "server-only";
import { STOCK_LINKS } from "@/config/stockLinks";
import { exchangeClock, isTradingDay, previousTradingDay } from "@/lib/market/calendar";

/**
 * Market data providers. Everything behind this interface runs on the server; the API key
 * is read from the server environment and never reaches the browser, a log line or an error.
 */

export interface DailyBar {
  /** Session date in exchange time (YYYY-MM-DD). */
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IntradayBar {
  t: number;
  close: number;
}

/** What the subscription provides, which decides how the data is labelled. */
export type ProviderPlan = "eod" | "delayed" | "fixture";

export interface MarketProvider {
  readonly name: string;
  readonly plan: ProviderPlan;
  /** Every US stock's adjusted bar for one session: one request covers all 28 tickers. */
  groupedDaily(date: string): Promise<Map<string, DailyBar>>;
  /** Adjusted daily bars for one ticker, oldest first. */
  dailyBars(ticker: string, from: string, to: string): Promise<DailyBar[]>;
  /** 5-minute bars of one session's regular hours, oldest first. */
  intradayBars(ticker: string, date: string): Promise<IntradayBar[]>;
}

export type MarketErrorCode = "NOT_CONFIGURED" | "FORBIDDEN" | "RATE_LIMITED" | "NOT_FOUND" | "UNAVAILABLE";

export class MarketDataError extends Error {
  constructor(readonly code: MarketErrorCode, message: string) {
    super(message);
  }
}

// ── Massive (formerly Polygon.io) ──────────────────────────────────────────

interface AggResult {
  T?: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  t: number;
}

const finite = (...n: number[]) => n.every((x) => typeof x === "number" && Number.isFinite(x));

function toDaily(r: AggResult): DailyBar | null {
  if (!finite(r.o, r.h, r.l, r.c, r.t) || r.c <= 0) return null;
  // Daily aggregates are stamped at the start of the session day in exchange time.
  return { date: exchangeClock(r.t + 12 * 3600_000).date, open: r.o, high: r.h, low: r.l, close: r.c, volume: Number(r.v) || 0 };
}

export interface MassiveOptions {
  apiKey: string;
  plan?: ProviderPlan;
  baseUrl?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

export function createMassiveProvider(opts: MassiveOptions): MarketProvider {
  const base = (opts.baseUrl ?? "https://api.massive.com").replace(/\/$/, "");
  const doFetch = opts.fetch ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 8000;

  async function get<T>(path: string): Promise<T> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    let res: Response;
    try {
      // The key goes in a header, so it never appears in a URL that could be logged.
      res = await doFetch(`${base}${path}`, { headers: { authorization: `Bearer ${opts.apiKey}`, accept: "application/json" }, signal: ctl.signal, cache: "no-store" });
    } catch {
      throw new MarketDataError("UNAVAILABLE", "The market data provider could not be reached.");
    } finally {
      clearTimeout(timer);
    }
    if (res.status === 401) throw new MarketDataError("NOT_CONFIGURED", "The market data key was rejected.");
    if (res.status === 403) throw new MarketDataError("FORBIDDEN", "This data is not included in the market data plan.");
    if (res.status === 429) throw new MarketDataError("RATE_LIMITED", "The market data provider's rate limit was reached.");
    if (res.status === 404) throw new MarketDataError("NOT_FOUND", "The market data provider has no data for this request.");
    if (!res.ok) throw new MarketDataError("UNAVAILABLE", `The market data provider answered ${res.status}.`);
    try {
      return (await res.json()) as T;
    } catch {
      throw new MarketDataError("UNAVAILABLE", "The market data provider sent an unreadable response.");
    }
  }

  return {
    name: "Massive",
    plan: opts.plan ?? "eod",
    async groupedDaily(date) {
      const body = await get<{ results?: AggResult[] }>(`/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true`);
      const out = new Map<string, DailyBar>();
      for (const r of body.results ?? []) {
        const bar = r.T ? toDaily(r) : null;
        // Grouped results all belong to `date`; keep the requested date rather than re-deriving it.
        if (bar && r.T) out.set(r.T, { ...bar, date });
      }
      return out;
    },
    async dailyBars(ticker, from, to) {
      const body = await get<{ results?: AggResult[] }>(`/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=5000`);
      return (body.results ?? []).map(toDaily).filter((b): b is DailyBar => b !== null);
    },
    async intradayBars(ticker, date) {
      const body = await get<{ results?: AggResult[] }>(`/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/5/minute/${date}/${date}?adjusted=true&sort=asc&limit=50000`);
      return (body.results ?? [])
        .filter((r) => finite(r.c, r.t) && r.c > 0)
        .filter((r) => {
          const c = exchangeClock(r.t);
          return c.date === date && c.minute >= 9 * 60 + 30 && c.minute < 16 * 60;
        })
        .map((r) => ({ t: r.t, close: r.c }));
    },
  };
}

// ── Fixture (local development and tests only) ────────────────────────────

/**
 * Deterministic synthetic prices for local fixture mode and tests. Never real market data:
 * every response built from it is labelled "sample", and the runtime refuses it in production.
 */
export function createFixtureProvider(opts: { now?: () => number; missing?: string[] } = {}): MarketProvider {
  const now = opts.now ?? Date.now;
  const missing = new Set(opts.missing ?? []);
  const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0), 2166136261);
  const rand = (seed: number) => {
    let x = seed >>> 0;
    return () => ((x = (Math.imul(x ^ (x >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
  };
  /** Close for a ticker on a date: a seeded walk from a fixed origin, so any date is reproducible. */
  const closeOn = (ticker: string, date: string) => {
    const r = rand(hash(`${ticker}:${date}`));
    const base = 20 + (hash(ticker) % 480);
    const dayIndex = Math.round(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
    const drift = Math.sin(dayIndex / 23 + (hash(ticker) % 7)) * 0.12 + Math.sin(dayIndex / 7) * 0.04;
    return Math.round(base * (1 + drift + (r() - 0.5) * 0.03) * 100) / 100;
  };
  const bar = (ticker: string, date: string): DailyBar => {
    const c = closeOn(ticker, date);
    const o = closeOn(ticker, previousTradingDay(date));
    return { date, open: o, high: Math.max(o, c) * 1.006, low: Math.min(o, c) * 0.994, close: c, volume: 1_000_000 + (hash(ticker + date) % 9_000_000) };
  };
  const sessions = (from: string, to: string) => {
    const out: string[] = [];
    for (let d = new Date(`${from}T12:00:00Z`); d.toISOString().slice(0, 10) <= to; d.setUTCDate(d.getUTCDate() + 1)) {
      const s = d.toISOString().slice(0, 10);
      if (isTradingDay(s) && s <= exchangeClock(now()).date) out.push(s);
    }
    return out;
  };
  const check = (ticker: string) => {
    if (missing.has(ticker)) throw new MarketDataError("NOT_FOUND", "The market data provider has no data for this request.");
  };
  return {
    name: "Sample data",
    plan: "fixture",
    async groupedDaily(date) {
      const out = new Map<string, DailyBar>();
      if (!isTradingDay(date)) return out;
      for (const { ticker } of STOCK_LINKS) if (!missing.has(ticker)) out.set(ticker, bar(ticker, date));
      return out;
    },
    async dailyBars(ticker, from, to) {
      check(ticker);
      return sessions(from, to).map((d) => bar(ticker, d));
    },
    async intradayBars(ticker, date) {
      check(ticker);
      if (!isTradingDay(date)) return [];
      const open = closeOn(ticker, previousTradingDay(date));
      const close = closeOn(ticker, date);
      const r = rand(hash(`${ticker}:${date}:intraday`));
      const start = Date.parse(`${date}T13:30:00Z`); // 9:30 New York during daylight time; close enough for samples
      return Array.from({ length: 78 }, (_, i) => ({ t: start + i * 300_000, close: Math.round((open + ((close - open) * (i + 1)) / 78 + (r() - 0.5) * open * 0.004) * 100) / 100 }));
    },
  };
}
