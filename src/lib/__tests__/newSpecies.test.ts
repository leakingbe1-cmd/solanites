import { describe, expect, it } from "vitest";
import { gameConfig } from "@/config/gameConfig";
import { discoveryOf } from "@/lib/discovery";
import { rarityChances, rollSpecies } from "@/lib/progression";
import { RENDERERS } from "@/components/creature/species";
import { ALL_SPECIES as SPECIES, ALL_SPECIES_BY_ID as SPECIES_BY_ID, classifiedBundle, isClassifiedId } from "@/server/classified";
import designs from "@/data/creatureDesigns.json";

const NEW = [
  { id: "nyxara", name: "Nyxara", rarity: "epic", element: "Shadow", dex: 26 },
  { id: "thalor", name: "Thalor", rarity: "legendary", element: "Tidal", dex: 27 },
  { id: "helivane", name: "Helivane", rarity: "mythic", element: "Solar", dex: 28 },
] as const;

describe("Nyxara, Thalor and Helivane", () => {
  it.each(NEW)("$name is catalogued with its rarity, element and dex", (n) => {
    expect(SPECIES_BY_ID[n.id]).toMatchObject(n);
    // classified species are drawn on the server and reach the browser as finished art
    if (isClassifiedId(n.id)) {
      expect(classifiedBundle(n.id).art.stages).toHaveLength(4);
      expect(classifiedBundle(n.id).design?.stages).toHaveLength(4);
    } else {
      expect(RENDERERS[n.id]).toBeDefined();
      expect((designs.species as Record<string, { stages: unknown[] }>)[n.id].stages).toHaveLength(4);
    }
  });

  it("brings the catalogue to 28 species with unique ids, names and dex numbers", () => {
    expect(SPECIES).toHaveLength(28);
    expect(SPECIES.map((s) => s.dex).sort((a, b) => a - b)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    expect(new Set(SPECIES.map((s) => s.name.toLowerCase())).size).toBe(28);
  });

  it("keeps tier odds unchanged", () => {
    expect(rarityChances(gameConfig).legendary).toBeCloseTo(3.8 / 100, 6);
  });

  it("can roll each new species, and Helivane is classified until discovered like other Mythics", () => {
    const hits = new Set<string>();
    for (let seed = 1; seed < 200000 && NEW.some((n) => !hits.has(n.id)); seed++) hits.add(rollSpecies(seed, gameConfig, SPECIES));
    for (const n of NEW) expect(hits.has(n.id)).toBe(true);
    expect(discoveryOf(SPECIES_BY_ID.helivane, [])).toBe("classified");
    expect(discoveryOf(SPECIES_BY_ID.thalor, [])).toBe("catalogued");
  });
});
