import type { RarityId } from "@/config/gameConfig";
import type { Species } from "@/lib/species";

/** Mythic and Secret species stay classified until the viewer hatches one. */
export const CLASSIFIED_RARITIES: RarityId[] = ["mythic", "secret"];

export type Discovery = "owned" | "catalogued" | "classified";

export function discoveryOf(s: Species, discovered: readonly string[]): Discovery {
  if (discovered.includes(s.id)) return "owned";
  return CLASSIFIED_RARITIES.includes(s.rarity) ? "classified" : "catalogued";
}
