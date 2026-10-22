import { gameConfig } from "@/config/gameConfig";
import { rollSpecies } from "@/lib/progression";
import { SPECIES_BY_ID, type Species } from "@/lib/species";

/**
 * The homepage live demo: one simulated egg, rolled in the browser with the same odds as real eggs
 * (gameConfig.rarityWeights), decided before the tap so the hatch alone reveals it. Never recorded
 * anywhere and never a real egg: real eggs come only from the server.
 */
export function rollDemo(seed: number): Species {
  return SPECIES_BY_ID[rollSpecies(seed, gameConfig)];
}

/** A fresh seed for this visit. */
export const demoSeed = () => (Math.random() * 2 ** 31) >>> 0;
