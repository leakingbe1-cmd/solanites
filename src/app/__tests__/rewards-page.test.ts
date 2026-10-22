import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RewardsPage, { metadata } from "../rewards/page";
import { DistributionProof, RewardsContent } from "@/components/rewards/RewardsContent";
import { DISTRIBUTION_PROOF, distributionProofProblems, HOLDER_DISTRIBUTION, HOLDER_DISTRIBUTION_HOURS, publishedTerms, REWARDS_PAGE_LIVE, rewardsTermsSet, TERM_LABELS } from "@/config/holderDistribution";

/** /rewards presents the planned holder distribution: nothing claimable, unset terms hidden, never "pending". */
const html = renderToStaticMarkup(createElement(RewardsContent));
const text = html.replace(/<[^>]+>/g, " ").replace(/&#x27;|&apos;/g, "'").replace(/\s+/g, " ").replace(/ ([,.])/g, "$1");

const read = (f: string) => readFileSync(path.resolve(__dirname, "../..", f), "utf8");

describe("rewards before launch", () => {
  it("is off by default: the route is a 404 and nothing links to or describes it", () => {
    expect(REWARDS_PAGE_LIVE).toBe(false);
    expect(() => RewardsPage()).toThrow(); // notFound()
    expect(read("components/layout/Nav.tsx")).toContain("REWARDS_PAGE_LIVE && rewardsTermsSet()");
    expect(read("components/layout/Footer.tsx")).toContain('{REWARDS_PAGE_LIVE && <li><Link className="hover:text-bone" href="/rewards">');
    expect(read("components/hatchery/HatcheryGuide.tsx")).toContain('link: REWARDS_PAGE_LIVE ? { href: "/rewards"');
    const hiw = read("app/how-it-works/page.tsx");
    expect(hiw).toContain("...(REWARDS_PAGE_LIVE");
    expect(hiw).toContain("{REWARDS_PAGE_LIVE && <li>");
    expect(metadata).toEqual({}); // no title or preview on the 404
  });
});

describe("Holder rewards page (once live)", () => {
  it("states the rule: developer supply, shared in proportion to holdings, two hours after launch", () => {
    expect(HOLDER_DISTRIBUTION.afterLaunchMs).toBe(2 * 60 * 60 * 1000);
    expect(HOLDER_DISTRIBUTION_HOURS).toBe(2);
    expect(text).toContain("Holder rewards"); // eyebrow (shown in capitals by CSS)
    expect(text).toContain("Developer supply returns to holders.");
    expect(text).toContain("Two hours after launch, the developer supply allocated for redistribution will be shared among eligible holders in proportion to their holdings.");
    expect(text).toContain("Each holder's share of it matches their share of the eligible supply.");
    expect(text).not.toMatch(/\bequal(ly)?\b|same share/i);
    expect(text).toContain("Holder distribution");
    expect(text).toContain("Scheduled after launch");
    expect(text).toContain("+2h");
  });

  it("makes clear the clock is the launch, not the visit", () => {
    expect(text).toContain("The clock starts at the official launch time, the same moment for everyone. It does not depend on when you visit this page.");
  });

  it("never says 'pending' or 'TBD', shows the owner's terms, and only says 'locked' with a lock proof", () => {
    expect(text).not.toMatch(/pending|\bTBD\b|to be confirmed/i);
    expect(HOLDER_DISTRIBUTION.lockProofUrl).toBeNull();
    expect(text).not.toMatch(/\blocked\b/i);
    expect(html.match(/>Planned</g)).toHaveLength(HOLDER_DISTRIBUTION.planned.length);
    for (const label of Object.values(TERM_LABELS)) expect(text).toContain(label);
    expect(publishedTerms().map((t) => t.term)).toEqual(Object.values(TERM_LABELS));
    expect(HOLDER_DISTRIBUTION.terms.amount).toBe("1% of total supply");
  });

  it("shows a term once the owner sets it, and joins the nav only when amount, eligibility and process are set", () => {
    const none = { amount: null, eligibility: null, antiSybil: null, snapshot: null, process: null };
    expect(publishedTerms({ ...none, amount: "X" })).toEqual([{ term: "Amount", detail: "X" }]);
    expect(rewardsTermsSet(none)).toBe(false);
    expect(rewardsTermsSet({ ...none, amount: "A", eligibility: "E" })).toBe(false);
    expect(rewardsTermsSet({ ...none, amount: "A", eligibility: "E", process: "P" })).toBe(true);
    expect(rewardsTermsSet()).toBe(true); // the owner's terms are set; the page itself stays off until REWARDS_PAGE_LIVE
    const nav = readFileSync(path.resolve(__dirname, "../../components/layout/Nav.tsx"), "utf8");
    expect(nav).toContain('...(REWARDS_PAGE_LIVE && rewardsTermsSet() ? [{ href: "/rewards", label: "Rewards" }] : [])');
  });

  it("has no refund wording, claim action, launch time, token amounts or promises", () => {
    expect(text).not.toMatch(/refund|fee claim|connect wallet/i);
    expect(html).not.toMatch(/<button|<form|<input/);
    expect(text).not.toMatch(/\b20\d\d\b|\bUTC\b|\d{1,2}:\d{2}/); // no date or time
    expect(text).not.toMatch(/\d[\d,.]*\s*(\$?SLNT|tokens)/i); // no token amounts
    expect(text.match(/\d[\d,.]*\s*%/g)).toEqual(["1%"]); // the one published share of supply
    expect(text).not.toMatch(/guarantee|automatic|instantly|airdrop/i);
    expect(text).toContain("There is nothing to claim, connect or sign here yet.");
  });
});

describe("Distribution proof (owner-pasted, no payout code)", () => {
  const W = "11111111111111111111111111111111"; // syntactically valid example only
  const SIG = "1".repeat(88);
  const row = { wallet: W, amount: "1,000 $SLNT", signature: SIG, time: "2026-11-01T14:05:00Z", sample: true };

  it("is empty and hidden until the owner pastes the snapshot hash or transfers", () => {
    expect(DISTRIBUTION_PROOF).toEqual({ snapshotHash: null, payouts: [] });
    expect(distributionProofProblems()).toEqual([]);
    expect(html).not.toContain("distribution-proof");
  });

  it("shows the hash and each transfer with its Solscan link; sample rows say Sample", () => {
    const out = renderToStaticMarkup(createElement(DistributionProof, { proof: { snapshotHash: "a".repeat(64), payouts: [row] } }));
    expect(out).toContain("Distribution proof");
    expect(out).toContain("a".repeat(64));
    expect(out).toContain(`href="https://solscan.io/tx/${SIG}"`);
    expect(out).toContain(">Sample<");
    expect(out).toContain("2026-11-01 14:05");
  });

  it("catches a bad paste and contains no payout code", () => {
    expect(distributionProofProblems({ snapshotHash: "xyz", payouts: [{ ...row, wallet: "nope", signature: "0OIl", time: "soon", amount: " " }] })).toEqual([
      "row 1: invalid wallet",
      "row 1: invalid signature",
      "row 1: invalid time",
      "row 1: missing amount",
      "snapshot hash must be 64 hex characters (SHA-256)",
    ]);
    for (const f of ["components/rewards/RewardsContent.tsx", "config/holderDistribution.ts"]) expect(read(f)).not.toMatch(/fetch\(|sendTransaction|signTransaction|Keypair|@solana\/web3/);
  });
});
