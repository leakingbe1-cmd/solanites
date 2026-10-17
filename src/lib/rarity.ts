import type { RarityId } from "@/config/gameConfig";

export interface RarityMeta {
  id: RarityId;
  label: string;
  /** Primary accent colour. */
  color: string;
  /** Secondary accent for gradients. */
  color2: string;
  glow: string;
  tagline: string;
  order: number;
}

export const RARITIES: Record<RarityId, RarityMeta> = {
  common: {
    id: "common",
    label: "Common",
    color: "#9fe8c8",
    color2: "#7cc4ff",
    glow: "rgba(140, 230, 200, 0.35)",
    tagline: "Born of morning dew and quiet validators.",
    order: 0,
  },
  rare: {
    id: "rare",
    label: "Rare",
    color: "#5b8cff",
    color2: "#a26bff",
    glow: "rgba(110, 120, 255, 0.45)",
    tagline: "Elemental anomalies drawn from deep currents.",
    order: 1,
  },
  epic: {
    id: "epic",
    label: "Epic",
    color: "#d64bff",
    color2: "#14f1d9",
    glow: "rgba(214, 75, 255, 0.5)",
    tagline: "Living light. They glow from the inside out.",
    order: 2,
  },
  legendary: {
    id: "legendary",
    label: "Legendary",
    color: "#ffc94a",
    color2: "#ff8a3d",
    glow: "rgba(255, 196, 74, 0.55)",
    tagline: "Gilded titans whispered about in every block.",
    order: 3,
  },
  mythic: {
    id: "mythic",
    label: "Mythic",
    color: "#e6ecff",
    color2: "#8f7bff",
    glow: "rgba(200, 210, 255, 0.55)",
    tagline: "Platinum. Cosmic. Older than the genesis slot.",
    order: 4,
  },
  secret: {
    id: "secret",
    label: "Secret",
    color: "#14f195",
    color2: "#ff3df2",
    glow: "rgba(20, 241, 149, 0.55)",
    tagline: "Not in any registry. Not supposed to exist.",
    order: 5,
  },
};

export const RARITY_ORDER: RarityId[] = ["common", "rare", "epic", "legendary", "mythic", "secret"];
