import { NOT_CONFIGURED_NOTE, type HomeStats, type Metric, type MetricStatus } from "@/shared/homeStats";

/**
 * The homepage's live figures (src/components/landing/ProofStrip.tsx), worked out from
 * /api/home-stats. A value is shown only when the server has one: a metric without data is left
 * out, never shown as 0, a placeholder or "Unavailable".
 */
export type MetricKey = "holders" | "eggs" | "marketCap";

export interface MetricView {
  key: MetricKey;
  label: string;
  /** A shorter label for phones, where it differs. */
  shortLabel?: string;
  /** The number to show (animated by the component), or null when there is none. */
  value: number | null;
  format: (n: number) => string;
  status: MetricStatus;
  /** The live dot: only for a metric fresh from its source. */
  live: boolean;
  /** Small line under the number: "updated 4m ago", the unavailable reason, or nothing. */
  detail: string | null;
}

export const formatCount = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

/** $1.23M, $45.6K, $2.10B; whole dollars below a thousand. */
export function formatUsdCompact(n: number): string {
  const abs = Math.abs(n);
  const unit = abs >= 1e9 ? ["B", 1e9] : abs >= 1e6 ? ["M", 1e6] : abs >= 1e3 ? ["K", 1e3] : null;
  if (!unit) return `$${Math.round(n).toLocaleString("en-US")}`;
  const v = n / (unit[1] as number);
  return `$${v.toFixed(Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2)}${unit[0]}`;
}

/** "just now", "4m ago", "2h ago", "3d ago". */
export function ago(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function view(key: MetricKey, label: string, m: Metric<number>, format: (n: number) => string, now: number): MetricView {
  const has = m.status !== "unavailable" && typeof m.value === "number" && Number.isFinite(m.value);
  const status: MetricStatus = has ? m.status : "unavailable";
  const detail = !has ? (m.note ?? "No data yet.") : status === "stale" ? (m.asOf ? `updated ${ago(m.asOf, now)}` : (m.note ?? "may be out of date")) : null;
  return { key, label, value: has ? (m.value as number) : null, format, status, live: status === "live", detail };
}

export function metricViews(stats: HomeStats, now: number): MetricView[] {
  const fdv = stats.marketCap.kind === "fdv";
  return [
    view("holders", "Holders", stats.holders, formatCount, now),
    view("eggs", "Eggs collected", stats.eggs, formatCount, now),
    { ...view("marketCap", fdv ? "FDV" : "Live market cap", stats.marketCap, formatUsdCompact, now), shortLabel: fdv ? undefined : "Market cap" },
  ];
}

/**
 * Before launch the server has no mint or RPC, so there is nothing live to show: the homepage shows
 * a designed pre-launch panel instead of three "Unavailable" boxes. A transient failure after launch
 * still shows the live strip with its reasons.
 */
export const isPreLaunch = (stats: HomeStats): boolean =>
  stats.holders.status === "unavailable" && stats.holders.note === NOT_CONFIGURED_NOTE && stats.marketCap.status === "unavailable";

export const POLL_MS = 30_000;
