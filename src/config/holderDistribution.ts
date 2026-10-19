/**
 * The planned holder distribution, shown on /claims and How It Works.
 *
 * The rule (owner-approved copy): two hours after launch, the locked developer supply
 * allocated for redistribution is divided equally among eligible holders. The timer is
 * the official launch time, the same for everyone, never a visitor's own visit.
 *
 * Copy only. Nothing distributes anything yet: there is no locked-supply source,
 * eligibility rule, snapshot at the two-hour mark, or payout. Everything not decided
 * is listed in `pending` and must stay marked as such until it is built and published
 * (see docs/holder-tracking.md, "Holder distribution").
 */
export const HOLDER_DISTRIBUTION = {
  /** Time from the official launch to the distribution. */
  afterLaunchMs: 2 * 60 * 60 * 1000,
  /** Agreed parts of the rule. */
  planned: [
    { term: "Timing", detail: "Two hours after the official launch time. The launch time will be announced; it is the same for everyone." },
    { term: "Source", detail: "The locked developer supply allocated for redistribution." },
    { term: "Split", detail: "Divided equally: every eligible holder receives the same share." },
  ],
  /** Still to be confirmed and published. */
  pending: [
    { term: "Eligibility", detail: "Who counts as an eligible holder will be published here." },
    { term: "Amount", detail: "The final amount allocated for redistribution will be published here." },
    { term: "Process", detail: "How the distribution will be carried out will be published here." },
  ],
} as const;

export const HOLDER_DISTRIBUTION_HOURS = HOLDER_DISTRIBUTION.afterLaunchMs / 3_600_000;
