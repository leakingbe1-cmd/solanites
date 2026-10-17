/**
 * Response shape of GET /api/wallet/[address]. Shared by server and UI.
 * Amounts are strings: `*Base` fields are exact integer base units, the
 * others are exact decimal strings for display. No floats.
 */
export interface WalletLookupResult {
  address: string;
  token: {
    mint: string;
    tokenProgram: "spl-token" | "spl-token-2022";
    decimals: number;
  };
  balance: {
    amountBase: string;
    amount: string;
    frozenAmount: string;
    tokenAccounts: { address: string; amount: string; state: "initialized" | "frozen" }[];
  };
  eggs: {
    tokensPerEgg: number;
    maxEggsPerWallet: number;
    meetsThreshold: boolean;
    eligibleEggs: number;
    toNextEgg: string;
    /** Project/treasury/LP addresses are excluded from eggs and rewards. */
    excluded: boolean;
  };
  /** Phase 3 adds tracked history; until then this is always "not_tracked". */
  holding: { status: "not_tracked"; note: string };
  /** Phase 5 adds dry-run reward weights; until then this is always "not_available". */
  rewards: { status: "not_available"; note: string };
  source: {
    kind: "live-rpc";
    commitment: "confirmed" | "finalized";
    slot: number;
    observedAt: string;
    cached: boolean;
  };
}

export interface WalletLookupError {
  error: { code: "INVALID_ADDRESS" | "RATE_LIMITED" | "NOT_CONFIGURED" | "RPC_UNAVAILABLE" | "UPSTREAM_ERROR"; message: string };
}
