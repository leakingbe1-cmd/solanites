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

const SPECIES = designs.species as Record<string, SpeciesDesign>;

export const STAGE_NAMES: string[] = designs.stageNames;

export function designOf(speciesId: string): SpeciesDesign | null {
  return SPECIES[speciesId] ?? null;
}

