import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { RENDERERS } from "@/components/creature/species";
import publicDesigns from "@/data/creatureDesigns.json";
import assets from "@/data/creatureAssets.json";
import { CATALOGUE_SIZE, CLASSIFIED_SLOTS, SEALED, SPECIES, SPECIES_BY_ID } from "@/lib/species";
import { CLASSIFIED_RENDERERS, CLASSIFIED_SPECIES, classifiedBundle, ctxFor, discloseEggs } from "@/server/classified";
import { svgMarkup } from "@/server/classified/markup";

/**
 * Mythic and Secret species are server only (owner decision before launch): their names,
 * designs and lore must not be in any public bundle, page, API response or asset path.
 * The built site is checked end to end by scripts/qa/classified-privacy.mjs.
 */

const root = path.resolve(__dirname, "../../..");
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

/** Strings that identify a classified species (its id, name, epithet and the start of its lore). */
const SECRETS = CLASSIFIED_SPECIES.flatMap((s) => [s.name.replace(/^Ø /, ""), s.epithet, s.lore.slice(0, 40)]);
// "genesis" is also an ordinary word in site copy ("Genesis Hatchery", "the genesis slot"), so only its quoted id counts.
const idPattern = (id: string) => (id === "genesis" ? /["'`]genesis["'`]/ : new RegExp(`\\b${id}\\b`, "i"));

describe("classified species are server only", () => {
  it("the public catalogue holds no classified species, but counts their slots", () => {
    expect(CLASSIFIED_SPECIES.map((s) => s.rarity).sort()).toEqual(["mythic", "mythic", "mythic", "mythic", "secret", "secret"]);
    for (const s of CLASSIFIED_SPECIES) {
      expect(SPECIES.some((p) => p.id === s.id)).toBe(false);
      expect(SPECIES_BY_ID[s.id]).toBeUndefined();
      expect(RENDERERS[s.id]).toBeUndefined();
      expect(Object.keys(publicDesigns.species)).not.toContain(s.id);
      expect(Object.keys(assets.species)).not.toContain(s.id);
    }
    expect(CLASSIFIED_SLOTS.map((c) => [c.dex, c.rarity])).toEqual(CLASSIFIED_SPECIES.map((s) => [s.dex, s.rarity]));
    expect(CATALOGUE_SIZE).toBe(28);
  });

  it("no code outside src/server names a classified species or imports the classified module from the client", () => {
    const client = files(path.join(root, "src")).filter((f) => !f.includes(`${path.sep}server${path.sep}`) && !f.includes("__tests__") && /\.(tsx?|json|css)$/.test(f));
    expect(client.length).toBeGreaterThan(50);
    for (const f of client) {
      const text = readFileSync(f, "utf8");
      const rel = path.relative(root, f);
      for (const s of SECRETS) expect(text.includes(s), `${rel} contains "${s}"`).toBe(false);
      for (const c of CLASSIFIED_SPECIES) expect(idPattern(c.id).test(text), `${rel} names ${c.id}`).toBe(false);
      // only server pages and routes may import it (they are checked by Next's server-only guard too)
      if (text.includes("@/server/classified")) expect(rel, `${rel} imports the classified module`).toMatch(/^src[\\/]app[\\/].*(page|route)\.tsx?$/);
    }
  });

  it("every classified module is marked server-only", () => {
    for (const f of files(path.join(root, "src/server/classified")).filter((f) => /\.tsx?$/.test(f))) expect(readFileSync(f, "utf8"), f).toMatch(/^import "server-only";/m);
  });

  it("no public asset path names a classified species", () => {
    for (const f of files(path.join(root, "public"))) for (const c of CLASSIFIED_SPECIES) expect(f.toLowerCase().includes(c.id), f).toBe(false);
  });
});

describe("server-rendered classified art", () => {
  it("is exactly the markup React would render (all six species, all four stages)", () => {
    for (const s of CLASSIFIED_SPECIES) {
      for (let evo = 0; evo < 4; evo++) {
        const el = createElement("g", null, CLASSIFIED_RENDERERS[s.id].render(ctxFor(s, evo)));
        expect(svgMarkup(el), `${s.id} stage ${evo + 1}`).toBe(renderToStaticMarkup(el));
      }
    }
  });

  it("carries the species, its design and four stages, with no ground shadow, aura or halo (canon W1–W2)", () => {
    for (const s of CLASSIFIED_SPECIES) {
      const b = classifiedBundle(s.id);
      expect(b.species).toEqual(s);
      expect(b.design?.stages).toHaveLength(4);
      expect(b.art.stages).toHaveLength(4);
      for (const m of b.art.stages) {
        expect(m.length).toBeGreaterThan(200);
        expect(m).not.toMatch(/<ellipse cx="200" cy="376"/);
        expect(m).not.toMatch(/class="(sl-aura|sl-halo|sl-glitch-lines|sl-backlight)"/);
      }
    }
  });

  it("the public site draws a classified slot as the generic sealed form, never a real design", () => {
    for (const rarity of ["mythic", "secret"] as const) {
      for (const stage of [0, 3]) {
        const markup = renderToStaticMarkup(createElement(CreatureArt, { species: SEALED[rarity], stage, animated: false, vector: true, silhouette: true }));
        expect(markup).toContain('aria-label="Undiscovered Solanite"');
        for (const s of CLASSIFIED_SPECIES) {
          expect(markup).not.toContain(s.palette.body);
          expect(markup).not.toContain(classifiedBundle(s.id).art.stages[stage].slice(0, 80));
        }
      }
    }
  });
});

describe("what the public API discloses about eggs", () => {
  let n = 0;
  const egg = (speciesId: string | null, status: string) => ({ id: `egg_test_${n++}`, status, speciesId });

  it("a classified species is sealed until its egg hatches, then sent with its art", () => {
    const [astra, gen] = [CLASSIFIED_SPECIES.find((s) => s.rarity === "mythic")!, CLASSIFIED_SPECIES.find((s) => s.rarity === "secret")!];
    const { eggs, classified } = discloseEggs([egg("mossling", "incubating"), egg(astra.id, "incubating"), egg(gen.id, "ready"), egg(gen.id, "hatched"), egg(null, "queued")]);
    expect(eggs.map((e) => e.speciesId)).toEqual(["mossling", "sealed-mythic", "sealed-secret", gen.id, null]);
    expect(classified.map((b) => b.species.id)).toEqual([gen.id]);
    expect(JSON.stringify(eggs.slice(0, 3))).not.toContain(astra.id);
  });

  it("sends nothing classified for public species", () => {
    expect(discloseEggs([egg("mossling", "hatched"), egg("thalor", "hatched")]).classified).toEqual([]);
  });
});
