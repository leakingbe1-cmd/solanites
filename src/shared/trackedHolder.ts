import type { EggStatus } from "@/config/eggProgression";

/**
 * Response of GET /api/holders/:address — an automatically tracked holder.
 * No wallet connection is involved. Amounts are exact decimal strings;
 * times are epoch milliseconds from the server clock.
 */
export interface TrackedHolderView {
  address: string;
  /** "fixture" only in local development with SOLANITES_FIXTURES=1; never real holders. */
  source: "chain" | "fixture";
  tracked: boolean;
  serverNow: number;
  holdings: {
    /** Verified balance at `slot` (finalized), excluding frozen accounts. */
    amount: string;
    frozenAmount: string;
    /** floor(amount / tokensPerEgg). */
    qualifyingUnits: number;
    /** Tokens in this wallet that already earned an egg, here or in a wallet they came from. */
    creditedAmount: string;
    /** Part of that which arrived from another wallet where it had already earned an egg. */
    inheritedCreditAmount: string;
    /** Tokens still needed for the next egg. */
    toNextEgg: string;
    slot: number;
    observedAt: number | null;
    excluded: boolean;
  };
  counts: { earned: number; queued: number; incubating: number; ready: number; hatched: number };
  /** Onboarding fast track: the first `total` eggs a wallet earns. `issued` of them are earned so far, `used` of those hatched. */
  fastTrack: { total: number; issued: number; used: number; remaining: number; complete: boolean; hatchMs: number; stageMs: number };
  eggs: TrackedEgg[];
  rules: { tokensPerEgg: number; incubationScheduleMs: number[]; incubationMode: "sequential" | "parallel"; initialGrowthScheduleMs: number[] };
  sync: { lastSyncedAt: number | null; pending: boolean; error: string | null };
  /** Verified continuous holding of at least one egg's worth (null when not holding that now) and the cosmetic badges it has earned (ids from gameConfig.streakBadges). */
  streak: { heldMs: number | null; badges: string[] };
}

export interface TrackedEgg {
  id: string;
  sequence: number;
  status: EggStatus;
  earnedAt: number;
  incubationStartedAt: number;
  incubationMs: number;
  readyAt: number;
  hatchedAt: number | null;
  /** Visual variation only; unrelated to the sealed outcome. */
  displaySeed: number;
  /** Revealed at hatch. Before that, only shown as the silhouette once the egg is stirring. */
  speciesId: string | null;
  /** Initial growth this creature needs to reach its mature form; fixed when the egg was issued. */
  maturityMs: number;
  /** One of the wallet's onboarding fast-track eggs (fixed when issued): quick hatch and one stage per minute. */
  fastTrack: boolean;
  /** Fast-track creatures: cumulative growth after maturity for each later form. Null: the game's normal timings. */
  afterMaturityMs: number[] | null;
  /**
   * Hatched creatures: qualifying holding time since the egg hatched (its
   * incubation completed), as of `serverNow`. Drives growth and evolution. Null for eggs.
   */
  growthMs: number | null;
  /** Whether that time is still accruing (the balance currently backs this creature). */
  growing: boolean;
  /**
   * Growth and evolution decided by the server from `growthMs` at `serverNow`
   * (authoritative; the page only counts down between refreshes).
   */
  evolution: {
    stage: number;
    label: string;
    phase: "growing" | "mature" | "evolved" | "ascended";
    /** Initial growth complete. */
    matured: boolean;
    nextLabel: string | null;
    /** Qualifying holding still needed for the next milestone, as of `serverNow`. */
    toNextMs: number;
  } | null;
}

export interface HatchResult {
  egg: TrackedEgg;
  speciesId: string;
  alreadyHatched: boolean;
}

export interface TrackerApiError {
  error: { code: "INVALID_ADDRESS" | "NOT_CONFIGURED" | "RPC_UNAVAILABLE" | "RATE_LIMITED" | "NOT_FOUND" | "NOT_READY" | "UPSTREAM_ERROR" | "UNAUTHORIZED"; message: string; readyAt?: number };
}
