import type { Species } from "@/lib/species";

/** Every species is public; a viewer has either hatched one (owned) or not (catalogued). */
export type Discovery = "owned" | "catalogued";

export function discoveryOf(s: Species, discovered: readonly string[]): Discovery {
  return discovered.includes(s.id) ? "owned" : "catalogued";
}
