import type { MarketStatus } from "./calendar";
import type { GrowthEntry, VigourBand } from "./growth";

/** Chart ranges. 1D is the last completed session's intraday bars; the rest are daily closes. */
export const MARKET_RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;
export type MarketRange = (typeof MARKET_RANGES)[number];

/**
 * How fresh the numbers are. Never "live": the configured plans provide end-of-day or
 * delayed data, and the label says exactly which.
 *   previous_close  last completed session's official close (end-of-day data)
 *   delayed         intraday prices delayed by the provider (paid plans)
 *   stale           the newest stored session is older than it should be
 *   sample          local development fixture data, not real prices
 *   unavailable     no trustworthy data; nothing is shown in its place
 */
export type DataStatus = "previous_close" | "delayed" | "stale" | "sample" | "unavailable";

export interface StockIdentity {
  ticker: string;
  company: string;
  exchange: string;
  sector: string;
  connection: string;
}

export interface MarketQuote {
  /** Official close of `sessionDate`. */
  price: number;
  previousClose: number | null;
  change: number | null;
  changePct: number | null;
  direction: "up" | "down" | "flat" | "unknown";
  sessionDate: string;
  previousSessionDate: string | null;
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
  source: { name: string; plan: string; fetchedAt: number | null };
  /** When this response was produced (server clock). */
  generatedAt: number;
  review: string | null;
}
