/**
 * The planned holder distribution, shown on /rewards and How It Works.
 *
 * The rule (owner-approved copy): two hours after launch, the developer supply allocated for
 * redistribution is divided equally among eligible holders. The timer is the official launch time,
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
    { term: "Split", detail: "Divided equally: every eligible holder receives the same share." },
  ],
  /** Owner-set terms; null = not published (hidden). */
  terms: { amount: null, eligibility: null, antiSybil: null, snapshot: null, process: null } as DistributionTerms,
  /** Public link proving the allocation is locked (e.g. a Streamflow lock). Until set, it is never called "locked". */
  lockProofUrl: null as string | null,
};

/**
 * Pre-launch switch for the whole rewards surface (owner, 21 Oct: hold until launch). While false,
 * /rewards answers 404 and nothing links to it or describes it: no nav, footer, guide card or How It
 * Works row. Turn on at launch, together with the terms below.
 */
export const REWARDS_PAGE_LIVE = false;

export const HOLDER_DISTRIBUTION_HOURS = HOLDER_DISTRIBUTION.afterLaunchMs / 3_600_000;

export const TERM_LABELS: Record<keyof DistributionTerms, string> = { amount: "Amount", eligibility: "Eligibility", antiSybil: "One share per holder", snapshot: "Snapshot", process: "Process" };

/** The published terms, in display order; unset ones are left out. */
export const publishedTerms = (t: DistributionTerms = HOLDER_DISTRIBUTION.terms) =>
  (Object.keys(TERM_LABELS) as (keyof DistributionTerms)[]).flatMap((k) => (t[k] ? [{ term: TERM_LABELS[k], detail: t[k] as string }] : []));

/** Rewards joins the main nav once the material terms (amount, eligibility, process) are all published. */
export const rewardsTermsSet = (t: DistributionTerms = HOLDER_DISTRIBUTION.terms) => !!(t.amount && t.eligibility && t.process);

export const isLocked = () => !!HOLDER_DISTRIBUTION.lockProofUrl;
