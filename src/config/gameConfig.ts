/**
 * Solanites gameplay configuration.
 *
 * Every rule that governs eligibility and progression lives here so it can be
 * tuned (or later loaded from a server) without touching UI code.
 *
 * IMPORTANT: In production these values must be enforced server-side. The
 * client only uses them to *display* progress; it must never be the source
 * of truth for eligibility, hatching or evolution.
 */

export type RarityId = "common" | "rare" | "epic" | "legendary" | "mythic" | "secret";

/** What happens to an egg/creature's progress while the wallet does not hold enough tokens to back it. */
export type BelowThresholdPolicy =
  /** Progress freezes and resumes when the balance is restored. */
  | "pause"
  /** Accumulated holding time for unbacked eggs/creatures is wiped to zero. */
  | "reset"
  /** Progress keeps accruing regardless of balance (most lenient). */
  | "continue";

/** Whether eggs / hatched creatures may move between wallets. */
export type TransferPolicy = "locked" | "transferable" | "transferable-resets-progress";

export interface GameConfig {
  token: {
    symbol: string;
    totalSupply: number;
    /** Tokens a wallet must hold to back one egg. */
    tokensPerEgg: number;
    decimals: number;
  };
  eggs: {
    maxEggsPerWallet: number;
    /** Holding time (ms) an egg needs before it can hatch. */
    incubationMs: number;
    /** Fraction of incubation at which the shell starts glowing / cracking (Stage 2). */
    crackingAt: number;
    /** Fraction of incubation at which the creature becomes visible inside (Stage 3). */
    stirringAt: number;
  };
  evolution: {
    /**
     * Cumulative post-hatch holding time (ms) required to reach each evolution
     * form. Index 0 is the hatchling (reached at hatch, so 0 ms).
     */
    thresholdsMs: number[];
    names: string[];
  };
  /** Relative weights. They are normalised, so they don't need to sum to 100. */
  rarityWeights: Record<RarityId, number>;
  policies: {
    belowThreshold: BelowThresholdPolicy;
    eggTransfer: TransferPolicy;
    creatureTransfer: TransferPolicy;
    /** If true, a ready egg must be hatched by the holder (manual reveal). */
    manualHatch: boolean;
  };
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const gameConfig: GameConfig = {
  token: {
    symbol: "$SOLITE",
    totalSupply: 10_000_000,
    tokensPerEgg: 10_000,
    decimals: 6,
  },
  eggs: {
    maxEggsPerWallet: 6,
    incubationMs: 7 * DAY,
    crackingAt: 0.35,
    stirringAt: 0.7,
  },
  evolution: {
    thresholdsMs: [0, 14 * DAY, 45 * DAY, 120 * DAY],
    names: ["Eggling", "Hatchling", "Evolved", "Ascended"],
  },
  rarityWeights: {
    common: 60,
    rare: 25,
    epic: 10,
    legendary: 3.8,
    mythic: 1,
    secret: 0.2,
  },
  policies: {
    belowThreshold: "pause",
    eggTransfer: "locked",
    creatureTransfer: "transferable-resets-progress",
    manualHatch: true,
  },
};

export const TIME = { HOUR, DAY };
