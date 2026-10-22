import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { WHATS_NEXT } from "@/components/landing/WhatsNext";

const read = (f: string) => readFileSync(path.resolve(__dirname, "../..", f), "utf8");

describe("what's next line", () => {
  it("is the owner's copy, with no date, returns or price talk", () => {
    expect(WHATS_NEXT).toBe("Creator fees fund the next version of Solanites: a living world where your creatures have a purpose.");
    expect(WHATS_NEXT).not.toMatch(/\b20\d\d\b|\bQ[1-4]\b|soon|price|return|profit|moon|x\d|\d+x/i);
  });

  it("sits under the proof strip on the homepage and on How It Works", () => {
    const home = read("app/page.tsx");
    expect(home.indexOf("<WhatsNext")).toBeGreaterThan(home.indexOf("<ProofStrip />"));
    expect(read("app/how-it-works/page.tsx")).toContain("<WhatsNext");
  });
});
