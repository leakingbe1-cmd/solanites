import type { HomeStats, Metric, MetricStatus } from "@/shared/homeStats";

/**
 * What the homepage shows for each live metric (src/components/landing/HomeMetrics.tsx), worked
 * out from /api/home-stats. A value is shown only when the server has one: an unavailable metric
 * reads "Unavailable" with its reason, never 0 or a placeholder number.
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

/** The freshness line's parts, with attribution for the market source; `optional` parts may be hidden on phones. */
export function freshnessParts(stats: HomeStats, now: number): { text: string; optional?: boolean }[] {
  const parts: { text: string; optional?: boolean }[] = [{ text: `Updated ${ago(stats.generatedAt, now)}` }, { text: "refreshes every 30 s", optional: true }];
  if (stats.marketCap.source && stats.marketCap.status !== "unavailable") parts.push({ text: `market data: ${stats.marketCap.source}` });
  return parts;
}

export const freshnessLine = (stats: HomeStats, now: number) => freshnessParts(stats, now).map((p) => p.text).join(" · ");

/** Shown in place of all three when the route itself can't be reached and there's no earlier answer. */
export const UNREACHABLE_NOTE = "Live metrics are temporarily unavailable.";

export const POLL_MS = 30_000;
