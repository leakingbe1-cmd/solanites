import type { RarityId } from "@/config/gameConfig";

/**
 * GET /api/leaderboard: the live Hall of Keepers, ranked on the server from the tracker's records.
 * Keepers appear only as short addresses; nothing the visitor sends affects the ranking.
 *
 * Ranking rules (ties always end on the full address, ascending, so the order is deterministic):
 * - evolved: sum of the evolution stages of a keeper's hatched creatures, then the best single
 *   stage, then the earliest-hatched creature at that best stage.
 * - holders: verified continuous qualifying holding (balance at or above one egg's worth) from the
 *   earliest verified point (a recorded transaction crossing the threshold, or the tracker's first
 *   observation there); a recorded drop below restarts it. Holding before tracking isn't counted.
 * - rarest: rarest hatched creature (secret > mythic > legendary > epic > rare > common), then how
 *   many creatures of that rarity, then the earliest hatch at it. Sealed eggs never count.
 */
export type LeaderboardCategory = "evolved" | "holders" | "rarest";

export interface LeaderRow {
  rank: number;
  /** Short public form of the keeper's address, e.g. "7xKX…9fGh". */
  keeper: string;
  /** The creature shown for this keeper in this category; null when they have none hatched yet. */
  creature: { speciesId: string; stage: number } | null;
  /** Hatched creatures the keeper has. */
  creatures: number;
  /** evolved: sum of stages and best single stage. */
  stageSum: number;
  bestStage: number;
  /** holders: verified continuous qualifying holding (ms); null when not currently qualifying. */
  heldMs: number | null;
  /** rarest: the keeper's rarest hatched rarity and how many creatures they have at it. */
  rarity: RarityId | null;
  rarityCount: number;
}

export interface Leaderboard {
  /** "chain": real holders from Solana. "fixture": local test data, labelled as such. */
  source: "chain" | "fixture";
  /** Server time this ranking was computed (ms). */
  generatedAt: number;
  /** Last completed tracker sync (ms), or null before the first one. */
  lastSyncAt: number | null;
  categories: Record<LeaderboardCategory, LeaderRow[]>;
}

/** A keeper's own place in one category: their row (rank may be below the top list) and how many are ranked. */
export interface KeeperStanding {
  row: LeaderRow;
  of: number;
}

/** GET /api/leaderboard/standing?address=…: one address's place in each category. */
export interface LeaderboardStanding {
  generatedAt: number;
  categories: Record<LeaderboardCategory, KeeperStanding | null>;
}

export const LEADERBOARD_SIZE = 25;
export const LEADERBOARD_POLL_MS = 30_000;
