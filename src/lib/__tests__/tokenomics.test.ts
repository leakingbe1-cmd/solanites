import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VerifyPanel } from "@/components/trust/VerifyPanel";
import { TOKENOMICS, type Tokenomics } from "@/config/tokenomics";
import { tokenomicsProblems, trustFacts } from "@/lib/tokenomics";

/** Tokenomics: owner-set, validated, and hidden field by field until set. Never "pending" or invented. */
const EMPTY: Tokenomics = { allocations: [], liquidity: null, mintAuthority: null, freezeAuthority: null, fees: null, teamWallets: [] };
const ADDR = "11111111111111111111111111111111"; // syntactically valid example only

describe("tokenomics", () => {
  it("the configured values are valid (an empty config is valid)", () => {
    expect(tokenomicsProblems()).toEqual([]);
  });

  it("nothing set: no facts, and the panel shows only the contract line and the Proof link", () => {
    expect(trustFacts(EMPTY)).toEqual([]);
    const text = renderToStaticMarkup(createElement(VerifyPanel)).replace(/<[^>]+>/g, " ");
    if (trustFacts(TOKENOMICS).length === 0) {
      expect(text).toContain("Verify $SLNT");
      expect(text).toContain("Contract: coming soon");
      expect(text).toContain("Proof page");
      expect(text).not.toMatch(/pending|TBD|authority|liquidity|fees/i);
    }
  });

  it("each set fact appears with its address to copy and its proof link", () => {
    const t: Tokenomics = { ...EMPTY, mintAuthority: "revoked", freezeAuthority: "revoked", allocations: [{ label: "Team", percent: 2.5, address: ADDR, proofUrl: "https://example.test/lock" }], teamWallets: [{ label: "Treasury", address: ADDR }] };
    const facts = trustFacts(t);
    expect(facts.map((f) => f.label)).toEqual(["Mint authority", "Freeze authority", "Team", "Treasury"]);
    expect(facts[0].value).toBe("Revoked");
    expect(facts[2]).toMatchObject({ value: "2.5% of supply", address: ADDR, proofUrl: "https://example.test/lock" });
  });

  it("catches bad edits: over 100%, invalid addresses, non-https proofs", () => {
    expect(tokenomicsProblems({ ...EMPTY, allocations: [{ label: "A", percent: 60 }, { label: "B", percent: 50 }] })).toContain("allocations add up to 110%");
    expect(tokenomicsProblems({ ...EMPTY, teamWallets: [{ label: "T", address: "nope" }] })).toEqual(["T: invalid address"]);
    expect(tokenomicsProblems({ ...EMPTY, allocations: [{ label: "L", percent: 1, proofUrl: "http://x" }] })).toEqual(["L: proof must be an https link"]);
  });
});
