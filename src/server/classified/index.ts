import "server-only";
import { ART_ID_TOKEN, type ClassifiedArt } from "@/components/creature/species";
import type { Ctx, Renderer } from "@/components/creature/kit";
import type { SpeciesDesign } from "@/lib/creatureDesigns";
import { SPECIES, type Species } from "@/lib/species";
import type { ClassifiedBundle } from "@/shared/classified";
import designs from "./designs.json";
import { svgMarkup } from "./markup";
import { astravex } from "./renderers/astravex";
import { eventide } from "./renderers/eventide";
import { genesis } from "./renderers/genesis";
import { helivane } from "./renderers/helivane";
import { nullborn } from "./renderers/nullborn";
import { orbelith } from "./renderers/orbelith";
import { CLASSIFIED_SPECIES } from "./species";

/**
 * Classified (Mythic and Secret) species, server side. The public site and its API only
 * ever see the sealed stand-ins in src/lib/species.ts; the real species leave the server
 * in exactly two ways, both as a ClassifiedBundle:
 *
 * - Developer Mode, after the owner's server-side sign-in (src/server/studioAuth.ts);
 * - with a holder's own egg once it has hatched (discloseEggs / the hatch route).
 */

export { CLASSIFIED_SPECIES };

/** Every species, in the original catalogue order. Production rolls must use this. */
export const ALL_SPECIES: readonly Species[] = [...SPECIES, ...CLASSIFIED_SPECIES];
export const ALL_SPECIES_BY_ID: Readonly<Record<string, Species>> = Object.fromEntries(ALL_SPECIES.map((s) => [s.id, s]));

/** Exported for the parity tests only; nothing ships these to a browser. */
export const CLASSIFIED_RENDERERS: Record<string, Renderer> = { astravex, orbelith, eventide, helivane, genesis, nullborn };
const DESIGNS = designs.species as Record<string, SpeciesDesign>;
const BY_ID = new Map(CLASSIFIED_SPECIES.map((s) => [s.id, s]));

export const isClassifiedId = (id: string): boolean => BY_ID.has(id);

/** The public stand-in id for a classified species (sealed-mythic / sealed-secret). */
export function sealedIdFor(id: string): string {
  const s = BY_ID.get(id);
  return s ? `sealed-${s.rarity}` : id;
}

const cache = new Map<string, ClassifiedBundle>();

/** Everything a browser needs to show one classified species, its art finished as markup. */
export function classifiedBundle(id: string): ClassifiedBundle {
  const hit = cache.get(id);
  if (hit) return hit;
  const species = BY_ID.get(id);
  const r = CLASSIFIED_RENDERERS[id];
  if (!species || !r) throw new Error(`Not a classified species: ${id}`);
  const stages = [0, 1, 2, 3].map((evo) => svgMarkup(r.render(ctxFor(species, evo)))) as ClassifiedArt["stages"];
  // Painted classified stages will come from the private Blob store (not yet connected), never
  // from the repository. Until then a classified species is drawn with its vector art.
  const out: ClassifiedArt = { stages, floating: r.floating, fit: r.fit, stageFit: r.stageFit, shadow: r.shadow, halo: r.halo };
  for (const k of Object.keys(out) as (keyof ClassifiedArt)[]) if (out[k] === undefined) delete out[k];
  const bundle = { species, design: DESIGNS[id] ?? null, art: out };
  cache.set(id, bundle);
  return bundle;
}

/** All classified species, for Developer Mode only. */
export function allClassifiedBundles(): ClassifiedBundle[] {
  return CLASSIFIED_SPECIES.map((s) => classifiedBundle(s.id));
}

/** The drawing context CreatureArt builds, with a placeholder for its per-instance id. */
export function ctxFor(species: Species, evo: number): Ctx {
  return {
    id: ART_ID_TOKEN,
    p: species.palette,
    species,
    evo,
    g: [0.55, 0.78, 1, 1.12][evo],
    mark: [0.35, 0.65, 0.95, 1][evo],
    u: (name: string) => `url(#${ART_ID_TOKEN}-${name})`,
  };
}

/**
 * What the public API may say about eggs: a classified species is named only once its egg
 * has hatched (and then comes with its bundle); before that it is the sealed stand-in, so a
 * stirring egg shows a generic sealed silhouette rather than the real one.
 */
export function discloseEggs<E extends { status: string; speciesId: string | null }>(eggs: readonly E[]): { eggs: E[]; classified: ClassifiedBundle[] } {
  const revealed = new Set<string>();
  const out = eggs.map((e) => {
    if (!e.speciesId || !isClassifiedId(e.speciesId)) return e;
    if (e.status === "hatched") {
      revealed.add(e.speciesId);
      return e;
    }
    return { ...e, speciesId: sealedIdFor(e.speciesId) };
  });
  return { eggs: out, classified: [...revealed].map(classifiedBundle) };
}
