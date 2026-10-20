import type { MarketStatus } from "./calendar";
import type { GrowthEntry, VigourBand } from "./growth";

/** Chart ranges. 1D is the last completed session's intraday bars; the rest are daily closes. */
export const MARKET_RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;
export type MarketRange = (typeof MARKET_RANGES)[number];

/**
 * How fresh the numbers are, decided from the provider's own timestamps, never assumed.
 *   realtime        an intraday price no more than 2 minutes old while the market is open
 *   previous_close  last completed session's official close (end-of-day data)
 *   delayed         an intraday price older than that, or one whose age the provider didn't give
 *   stale           the newest stored session is older than it should be
 *   sample          local development fixture data, not real prices
 *   unavailable     no trustworthy data; nothing is shown in its place
 */
export type DataStatus = "realtime" | "previous_close" | "delayed" | "stale" | "sample" | "unavailable";

export interface StockIdentity {
  ticker: string;
  company: string;
  exchange: string;
  sector: string;
  connection: string;
}

export interface MarketQuote {
  /** Official close of `sessionDate`, or the latest intraday price when `asOf` is set. */
  price: number;
  previousClose: number | null;
  change: number | null;
  changePct: number | null;
  direction: "up" | "down" | "flat" | "unknown";
  sessionDate: string;
  previousSessionDate: string | null;
  /** Epoch ms of an intraday price, from the provider's own timestamp; absent for closes. */
  asOf?: number | null;
}

export interface ChartPoint {
  /** Epoch ms (intraday) or the session's date at 16:00 exchange time (daily). */
  t: number;
  /** Session date (YYYY-MM-DD). */
  date: string;
  close: number;
}

export interface MarketChart {
  range: MarketRange;
  points: ChartPoint[];
  /** Why there are no points, in plain words, when `points` is empty. */
  unavailable: string | null;
  interval: "5min" | "1day";
}

export interface MarketGrowth {
  value: number;
  band: VigourBand;
  label: string;
  /** Newest first: the sessions currently counted. */
  window: GrowthEntry[];
  rulesVersion: number;
  rules: { pointsPerPercent: number; dailyCap: number; windowSessions: number; neutral: number };
}

export interface MarketSnapshot {
  speciesId: string;
  stock: StockIdentity;
  status: DataStatus;
  /** One sentence describing `status`, safe to show to anyone. */
  statusDetail: string;
  quote: MarketQuote | null;
  chart: MarketChart;
  growth: MarketGrowth | null;
  market: MarketStatus;
  source: { name: string; plan: string; fetchedAt: number | null; delayMinutes?: number | null };
  /** When this response was produced (server clock). */
  generatedAt: number;
  review: string | null;
}
