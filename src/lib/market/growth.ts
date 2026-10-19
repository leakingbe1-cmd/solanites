/**
 * Market Vigour: how a species' linked stock has been moving, as a bounded game indicator.
 *
 * WHAT IT IS: a cosmetic, species-level indicator shown beside the creature. It is separate
 * from the creature's base stats (species.ts), its permanent progression (evolution through
 * holding, progression.ts) and everything an egg or reward depends on. Market data can't
 * change ownership, rarity, hatch odds, evolution timing or rewards, and owning a creature
 * says nothing about how its stock will perform.
 *
 * THE FORMULA (rules version 1):
 *   1. Daily change, from two consecutive completed trading sessions on the primary exchange:
 *        changePct = (close − previousClose) / previousClose × 100
 *      Split- and dividend-adjusted closes, so a stock split never looks like a crash.
 *   2. Daily growth points, rounded to 0.1 and capped:
 *        points = clamp(round1(changePct × 4), −10, +10)
 *      so a 2.5% day earns +10 (the cap) and a 1.8% fall costs −7.2.
 *   3. Vigour, from the last 20 recorded sessions (about four trading weeks):
 *        vigour = clamp(50 + Σ points, 0, 100)
 *      50 is neutral. The rolling window keeps it bounded and responsive: old moves age out
 *      instead of compounding, so no streak of extreme days can run away.
 *
 * Deterministic and idempotent by construction: vigour is a pure function of stored daily
 * closes, and each (species, session) is recorded once (see server/market/store.ts). Reloading,
 * refreshing or logging in again recomputes the same number; nothing is "applied" twice.
 */

export const GROWTH_RULES = {
  version: 1,
  pointsPerPercent: 4,
  dailyCap: 10,
  windowSessions: 20,
  neutral: 50,
  min: 0,
  max: 100,
} as const;

export type GrowthRules = typeof GROWTH_RULES;

/** One completed trading session (YYYY-MM-DD in the exchange's time zone). */
export interface DailyClose {
  date: string;
  close: number;
}

export interface GrowthEntry {
  date: string;
  previousDate: string;
  previousClose: number;
  close: number;
  /** Percent, rounded to 4 decimal places. */
  changePct: number;
  points: number;
}

const round = (v: number, dp: number) => {
  const f = 10 ** dp;
  // Round half away from zero, so +x and −x always mirror each other.
  return (Math.sign(v) * Math.round(Math.abs(v) * f)) / f || 0;
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const valid = (n: number) => Number.isFinite(n) && n > 0;

/** Percentage change between two closes, or null when either close is unusable. */
export function dailyChangePct(previousClose: number, close: number): number | null {
  if (!valid(previousClose) || !valid(close)) return null;
  return round(((close - previousClose) / previousClose) * 100, 4);
}

/** Growth points for one day's percentage change: bounded, symmetric, rounded to 0.1. */
export function growthPoints(changePct: number, rules: GrowthRules = GROWTH_RULES): number {
  if (!Number.isFinite(changePct)) return 0;
  return clamp(round(changePct * rules.pointsPerPercent, 1), -rules.dailyCap, rules.dailyCap);
}

/**
 * Growth entries for consecutive sessions. `closes` may arrive unsorted and may repeat a
 * date (the newest value for a date wins); sessions with unusable prices are skipped and
 * break the chain, so a missing day never turns into a fabricated move.
 */
export function growthEntries(closes: DailyClose[], rules: GrowthRules = GROWTH_RULES): GrowthEntry[] {
  const byDate = new Map<string, number>();
  for (const c of closes) if (/^\d{4}-\d{2}-\d{2}$/.test(c.date)) byDate.set(c.date, c.close);
  const sorted = [...byDate.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const out: GrowthEntry[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const [previousDate, previousClose] = sorted[i - 1];
    const [date, close] = sorted[i];
    const changePct = dailyChangePct(previousClose, close);
    if (changePct === null) continue;
    out.push({ date, previousDate, previousClose, close, changePct, points: growthPoints(changePct, rules) });
  }
  return out;
}

export type VigourBand = "dormant" | "subdued" | "steady" | "stirring" | "surging";

export const VIGOUR_BANDS: { band: VigourBand; label: string; from: number }[] = [
  { band: "dormant", label: "Dormant", from: 0 },
  { band: "subdued", label: "Subdued", from: 30 },
  { band: "steady", label: "Steady", from: 45 },
  { band: "stirring", label: "Stirring", from: 56 },
  { band: "surging", label: "Surging", from: 70 },
];

export function vigourBand(vigour: number): (typeof VIGOUR_BANDS)[number] {
  let pick = VIGOUR_BANDS[0];
  for (const b of VIGOUR_BANDS) if (vigour >= b.from) pick = b;
  return pick;
}

export interface Vigour {
  value: number;
  band: VigourBand;
  label: string;
  /** The sessions that make up the current value, newest first. */
  window: GrowthEntry[];
  rulesVersion: number;
}

/** Current vigour from growth entries (any order): neutral plus the last N sessions' points. */
export function vigourOf(entries: GrowthEntry[], rules: GrowthRules = GROWTH_RULES): Vigour {
  const window = [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, rules.windowSessions);
  const sum = window.reduce((s, e) => s + e.points, 0);
  const value = round(clamp(rules.neutral + sum, rules.min, rules.max), 1);
  const b = vigourBand(value);
  return { value, band: b.band, label: b.label, window, rulesVersion: rules.version };
}
