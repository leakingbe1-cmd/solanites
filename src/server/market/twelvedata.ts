import "server-only";
import type { Exchange } from "@/server/market/stockLinks";
import { MarketDataError, type MarketErrorCode } from "./provider";

/**
 * Twelve Data REST client (https://twelvedata.com/docs), server side only.
 *
 * The key travels in the Authorization header, never in a URL, so it can't appear in a log
 * line, an error or a cache key. Every response is checked before use: the symbol and exchange
 * must be the ones asked for (so one ticker's prices can never land under another creature),
 * the currency must be USD, prices must be finite and positive, and dates must parse. Anything
 * that fails is dropped or rejected; nothing is filled in. A date reported twice with different
 * closes is dropped entirely rather than resolved by whichever record came first.
 */

export interface TwelveDataOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

export interface TdBar {
  /** YYYY-MM-DD for daily bars; "YYYY-MM-DD HH:mm:ss" in exchange time for intraday. */
  datetime: string;
  close: number;
}

export interface TdQuote {
  close: number;
  previousClose: number | null;
  change: number | null;
  changePct: number | null;
  /** Session date of the quote (YYYY-MM-DD, exchange time). */
  date: string;
  isMarketOpen: boolean;
  /** Epoch ms of the latest intraday price, when the provider reports one. */
  lastQuoteAt: number | null;
}

export interface TwelveDataClient {
  timeSeries(ticker: string, exchange: Exchange, interval: "1day" | "5min", outputsize: number): Promise<TdBar[]>;
  quote(ticker: string, exchange: Exchange): Promise<TdQuote>;
}

/** Twelve Data's exchange names for the two listings we use. */
const TD_EXCHANGE: Record<Exchange, string> = { NYSE: "NYSE", Nasdaq: "NASDAQ" };

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
const DATE = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/;

/** Map a Twelve Data error to our codes. The provider's message is never passed on. */
function codeFor(httpStatus: number, bodyCode: unknown): MarketErrorCode {
  const c = typeof bodyCode === "number" ? bodyCode : httpStatus;
  if (c === 401 || c === 403) return "FORBIDDEN";
  if (c === 429) return "RATE_LIMITED";
  // 404 means the symbol isn't covered; a 400 is a request the provider couldn't use, which says
  // nothing about coverage (and must not read as "not found", which the routes turn into 404).
  if (c === 404) return "NOT_FOUND";
  return "UNAVAILABLE";
}
const MESSAGES: Record<MarketErrorCode, string> = {
  NOT_CONFIGURED: "Market data isn't configured.",
  FORBIDDEN: "The market data provider refused the request (plan or key).",
  RATE_LIMITED: "The market data provider's rate limit was reached.",
  NOT_FOUND: "The market data provider has no data for this symbol.",
  UNAVAILABLE: "The market data provider couldn't be reached.",
};

export function createTwelveDataClient(opts: TwelveDataOptions): TwelveDataClient {
  const base = (opts.baseUrl ?? "https://api.twelvedata.com").replace(/\/$/, "");
  const doFetch = opts.fetch ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 8000;

  async function get(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
    const url = `${base}${path}?${new URLSearchParams(params)}`;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    let res: Response;
    try {
      res = await doFetch(url, { headers: { authorization: `apikey ${opts.apiKey}`, accept: "application/json" }, signal: ctl.signal, cache: "no-store" });
    } catch {
      throw new MarketDataError("UNAVAILABLE", MESSAGES.UNAVAILABLE);
    } finally {
      clearTimeout(timer);
    }
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    // Twelve Data reports most errors as HTTP 200 with { status: "error", code }.
    if (!res.ok || !body || body.status === "error") {
      const code = codeFor(res.status, body?.code);
      throw new MarketDataError(code, MESSAGES[code]);
    }
    return body;
  }

  function checkIdentity(body: Record<string, unknown>, ticker: string, exchange: Exchange, where: "meta" | "root") {
    const id = (where === "meta" ? body.meta : body) as Record<string, unknown> | undefined;
    if (!id || id.symbol !== ticker) throw new MarketDataError("UNAVAILABLE", "The provider answered for a different symbol.");
    if (id.exchange !== undefined && id.exchange !== TD_EXCHANGE[exchange]) throw new MarketDataError("UNAVAILABLE", "The provider answered for a different exchange.");
    if (id.currency !== undefined && id.currency !== "USD") throw new MarketDataError("UNAVAILABLE", "The provider answered in an unexpected currency.");
  }

  return {
    async timeSeries(ticker, exchange, interval, outputsize) {
      const body = await get("/time_series", { symbol: ticker, exchange: TD_EXCHANGE[exchange], interval, outputsize: String(outputsize), order: "ASC", timezone: "Exchange" });
      checkIdentity(body, ticker, exchange, "meta");
      // Duplicate dates: identical closes collapse to one bar; conflicting closes invalidate the
      // date (every record for it is dropped), so the series never depends on record order.
      const closesByDate = new Map<string, Set<number>>();
      for (const v of Array.isArray(body.values) ? (body.values as Record<string, unknown>[]) : []) {
        const close = num(v.close);
        const dt = typeof v.datetime === "string" ? v.datetime : "";
        if (close === null || close <= 0 || !DATE.test(dt)) continue;
        const set = closesByDate.get(dt) ?? new Set<number>();
        set.add(close);
        closesByDate.set(dt, set);
      }
      const bars: TdBar[] = [];
      for (const [datetime, closes] of closesByDate) if (closes.size === 1) bars.push({ datetime, close: [...closes][0] });
      bars.sort((a, b) => (a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : 0));
      return bars;
    },

    async quote(ticker, exchange) {
      const body = await get("/quote", { symbol: ticker, exchange: TD_EXCHANGE[exchange] });
      checkIdentity(body, ticker, exchange, "root");
      const close = num(body.close);
      const date = typeof body.datetime === "string" ? body.datetime.slice(0, 10) : "";
      if (close === null || close <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new MarketDataError("UNAVAILABLE", "The provider's quote didn't contain a usable price.");
      const prev = num(body.previous_close);
      const lastQuoteAt = num(body.last_quote_at);
      return {
        close,
        previousClose: prev !== null && prev > 0 ? prev : null,
        change: num(body.change),
        changePct: num(body.percent_change),
        date,
        isMarketOpen: body.is_market_open === true,
        // Seconds since the epoch; refuse anything implausible rather than guess.
        lastQuoteAt: lastQuoteAt !== null && lastQuoteAt > 1_500_000_000 ? lastQuoteAt * 1000 : null,
      };
    },
  };
}
