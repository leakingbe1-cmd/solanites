import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RENDERERS } from "@/components/creature/species";
import { gameConfig } from "@/config/gameConfig";
import manifest from "@/data/creatureAssets.json";
import { designOf } from "@/lib/creatureDesigns";
import { discoveryOf } from "@/lib/discovery";
import { CATALOGUE_SIZE, FEATURED_STAGE, SPECIES, SPECIES_BY_ID } from "@/lib/species";

/**
 * Mythic and Secret species are shown fully, like every other rarity (owner decision, 20 Oct):
 * real names, art, lore and all stages, no "Classified" state, and the catalogue cards at the
 * final evolution stage.
 */
const SIX = ["astravex", "orbelith", "eventide", "helivane", "genesis", "nullborn"];
const ROOT = path.resolve(__dirname, "../../..");

describe("Mythic and Secret species are public", () => {
  it("all 28 species are in the one public catalogue, the six included", () => {
    expect(SPECIES).toHaveLength(28);
    expect(CATALOGUE_SIZE).toBe(28);
    for (const id of SIX) expect(SPECIES_BY_ID[id], id).toBeDefined();
    expect(SPECIES.filter((s) => s.rarity === "mythic").map((s) => s.id).sort()).toEqual(["astravex", "eventide", "helivane", "orbelith"]);
    expect(SPECIES.filter((s) => s.rarity === "secret").map((s) => s.id).sort()).toEqual(["genesis", "nullborn"]);
  });

  it.each(SIX)("%s has its real name, lore, element, renderer and four-stage design", (id) => {
    const s = SPECIES_BY_ID[id];
    expect(s.name).not.toMatch(/\?|Sealed|Classified/);
    expect(s.lore.length).toBeGreaterThan(30);
    expect(RENDERERS[id]).toBeDefined();
    expect(designOf(id)?.stages).toHaveLength(4);
  });

  it.each(SIX)("%s is catalogued (never classified) until the viewer hatches one", (id) => {
    expect(discoveryOf(SPECIES_BY_ID[id], [])).toBe("catalogued");
    expect(discoveryOf(SPECIES_BY_ID[id], [id])).toBe("owned");
  });

  it("their painted stages are public files, with only Eventide's Hatchling (never painted) left to vector", () => {
    const species = (manifest as { species: Record<string, (unknown | null)[]> }).species;
    const missing = SIX.flatMap((id) => species[id].map((a, n) => (a ? null : `${id}:${n}`)).filter(Boolean));
    expect(missing).toEqual(["eventide:1"]);
  });

  it("no tracked source still hides content by rarity", () => {
    for (const f of ["src/lib/discovery.ts", "src/components/creature/CollectionPlate.tsx", "src/components/creature/CreatureDetail.tsx", "src/components/landing/RarityShowcase.tsx", "src/app/collection/page.tsx"]) {
      const text = readFileSync(path.join(ROOT, f), "utf8");
      expect(text, f).not.toMatch(/"classified"|CLASSIFIED_|sealed=|\?\?\?/);
    }
  });
});

describe("catalogue cards show the final evolution stage", () => {
  it("FEATURED_STAGE is the last stage in the evolution data, not a fixed index", () => {
    expect(FEATURED_STAGE).toBe(gameConfig.evolution.names.length - 1);
    expect(gameConfig.evolution.names[FEATURED_STAGE]).toBe("Ascended");
  });

  it("the Collection plates, related cards and tier cards use it", () => {
    for (const f of ["src/components/creature/CollectionPlate.tsx", "src/components/creature/CreatureDetail.tsx", "src/components/landing/RarityShowcase.tsx"]) {
      expect(readFileSync(path.join(ROOT, f), "utf8"), f).toMatch(/FEATURED_STAGE/);
    }
  });
});
