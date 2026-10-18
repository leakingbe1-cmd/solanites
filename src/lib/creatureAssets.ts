import manifest from "@/data/creatureAssets.json";

/**
 * Raster artwork per species and stage, produced by `npm run art:build`
 * from files in art/creatures. A null entry means no real artwork has been
 * supplied for that stage yet, and the procedural vector art is shown.
 */
export interface StageAsset {
  src: string;
  thumb: string;
  /** False when the artwork has an opaque (dark) background. */
  alpha: boolean;
  /** Shape-only version for classified species, so "???" never needs the real art. */
  silhouette?: string;
}

const SPECIES = (manifest as { species: Record<string, (StageAsset | null)[]> }).species;

export function stageAsset(speciesId: string, stage: number): StageAsset | null {
  return SPECIES[speciesId]?.[stage] ?? null;
}

/** Number of real stage assets supplied for a species (0–4). */
export function assetCount(speciesId: string): number {
  return (SPECIES[speciesId] ?? []).filter(Boolean).length;
}
