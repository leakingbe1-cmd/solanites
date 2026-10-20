import type { RarityId } from "@/config/gameConfig";


export type Element =
  | "Verdant"
  | "Tidal"
  | "Lumen"
  | "Frost"
  | "Storm"
  | "Shadow"
  | "Crystal"
  | "Ember"
  | "Aether"
  | "Solar"
  | "Nebula"
  | "Void"
  | "Prism";

export interface Palette {
  body: string;
  bodyLight: string;
  bodyDark: string;
  belly: string;
  wing: string;
  wingEdge: string;
  accent: string;
  eye: string;
  horn: string;
}

/**
 * A Solanite species. Each id has its own body plan renderer in
 * components/creature/species — see docs/creature-design.md for the matrix.
 */
export interface Species {
  id: string;
  dex: number;
  name: string;
  epithet: string;
  rarity: RarityId;
  element: Element;
  palette: Palette;
  personality: [string, string, string];
  lore: string;
  /** Base stats at Hatchling; they grow with evolution. */
  stats: { power: number; spirit: number; agility: number };
}

export const ELEMENT_GLYPH: Record<Element, string> = {
  Verdant: "❦",
  Tidal: "≋",
  Lumen: "✧",
  Frost: "❄",
  Storm: "ϟ",
  Shadow: "◐",
  Crystal: "◇",
  Ember: "♨",
  Aether: "☍",
  Solar: "☀",
  Nebula: "✺",
  Void: "◎",
  Prism: "◈",
};

export const SPECIES: Species[] = [
  // ── COMMON ── whites, greens, blues
  {
    id: "mossling",
    dex: 1,
    name: "Mossling",
    epithet: "The Patient Sprout",
    rarity: "common",
    element: "Verdant",
    palette: {
      body: "#3fbf7f",
      bodyLight: "#a8f0c4",
      bodyDark: "#145c43",
      belly: "#d8f7d0",
      wing: "#2f9e6c",
      wingEdge: "#b6ffd8",
      accent: "#14f195",
      eye: "#e8ff6b",
      horn: "#e9dcc0",
    },
    personality: ["Patient", "Curious", "Loyal"],
    lore: "Mosslings sleep beneath the roots of validator groves, growing a little greener with every block their keeper holds.",
    stats: { power: 22, spirit: 30, agility: 26 },
  },
  {
    id: "driftfin",
    dex: 2,
    name: "Driftfin",
    epithet: "Tide-Whisperer",
    rarity: "common",
    element: "Tidal",
    palette: {
      body: "#3b9dff",
      bodyLight: "#a9dcff",
      bodyDark: "#123e7a",
      belly: "#dff3ff",
      wing: "#55c3ff",
      wingEdge: "#c9f2ff",
      accent: "#6ff7ff",
      eye: "#ffffff",
      horn: "#dbeeff",
    },
    personality: ["Calm", "Playful", "Wandering"],
    lore: "Driftfins ride the low currents between slots, humming songs only their holders can hear.",
    stats: { power: 20, spirit: 28, agility: 34 },
  },
  {
    id: "pallow",
    dex: 3,
    name: "Pallow",
    epithet: "The Pearl Herald",
    rarity: "common",
    element: "Lumen",
    palette: {
      body: "#e8ecf7",
      bodyLight: "#ffffff",
      bodyDark: "#8d97b8",
      belly: "#ffffff",
      wing: "#d6def5",
      wingEdge: "#ffffff",
      accent: "#9ad7ff",
      eye: "#5fb8ff",
      horn: "#ffffff",
    },
    personality: ["Gentle", "Proud", "Hopeful"],
    lore: "Pallows announce the dawn of every epoch. Their feathers hold a faint memory of the first light.",
    stats: { power: 18, spirit: 36, agility: 26 },
  },
  {
    id: "glimmeray",
    dex: 4,
    name: "Glimmeray",
    epithet: "Shallows Drifter",
    rarity: "common",
    element: "Tidal",
    palette: {
      body: "#5cc8e8",
      bodyLight: "#c6f4ff",
      bodyDark: "#1b5f80",
      belly: "#eafcff",
      wing: "#47b5dd",
      wingEdge: "#d8fbff",
      accent: "#8ffff0",
      eye: "#ffffff",
      horn: "#cdefff",
    },
    personality: ["Serene", "Shy", "Graceful"],
    lore: "Glimmerays glide in slow spirals, leaving trails of soft light where the network runs calm.",
    stats: { power: 16, spirit: 30, agility: 36 },
  },
  {
    id: "sproutwyrm",
    dex: 5,
    name: "Sproutwyrm",
    epithet: "Coil of the Canopy",
    rarity: "common",
    element: "Verdant",
    palette: {
      body: "#69c95a",
      bodyLight: "#c8f5a8",
      bodyDark: "#245a24",
      belly: "#f0ffd8",
      wing: "#8be07a",
      wingEdge: "#e6ffd0",
      accent: "#c7ff5e",
      eye: "#fff38a",
      horn: "#c9a676",
    },
    personality: ["Stubborn", "Warm", "Hungry"],
    lore: "A Sproutwyrm inches forward one segment per epoch, sprouting a new bud each time its keeper holds on.",
    stats: { power: 26, spirit: 24, agility: 28 },
  },
  {
    id: "frostkit",
    dex: 6,
    name: "Frostkit",
    epithet: "Little Glacier",
    rarity: "common",
    element: "Frost",
    palette: {
      body: "#d9ecff",
      bodyLight: "#ffffff",
      bodyDark: "#6f8fb8",
      belly: "#f4fbff",
      wing: "#b7d8ff",
      wingEdge: "#ffffff",
      accent: "#7fd4ff",
      eye: "#3aa0ff",
      horn: "#eaf6ff",
    },
    personality: ["Brave", "Clumsy", "Bright"],
    lore: "Frostkits breathe tiny snowstorms when excited. They are excited constantly.",
    stats: { power: 28, spirit: 22, agility: 26 },
  },

  // ── RARE ── deep blues, purples, elemental oddities
  {
    id: "abyssal-vael",
    dex: 7,
    name: "Vael",
    epithet: "Of the Abyssal Trench",
    rarity: "rare",
    element: "Tidal",
    palette: {
      body: "#1f3fbf",
      bodyLight: "#5d86ff",
      bodyDark: "#08113f",
      belly: "#6fd4ff",
      wing: "#2a5cff",
      wingEdge: "#79e8ff",
      accent: "#38f4ff",
      eye: "#9dfcff",
      horn: "#a8c2ff",
    },
    personality: ["Solemn", "Ancient", "Watchful"],
    lore: "Vael sleeps where light forgets to reach. Its veins glow with bioluminescent ledger-script.",
    stats: { power: 38, spirit: 40, agility: 34 },
  },
  {
    id: "stormquill",
    dex: 8,
    name: "Stormquill",
    epithet: "Thunder's Courier",
    rarity: "rare",
    element: "Storm",
    palette: {
      body: "#5a3bd6",
      bodyLight: "#a58bff",
      bodyDark: "#1e0f5c",
      belly: "#cbbdff",
      wing: "#6b46ff",
      wingEdge: "#7ef9ff",
      accent: "#7ef9ff",
      eye: "#e9ff7a",
      horn: "#d8ccff",
    },
    personality: ["Restless", "Fierce", "Quick"],
    lore: "Each beat of a Stormquill's wings finalises a thousand transactions. Probably.",
    stats: { power: 36, spirit: 32, agility: 46 },
  },
  {
    id: "duskwing",
    dex: 9,
    name: "Duskwing",
    epithet: "Twilight Sentinel",
    rarity: "rare",
    element: "Shadow",
    palette: {
      body: "#4a2a8c",
      bodyLight: "#8b63d9",
      bodyDark: "#170a33",
      belly: "#b89cff",
      wing: "#3a1f78",
      wingEdge: "#c78bff",
      accent: "#b46bff",
      eye: "#ff9df5",
      horn: "#1b1030",
    },
    personality: ["Guarded", "Loyal", "Mysterious"],
    lore: "Duskwings guard the boundary between one epoch and the next, unseen by all but their keeper.",
    stats: { power: 42, spirit: 36, agility: 34 },
  },
  {
    id: "cryovant",
    dex: 10,
    name: "Cryovant",
    epithet: "Shard Glider",
    rarity: "rare",
    element: "Crystal",
    palette: {
      body: "#1b4fa8",
      bodyLight: "#6fb6ff",
      bodyDark: "#0a1c4a",
      belly: "#bff3ff",
      wing: "#2463c9",
      wingEdge: "#a8fbff",
      accent: "#7affff",
      eye: "#ffffff",
      horn: "#c9f4ff",
    },
    personality: ["Precise", "Cold", "Elegant"],
    lore: "Cryovant's bell is grown from lattice ice — every facet a frozen hash, every shard tendril a broken one.",
    stats: { power: 34, spirit: 38, agility: 42 },
  },
  {
    id: "emberlisk",
    dex: 11,
    name: "Emberlisk",
    epithet: "Kiln-Hearted",
    rarity: "rare",
    element: "Ember",
    palette: {
      body: "#3a1f5c",
      bodyLight: "#7a4aa8",
      bodyDark: "#150a24",
      belly: "#ff9b5c",
      wing: "#4b2370",
      wingEdge: "#ff7a3d",
      accent: "#ff6a2b",
      eye: "#ffd36b",
      horn: "#2a1638",
    },
    personality: ["Hot-headed", "Generous", "Bold"],
    lore: "Molten seams run beneath Emberlisk's violet hide. It is warm to hold and impossible to anger twice.",
    stats: { power: 48, spirit: 30, agility: 32 },
  },

  // ── EPIC ── glowing creatures
  {
    id: "neonyx",
    dex: 12,
    name: "Neonyx",
    epithet: "The Lantern Wyrm",
    rarity: "epic",
    element: "Lumen",
    palette: {
      body: "#2a0f4a",
      bodyLight: "#6a2bb0",
      bodyDark: "#0c0418",
      belly: "#ff6bf0",
      wing: "#3b1170",
      wingEdge: "#ff5cf0",
      accent: "#ff4df5",
      eye: "#6bfff6",
      horn: "#ff9df8",
    },
    personality: ["Radiant", "Vain", "Electric"],
    lore: "Neonyx glows brighter the longer it is held — a living lantern fed by conviction.",
    stats: { power: 54, spirit: 58, agility: 50 },
  },
  {
    id: "aurorath",
    dex: 13,
    name: "Aurorath",
    epithet: "Veil of Northern Fire",
    rarity: "epic",
    element: "Aether",
    palette: {
      body: "#0b3b44",
      bodyLight: "#1fa59a",
      bodyDark: "#03151a",
      belly: "#7bfff0",
      wing: "#0d5c5e",
      wingEdge: "#d36bff",
      accent: "#14f1d9",
      eye: "#ffffff",
      horn: "#b9fff6",
    },
    personality: ["Dreamy", "Wise", "Distant"],
    lore: "Aurorath swims the upper sky trailing curtains of aurora. Where it passes, the sky remembers colour.",
    stats: { power: 46, spirit: 66, agility: 52 },
  },
  {
    id: "zephrax",
    dex: 14,
    name: "Zephrax",
    epithet: "Coil of Living Current",
    rarity: "epic",
    element: "Storm",
    palette: {
      body: "#0e1f4d",
      bodyLight: "#2f5fd6",
      bodyDark: "#050a1f",
      belly: "#5cf6ff",
      wing: "#173a8a",
      wingEdge: "#5cf6ff",
      accent: "#4dfcff",
      eye: "#fffb8a",
      horn: "#c7fbff",
    },
    personality: ["Wild", "Brilliant", "Impatient"],
    lore: "Zephrax is pure throughput given scales. It has never once stood still.",
    stats: { power: 60, spirit: 44, agility: 66 },
  },
  {
    id: "prismara",
    dex: 15,
    name: "Prismara",
    epithet: "Refractor Queen",
    rarity: "epic",
    element: "Crystal",
    palette: {
      body: "#3a1460",
      bodyLight: "#9a4dff",
      bodyDark: "#12051f",
      belly: "#ffd0ff",
      wing: "#5a1f9a",
      wingEdge: "#6bfff1",
      accent: "#ff7af6",
      eye: "#ffffff",
      horn: "#ffe1ff",
    },
    personality: ["Regal", "Dazzling", "Fickle"],
    lore: "Light entering Prismara never leaves the same colour. Neither do those who meet her.",
    stats: { power: 52, spirit: 62, agility: 54 },
  },
  {
    id: "nyxara",
    dex: 26,
    name: "Nyxara",
    epithet: "The Ribbon of Dusk",
    rarity: "epic",
    element: "Shadow",
    palette: {
      body: "#2a2350",
      bodyLight: "#5a4c9a",
      bodyDark: "#0d0a22",
      belly: "#c9bff2",
      wing: "#4b2f9e",
      wingEdge: "#b69bff",
      accent: "#a98bff",
      eye: "#ffd27a",
      horn: "#7d6ae0",
    },
    personality: ["Elusive", "Graceful", "Curious"],
    lore: "Nyxara slips through the gaps between confirmations, trailing a ribbon of dusk from its tail. Holders say it only lets itself be seen by those who stopped watching the chart.",
    stats: { power: 58, spirit: 80, agility: 90 },
  },

  // ── LEGENDARY ── golden
  {
    id: "aurelion",
    dex: 16,
    name: "Aurelion",
    epithet: "Sovereign of the Gilded Slot",
    rarity: "legendary",
    element: "Solar",
    palette: {
      body: "#e0a52a",
      bodyLight: "#fff1a8",
      bodyDark: "#6b3d06",
      belly: "#fff6d0",
      wing: "#c9821c",
      wingEdge: "#fff3a0",
      accent: "#ffe066",
      eye: "#ffffff",
      horn: "#fff7da",
    },
    personality: ["Majestic", "Just", "Unyielding"],
    lore: "They say Aurelion counted every slot since genesis, and remembers who held through each one.",
    stats: { power: 78, spirit: 72, agility: 64 },
  },
  {
    id: "solvanth",
    dex: 17,
    name: "Solvanth",
    epithet: "The Sunscale Leviathan",
    rarity: "legendary",
    element: "Solar",
    palette: {
      body: "#e8b23a",
      bodyLight: "#fff0b0",
      bodyDark: "#7a4308",
      belly: "#ffe9a6",
      wing: "#ffcb52",
      wingEdge: "#fff6c7",
      accent: "#ffd34d",
      eye: "#ff5a2b",
      horn: "#fff0c8",
    },
    personality: ["Ancient", "Benevolent", "Vast"],
    lore: "Solvanth circles the sun once per epoch. Its scales are minted from compressed daylight.",
    stats: { power: 82, spirit: 70, agility: 60 },
  },
  {
    id: "pyraurum",
    dex: 18,
    name: "Pyraurum",
    epithet: "Phoenix of the Golden Pyre",
    rarity: "legendary",
    element: "Ember",
    palette: {
      body: "#e89a2a",
      bodyLight: "#ffe08a",
      bodyDark: "#7a2a06",
      belly: "#fff1c4",
      wing: "#ff9a2a",
      wingEdge: "#fff2a0",
      accent: "#ffcf3d",
      eye: "#ffffff",
      horn: "#fff4cc",
    },
    personality: ["Undying", "Passionate", "Proud"],
    lore: "Pyraurum burns, falls, and rises again — brighter each time its keeper refuses to sell.",
    stats: { power: 76, spirit: 80, agility: 70 },
  },
  {
    id: "aurelith",
    dex: 19,
    name: "Aurelith",
    epithet: "The Gilded Tide",
    rarity: "legendary",
    element: "Solar",
    palette: {
      body: "#d79a24",
      bodyLight: "#fff0a0",
      bodyDark: "#5c3204",
      belly: "#fff8dc",
      wing: "#e6a62c",
      wingEdge: "#fffbe0",
      accent: "#ffe27a",
      eye: "#ffffff",
      horn: "#fff4cf",
    },
    personality: ["Serene", "Regal", "Generous"],
    lore: "Aurelith's shadow turns oceans to molten gold. Sailors call it a blessing; validators call it uptime.",
    stats: { power: 70, spirit: 78, agility: 74 },
  },
  {
    id: "velynx",
    dex: 25,
    name: "Velynx",
    epithet: "The Glyphwalker",
    rarity: "legendary",
    element: "Shadow",
    palette: {
      body: "#23262f",
      bodyLight: "#4a5060",
      bodyDark: "#08090d",
      belly: "#2c303b",
      wing: "#0f5a5c",
      wingEdge: "#3ef2e0",
      accent: "#2ee8d8",
      eye: "#9d7bff",
      horn: "#19b8a8",
    },
    personality: ["Confident", "Mysterious", "Mischievous"],
    lore: "Velynx walks between blocks the way a cat walks along a fence, leaving glowing glyphs where its paws have been. It always knows where it is going. It rarely tells you.",
    stats: { power: 72, spirit: 74, agility: 92 },
  },
  {
    id: "thalor",
    dex: 27,
    name: "Thalor",
    epithet: "The Deepwarden",
    rarity: "legendary",
    element: "Tidal",
    palette: {
      body: "#0f4f63",
      bodyLight: "#2c8ea3",
      bodyDark: "#04202b",
      belly: "#9fe3e6",
      wing: "#0b6f86",
      wingEdge: "#6af3ff",
      accent: "#3fe6ff",
      eye: "#f2fbff",
      horn: "#c9e8ee",
    },
    personality: ["Steadfast", "Protective", "Ancient"],
    lore: "Thalor patrols the cold trench beneath every ledger, its armoured brow turned toward anything that sinks too fast. It has never surfaced without a reason.",
    stats: { power: 90, spirit: 78, agility: 60 },
  },
];

/**
 * Mythic and Secret species are classified: their data lives on the server only
 * (src/server/classified) and never ships in a public bundle, page or API response. The
 * public site knows only that these catalogue slots exist and their tier.
 */
export type ClassifiedRarity = "mythic" | "secret";
/**
 * Each slot's owner-approved public preview (20 Oct): a partial reveal (dark form, rim light,
 * signature lights) shown in place of the seal-stone until the viewer may see the species.
 * File names carry only the tier; no name, lore or metadata goes with them.
 */
export const CLASSIFIED_SLOTS: readonly { dex: number; rarity: ClassifiedRarity; preview: string }[] = [
  { dex: 20, rarity: "mythic", preview: "/sealed/mythic-b.webp" },
  { dex: 21, rarity: "mythic", preview: "/sealed/mythic-d.webp" },
  { dex: 22, rarity: "mythic", preview: "/sealed/mythic-c.webp" },
  { dex: 28, rarity: "mythic", preview: "/sealed/mythic-a.webp" },
  { dex: 23, rarity: "secret", preview: "/sealed/secret-b.webp" },
  { dex: 24, rarity: "secret", preview: "/sealed/secret-a.webp" },
];

/** Every species in the game, classified included: the number the site advertises. */
export const CATALOGUE_SIZE = SPECIES.length + CLASSIFIED_SLOTS.length;

/**
 * Stand-in for a classified species wherever the public site would otherwise need one: a
 * classified Collection slot, the egg of a sealed tracked hatch, or a simulated (demo) hatch
 * that rolls Mythic or Secret. It is drawn as a generic sealed form, never a real design.
 */
function sealed(rarity: ClassifiedRarity, dex = 0): Species {
  return {
    id: dex ? `classified-${dex}` : `sealed-${rarity}`,
    dex,
    name: "???",
    epithet: "Classified",
    rarity,
    element: "Void",
    palette: { body: "#2a2640", bodyLight: "#4a4566", bodyDark: "#0d0b18", belly: "#3a3554", wing: "#2a2640", wingEdge: "#6b6888", accent: "#9b97c0", eye: "#c9c6e8", horn: "#4a4566" },
    personality: ["Classified", "Classified", "Classified"],
    lore: "A classified Solanite. Its true form is revealed only when a holder's own egg hatches one.",
    stats: { power: 0, spirit: 0, agility: 0 },
  };
}
export const SEALED: Record<ClassifiedRarity, Species> = { mythic: sealed("mythic"), secret: sealed("secret") };
export const isSealedId = (id: string) => /^(sealed-(mythic|secret)|classified-\d+)$/.test(id);

/**
 * The approved preview for a sealed stand-in: its own slot's for a catalogue slot, the tier's
 * first for a generic stand-in (a demo roll or a tier card). Null for anything else.
 */
export function sealedPreview(s: Pick<Species, "id" | "dex" | "rarity">): string | null {
  if (!isSealedId(s.id)) return null;
  return (CLASSIFIED_SLOTS.find((c) => c.dex === s.dex) ?? CLASSIFIED_SLOTS.find((c) => c.rarity === s.rarity))?.preview ?? null;
}

/**
 * What a client-side (simulated) roll can land on: the public species plus one sealed
 * stand-in per classified tier, so the rarity odds are exactly the production ones.
 */
export const PUBLIC_ROLL_CATALOGUE: readonly Species[] = [...SPECIES, SEALED.mythic, SEALED.secret];

/**
 * Lookup by id. Holds the public species and the sealed stand-ins; a classified species is
 * added only when the server sends it to a viewer entitled to it (registerClassified).
 */
export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(PUBLIC_ROLL_CATALOGUE.map((s) => [s.id, s]));

/** The classified species this viewer has been sent by the server, by catalogue number. */
const revealedByDex = new Map<number, Species>();

/** Adds a classified species sent by the server (Developer Mode, or the viewer's own hatch). */
export function revealSpecies(s: Species): void {
  SPECIES_BY_ID[s.id] = s;
  revealedByDex.set(s.dex, s);
}

/**
 * The full catalogue as this viewer may see it: public species, then each classified slot
 * as its revealed species or, if not revealed to them, a sealed stand-in.
 */
export function catalogueForViewer(): Species[] {
  return [...SPECIES, ...CLASSIFIED_SLOTS.map((c) => revealedByDex.get(c.dex) ?? sealed(c.rarity, c.dex))];
}

export function speciesOfRarity(r: RarityId): Species[] {
  return SPECIES.filter((s) => s.rarity === r);
}

/** Stats scale with evolution stage (0..3). */
export function statsAt(species: Species, evo: number) {
  const mult = [1, 1.35, 1.75, 2.2][Math.max(0, Math.min(3, evo))];
  return {
    power: Math.min(250, Math.round(species.stats.power * mult)),
    spirit: Math.min(250, Math.round(species.stats.spirit * mult)),
    agility: Math.min(250, Math.round(species.stats.agility * mult)),
  };
}
