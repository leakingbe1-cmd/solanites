import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** The hero says why to hold in product terms, never price, gains or returns. */
describe("hero: why hold", () => {
  const page = readFileSync(path.resolve(__dirname, "../page.tsx"), "utf8");
  const line = page.slice(page.indexOf('data-testid="hero-why-hold"'), page.indexOf("</p>", page.indexOf('data-testid="hero-why-hold"')));
  it("names what grows while you hold: eggs, collection, evolution, rank and streak", () => {
    for (const w of ["eggs", "collection", "evolve", "rank", "streak"]) expect(line).toContain(w);
  });
  it("never talks price, gains or returns", () => {
    expect(line).not.toMatch(/price|gain|profit|return|moon|\bx\d|\$\d|worth|value/i);
  });
});
