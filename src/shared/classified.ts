import type { ClassifiedArt } from "@/components/creature/species";
import type { SpeciesDesign } from "@/lib/creatureDesigns";
import type { Species } from "@/lib/species";

/**
 * A classified (Mythic or Secret) species as the server sends it: only to the owner in
 * Developer Mode, or with a holder's own hatched egg. Never part of a public bundle.
 */
export interface ClassifiedBundle {
  species: Species;
  design: SpeciesDesign | null;
  art: ClassifiedArt;
}
