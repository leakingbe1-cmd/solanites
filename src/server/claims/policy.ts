/**
 * The launch-fee refund policy.
 *
 * Nothing in the project defines the refund rules, so no policy is active
 * and the claim flow stops after showing that claims are not configured. A
 * policy is code, reviewed like code: implement `FeeRefundPolicy`, assign it
 * to ACTIVE_FEE_POLICY below, and only then can quotes and claim records
 * be created. Recording a claim never pays it: payouts are a separate,
 * explicitly authorised step that is not built.
 */

export interface ClaimContext {
  claimant: string;
  nowMs: number;
  launchAtMs: number;
  /** Live balance read on the server at finalized commitment. */
  verifiedBalance: { amountBase: bigint; decimals: number; slot: number };
  /** The wallet's balance changes the tracker has recorded since tracking began. */
  history: { signature: string; slot: number; preBase: bigint; postBase: bigint }[];
  tracked: { firstSeenMs: number | null; eggsEarned: number } | null;
}

export type FeeQuote = { eligible: true; amountBase: bigint; lines: { label: string; value: string }[] } | { eligible: false; reason: string };

export interface FeeRefundPolicy {
  /** One claim per wallet per period, e.g. "launch". */
  periodId: string;
  /** What is paid out, e.g. "SOL" or a token mint address. */
  payoutAsset: string;
  payoutDecimals: number;
  /** Claims close at this time, or never (null). */
  closesAtMs: number | null;
  /** Total that may ever be claimed in this period, in payout base units. Enforced atomically. */
  budgetBase: bigint;
  quote(ctx: ClaimContext): FeeQuote | Promise<FeeQuote>;
}

/** Decisions needed before a policy can be written. Shown by the API and docs while none is active. */
export const REQUIRED_DECISIONS = [
  "Which fees are refunded (e.g. a token transfer tax, swap/LP fees, or another fee), and how each wallet's paid fees are measured from chain data.",
  "The refund rate or formula, and any per-wallet cap.",
  "The payout currency (SOL, $SLNT or another token) and its source wallet.",
  "The total refund budget, and what happens if claims exceed it.",
  "The holding requirement: minimum balance, minimum holding time, and whether selling forfeits the refund.",
  "Which transactions count (e.g. only buys in the first six hours) and the claim deadline.",
  "Holder rewards (if any) are a separate programme from fee refunds and need their own approved rules.",
  "Whether a wallet can claim once or repeatedly.",
  "How payouts are executed and approved (e.g. a multisig-approved batch from a dedicated, limited-funds wallet).",
] as const;

export const ACTIVE_FEE_POLICY: FeeRefundPolicy | null = null;
