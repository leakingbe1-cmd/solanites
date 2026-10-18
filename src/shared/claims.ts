/** API shapes for the launch-fee claim flow (Workflow B). Amounts are exact decimal strings. */

export interface ClaimsStatus {
  serverNow: number;
  /** False until the server's database and chain settings are configured. */
  serviceReady: boolean;
  /** Launch time from server configuration, or null if not scheduled. */
  launchAt: number | null;
  opensAt: number | null;
  open: boolean;
  /** Sign-in (domain + session secret) configured on the server. */
  signInReady: boolean;
  /** A refund policy is active; without one, no amount can be quoted or claimed. */
  policyConfigured: boolean;
  requiredDecisions: string[];
  closesAt: number | null;
}

export interface ClaimQuote {
  address: string;
  eligible: boolean;
  reason?: string;
  amount?: string;
  payoutAsset?: string;
  lines: { label: string; value: string }[];
  verifiedAt: { slot: number; balance: string };
}

export interface FeeClaimRecord {
  id: string;
  periodId: string;
  amount: string;
  payoutAsset: string;
  status: "pending_payout" | "paid" | "rejected";
  createdAt: number;
  payoutSignature: string | null;
  lines: { label: string; value: string }[];
}

export interface ClaimsApiError {
  error: { code: "NOT_OPEN" | "NOT_CONFIGURED" | "INVALID_ADDRESS" | "INVALID_SIGNATURE" | "NONCE_INVALID" | "UNAUTHORIZED" | "NOT_ELIGIBLE" | "RPC_UNAVAILABLE" | "RATE_LIMITED"; message: string };
}
