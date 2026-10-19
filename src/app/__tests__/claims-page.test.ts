import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ClaimsPage, { metadata } from "../claims/page";
import { HOLDER_DISTRIBUTION, HOLDER_DISTRIBUTION_HOURS } from "@/config/holderDistribution";

/** /claims presents the planned holder distribution, with nothing claimable and every open term pending. */
const html = renderToStaticMarkup(createElement(ClaimsPage));
const text = html.replace(/<[^>]+>/g, " ").replace(/&#x27;|&apos;/g, "'").replace(/\s+/g, " ").replace(/ ([,.])/g, "$1");

describe("Holder rewards page", () => {
  it("states the rule: locked developer supply, divided equally, two hours after launch", () => {
    expect(HOLDER_DISTRIBUTION.afterLaunchMs).toBe(2 * 60 * 60 * 1000);
    expect(HOLDER_DISTRIBUTION_HOURS).toBe(2);
    expect(metadata.title).toBe("Holder Rewards — Solanites");
    expect(text).toContain("Holder rewards"); // eyebrow (shown in capitals by CSS)
    expect(text).toContain("Locked developer supply returns to holders.");
    expect(text).toContain("Two hours after launch, the locked developer supply will be divided equally among eligible holders.");
    expect(text).toContain("Every eligible holder will receive an equal share of the total supply allocated for redistribution.");
    expect(text).toContain("Holder distribution");
    expect(text).toContain("Scheduled after launch");
    expect(text).toContain("+2h");
  });

  it("makes clear the clock is the launch, not the visit", () => {
    expect(text).toContain("The clock starts at the official launch time, the same moment for everyone. It does not depend on when you visit this page.");
  });

  it("marks eligibility, amount and process as pending, and the agreed rule as planned", () => {
    for (const { term, detail } of HOLDER_DISTRIBUTION.pending) {
      expect(text).toContain(term);
      expect(text).toContain(detail);
    }
    expect(html.match(/>Pending</g)).toHaveLength(HOLDER_DISTRIBUTION.pending.length);
    expect(html.match(/>Planned</g)).toHaveLength(HOLDER_DISTRIBUTION.planned.length);
  });

  it("has no refund wording, claim action, launch time, amounts or promises", () => {
    expect(text).not.toMatch(/refund|fee claim|connect wallet/i);
    expect(html).not.toMatch(/<button|<form|<input/);
    expect(text).not.toMatch(/\b20\d\d\b|\bUTC\b|\d{1,2}:\d{2}/); // no date or time
    expect(text).not.toMatch(/\d[\d,.]*\s*(\$?SLNT|tokens|%)/i); // no amounts
    expect(text).not.toMatch(/guarantee|automatic|instantly|airdrop/i);
    expect(text).toContain("There is nothing to claim, connect or sign here yet.");
  });
});
