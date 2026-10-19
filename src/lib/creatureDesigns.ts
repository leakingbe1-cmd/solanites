import designs from "@/data/creatureDesigns.json";

/** Per-species design bible (docs/creature-art). Stage text is shown in the detail view. */
export interface SpeciesDesign {
  silhouette: string;
  anatomy: string;
  face: string;
  posture: string;
  materials: string;
  effects: string;
  stages: { summary: string; brief: string }[];
  reference: string | null;
}

/** Public species only; a classified species' design arrives from the server (revealDesign). */
const SPECIES = designs.species as Record<string, SpeciesDesign>;

export const STAGE_NAMES: string[] = designs.stageNames;

export function designOf(speciesId: string): SpeciesDesign | null {
  return SPECIES[speciesId] ?? null;
}

/** Adds the design of a classified species the server sent to a viewer entitled to it. */
export function revealDesign(speciesId: string, design: SpeciesDesign): void {
  SPECIES[speciesId] = design;
}
