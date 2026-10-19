import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/data/creatureAssets.json";
import { registerStageAssets, stageAsset } from "@/lib/creatureAssets";
import { CLASSIFIED_SPECIES, classifiedBundle } from "@/server/classified";
import art from "@/server/classified/art.json";

/** Painted art for Mythic and Secret species: server only, delivered inside a disclosed bundle. */
const ROOT = path.resolve(__dirname, "../../..");
const ids = CLASSIFIED_SPECIES.map((s) => s.id);
const painted = (art as { species: Record<string, ({ src: string } | null)[]> }).species;

describe("classified painted art stays on the server", () => {
  it("has no public files, thumbnails, silhouettes or manifest entries", () => {
    const pub = path.join(ROOT, "public/creatures");
    const dirs = existsSync(pub) ? readdirSync(pub) : [];
    for (const id of ids) {
      expect(dirs, `public/creatures/${id}`).not.toContain(id);
      expect(Object.keys((manifest as { species: object }).species), `creatureAssets.json lists ${id}`).not.toContain(id);
    }
  });

  it("is imported only by the server-only classified module", () => {
    const hits: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, f.name);
        if (f.isDirectory()) walk(p);
        else if (/\.(ts|tsx|js|mjs)$/.test(f.name) && /classified\/art(\.json)?["']/.test(readFileSync(p, "utf8"))) hits.push(path.relative(ROOT, p));
      }
    };
    walk(path.join(ROOT, "src"));
    expect(hits.filter((h) => !h.startsWith("src/server/"))).toEqual([]);
  });

  it("covers exactly the six classified species, as embedded images only", () => {
    expect(Object.keys(painted).sort()).toEqual([...ids].sort());
    for (const stages of Object.values(painted)) {
      expect(stages).toHaveLength(4);
      for (const s of stages) if (s) expect(s.src.startsWith("data:image/webp;base64,")).toBe(true);
    }
  });

  it("travels inside the disclosed bundle when a stage has been painted, and not otherwise", () => {
    for (const id of ids) {
      const b = classifiedBundle(id);
      const any = painted[id].some(Boolean);
      expect(Boolean(b.art.images), id).toBe(any);
      if (any) expect(b.art.images?.map(Boolean)).toEqual(painted[id].map(Boolean));
    }
  });

  it("a revealed species' painted stages are found through the runtime registry", () => {
    const fake = { src: "data:image/webp;base64,AAAA", thumb: "data:image/webp;base64,AAAA", alpha: true };
    registerStageAssets("test-classified", [null, fake, null, null]);
    expect(stageAsset("test-classified", 1)).toEqual(fake);
    expect(stageAsset("test-classified", 0)).toBeNull();
  });
});
