/**
 * The planned holder distribution, shown on /rewards and How It Works.
 *
 * The rule (owner-approved copy): two hours after launch, the developer supply allocated for
 * redistribution is shared among eligible holders in proportion to their holdings (owner, 22 Oct). The timer is the official launch time,
 * the same for everyone, never a visitor's own visit.
 *
 * Copy only. Nothing distributes anything yet. The terms below are set by the owner; each one
 * stays hidden on the site until it has a value (nothing is ever shown as "pending"), and the page
 * stays out of the main nav until the amount, eligibility and process are all set. Enabling any
 * payout needs the owner's explicit approval (see docs/holder-tracking.md, "Holder distribution").
 */
export interface DistributionTerms {
  /** e.g. "10,000,000 $SLNT (1% of supply)". */
  amount: string | null;
  /** Who is eligible, including any minimum balance. */
  eligibility: string | null;
  /** How wallet-splitting is prevented. */
  antiSybil: string | null;
  /** When and how the holder snapshot is taken. */
  snapshot: string | null;
  /** How the distribution is carried out. */
  process: string | null;
}

export const HOLDER_DISTRIBUTION = {
  /** Time from the official launch to the distribution. */
  afterLaunchMs: 2 * 60 * 60 * 1000,
  /** Agreed parts of the rule. */
  planned: [
    { term: "Timing", detail: "Two hours after the official launch time. The launch time will be announced; it is the same for everyone." },
    { term: "Source", detail: "The developer supply allocated for redistribution." },
    { term: "Share", detail: "Proportional: each eligible holder receives the part of the allocation that matches their share of the eligible supply." },
  ],
  /** Owner-set terms; null = not published (hidden). */
   terms: {
    amount: "1% of total supply",
    eligibility: "Every wallet holding $SLNT at the snapshot, excluding the liquidity pool, project and exchange wallets",
    antiSybil: "Shares are proportional to each wallet's balance, so splitting a holding across wallets gains nothing",
    snapshot: "Finalized balances exactly 2 hours after launch; the snapshot list and its hash are published on /rewards",
    process: "Sent from the published distribution wallet in batches; every transaction is linked on /rewards",
  } as DistributionTerms,
  /** Public link proving the allocation is locked (e.g. a Streamflow lock). Until set, it is never called "locked". */
  lockProofUrl: null as string | null,
};

/**
 * Pre-launch switch for the whole rewards surface (owner, 21 Oct: hold until launch). While false,
 * /rewards answers 404 and nothing links to it or describes it: no nav, footer, guide card or How It
 * Works row. Turn on at launch, together with the terms below.
 */
export const REWARDS_PAGE_LIVE = false;

/**
 * Proof of the distribution, filled in by the owner after sending it (the site sends nothing):
 * the snapshot hash, then one row per transfer with its transaction signature. The "Distribution
 * proof" section on /rewards stays hidden while both are empty.
 */
export interface DistributionPayout {
  /** Recipient wallet (shown shortened). */
  wallet: string;
  /** As sent, e.g. "12,345.67 $SLNT". */
  amount: string;
  /** Transaction signature; links to Solscan. */
  signature: string;
  /** When it was sent, ISO 8601 UTC (e.g. "2026-11-01T14:05:00Z"). */
  time: string;
  /** Screenshots only: labels the row "Sample". Never set on a real row. */
  sample?: boolean;
}

export const DISTRIBUTION_PROOF: { snapshotHash: string | null; payouts: DistributionPayout[] } = {
  snapshotHash: null,
  payouts: [],
};

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
/** Problems with the proof rows (an empty list means valid). Checked by tests, so a bad paste fails CI. */
export function distributionProofProblems(p = DISTRIBUTION_PROOF): string[] {
  const out: string[] = [];
  for (const [i, r] of p.payouts.entries()) {
    if (!BASE58.test(r.wallet) || r.wallet.length < 32 || r.wallet.length > 44) out.push(`row ${i + 1}: invalid wallet`);
    if (!BASE58.test(r.signature) || r.signature.length < 64 || r.signature.length > 88) out.push(`row ${i + 1}: invalid signature`);
    if (!Number.isFinite(Date.parse(r.time))) out.push(`row ${i + 1}: invalid time`);
    if (!r.amount.trim()) out.push(`row ${i + 1}: missing amount`);
  }
  if (p.snapshotHash !== null && !/^[0-9a-f]{64}$/i.test(p.snapshotHash)) out.push("snapshot hash must be 64 hex characters (SHA-256)");
  return out;
}

export const solscanTxUrl = (signature: string) => `https://solscan.io/tx/${signature}`;

export const HOLDER_DISTRIBUTION_HOURS = HOLDER_DISTRIBUTION.afterLaunchMs / 3_600_000;

export const TERM_LABELS: Record<keyof DistributionTerms, string> = { amount: "Amount", eligibility: "Eligibility", antiSybil: "Wallet splitting", snapshot: "Snapshot", process: "Process" };

/** The published terms, in display order; unset ones are left out. */
export const publishedTerms = (t: DistributionTerms = HOLDER_DISTRIBUTION.terms) =>
  (Object.keys(TERM_LABELS) as (keyof DistributionTerms)[]).flatMap((k) => (t[k] ? [{ term: TERM_LABELS[k], detail: t[k] as string }] : []));

/** Rewards joins the main nav once the material terms (amount, eligibility, process) are all published. */
export const rewardsTermsSet = (t: DistributionTerms = HOLDER_DISTRIBUTION.terms) => !!(t.amount && t.eligibility && t.process);

export const isLocked = () => !!HOLDER_DISTRIBUTION.lockProofUrl;
