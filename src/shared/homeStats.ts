/**
 * GET /api/home-stats: the three live homepage metrics. Every value comes from real data or is
 * null with a status saying why; the UI never shows a placeholder as a live figure.
 */
export type MetricStatus =
  /** Fresh from its source within the metric's refresh window. */
  | "live"
  /** The last good value, kept because a refresh failed or is due; asOf says how old it is. */
  | "stale"
  /** No real value yet: not configured, the source failed, or there is no data. */
  | "unavailable";

export interface Metric<T> {
  value: T | null;
  status: MetricStatus;
  /** When the value was observed at its source (ms since epoch); null when unavailable. */
  asOf: number | null;
  /** Short, user-safe reason when unavailable or stale (no hosts, keys or stack traces). */
  note?: string;
}

export interface HomeStats {
  /** Unique wallet owners with a positive balance, excluding program-controlled owners and configured project wallets. */
  holders: Metric<number> & { slot?: number };
  /** Eggs earned by all holders, from the tracker's egg records (one row per owner and sequence). */
  eggs: Metric<number>;
  /** USD market value of the token. kind says whether it is circulating market cap or FDV. */
  marketCap: Metric<number> & { kind?: "circulating" | "fdv"; priceUsd?: number; source?: string };
  /** Server time this response was assembled. */
  generatedAt: number;
}

/** The note on holders and market cap when the server has no mint or RPC configured (before launch). */
export const NOT_CONFIGURED_NOTE = "Token tracking is not configured on this server.";
