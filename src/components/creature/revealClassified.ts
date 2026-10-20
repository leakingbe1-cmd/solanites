import type { ClassifiedBundle } from "@/shared/classified";
import { revealDesign } from "@/lib/creatureDesigns";
import { registerScene } from "@/lib/creatureScenes";
import { revealSpecies } from "@/lib/species";
import { registerClassifiedArt } from "./species";

/**
 * Makes classified species the server sent viewable in this browser (idempotent).
 *
 * Browser only: the lookups it fills are module state, which on the server is shared by
 * every request, so registering there would let one viewer's classified species appear in
 * another visitor's server-rendered page. Callers reveal after mount (an effect or an event).
 */
export function revealClassified(bundles: readonly ClassifiedBundle[] | undefined): void {
  if (typeof window === "undefined") return;
  for (const b of bundles ?? []) {
    revealSpecies(b.species);
    if (b.design) revealDesign(b.species.id, b.design);
    registerClassifiedArt(b.species.id, b.art);
    if (b.scene) registerScene(b.species.id, b.scene.scene, b.scene.assets);
  }
}
