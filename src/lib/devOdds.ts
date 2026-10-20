import type { GameConfig, RarityId } from "@/config/gameConfig";
import { rollRarity, rollSpecies } from "@/lib/progression";
import { RARITY_ORDER } from "@/lib/rarity";
import { mulberry32 } from "@/lib/rng";
import { SPECIES, type Species } from "@/lib/species";

/**
 * Developer hatch odds: a test-only view of the hatch roll for Developer Mode
 * (/studio/dev). It never changes `gameConfig`; it derives a separate copy of the
 * rarity weights for simulated hatches, which reuse the production `rollSpecies`.
 *
 * How the multiplier works: the ticked ("boosted") tiers have their base weight
 * multiplied, then every weight is divided by the new total so the chances sum to
 * 100%. Because the total grows too, a 10× multiplier does not make a tier exactly
 * ten times more likely. With Mythic and Secret boosted 10×, Mythic goes from
 * 1 / 100 = 1.00% to 10 / 110.8 = 9.03%; with every tier above Common boosted, the
 * Rare weight absorbs most of the gain and Mythic only reaches 2.46% even at 100×.
 * Boosted tiers keep their ratios to each other; unboosted tiers lose share.
 *
 * A tier whose base weight is 0 is excluded from the hatch pool, and multiplying 0
 * keeps it excluded. `includeZeroWeight` is the explicit override that gives such a
 * boosted tier a stand-in weight (the smallest positive base weight); `force` makes
 * every simulated hatch one tier.
 */

export const DEV_MULTIPLIER_MIN = 1;
export const DEV_MULTIPLIER_MAX = 100;

export interface DevOddsSettings {
  /** 1 to 100. 1 reproduces the public odds exactly. */
  multiplier: number;
  /** Tiers whose weight the multiplier applies to. */
  boosted: RarityId[];
  /** Explicit override: let boosted tiers with a base weight of 0 into the simulated pool. */
  includeZeroWeight: boolean;
  /** Explicit override: every simulated hatch is this tier. */
  force: RarityId | null;
}

export const DEFAULT_DEV_ODDS: DevOddsSettings = Object.freeze({
  multiplier: 1,
  // the tiers that are hardest to reproduce; any tier can be ticked in the panel
  boosted: ["mythic", "secret"] as RarityId[],
  includeZeroWeight: false,
  force: null,
});

const isRarity = (v: unknown): v is RarityId => typeof v === "string" && (RARITY_ORDER as string[]).includes(v);

/**
 * Validates untrusted settings (for example a request body). Returns an error message
 * instead of guessing: non-numeric or out-of-range multipliers, unknown tiers and a
 * forced tier without species are refused.
 */
export function parseDevOdds(input: unknown): { ok: true; settings: DevOddsSettings } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Settings must be an object." };
  const o = input as Record<string, unknown>;
  const m = o.multiplier ?? DEFAULT_DEV_ODDS.multiplier;
  if (typeof m !== "number" || !Number.isFinite(m) || m < DEV_MULTIPLIER_MIN || m > DEV_MULTIPLIER_MAX) {
    return { ok: false, error: `multiplier must be a number from ${DEV_MULTIPLIER_MIN} to ${DEV_MULTIPLIER_MAX}.` };
  }
  const boosted = o.boosted ?? DEFAULT_DEV_ODDS.boosted;
  if (!Array.isArray(boosted) || !boosted.every(isRarity)) return { ok: false, error: "boosted must list known rarities." };
  const includeZeroWeight = o.includeZeroWeight ?? false;
  if (typeof includeZeroWeight !== "boolean") return { ok: false, error: "includeZeroWeight must be true or false." };
  const force = o.force ?? null;
  if (force !== null && !isRarity(force)) return { ok: false, error: "force must be a known rarity or null." };
  if (force && !SPECIES.some((s) => s.rarity === force)) return { ok: false, error: `No species exist for ${force}.` };
  return { ok: true, settings: { multiplier: m, boosted: [...new Set(boosted)], includeZeroWeight, force } };
}

/** The public weights, as the production roll reads them (negative or invalid values count as 0). */
export function baseWeights(cfg: GameConfig): Record<RarityId, number> {
  return Object.fromEntries(RARITY_ORDER.map((r) => [r, Math.max(0, Number(cfg.rarityWeights[r]) || 0)])) as Record<RarityId, number>;
}

/** The developer test weights. Never mutates `cfg`. */
export function effectiveWeights(cfg: GameConfig, s: DevOddsSettings): Record<RarityId, number> {
  const base = baseWeights(cfg);
  if (s.force) return Object.fromEntries(RARITY_ORDER.map((r) => [r, r === s.force ? 1 : 0])) as Record<RarityId, number>;
  const smallest = Math.min(...RARITY_ORDER.map((r) => base[r]).filter((w) => w > 0));
  const m = Math.min(DEV_MULTIPLIER_MAX, Math.max(DEV_MULTIPLIER_MIN, s.multiplier));
  return Object.fromEntries(
    RARITY_ORDER.map((r) => {
      const boosted = s.boosted.includes(r);
      let w = base[r];
      if (w === 0 && boosted && s.includeZeroWeight && Number.isFinite(smallest)) w = smallest;
      return [r, boosted ? w * m : w];
    }),
  ) as Record<RarityId, number>;
}

/** Weights → probabilities that sum to 1. */
export function chancesOf(weights: Record<RarityId, number>): Record<RarityId, number> {
  const total = RARITY_ORDER.reduce((sum, r) => sum + weights[r], 0);
  if (!(total > 0)) throw new Error("At least one rarity needs a positive weight.");
  return Object.fromEntries(RARITY_ORDER.map((r) => [r, weights[r] / total])) as Record<RarityId, number>;
}

/**
 * Percentages for display with `dp` decimals that add up to exactly 100 (largest-remainder
 * rounding), so the table never shows 99.99% or 100.01%.
 */
export function percentLabels(chances: Record<RarityId, number>, dp = 2): Record<RarityId, number> {
  const unit = 10 ** dp;
  const raw = RARITY_ORDER.map((r) => chances[r] * 100 * unit);
  const floors = raw.map(Math.floor);
  let left = 100 * unit - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => [v - floors[i], i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i] += 1;
    left -= 1;
  }
  return Object.fromEntries(RARITY_ORDER.map((r, i) => [r, floors[i] / unit])) as Record<RarityId, number>;
}

/** A copy of the config with the developer weights. The original is untouched. */
export function devGameConfig(cfg: GameConfig, s: DevOddsSettings): GameConfig {
  return { ...cfg, rarityWeights: effectiveWeights(cfg, s) };
}

/**
 * One simulated hatch: the production roll, fed the developer weights. The studio route
 * passes the full catalogue (SPECIES), the same one production rolls use.
 */
export function simulateHatch(seed: number, cfg: GameConfig, s: DevOddsSettings, catalogue?: readonly Species[]): string {
  return rollSpecies(seed, devGameConfig(cfg, s), catalogue);
}

/** The rarity a seed would roll under these settings (same PRNG sequence as `simulateHatch`). */
export function simulateRarity(seed: number, cfg: GameConfig, s: DevOddsSettings): RarityId {
  return rollRarity(mulberry32(seed), devGameConfig(cfg, s));
}
