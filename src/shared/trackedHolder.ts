import type { EggStatus } from "@/config/eggProgression";
import type { ClassifiedBundle } from "@/shared/classified";

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
  eggs: TrackedEgg[];
  rules: { tokensPerEgg: number; incubationScheduleMs: number[]; incubationMode: "sequential" | "parallel"; initialGrowthScheduleMs: number[] };
  sync: { lastSyncedAt: number | null; pending: boolean; error: string | null };
  /** Classified species among this holder's hatched eggs, added by the API (src/server/classified). */
  classified?: ClassifiedBundle[];
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
  /** Set by the API when the hatched species is classified (Mythic or Secret). */
  classified?: ClassifiedBundle[];
}

export interface TrackerApiError {
  error: { code: "INVALID_ADDRESS" | "NOT_CONFIGURED" | "RPC_UNAVAILABLE" | "RATE_LIMITED" | "NOT_FOUND" | "NOT_READY" | "UPSTREAM_ERROR" | "UNAUTHORIZED"; message: string; readyAt?: number };
}
