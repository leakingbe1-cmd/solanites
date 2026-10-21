import type { RarityId } from "@/config/gameConfig";

/**
 * GET /api/proof: what anyone can check about the tracker, read-only. Rarity is sealed when an egg
 * is issued, but there is no per-egg commitment yet, so results are not independently verifiable.
 */
export interface ProofExcluded {
  /** Full public address: excluded wallets are project or program wallets, published on purpose. */
  address: string;
  reason: "project" | "program";
}

export interface Proof {
  source: "chain" | "fixture";
  generatedAt: number;
  /** Last completed sync (ms) and the newest balance slot the tracker has recorded. */
  lastSyncAt: number | null;
  latestSlot: number | null;
  /** Slot tracking started from. */
  trackingStartSlot: number | null;
  /** Whether the mint's on-chain supply matched the configured supply at the last check; null before one. */
  supplyMatchesConfig: boolean | null;
  eggs: { issued: number; hatched: number };
  /** Hatched creatures per rarity, beside the configured hatch chance (0–1). */
  rarity: Record<RarityId, { hatched: number; configured: number }>;
  /** Wallets that never earn eggs, with the reason; at most 100, total in excludedCount. */
  excluded: ProofExcluded[];
  excludedCount: number;
}
