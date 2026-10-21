import { describe, expect, it } from "vitest";
import { gameConfig } from "@/config/gameConfig";
import { rarityChances, rollSpecies } from "@/lib/progression";
import { SPECIES, SPECIES_BY_ID, speciesOfRarity } from "@/lib/species";

describe("Velynx joins the catalogue without changing anything else", () => {
  it("is a Legendary Shadow species with a unique id, name and dex number", () => {
    const v = SPECIES_BY_ID.velynx;
    expect(v).toMatchObject({ rarity: "legendary", element: "Shadow", dex: 25, name: "Velynx" });
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(SPECIES.length);
    expect(new Set(SPECIES.map((s) => s.name.toLowerCase())).size).toBe(SPECIES.length);
    expect(new Set(SPECIES.map((s) => s.dex)).size).toBe(SPECIES.length);
  });

  it("keeps the original 24 species' dex numbers", () => {
    const later = ["velynx", "nyxara", "thalor", "helivane"];
    expect(SPECIES.filter((s) => !later.includes(s.id)).map((s) => s.dex).sort((a, b) => a - b)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  });

  it("does not change tier odds — only the split inside the Legendary tier", () => {
    expect(rarityChances(gameConfig).legendary).toBeCloseTo(8 / 100, 6);
    expect(speciesOfRarity("legendary").map((s) => s.id)).toContain("velynx");
  });

  it("can be rolled from a Legendary result", () => {
    const hits = new Set<string>();
    for (let seed = 1; seed < 20000 && !hits.has("velynx"); seed++) hits.add(rollSpecies(seed, gameConfig));
    expect(hits.has("velynx")).toBe(true);
  });
});
