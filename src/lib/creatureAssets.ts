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
  /** Shape-only version, used for a silhouette instead of darkening the real art. */
  silhouette?: string;
}

const SPECIES = (manifest as { species: Record<string, (StageAsset | null)[]> }).species;

/** Painted stages registered at runtime (none today); they win over the built-in manifest. */
const RUNTIME: Record<string, (StageAsset | null)[]> = {};

export function registerStageAssets(speciesId: string, stages: (StageAsset | null)[]): void {
  RUNTIME[speciesId] = stages;
}

export function stageAsset(speciesId: string, stage: number): StageAsset | null {
  return (RUNTIME[speciesId] ?? SPECIES[speciesId])?.[stage] ?? null;
}

/** Number of real stage assets supplied for a species (0–4). */
export function assetCount(speciesId: string): number {
  return (RUNTIME[speciesId] ?? SPECIES[speciesId] ?? []).filter(Boolean).length;
}
