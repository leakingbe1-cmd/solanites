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
     * Form names. Index 0 is the newborn form at hatch, index 1 the mature
     * form reached when initial growth completes (per-creature duration, see
     * `initialGrowthScheduleMs` in eggProgression), and the rest are later
     * evolutions.
     */
    names: string[];
    /**
     * Later evolutions (index 2 onwards in `names`): qualifying holding needed
     * after the creature reached maturity (ms, cumulative).
     */
    afterMaturityMs: number[];
    /**
     * After the final form: qualifying holding after maturity for each further
     * Ascension rank (II, III, …). Gaps grow each time.
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
    // Official public ticker. Display only: tracking identifies the token by SOLANITES_MINT, never by name.
    symbol: "$SLNT",
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
    // Eggling at hatch (growing) → Hatchling when initial growth completes (mature; 1 min for the
    // first creature, see eggProgression) → Evolved 30 min later → Ascended 2 h after maturity.
    names: ["Eggling", "Hatchling", "Evolved", "Ascended"],
    afterMaturityMs: [30 * MINUTE, 2 * HOUR],
    // Ascended II at 8 h, III at 24 h, IV at 3 days, V at 7 days, VI at 30 days after maturity.
    ascensionRanksMs: [8 * HOUR, 24 * HOUR, 3 * DAY, 7 * DAY, 30 * DAY],
  },
  rarityWeights: {
    common: 40,
    rare: 30,
    epic: 17,
    legendary: 8,
    mythic: 3.5,
    secret: 1.5,
  },
  policies: {
    belowThreshold: "pause",
    eggTransfer: "locked",
    creatureTransfer: "transferable-resets-progress",
    manualHatch: true,
  },
};

export const TIME = { MINUTE, HOUR, DAY };
