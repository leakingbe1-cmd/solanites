const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** "3d 04h 12m" style duration. */
export function formatDuration(ms: number, opts: { seconds?: boolean } = {}): string {
  const v = Math.max(0, ms);
  const d = Math.floor(v / DAY);
  const h = Math.floor((v % DAY) / HOUR);
  const m = Math.floor((v % HOUR) / MIN);
  const s = Math.floor((v % MIN) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  if (h > 0) return `${h}h ${pad(m)}m${opts.seconds ? ` ${pad(s)}s` : ""}`;
  return `${m}m ${pad(s)}s`;
}

export function formatDays(ms: number): string {
  const days = ms / DAY;
  if (days >= 10) return `${Math.round(days)} days`;
  if (days >= 1) return `${days.toFixed(1)} days`;
  return `${Math.max(0, Math.round(ms / HOUR))} hours`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function shortAddress(a: string): string {
  return a.length > 10 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a;
}

export function pct(x: number): string {
  return `${Math.round(Math.max(0, Math.min(1, x)) * 100)}%`;
}
