import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContractAddress } from "@/components/layout/ContractAddress";
import { CONTRACT_ADDRESS, isContractAddress, solscanTokenUrl } from "@/config/social";

/** The contract address display: "coming soon" until the owner sets it, never a guessed or invalid value. */
const render = (props: Parameters<typeof ContractAddress>[0]) => renderToStaticMarkup(createElement(ContractAddress, props));
// A syntactically valid example only (the System Program id); not the $SLNT mint.
const EXAMPLE = "11111111111111111111111111111111";

describe("ContractAddress", () => {
  it("the configured address is unset or a valid Solana address", () => {
    expect(CONTRACT_ADDRESS === null || isContractAddress(CONTRACT_ADDRESS)).toBe(true);
  });

  it("unset: 'coming soon' everywhere, with no address, copy button or explorer link", () => {
    for (const variant of ["full", "compact"] as const) {
      const html = render({ variant, address: null });
      expect(html).toContain('data-state="soon"');
      expect(html).toMatch(/coming soon|CA: soon/);
      expect(html).not.toContain("<button");
      expect(html).not.toContain("solscan");
    }
  });

  it("an invalid value is never shown", () => {
    const html = render({ address: "not-an-address" });
    expect(html).toContain('data-state="soon"');
    expect(html).not.toContain("not-an-address");
  });

  it("set: the full address, copy button, Solscan link and the trust note", () => {
    const html = render({ address: EXAMPLE });
    expect(html).toContain('data-state="live"');
    expect(html).toContain(EXAMPLE);
    expect(html).toContain('aria-label="Copy contract address"');
    expect(html).toContain(solscanTokenUrl(EXAMPLE));
    expect(html).toContain("Only trust this address.");
  });

  it("compact (nav): short form with a copy button", () => {
    const html = render({ variant: "compact", address: EXAMPLE });
    expect(html).toContain("CA 1111…1111");
    expect(html).toContain('aria-label="Copy contract address"');
  });
});
