import type { RarityId } from "@/config/gameConfig";

export interface RarityMeta {
  id: RarityId;
  label: string;
  /** Tier accent — used sparingly: a dot, a hairline, a label. */
  color: string;
  /** Secondary tone for gradients. */
  color2: string;
  glow: string;
  tagline: string;
  order: number;
}

export const RARITIES: Record<RarityId, RarityMeta> = {
  common: {
    id: "common",
    label: "Common",
    color: "#aab8ae",
    color2: "#7f8c86",
    glow: "rgba(170, 184, 174, 0.18)",
    tagline: "Quiet creatures of stone, moss and shallow water.",
    order: 0,
  },
  rare: {
    id: "rare",
    label: "Rare",
    color: "#86a3ff",
    color2: "#5b6fd6",
    glow: "rgba(120, 150, 255, 0.22)",
    tagline: "Unusual anatomy: obsidian cloaks and living crystal.",
    order: 1,
  },
  epic: {
    id: "epic",
    label: "Epic",
    color: "#b79bff",
    color2: "#7f6ae0",
    glow: "rgba(170, 140, 255, 0.26)",
    tagline: "Creatures that make their own light.",
    order: 2,
  },
  legendary: {
    id: "legendary",
    label: "Legendary",
    color: "#e2c27e",
    color2: "#a8843f",
    glow: "rgba(226, 194, 126, 0.24)",
    tagline: "Gilded and armoured. Recognised on sight.",
    order: 3,
  },
  mythic: {
    id: "mythic",
    label: "Mythic",
    color: "#e4e7f3",
    color2: "#9aa0c0",
    glow: "rgba(220, 225, 245, 0.24)",
    tagline: "Bodies that are not entirely bodies.",
    order: 4,
  },
  secret: {
    id: "secret",
    label: "Secret",
    color: "#86ecca",
    color2: "#a98bff",
    glow: "rgba(134, 236, 202, 0.22)",
    tagline: "Not in any registry. Not supposed to exist.",
    order: 5,
  },
};

export const RARITY_ORDER: RarityId[] = ["common", "rare", "epic", "legendary", "mythic", "secret"];
