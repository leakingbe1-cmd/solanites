/**
 * The public shipping log (/updates): what changed on the site, newest first, one entry per day.
 * Dated from the commits that shipped it. Facts only: no launch dates, prices or promises.
 */
export interface Update {
  /** ISO date (YYYY-MM-DD) the work landed. */
  date: string;
  title: string;
  items: string[];
}

export const UPDATES: Update[] = [
  {
    date: "2026-10-21",
    title: "Clearer homepage, your rank and replayed reveals",
    items: [
      "The homepage now says what $SLNT does in one line, and the demo is one tap away.",
      "Before launch, the homepage metrics and the leaderboard explain what switches on at launch instead of showing empty boxes.",
      "The Collection shows the real creatures of the address you watch; demo discoveries stay in the demo.",
      "The leaderboard shows your own rank in every list, including below the top 25.",
      "If an egg hatched while you were away, its reveal plays the next time you look.",
      "Hatch odds set to 40 / 30 / 17 / 8 / 3.5 / 1.5 % and shown on How It Works.",
      "Link previews on X show a proper card.",
    ],
  },
  {
    date: "2026-10-20",
    title: "Live leaderboard and holder metrics",
    items: [
      "The leaderboard ranks tracked holders from the chain instead of sample data.",
      "Homepage metrics for holders, eggs collected and market cap, each labelled live or stale.",
      "Holder tracking counts only wallets with a positive balance and handles long transaction histories.",
      "Every species has its own scene in the Collection.",
      "Your first five eggs hatch in a minute, so new keepers see a creature straight away.",
    ],
  },
  {
    date: "2026-10-19",
    title: "New look and hardening",
    items: [
      "A cinematic redesign: cosmic backdrop, page transitions and a sliding nav.",
      "The Phoenix homepage.",
      "Security headers, a gated studio and launch details held back until launch.",
    ],
  },
  {
    date: "2026-10-18",
    title: "Four forms and automatic egg tracking",
    items: [
      "Every species redrawn across four forms, from Eggling to Ascended.",
      "Eggs are earned automatically from on-chain balances; no wallet connection needed.",
      "Hatchery progression overhaul with a separate growth stage.",
      "The official ticker $SLNT used everywhere.",
    ],
  },
  {
    date: "2026-10-17",
    title: "First playable prototype",
    items: ["Homepage, Hatchery, Collection, How It Works and the leaderboard."],
  },
];
