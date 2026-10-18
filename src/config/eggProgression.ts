/**
 * Egg entitlement and incubation rules for automatically tracked holders.
 *
 * This is the single place to change how many tokens back an egg and how
 * long each egg incubates. The server enforces these values; the UI only
 * reads them to explain progress.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export type IncubationMode =
  /** Eggs incubate one at a time: egg n starts when egg n-1 is ready to hatch. */
  | "sequential"
  /** Every egg starts incubating as soon as it is earned. */
  | "parallel";

export interface EggProgressionConfig {
  /** Whole SOLITE that back one egg entitlement. */
  tokensPerEgg: number;
  /** Total SOLITE supply, for display and sanity checks. */
  totalSupply: number;
  /** Upper bound on eggs per wallet, or null for no cap. */
  maxEggsPerWallet: number | null;
  /**
   * Incubation per egg by sequence number: index 0 is the first egg, and the
   * last entry repeats for every later egg.
   */
  incubationScheduleMs: number[];
  incubationMode: IncubationMode;
}

export const eggProgression: EggProgressionConfig = {
  tokensPerEgg: 1_000_000,
  totalSupply: 1_000_000_000,
  maxEggsPerWallet: null,
  incubationScheduleMs: [5 * MINUTE, 6 * HOUR, 24 * HOUR, 48 * HOUR, 72 * HOUR],
  incubationMode: "sequential",
};

/** Incubation length for the egg with this 1-based sequence number. */
export function incubationMsFor(sequence: number, cfg: EggProgressionConfig = eggProgression): number {
  if (!Number.isInteger(sequence) || sequence < 1) throw new Error("Egg sequence numbers start at 1");
  const s = cfg.incubationScheduleMs;
  if (!s.length) throw new Error("incubationScheduleMs must not be empty");
  return s[Math.min(sequence, s.length) - 1];
}

export interface EggSchedule {
  incubationStartedAt: number;
  incubationMs: number;
  readyAt: number;
}

/**
 * Fixes an egg's timer when it is issued. In sequential mode it starts when
 * the previous egg finishes incubating (or now, if that is later), so a
 * holder who qualifies for several eggs at once does not get them all in the
 * first-egg window.
 */
export function scheduleEgg(sequence: number, earnedAt: number, previousReadyAt: number | null, cfg: EggProgressionConfig = eggProgression): EggSchedule {
  const incubationMs = incubationMsFor(sequence, cfg);
  const start = cfg.incubationMode === "sequential" && previousReadyAt !== null ? Math.max(earnedAt, previousReadyAt) : earnedAt;
  return { incubationStartedAt: start, incubationMs, readyAt: start + incubationMs };
}

export type EggStatus = "queued" | "incubating" | "ready" | "hatched";

/** Status from stored timestamps and a trusted (server) clock. */
export function eggStatusAt(egg: { incubationStartedAt: number; readyAt: number; hatchedAt: number | null }, now: number): EggStatus {
  if (egg.hatchedAt !== null) return "hatched";
  if (now < egg.incubationStartedAt) return "queued";
  if (now < egg.readyAt) return "incubating";
  return "ready";
}

function shortDuration(ms: number): string {
  if (ms < HOUR) return `${Math.round(ms / MINUTE)} min`;
  return `${Math.round(ms / HOUR)} h`;
}

/** "5 min, 6 h, 24 h, 48 h, then 72 h per egg" — for UI copy. */
export function describeSchedule(cfg: EggProgressionConfig = eggProgression): string {
  const s = cfg.incubationScheduleMs.map(shortDuration);
  return s.length === 1 ? `${s[0]} per egg` : `${s.slice(0, -1).join(", ")}, then ${s.at(-1)} per egg`;
}
