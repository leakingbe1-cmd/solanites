import { describe, expect, it } from "vitest";
import { gameConfig } from "@/config/gameConfig";
import manifest from "@/data/creatureAssets.json";
import designs from "@/data/creatureDesigns.json";
import { pickImage } from "@/components/creature/CreatureArt";
import { discoveryOf } from "@/lib/discovery";
import { SPECIES } from "@/lib/species";
import { ALL_SPECIES_BY_ID as SPECIES_BY_ID } from "@/server/classified";

const ids = SPECIES.map((s) => s.id).sort();

describe("design bible covers the whole catalogue", () => {
  it("has exactly one design per existing species id", () => {
    expect(Object.keys(designs.species).sort()).toEqual(ids);
  });

  it("gives every species four stages, each with UI copy and an art brief", () => {
    for (const [id, d] of Object.entries(designs.species)) {
      expect(d.stages, id).toHaveLength(4);
      for (const s of d.stages) {
        expect(s.summary.length, id).toBeGreaterThan(25);
        expect(s.brief.length, id).toBeGreaterThan(20);
      }
      expect(new Set(d.stages.map((s) => s.brief)).size, `${id} stages must differ`).toBe(4);
    }
  });

  it("uses the same stage names as the game rules", () => {
    expect(designs.stageNames).toEqual(gameConfig.evolution.names);
    expect(gameConfig.evolution.names).toEqual(["Eggling", "Hatchling", "Evolved", "Ascended"]);
  });
});

describe("asset manifest", () => {
  const species = (manifest as { species: Record<string, unknown[]> }).species;

  it("tracks four stage slots for every species", () => {
    expect(Object.keys(species).sort()).toEqual(ids);
    for (const id of ids) expect(species[id], id).toHaveLength(4);
  });

  it("never points two stages or species at the same file", () => {
    const srcs = Object.values(species)
      .flat()
      .filter((a): a is { src: string } => !!a)
      .map((a) => a.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });
});

describe("discovery-safe image selection", () => {
  const art = { src: "/creatures/x/3-evolved.webp", thumb: "/creatures/x/3-evolved-384.webp", alpha: true };

  it("shows full art with a responsive srcset when not hidden", () => {
    expect(pickImage(art, false, false)).toEqual({ src: art.src, srcSet: `${art.thumb} 384w, ${art.src} 1024w` });
  });

  it("classified species only ever expose the silhouette file", () => {
    expect(pickImage({ ...art, silhouette: "/creatures/x/3-evolved-silhouette.webp" }, true, true)).toEqual({ src: "/creatures/x/3-evolved-silhouette.webp" });
    expect(pickImage(art, true, true)).toBeNull(); // falls back to the vector silhouette
  });

  it("opaque art can't be silhouetted, so it falls back to vector", () => {
    expect(pickImage({ ...art, alpha: false }, true, false)).toBeNull();
  });

  it("classifies Mythic/Secret until discovered", () => {
    expect(discoveryOf(SPECIES_BY_ID.astravex, [])).toBe("classified");
    expect(discoveryOf(SPECIES_BY_ID.astravex, ["astravex"])).toBe("owned");
    expect(discoveryOf(SPECIES_BY_ID.mossling, [])).toBe("catalogued");
  });
});
