const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** "3d 04h 12m" style duration. */
/** "00:42" / "01:05": a short countdown for minute-scale timers. Longer spans fall back to formatDuration. */
export function formatClock(ms: number): string {
  const v = Math.max(0, Math.ceil(ms / 1000));
  if (v >= 3600) return formatDuration(ms);
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}

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

/** Short milestone length: "5 min", "30 min", "2 h", "24 h", "3 days". */
export function formatSpan(ms: number): string {
  if (ms < HOUR) return `${Math.round(ms / MIN)} min`;
  if (ms <= DAY) return `${+(ms / HOUR).toFixed(1)} h`;
  return `${+(ms / DAY).toFixed(1)} days`;
}
