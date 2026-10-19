import { describe, expect, it } from "vitest";
import { STOCK_LINKS, stockLinkOf } from "@/server/market/stockLinks";
import { RARITIES } from "@/lib/rarity";
import { ALL_SPECIES as SPECIES } from "@/server/classified";

describe("creature → stock links", () => {
  it("every one of the 28 catalogue species has exactly one link, and nothing else does", () => {
    expect(SPECIES).toHaveLength(28);
    expect(STOCK_LINKS).toHaveLength(28);
    expect(new Set(STOCK_LINKS.map((l) => l.speciesId))).toEqual(new Set(SPECIES.map((s) => s.id)));
  });

  it("no two species share a stock", () => {
    expect(new Set(STOCK_LINKS.map((l) => l.ticker)).size).toBe(28);
  });

  it("every link is complete and well formed", () => {
    for (const l of STOCK_LINKS) {
      expect(l.ticker).toMatch(/^[A-Z]{1,5}$/);
      expect(["NYSE", "Nasdaq"]).toContain(l.exchange);
      for (const f of [l.company, l.sector, l.connection, l.visualIdentity]) expect(f.trim().length).toBeGreaterThan(3);
    }
  });

  it("links leave the catalogue untouched: same names, rarity tiers and tier counts", () => {
    const counts = Object.fromEntries(Object.keys(RARITIES).map((r) => [r, SPECIES.filter((s) => s.rarity === r).length]));
    expect(counts).toEqual({ common: 6, rare: 5, epic: 5, legendary: 6, mythic: 4, secret: 2 });
    expect(stockLinkOf("pyraurum")?.ticker).toBe("AMD");
    expect(stockLinkOf("nope")).toBeNull();
  });

  it("listings with pending corporate events are flagged for review", () => {
    expect(STOCK_LINKS.filter((l) => l.review).map((l) => l.ticker).sort()).toEqual(["CMCSA", "RIG"]);
  });
});
