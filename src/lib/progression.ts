import type { GameConfig, RarityId } from "@/config/gameConfig";
import { mulberry32 } from "@/lib/rng";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, speciesOfRarity } from "@/lib/species";

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
   * Production: commit-reveal on the server so the client can't peek or reroll.
   */
  speciesId: string;
  hatchedAt: number | null;
  /** Qualifying holding time accumulated since hatching. */
  growthMs: number;
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

export interface EvolutionInfo {
  stage: number;
  name: string;
  /** 0..1 progress toward the next form (1 at max). */
  progress: number;
  /** Holding time left until the next form (0 at max). */
  remainingMs: number;
  isMax: boolean;
  nextName: string | null;
}

export function evolutionOf(growthMs: number, cfg: GameConfig): EvolutionInfo {
  const t = cfg.evolution.thresholdsMs;
  let stage = 0;
  for (let i = 0; i < t.length; i++) if (growthMs >= t[i]) stage = i;
  const isMax = stage >= t.length - 1;
  const lo = t[stage];
  const hi = isMax ? lo : t[stage + 1];
  return {
    stage,
    name: cfg.evolution.names[stage],
    progress: isMax ? 1 : (growthMs - lo) / (hi - lo),
    remainingMs: isMax ? 0 : hi - growthMs,
    isMax,
    nextName: isMax ? null : cfg.evolution.names[stage + 1],
  };
}

/* ── Rarity roll ────────────────────────────────────────────── */

export function rollRarity(rand: () => number, cfg: GameConfig): RarityId {
  const total = RARITY_ORDER.reduce((s, r) => s + Math.max(0, cfg.rarityWeights[r]), 0);
  let x = rand() * total;
  for (const r of RARITY_ORDER) {
    x -= Math.max(0, cfg.rarityWeights[r]);
    if (x < 0) return r;
  }
  return "common";
}

export function rollSpecies(seed: number, cfg: GameConfig): string {
  const rand = mulberry32(seed);
  const rarity = rollRarity(rand, cfg);
  const pool = speciesOfRarity(rarity);
  const list = pool.length ? pool : SPECIES;
  return list[Math.floor(rand() * list.length)].id;
}

export function rarityChances(cfg: GameConfig): Record<RarityId, number> {
  const total = RARITY_ORDER.reduce((s, r) => s + Math.max(0, cfg.rarityWeights[r]), 0);
  return Object.fromEntries(RARITY_ORDER.map((r) => [r, total ? cfg.rarityWeights[r] / total : 0])) as Record<RarityId, number>;
}
