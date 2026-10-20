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

describe("a species keeps its stock at every stage, whatever art it has", () => {
  it("links are keyed by species alone, and every painted species keeps its catalogue id and link", async () => {
    const manifest = (await import("@/data/creatureAssets.json")).default as { species: Record<string, unknown[]> };
    for (const l of STOCK_LINKS) expect(Object.keys(l)).not.toContain("stage");
    for (const [id, stages] of Object.entries(manifest.species)) {
      expect(stages, id).toHaveLength(4);
      expect(SPECIES.some((s) => s.id === id), `${id} is a catalogue id`).toBe(true);
      expect(stockLinkOf(id), `${id} has its stock`).not.toBeNull();
    }
  });

  it("the market snapshot names the same company for a species however it is asked for", async () => {
    const { unavailableSnapshot } = await import("@/server/market/service");
    for (const l of STOCK_LINKS.slice(0, 10)) {
      const a = unavailableSnapshot(l.speciesId, "1W", 0).stock;
      const b = unavailableSnapshot(l.speciesId, "1Y", 1e12).stock;
      expect(a).toEqual(b);
      expect(a.ticker).toBe(l.ticker);
    }
  });
});

describe("every linked stock has a TradingView symbol", () => {
  it("all 28 mappings produce a well-formed exchange:ticker symbol", async () => {
    const { tradingViewSymbol } = await import("@/lib/market/tradingview");
    for (const l of STOCK_LINKS) expect(tradingViewSymbol(l.exchange, l.ticker), l.speciesId).toMatch(/^(NYSE|NASDAQ):[A-Z.]+$/);
  });
});
