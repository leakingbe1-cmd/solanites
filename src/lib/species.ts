import type { RarityId } from "@/config/gameConfig";

/**
 * Each species has its own body plan, so rarity is carried by anatomy and
 * material rather than by recolouring a shared template.
 */
export type BodyPlan =
  | "shellback" // low armoured quadruped
  | "veilfin" // finned aerial eel
  | "cloakwing" // perched obsidian raptor, wings folded as a cloak
  | "crystalstag" // cervid with crystal growths
  | "hoodserpent" // rising hooded serpent with lantern organs
  | "skyray" // aurora-membraned ray
  | "regaldragon" // armoured heraldic dragon
  | "bladephoenix" // crane-like phoenix with a fan of blade feathers
  | "orbitalconstruct" // mask and floating platinum segments around a star core
  | "voidwhale" // leviathan whose body is a window into space
  | "prismform" // geometric entity built from slanted bars
  | "nullmoth"; // inverted many-eyed moth

export type Element = "Verdant" | "Tidal" | "Shadow" | "Crystal" | "Lumen" | "Aether" | "Solar" | "Ember" | "Nebula" | "Void" | "Prism";

export interface Palette {
  body: string;
  bodyLight: string;
  bodyDark: string;
  belly: string;
  /** Membrane / mid-tone of metal. */
  wing: string;
  wingEdge: string;
  /** Rim light and signature accent. */
  accent: string;
  eye: string;
  /** Horn, bone or bright metal. */
  horn: string;
}

export interface Species {
  id: string;
  dex: number;
  name: string;
  epithet: string;
  rarity: RarityId;
  element: Element;
  bodyPlan: BodyPlan;
  /** One line describing what makes the species anatomically distinct. */
  anatomy: string;
  palette: Palette;
  personality: [string, string, string];
  lore: string;
  /** Base stats at Hatchling; they grow with evolution. */
  stats: { power: number; spirit: number; agility: number };
}

export const SPECIES: Species[] = [
  // ── COMMON ─────────────────────────────────────────────
  {
    id: "mossling",
    dex: 1,
    name: "Mossling",
    epithet: "The Patient Shellback",
    rarity: "common",
    element: "Verdant",
    bodyPlan: "shellback",
    anatomy: "Low-slung quadruped under a domed shell of slate plates that slowly grows a living garden.",
    palette: {
      body: "#5d7a63",
      bodyLight: "#a9c4a7",
      bodyDark: "#1c2a22",
      belly: "#c9d6b8",
      wing: "#4c5a5a",
      wingEdge: "#8a9b96",
      accent: "#9fe0b4",
      eye: "#e7f59a",
      horn: "#b7b2a2",
    },
    personality: ["Patient", "Curious", "Loyal"],
    lore: "Mosslings sleep beneath validator groves. Every epoch their keeper holds, another plate of the shell turns green.",
    stats: { power: 22, spirit: 30, agility: 18 },
  },
  {
    id: "driftfin",
    dex: 2,
    name: "Driftfin",
    epithet: "Tide-Whisperer",
    rarity: "common",
    element: "Tidal",
    bodyPlan: "veilfin",
    anatomy: "Weightless eel with veil fins that drifts through air the way others swim through water.",
    palette: {
      body: "#6f8fa8",
      bodyLight: "#d5e4ef",
      bodyDark: "#1a2836",
      belly: "#e8f0f5",
      wing: "#8fb3cf",
      wingEdge: "#e9f4fb",
      accent: "#a9d8ff",
      eye: "#ffffff",
      horn: "#d7e3ec",
    },
    personality: ["Calm", "Playful", "Wandering"],
    lore: "Driftfins ride the low currents between slots, humming songs only their holders can hear.",
    stats: { power: 18, spirit: 26, agility: 34 },
  },

  // ── RARE ───────────────────────────────────────────────
  {
    id: "duskwing",
    dex: 3,
    name: "Duskwing",
    epithet: "Twilight Sentinel",
    rarity: "rare",
    element: "Shadow",
    bodyPlan: "cloakwing",
    anatomy: "Obsidian raptor that wears its own folded wings as a cloak. They open only when it is fully grown.",
    palette: {
      body: "#1b1a24",
      bodyLight: "#4a4760",
      bodyDark: "#050509",
      belly: "#2b2838",
      wing: "#16141f",
      wingEdge: "#5b5478",
      accent: "#8f7cff",
      eye: "#b9a8ff",
      horn: "#9c98b0",
    },
    personality: ["Guarded", "Loyal", "Mysterious"],
    lore: "Duskwings guard the boundary between one epoch and the next, unseen by all but their keeper.",
    stats: { power: 40, spirit: 34, agility: 38 },
  },
  {
    id: "cryovant",
    dex: 4,
    name: "Cryovant",
    epithet: "Shard Stag",
    rarity: "rare",
    element: "Crystal",
    bodyPlan: "crystalstag",
    anatomy: "Long-legged stag whose antlers and spine are living crystal lattices.",
    palette: {
      body: "#25324f",
      bodyLight: "#5f7499",
      bodyDark: "#0a0f1d",
      belly: "#7f93b5",
      wing: "#3d5d8f",
      wingEdge: "#b8dcff",
      accent: "#8fd2ff",
      eye: "#d9f1ff",
      horn: "#e4f3ff",
    },
    personality: ["Precise", "Cold", "Elegant"],
    lore: "Each facet of a Cryovant's antlers is a frozen hash. Herds of them were once mistaken for glaciers.",
    stats: { power: 34, spirit: 38, agility: 42 },
  },

  // ── EPIC ───────────────────────────────────────────────
  {
    id: "neonyx",
    dex: 5,
    name: "Neonyx",
    epithet: "The Lantern Hood",
    rarity: "epic",
    element: "Lumen",
    bodyPlan: "hoodserpent",
    anatomy: "Rising serpent with a flared hood of lantern organs that brighten as it matures.",
    palette: {
      body: "#191628",
      bodyLight: "#4a4370",
      bodyDark: "#05040b",
      belly: "#8a80b8",
      wing: "#231d3d",
      wingEdge: "#6f63a8",
      accent: "#c58bff",
      eye: "#ffd9f6",
      horn: "#cfc7ee",
    },
    personality: ["Radiant", "Vain", "Electric"],
    lore: "Neonyx glows brighter the longer it is held. It is a living lantern fed by conviction.",
    stats: { power: 54, spirit: 58, agility: 50 },
  },
  {
    id: "aurorath",
    dex: 6,
    name: "Aurorath",
    epithet: "Veil of Northern Fire",
    rarity: "epic",
    element: "Aether",
    bodyPlan: "skyray",
    anatomy: "Vast sky-ray with translucent wings that hold an aurora inside them.",
    palette: {
      body: "#121a26",
      bodyLight: "#3c5266",
      bodyDark: "#04070c",
      belly: "#8fb6c4",
      wing: "#1c2c3c",
      wingEdge: "#9ed9e6",
      accent: "#7fe6dc",
      eye: "#ffffff",
      horn: "#c7dde4",
    },
    personality: ["Dreamy", "Wise", "Distant"],
    lore: "Aurorath's wings are curtains of aurora. Where it passes, the sky remembers colour.",
    stats: { power: 46, spirit: 66, agility: 56 },
  },

  // ── LEGENDARY ──────────────────────────────────────────
  {
    id: "aurelion",
    dex: 7,
    name: "Aurelion",
    epithet: "Sovereign of the Gilded Slot",
    rarity: "legendary",
    element: "Solar",
    bodyPlan: "regaldragon",
    anatomy: "The only true dragon in the archive. Obsidian hide sealed with gilded armour and a horned crown.",
    palette: {
      body: "#1d1a17",
      bodyLight: "#544a3d",
      bodyDark: "#060504",
      belly: "#3a3128",
      wing: "#9b7432",
      wingEdge: "#5a4a36",
      accent: "#e8c47a",
      eye: "#ffe7a8",
      horn: "#f3dc9f",
    },
    personality: ["Majestic", "Just", "Unyielding"],
    lore: "They say Aurelion counted every slot since genesis, and remembers who held through each one.",
    stats: { power: 78, spirit: 72, agility: 64 },
  },
  {
    id: "pyraurum",
    dex: 8,
    name: "Pyraurum",
    epithet: "Phoenix of the Golden Pyre",
    rarity: "legendary",
    element: "Ember",
    bodyPlan: "bladephoenix",
    anatomy: "Crane-like phoenix crowned by a radiant fan of feathers forged like blades.",
    palette: {
      body: "#3a1912",
      bodyLight: "#8a4a2c",
      bodyDark: "#0e0504",
      belly: "#c98a55",
      wing: "#8f6a2c",
      wingEdge: "#d9a65a",
      accent: "#f0b867",
      eye: "#fff1c7",
      horn: "#f6e0a6",
    },
    personality: ["Undying", "Passionate", "Proud"],
    lore: "Pyraurum burns, falls, and rises again, brighter each time its keeper refuses to sell.",
    stats: { power: 72, spirit: 80, agility: 70 },
  },

  // ── MYTHIC ─────────────────────────────────────────────
  {
    id: "astravex",
    dex: 9,
    name: "Astravex",
    epithet: "The Unbound Reliquary",
    rarity: "mythic",
    element: "Nebula",
    bodyPlan: "orbitalconstruct",
    anatomy: "No continuous body: a horned platinum mask and armour plates orbiting a captive star.",
    palette: {
      body: "#b9bfd2",
      bodyLight: "#f4f6fb",
      bodyDark: "#2b2f42",
      belly: "#0d0b1e",
      wing: "#8a91aa",
      wingEdge: "#dfe3f0",
      accent: "#b3a6ff",
      eye: "#e9e4ff",
      horn: "#ffffff",
    },
    personality: ["Infinite", "Calm", "Omniscient"],
    lore: "Astravex was a dragon once. Now only its armour remains, still circling the star that was its heart.",
    stats: { power: 90, spirit: 96, agility: 82 },
  },
  {
    id: "orbelith",
    dex: 10,
    name: "Orbelith",
    epithet: "The Celestine Leviathan",
    rarity: "mythic",
    element: "Aether",
    bodyPlan: "voidwhale",
    anatomy: "Leviathan whose body is a window into deep space, framed by platinum bone.",
    palette: {
      body: "#0c0b1c",
      bodyLight: "#2d2a52",
      bodyDark: "#030209",
      belly: "#d8dcea",
      wing: "#6c74a0",
      wingEdge: "#c9cfe6",
      accent: "#8fb8ff",
      eye: "#e6efff",
      horn: "#e7eaf4",
    },
    personality: ["Eternal", "Patient", "Cosmic"],
    lore: "Orbelith swims the edge of known space. The stars you see inside it are the ones it has swallowed.",
    stats: { power: 88, spirit: 98, agility: 80 },
  },

  // ── SECRET ─────────────────────────────────────────────
  {
    id: "genesis",
    dex: 11,
    name: "GENESIS",
    epithet: "Slot Zero",
    rarity: "secret",
    element: "Prism",
    bodyPlan: "prismform",
    anatomy: "A being of pure geometry, assembled from the three slanted bars of the first block.",
    palette: {
      body: "#d9dde8",
      bodyLight: "#ffffff",
      bodyDark: "#23263a",
      belly: "#0b0b12",
      wing: "#8b93b4",
      wingEdge: "#e9ecf5",
      accent: "#7df0c8",
      eye: "#ffffff",
      horn: "#a98bff",
    },
    personality: ["Primordial", "Unknowable", "Kind"],
    lore: "Before the first block, something was already holding. GENESIS remembers. GENESIS chose you.",
    stats: { power: 99, spirit: 99, agility: 99 },
  },
  {
    id: "nullborn",
    dex: 12,
    name: "NULLBORN",
    epithet: "The Unindexed",
    rarity: "secret",
    element: "Void",
    bodyPlan: "nullmoth",
    anatomy: "Inverted moth of bleached chitin, covered in eyes that look back.",
    palette: {
      body: "#e9e8ee",
      bodyLight: "#ffffff",
      bodyDark: "#8c8a99",
      belly: "#cfcdd8",
      wing: "#f2f1f6",
      wingEdge: "#ffffff",
      accent: "#d86bb5",
      eye: "#09080d",
      horn: "#15141c",
    },
    personality: ["Glitched", "Curious", "Inverted"],
    lore: "No RPC returns its account. No explorer shows its history. And yet here it is, looking back at you.",
    stats: { power: 97, spirit: 100, agility: 98 },
  },
];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

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

/**
 * Species retired in the visual redesign, mapped to a replacement of the SAME
 * rarity so saved prototype collections keep working.
 */
export const LEGACY_SPECIES: Record<string, string> = {
  pallow: "driftfin",
  glimmeray: "driftfin",
  sproutwyrm: "mossling",
  frostkit: "mossling",
  "abyssal-vael": "cryovant",
  stormquill: "duskwing",
  emberlisk: "duskwing",
  zephrax: "neonyx",
  prismara: "aurorath",
  solvanth: "aurelion",
  aurelith: "pyraurum",
  eventide: "orbelith",
};

export function resolveSpeciesId(id: string): string {
  return SPECIES_BY_ID[id] ? id : (LEGACY_SPECIES[id] ?? id);
}
