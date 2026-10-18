import { initialGrowthMsFor } from "@/config/eggProgression";
import type { GameConfig, RarityId } from "@/config/gameConfig";
import { formatSpan } from "@/lib/format";
import { mulberry32 } from "@/lib/rng";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, speciesOfRarity, type Species } from "@/lib/species";

/**
 * Pure progression rules. No React, no storage, no clock — so the exact same
 * functions can run on a server/indexer that is the real source of truth.
 */

export interface SolaniteRecord {
  id: string;
  seed: number;
  /** Simulated wall-clock time the egg was granted. */
  acquiredAt: number;
  /** Qualifying holding time accumulated toward hatching. */
  incubationMs: number;
  /** This egg's own incubation length (the per-egg schedule). Falls back to `cfg.eggs.incubationMs`. */
  durationMs?: number;
  /**
   * Species rolled when the egg was granted. Hidden from the UI until hatch.
   * Tracked eggs: rolled and sealed on the server when the egg is earned, so it cannot be rerolled.
   */
  speciesId: string;
  hatchedAt: number | null;
  /** Qualifying holding time accumulated since hatching. */
  growthMs: number;
  /** This creature's initial growth to its mature form. Falls back to the first creature's. */
  maturityMs?: number;
  /** Whether the last tick found this record backed by the wallet's balance. */
  backed: boolean;
  nickname?: string;
}

export type Phase = "egg" | "ready" | "creature";

/** Incubation an egg needs before it can hatch. */
export function incubationTarget(r: SolaniteRecord, cfg: GameConfig): number {
  return r.durationMs ?? cfg.eggs.incubationMs;
}

export function phaseOf(r: SolaniteRecord, cfg: GameConfig): Phase {
  if (r.hatchedAt !== null) return "creature";
  return r.incubationMs >= incubationTarget(r, cfg) ? "ready" : "egg";
}

/** How many eggs a balance can back. */
export function eggsAllowed(balance: number, cfg: GameConfig): number {
  if (cfg.token.tokensPerEgg <= 0) return 0;
  const n = Math.max(0, Math.floor(balance / cfg.token.tokensPerEgg));
  return cfg.eggs.maxEggsPerWallet === null ? n : Math.min(cfg.eggs.maxEggsPerWallet, n);
}

/** Tokens still needed to qualify for the next egg (0 if at the cap). */
export function tokensToNextEgg(balance: number, cfg: GameConfig): number {
  const allowed = eggsAllowed(balance, cfg);
  if (cfg.eggs.maxEggsPerWallet !== null && allowed >= cfg.eggs.maxEggsPerWallet) return 0;
  return (allowed + 1) * cfg.token.tokensPerEgg - balance;
}

/**
 * Advance all records by `deltaMs` of holding time.
 *
 * Records are backed oldest-first: if a wallet can back N eggs, the N oldest
 * records progress normally and the rest follow `policies.belowThreshold`.
 */
export function advance(records: SolaniteRecord[], deltaMs: number, balance: number, cfg: GameConfig): SolaniteRecord[] {
  const backedCount = eggsAllowed(balance, cfg);
  const sorted = [...records].sort((a, b) => a.acquiredAt - b.acquiredAt);
  const policy = cfg.policies.belowThreshold;

  return sorted.map((r, i) => {
    const backed = i < backedCount;
    const next = { ...r, backed };
    if (!backed && policy === "pause") return next;
    if (!backed && policy === "reset") {
      return r.hatchedAt === null ? { ...next, incubationMs: 0 } : { ...next, growthMs: 0 };
    }
    if (r.hatchedAt === null) {
      const target = incubationTarget(r, cfg);
      next.incubationMs = Math.min(target, r.incubationMs + deltaMs);
      // When hatching is automatic, overflow time flows straight into growth.
      if (!cfg.policies.manualHatch && next.incubationMs >= target) {
        next.hatchedAt = r.acquiredAt + target;
      }
    } else {
      next.growthMs = r.growthMs + deltaMs;
    }
    return next;
  });
}

/* ── Egg stages ─────────────────────────────────────────────── */

export const EGG_STAGE_NAMES = ["", "Dormant", "Awakening", "Stirring", "Ready to Hatch"] as const;

export function eggStage(r: SolaniteRecord, cfg: GameConfig): 1 | 2 | 3 | 4 {
  const f = r.incubationMs / incubationTarget(r, cfg);
  if (f >= 1) return 4;
  if (f >= cfg.eggs.stirringAt) return 3;
  if (f >= cfg.eggs.crackingAt) return 2;
  return 1;
}

export function incubationProgress(r: SolaniteRecord, cfg: GameConfig): number {
  return Math.min(1, r.incubationMs / incubationTarget(r, cfg));
}

/** Progress within the current egg stage, 0..1 (drives crack count etc). */
export function stageProgress(r: SolaniteRecord, cfg: GameConfig): number {
  const f = incubationProgress(r, cfg);
  const bounds = [0, cfg.eggs.crackingAt, cfg.eggs.stirringAt, 1];
  const s = eggStage(r, cfg);
  if (s === 4) return 1;
  const lo = bounds[s - 1];
  const hi = bounds[s];
  return (f - lo) / (hi - lo);
}

export function timeToHatch(r: SolaniteRecord, cfg: GameConfig): number {
  return Math.max(0, incubationTarget(r, cfg) - r.incubationMs);
}

/* ── Evolution ──────────────────────────────────────────────── */

export type GrowthPhase =
  /** Hatched, still growing towards its mature form. */
  | "growing"
  /** Initial growth complete: the mature form. */
  | "mature"
  /** A later evolution. */
  | "evolved"
  /** The final form, including its Ascension ranks. */
  | "ascended";

export interface EvolutionInfo {
  /** Form index (0 = first form). */
  stage: number;
  phase: GrowthPhase;
  /** Initial growth complete. */
  matured: boolean;
  /** This creature's initial growth duration. */
  maturityMs: number;
  name: string;
  /** 0..1 progress toward the next form (1 at the final form). */
  progress: number;
  /** Holding time left until the next form (0 at the final form). */
  remainingMs: number;
  /** True at the final form. */
  isMax: boolean;
  nextName: string | null;
  /** Ascension rank once the final form is reached (1 = just ascended, 2 = "II", …); 0 before. */
  rank: number;
  /** Form name, with the rank once ascended: "Evolved", "Ascended", "Ascended III". */
  label: string;
  /** The next milestone (form or rank), or null when every milestone is reached. */
  nextLabel: string | null;
  /** Holding time left until the next milestone (0 when none is left). */
  toNextMs: number;
  /** 0..1 progress toward the next milestone (1 when none is left). */
  toNextProgress: number;
  isFinal: boolean;
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** The first creature's initial growth; the default for records without their own. */
export const FIRST_MATURITY_MS = initialGrowthMsFor(1);

/**
 * Qualifying holding since hatching at which each form is reached for a
 * creature with this initial growth: newborn at 0, mature at `maturityMs`,
 * later evolutions after maturity.
 */
export function formThresholdsMs(maturityMs: number, cfg: GameConfig): number[] {
  return [0, maturityMs, ...cfg.evolution.afterMaturityMs.map((ms) => maturityMs + ms)];
}

/**
 * Growth and evolution from cumulative qualifying holding time since
 * hatching. A milestone is reached exactly at its threshold (>=), never before.
 */
export function evolutionOf(growthMs: number, cfg: GameConfig, maturityMs: number = FIRST_MATURITY_MS): EvolutionInfo {
  const g = Math.max(0, growthMs);
  const t = formThresholdsMs(maturityMs, cfg);
  const names = cfg.evolution.names;
  let stage = 0;
  for (let i = 0; i < t.length; i++) if (g >= t[i]) stage = i;
  const isMax = stage >= t.length - 1;

  // Every milestone in order: the forms, then the Ascension ranks.
  const ranks = cfg.evolution.ascensionRanksMs;
  const milestones: { at: number; label: string }[] = [
    ...t.map((at, i) => ({ at, label: names[i] })),
    ...ranks.map((at, i) => ({ at: maturityMs + at, label: `${names[names.length - 1]} ${ROMAN[i + 2] ?? i + 2}` })),
  ];
  let m = 0;
  for (let i = 0; i < milestones.length; i++) if (g >= milestones[i].at) m = i;
  const next = milestones[m + 1] ?? null;
  const rank = isMax ? m - (t.length - 1) + 1 : 0;

  return {
    stage,
    phase: stage === 0 ? "growing" : stage === 1 ? "mature" : isMax ? "ascended" : "evolved",
    matured: stage >= 1,
    maturityMs,
    name: names[stage],
    progress: isMax ? 1 : (g - t[stage]) / (t[stage + 1] - t[stage]),
    remainingMs: isMax ? 0 : t[stage + 1] - g,
    isMax,
    nextName: isMax ? null : names[stage + 1],
    rank,
    label: milestones[m].label,
    nextLabel: next?.label ?? null,
    toNextMs: next ? next.at - g : 0,
    toNextProgress: next ? (g - milestones[m].at) / (next.at - milestones[m].at) : 1,
    isFinal: !next,
  };
}

/**
 * When form `i` is reached, in words. With a creature's own initial growth the
 * maturity time is exact; without one (browsing a species) it is described.
 */
export function formUnlockText(i: number, cfg: GameConfig, maturityMs?: number): string {
  if (i <= 0) return "At hatch";
  if (i === 1) return maturityMs !== undefined ? `After ${formatSpan(maturityMs)} of growth` : `When initial growth completes (${formatSpan(FIRST_MATURITY_MS)} for a first creature)`;
  return `${formatSpan(cfg.evolution.afterMaturityMs[i - 2])} of holding after maturity`;
}

/* ── Rarity roll ────────────────────────────────────────────── */

/**
 * Picks a rarity with probability proportional to `cfg.rarityWeights`.
 * Throws if no rarity has a positive weight rather than guessing one.
 */
export function rollRarity(rand: () => number, cfg: GameConfig): RarityId {
  const weights = RARITY_ORDER.map((r) => [r, Math.max(0, cfg.rarityWeights[r] || 0)] as const);
  const total = weights.reduce((s, [, w]) => s + w, 0);
  if (!(total > 0)) throw new Error("rarityWeights must give at least one rarity a positive weight");
  let x = rand() * total;
  let last: RarityId | null = null;
  for (const [r, w] of weights) {
    if (w <= 0) continue;
    last = r;
    x -= w;
    if (x < 0) return r;
  }
  // Floating-point rounding at the very top of the range: the last rarity that can be rolled.
  return last!;
}

/**
 * Checks that every rarity with a positive weight has at least one species,
 * so a roll can never land on an empty tier.
 */
export function validateRarityConfig(cfg: GameConfig, catalogue: readonly Species[] = SPECIES): void {
  const positive = RARITY_ORDER.filter((r) => (cfg.rarityWeights[r] || 0) > 0);
  if (!positive.length) throw new Error("rarityWeights must give at least one rarity a positive weight");
  const empty = positive.filter((r) => !catalogue.some((s) => s.rarity === r));
  if (empty.length) throw new Error(`No species configured for rarity: ${empty.join(", ")}`);
}

/**
 * The species for an egg: a weighted rarity roll, then a uniform pick within
 * that rarity, both from one seeded PRNG so the same seed always gives the same
 * species. The server supplies a cryptographically random seed when the egg is
 * issued and stores the result; nothing here reads the clock or the client.
 * Throws if the rolled rarity has no species (never substitutes another tier).
 */
export function rollSpecies(seed: number, cfg: GameConfig, catalogue: readonly Species[] = SPECIES): string {
  const rand = mulberry32(seed);
  const rarity = rollRarity(rand, cfg);
  const pool = catalogue === SPECIES ? speciesOfRarity(rarity) : catalogue.filter((s) => s.rarity === rarity);
  if (!pool.length) throw new Error(`No species configured for rarity: ${rarity}`);
  return pool[Math.floor(rand() * pool.length)].id;
}

export function rarityChances(cfg: GameConfig): Record<RarityId, number> {
  const total = RARITY_ORDER.reduce((s, r) => s + Math.max(0, cfg.rarityWeights[r]), 0);
  return Object.fromEntries(RARITY_ORDER.map((r) => [r, total ? cfg.rarityWeights[r] / total : 0])) as Record<RarityId, number>;
}
