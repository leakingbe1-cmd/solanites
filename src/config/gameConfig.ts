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

import { eggProgression } from "./eggProgression";

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
    /** Upper bound on eggs per wallet, or null for no cap. */
    maxEggsPerWallet: number | null;
    /**
     * Default incubation for prototype records without their own duration.
     * Tracked eggs use the per-egg schedule in `eggProgression`.
     */
    incubationMs: number;
    /** Fraction of incubation at which the shell starts glowing / cracking (Stage 2). */
    crackingAt: number;
    /** Fraction of incubation at which the creature becomes visible inside (Stage 3). */
    stirringAt: number;
  };
  evolution: {
    /**
     * Cumulative qualifying holding time since hatching (ms) needed for each
     * form. Index 0 is the first form, reached at hatch (0 ms).
     */
    thresholdsMs: number[];
    names: string[];
    /**
     * After the final form: cumulative qualifying holding time since hatching
     * for each further Ascension rank (II, III, …). Gaps grow each time.
     */
    ascensionRanksMs: number[];
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

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const gameConfig: GameConfig = {
  token: {
    symbol: "$SOLITE",
    totalSupply: eggProgression.totalSupply,
    tokensPerEgg: eggProgression.tokensPerEgg,
    decimals: 6,
  },
  eggs: {
    maxEggsPerWallet: eggProgression.maxEggsPerWallet,
    incubationMs: 7 * DAY,
    crackingAt: 0.35,
    stirringAt: 0.7,
  },
  evolution: {
    // Eggling at hatch → Hatchling at 5 min → Evolved at 30 min → Ascended at 2 h (cumulative).
    thresholdsMs: [0, 5 * MINUTE, 30 * MINUTE, 2 * HOUR],
    names: ["Eggling", "Hatchling", "Evolved", "Ascended"],
    // Ascended II at 8 h, III at 24 h, IV at 3 days, V at 7 days, VI at 30 days (cumulative).
    ascensionRanksMs: [8 * HOUR, 24 * HOUR, 3 * DAY, 7 * DAY, 30 * DAY],
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

export const TIME = { MINUTE, HOUR, DAY };
