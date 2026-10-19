import { mulberry32 } from "@/lib/rng";
import { SEALED, SPECIES, type Species } from "@/lib/species";
import { RARITIES } from "@/lib/rarity";

/** SIMULATED leaderboard entries for the prototype. Deterministic so SSR and client agree. */
export interface LeaderEntry {
  wallet: string;
  species: Species;
  nickname: string | null;
  evoStage: number;
  heldDays: number;
  growthDays: number;
  collectionSize: number;
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const NICKS = ["Vesper", "Kael", "Oryn", "Solace", "Nyx", "Ember", "Halcyon", "Quill", "Zephyr", "Lumen", null, null, null, null];

function weightedSpecies(rand: () => number): Species {
  // Skew toward rarer creatures — the board shows the best of the best.
  const x = rand();
  const tier = x < 0.02 ? "secret" : x < 0.1 ? "mythic" : x < 0.3 ? "legendary" : x < 0.55 ? "epic" : x < 0.8 ? "rare" : "common";
  // Classified tiers stay sealed on the public board; one draw is still taken so the board is unchanged otherwise.
  const pool = tier === "mythic" || tier === "secret" ? [SEALED[tier]] : SPECIES.filter((s) => s.rarity === tier);
  return pool[Math.floor(rand() * pool.length)];
}

export function mockLeaderboard(n = 40): LeaderEntry[] {
  const rand = mulberry32(42);
  return Array.from({ length: n }, () => {
    const wallet = Array.from({ length: 44 }, () => B58[Math.floor(rand() * B58.length)]).join("");
    const growthDays = Math.floor(rand() ** 1.6 * 200);
    const evoStage = growthDays >= 120 ? 3 : growthDays >= 45 ? 2 : growthDays >= 14 ? 1 : 0;
    return {
      wallet,
      species: weightedSpecies(rand),
      nickname: NICKS[Math.floor(rand() * NICKS.length)],
      evoStage,
      growthDays,
      heldDays: growthDays + 7 + Math.floor(rand() * 60),
      collectionSize: 1 + Math.floor(rand() * 6),
    };
  });
}

export const rarityScore = (e: LeaderEntry) => RARITIES[e.species.rarity].order * 1000 + e.evoStage * 100 + e.growthDays / 10;
