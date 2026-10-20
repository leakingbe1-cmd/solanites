import type { ClassifiedArt } from "@/components/creature/species";
import type { SpeciesDesign } from "@/lib/creatureDesigns";
import type { SceneAssets, SceneDef } from "@/lib/creatureScenes";
import type { Species } from "@/lib/species";

/**
 * A classified (Mythic or Secret) species as the server sends it: only to the owner in
 * Developer Mode, or with a holder's own hatched egg. Never part of a public bundle.
 */
export interface ClassifiedBundle {
  species: Species;
  design: SpeciesDesign | null;
  art: ClassifiedArt;
  /**
   * Its biome and idle (src/lib/creatureScenes.ts), when the private store holds them. The scene
   * definition and asset URLs come from the private Blob store, never the repository; without
   * one the species shows the generic sealed vault.
   */
  scene?: { scene: SceneDef; assets: SceneAssets | null };
}
