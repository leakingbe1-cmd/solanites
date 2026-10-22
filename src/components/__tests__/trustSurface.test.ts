import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMMUNITY } from "@/config/social";

/** Trust surface: the X link, a short "no promises" page, and no community link until the owner opens one. */
const read = (f: string) => readFileSync(path.resolve(__dirname, "../..", f), "utf8");

describe("trust and community surface", () => {
  it("no community channel is linked until the owner sets one", () => {
    expect(COMMUNITY).toBeNull();
  });

  it("the nav links to X and the footer to the 'No promises' page", () => {
    expect(read("components/layout/Nav.tsx")).toContain("href={X_URL}");
    expect(read("components/layout/Footer.tsx")).toContain('href="/disclaimer"');
  });

  it("the 'No promises' page says it is not financial advice and promises no value", () => {
    const page = read("app/disclaimer/page.tsx");
    expect(page).toContain("Not financial advice");
    expect(page).toContain("No promises of value");
    expect(page).not.toMatch(/guarantee|profit(?!.)|x100|moon/i);
  });

  it("How It Works says the rules are fixed and changes are announced, not 'configurable'", () => {
    const page = read("app/how-it-works/page.tsx");
    expect(page).not.toContain("Every value is configurable");
    expect(page).toContain("The rules are fixed in code and enforced on the server.");
  });
});
