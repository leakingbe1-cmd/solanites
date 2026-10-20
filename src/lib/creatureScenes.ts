import manifest from "@/data/creatureScenes.json";
import type { Palette } from "@/lib/species";

/**
 * Creature scenes: the painted biome behind each species and the way it idles.
 *
 * A species with no scene of its own yet (the Mythic and Secret species, until their biomes
 * are painted) uses one neutral scene.
 *
 * One painted plate per species carries the biome through all four stages; each stage
 * frames it differently (STAGE_FRAMING) so the Eggling sees a close, hazy corner of its
 * world and the Ascended sees all of it. See docs/creature-scenes.md.
 */

export type Particle = "spores" | "leaves" | "bubbles" | "snow" | "ice" | "embers" | "ash" | "motes" | "plankton" | "glyphs" | "petals" | "none";

export interface Biome {
  /** Stable biome id (also the asset folder under public/scenes). */
  id: string;
  name: string;
  /** One line: why this place belongs to this species. */
  summary: string;
  /** Fallback gradient while the plate loads or if it is missing: [top-left light, mid, deep]. */
  tones: [string, string, string];
  /** Environmental movement, shown only at the larger sizes and never under reduced motion. */
  particle: Particle;
  /** Where the stage framing zooms toward, in % of the plate (the open space behind the creature). */
  focus?: [number, number];
  /**
   * Readability tuning for the whole plate, never a shape behind the creature (canon W2):
   * `lift` raises its exposure at every stage (a dark creature on a dark world), `calm`
   * scales its saturation (a creature whose hue the world shares). Checked by scene-readability.py.
   */
  lift?: number;
  calm?: number;
  /**
   * Canon C6/W1: height (0–1) of a fade from the bottom of the plate into its own deep tone,
   * where the painting shows anything that could read as ground, a perch or a horizon.
   */
  floor?: number;
  /** Extra depth-of-field blur (px at 1024) where the plate's texture competes with the creature. */
  soften?: number;
}

/** What a body can actually do. A motion is only allowed if the anatomy has the part (scenes.test.ts). */
export interface Anatomy {
  locomotion: "walks" | "crawls" | "swims" | "glides" | "drifts" | "hovers" | "flies" | "coils" | "stands";
  wings?: boolean;
  tail?: boolean;
  fins?: boolean;
  tendrils?: boolean;
  ears?: boolean;
  antlers?: boolean;
  lure?: boolean;
  /** Anatomical light (glyphs, seams, lure, core) that may pulse; never added light. */
  emissive?: boolean;
}

/**
 * Whole-body idle motions. Each moves the creature as one rigid or breathing body, so it is
 * only used where the anatomy allows it (a fish may pitch as it swims; a tortoise only breathes).
 */
export type BodyMotion =
  | "rock" // tiny rocking about the base (small Egglings)
  | "breathe" // grounded: chest rises from the feet, nothing leaves the ground
  | "stalk" // tall standing bodies: breath plus a slow weight shift over the feet
  | "hover" // floats or flies: slow rise and settle
  | "swim" // swims: slow figure-eight drift with a slight pitch
  | "glide" // broad gliders: a slow bank and rise
  | "pulse" // jellyfish: bell contracts, rises, settles
  | "coil"; // coiled serpents: breath plus a slow turn about the coil

/**
 * A part that moves on its own: cut from the creature's own artwork by a polygon (in % of the
 * 1024² canvas) and turned about a hinge on the body, or skewed from its attachment line. The
 * cut runs through the hinge, so the join never opens (scripts/qa/scene-parts.py checks this).
 */
export interface PartRig {
  part: "tail" | "wing" | "fin" | "tendrils" | "ears" | "antlers" | "canopy" | "lure" | "ribbon" | "crest";
  /** Polygon [x, y, …] in % of the canvas. */
  poly: number[];
  /** Hinge point in % (rotation centre, or the attachment line's y for skew). */
  hinge: [number, number];
  /**
   * sway / flick turn about the hinge point. The others keep a whole attachment line still:
   * skew shears from a horizontal one (y = hinge y), bend from a vertical one (x = hinge x),
   * and fold eases a frontal wing toward its vertical attachment line (x = hinge x).
   */
  motion: "sway" | "skew" | "bend" | "flick" | "fold";
  /** Peak angle in degrees (fold: peak compression in %). Negative mirrors the motion. */
  deg: number;
  /** Period in seconds. */
  period: number;
}

export interface StageIdle {
  body: BodyMotion;
  /** Peak displacement in % of the creature box (rise, drift or breath depth). */
  amp: number;
  /** Primary period in seconds; a second, slower period is derived so the motion never loops exactly. */
  period: number;
  parts?: PartRig[];
  /** Anatomical light pulses gently (needs a glow map: public/scenes/<id>/glow-<stage>.webp). */
  glow?: boolean;
}

export interface IdleProfile {
  /** One line for the docs and the detail view. */
  summary: string;
  /** Palette colours that mark the species' own emissive anatomy, for its glow maps (default accent). */
  glowFrom?: (keyof Palette)[];
  /** Brightness (0–1) from which a pixel in a glow colour counts as lit (default 0.5); raise it where lit surfaces share the colour. */
  glowLevel?: number;
  stages: [StageIdle, StageIdle, StageIdle, StageIdle];
}

export interface SceneDef {
  biome: Biome;
  anatomy: Anatomy;
  idle: IdleProfile;
}

/**
 * How the plate is framed at each stage (0 Eggling … 3 Ascended): zoom toward the biome's
 * focus, exposure, saturation, depth-of-field blur (px at 1024; scaled to the box), the edge
 * vignette, the strength of the world's own light wash, and whether that light and the
 * particles stir. Blur stays far below the 40 px the canon QA treats as a glow blob.
 */
export const STAGE_FRAMING = [
  { zoom: 1.34, light: 0.62, sat: 0.78, blur: 5, vignette: 0.62, air: 0.35, stir: false },
  { zoom: 1.2, light: 0.74, sat: 0.86, blur: 3, vignette: 0.55, air: 0.55, stir: false },
  { zoom: 1.08, light: 0.86, sat: 0.94, blur: 1.5, vignette: 0.46, air: 0.75, stir: true },
  { zoom: 1, light: 1, sat: 1, blur: 0, vignette: 0.38, air: 0.95, stir: true },
] as const;

const S = (body: BodyMotion, amp: number, period: number, extra: Partial<StageIdle> = {}): StageIdle => ({ body, amp, period, ...extra });

/** Public catalogue: one entry per public species id (scenes.test.ts keeps this exhaustive). */
export const SCENES: Record<string, SceneDef> = {
  mossling: {
    biome: { id: "root-hollow", name: "Validator Root Hollow", summary: "A mossy hollow under the roots of an ancient validator grove, where Mosslings sleep and grow.", tones: ["#5f7a3a", "#1d3a2a", "#08140f"], particle: "spores" },
    anatomy: { locomotion: "walks", tail: true, antlers: true },
    idle: {
      summary: "Slow, patient breathing from its feet; its leafy tail flicks now and then, and the Ascended sanctuary-tree on its back stirs in the hollow's air.",
      stages: [
        S("rock", 1.1, 5.6),
        S("breathe", 1.3, 5.2),
        S("breathe", 1.1, 6, { parts: [{ part: "tail", poly: [82.2, 53, 93, 53, 93, 66, 82.2, 66], hinge: [82.2, 60], motion: "bend", deg: 4, period: 7.4 }] }),
        S("breathe", 0.9, 7.2, {
          parts: [
            { part: "canopy", poly: [50, 8, 84, 8, 84, 40, 63, 44, 57.5, 44, 50, 40], hinge: [58.8, 43.5], motion: "sway", deg: 1.2, period: 8.6 },
            { part: "tail", poly: [85.6, 57, 97, 57, 97, 76, 85.6, 76], hinge: [85.6, 67], motion: "bend", deg: 3.5, period: 9.2 },
          ],
        }),
      ],
    },
  },
  driftfin: {
    biome: { id: "low-current", name: "Low Current Channel", summary: "The quiet blue-green current between slots, threaded with kelp ribbons, where Driftfins hum as they ride.", tones: ["#3f8fa8", "#123f5c", "#041624"], particle: "bubbles" },
    anatomy: { locomotion: "swims", tail: true, fins: true, emissive: true },
    idle: {
      summary: "Rides the current in a slow figure-eight, nose pitching gently with each wave.",
      // only the lateral-line dots: its pale fins share the accent hue but are not lit
      glowFrom: ["accent"],
      glowLevel: 0.95,
      stages: [
        S("swim", 1.4, 7),
        S("swim", 1.6, 8, { parts: [{ part: "tail", poly: [71.5, 40, 83, 40, 83, 60, 71.5, 60], hinge: [71.5, 50], motion: "bend", deg: 5, period: 3.6 }] }),
        S("swim", 1.5, 9.5, { glow: true, parts: [{ part: "tail", poly: [85, 46, 97, 46, 97, 72, 85, 72], hinge: [85, 60], motion: "bend", deg: 5, period: 4.2 }] }),
        S("swim", 1.2, 11.5, { glow: true, parts: [{ part: "tail", poly: [82, 54, 99.5, 54, 99.5, 88, 82, 88], hinge: [82, 73], motion: "bend", deg: 3.5, period: 5 }] }),
      ],
    },
  },
  pallow: {
    biome: { id: "dawn-cloudsea", name: "Dawnspire Cloudsea", summary: "A pearl-white sea of cloud at first light around a distant herald's spire, where each epoch's dawn is announced.", tones: ["#e9d2b4", "#7d7aa6", "#22203c"], particle: "petals" },
    // feathers open into wing-like fans at Ascended
    anatomy: { locomotion: "hovers", wings: true, tendrils: true, emissive: true },
    idle: {
      summary: "Hovers upright and drifts like a seed on warm air; its tassels trail behind the slow rise and settle.",
      stages: [
        S("hover", 1.2, 6.4),
        S("hover", 1.5, 7, { parts: [{ part: "tendrils", poly: [39, 65.5, 61, 65.5, 61, 84, 39, 84], hinge: [50, 65.5], motion: "skew", deg: 2, period: 5.2 }] }),
        S("hover", 1.6, 8),
        S("hover", 1.3, 9.6, {
          parts: [
            { part: "wing", poly: [2, 22, 37.5, 22, 37.5, 52, 30, 58, 2, 58], hinge: [37.5, 40], motion: "fold", deg: 3, period: 7.2 },
            { part: "wing", poly: [64.5, 22, 98, 22, 98, 58, 70, 58, 64.5, 52], hinge: [64.5, 40], motion: "fold", deg: 3, period: 7.2 },
            { part: "tendrils", poly: [36, 60, 66, 60, 66, 92, 36, 92], hinge: [51, 60], motion: "skew", deg: 1.6, period: 6.4 },
          ],
        }),
      ],
    },
  },
  glimmeray: {
    biome: { id: "sunlit-shallows", name: "Sunlit Shallows", summary: "A calm turquoise lagoon where sunlight nets the water and sea-grass leans with the swell.", tones: ["#7fd0c6", "#1f6f86", "#062a3a"], particle: "plankton" },
    // a manta's broad pectoral fins are its wings (design bible: "broad triangular wings")
    anatomy: { locomotion: "glides", wings: true, tail: true, fins: true },
    idle: {
      summary: "Glides in a slow bank, wings tilting as it rides the swell, never flapping.",
      stages: [
        S("glide", 1.2, 8),
        S("glide", 1.4, 9, { parts: [{ part: "tail", poly: [48, 57.5, 66, 57.5, 66, 80, 48, 80], hinge: [53, 57.5], motion: "skew", deg: 3, period: 5 }] }),
        S("glide", 1.5, 10.5, {
          parts: [
            { part: "tail", poly: [44, 58.5, 58, 58.5, 58, 85, 44, 85], hinge: [50, 58.5], motion: "skew", deg: 3, period: 5.6 },
            { part: "wing", poly: [5, 28, 28, 28, 28, 58, 5, 58], hinge: [28, 46], motion: "bend", deg: 2.2, period: 7 },
            { part: "wing", poly: [72, 28, 96, 28, 96, 58, 72, 58], hinge: [72, 46], motion: "bend", deg: -2.2, period: 7 },
          ],
        }),
        S("glide", 1.2, 12.5, { parts: [{ part: "tail", poly: [10, 58, 99, 58, 99, 92, 10, 92], hinge: [52, 58], motion: "skew", deg: 2, period: 6.8 }] }),
      ],
    },
  },
  sproutwyrm: {
    biome: { id: "canopy-bough", name: "Canopy Bough", summary: "High in the canopy among moss-wrapped boughs and layered leaves, lit through gaps in the crown.", tones: ["#a7b65a", "#2f5a2a", "#0b1a0c"], particle: "leaves", floor: 0.55 },
    anatomy: { locomotion: "crawls", antlers: true },
    idle: {
      summary: "Inches in place: segments swell and settle in a slow breath along the arch.",
      stages: [S("rock", 1, 5), S("breathe", 1.4, 4.8), S("breathe", 1.3, 5.6), S("breathe", 1, 6.8)],
    },
  },
  frostkit: {
    biome: { id: "glacier-hollow", name: "Glacier Hollow", summary: "A blue-white crevasse in the glacier where snow drifts down through pale morning light.", tones: ["#d6e6f2", "#4f7aa3", "#0d1d33"], particle: "snow" },
    anatomy: { locomotion: "walks", tail: true, ears: true },
    idle: {
      summary: "Alert and quick-breathing, with small weight shifts as if about to pounce; snow drifts past.",
      stages: [
        S("rock", 1.2, 4.4),
        S("breathe", 1.5, 3.8, { parts: [{ part: "tail", poly: [69.5, 30, 84, 30, 84, 57, 69.5, 57], hinge: [69.5, 50], motion: "bend", deg: 4, period: 3.4 }] }),
        S("breathe", 1.3, 4.6, { parts: [{ part: "tail", poly: [76, 30, 92, 30, 92, 62, 76, 62], hinge: [76, 52], motion: "bend", deg: 3.5, period: 4 }] }),
        S("stalk", 1, 6, { parts: [{ part: "tail", poly: [84.5, 36, 99, 36, 99, 66, 84.5, 66], hinge: [84.5, 52], motion: "bend", deg: 3, period: 5 }] }),
      ],
    },
  },
  "abyssal-vael": {
    biome: { id: "script-trench", name: "Abyssal Script Trench", summary: "The black trench where light forgets to reach, its walls veined with faint glowing ledger-script.", tones: ["#2a4f8a", "#0b1a40", "#02050f"], particle: "plankton" },
    anatomy: { locomotion: "coils", tail: true, fins: true, emissive: true },
    idle: {
      summary: "Rises and sinks on its coils with solemn slowness; marine snow falls through the dark.",
      // the cyan ledger-script veins only (its long neck highlight shares the hue but is paint)
      glowFrom: ["accent"],
      glowLevel: 0.96,
      stages: [
        S("coil", 1, 6),
        S("coil", 1.2, 6.6, { parts: [{ part: "tail", poly: [71, 48, 82, 48, 82, 72, 71, 72], hinge: [71, 60], motion: "bend", deg: 4, period: 4.8 }] }),
        // the neck rises from the coil: it leans from the coil's top line, which stays still
        S("coil", 1.1, 7.6, { glow: true, parts: [{ part: "crest", poly: [0, 0, 100, 0, 100, 60, 0, 60], hinge: [50, 60], motion: "skew", deg: 1, period: 9 }] }),
        S("coil", 0.9, 9, { glow: true, parts: [{ part: "crest", poly: [0, 0, 100, 0, 100, 68, 0, 68], hinge: [50, 68], motion: "skew", deg: 0.8, period: 11 }] }),
      ],
    },
  },
  stormquill: {
    biome: { id: "thunderhead-eyrie", name: "Thunderhead Eyrie", summary: "Storm-swept crags among violet thunderheads, lit from inside the cloud by distant charge.", tones: ["#8a86c8", "#2c2766", "#0a0820"], particle: "motes", soften: 2 },
    anatomy: { locomotion: "stands", wings: true, tail: true },
    idle: {
      summary: "Restless: quick breaths and a slow weight shift on its stilt legs, as if bracing into wind.",
      stages: [
        S("rock", 1.2, 4.2),
        S("stalk", 1.3, 4.4),
        S("stalk", 1.2, 5.2, { parts: [{ part: "tail", poly: [3, 52, 30, 52, 30, 82, 3, 82], hinge: [30, 65], motion: "bend", deg: 3, period: 3.8 }] }),
        S("stalk", 1, 6.4, { parts: [{ part: "tail", poly: [2, 60.5, 28.5, 60.5, 28.5, 90, 2, 90], hinge: [28.5, 70.5], motion: "bend", deg: 2.5, period: 4.6 }] }),
      ],
    },
  },
  duskwing: {
    biome: { id: "twilight-ruins", name: "Twilight Boundary Ruins", summary: "Moonlit overgrown arches on the boundary between one epoch and the next, steeped in violet mist.", tones: ["#8a78b8", "#2e2152", "#0b0718"], particle: "motes", calm: 0.85, floor: 0.55, soften: 1.5 },
    anatomy: { locomotion: "hovers", wings: true, ears: true, emissive: true },
    idle: {
      summary: "Hovers in place on a slow rise and settle, watching the dark.",
      // the eye-spots on its wings glow faintly in the dark
      glowFrom: ["eye"],
      glowLevel: 0.88,
      stages: [
        S("rock", 1, 5.2),
        S("hover", 1.4, 6, {
          parts: [
            { part: "wing", poly: [0, 28, 38, 28, 44, 38.5, 44, 80, 0, 80], hinge: [44, 50], motion: "fold", deg: 3, period: 5.2 },
            { part: "wing", poly: [56, 38.5, 62, 28, 100, 28, 100, 80, 56, 80], hinge: [56, 50], motion: "fold", deg: 3, period: 5.2 },
          ],
        }),
        S("hover", 1.6, 7, {
          glow: true,
          parts: [
            { part: "wing", poly: [0, 25, 37, 25, 46, 39, 46, 90, 0, 90], hinge: [46, 52], motion: "fold", deg: 2.5, period: 6.2 },
            { part: "wing", poly: [54, 39, 63, 25, 100, 25, 100, 90, 54, 90], hinge: [54, 52], motion: "fold", deg: 2.5, period: 6.2 },
          ],
        }),
        S("hover", 1.3, 8.4, { glow: true }),
      ],
    },
  },
  cryovant: {
    biome: { id: "lattice-grotto", name: "Lattice Ice Grotto", summary: "A drowned cavern of faceted ice where cold water refracts the light into slow caustics.", tones: ["#9fd4ec", "#1f4f8c", "#04122b"], particle: "ice" },
    anatomy: { locomotion: "drifts", tendrils: true, emissive: true },
    idle: {
      summary: "Pulses like a jellyfish: the bell contracts, lifts, and settles while its shard tendrils trail.",
      // canon C5: a Rare's eyes do not emit, so only the core, brow lines and tendril beads pulse
      glowFrom: ["accent"],
      glowLevel: 0.9,
      stages: [
        S("pulse", 1.4, 5.6),
        S("pulse", 1.8, 6, { glow: true, parts: [{ part: "tendrils", poly: [0, 55, 100, 55, 100, 100, 0, 100], hinge: [50, 55], motion: "skew", deg: 1.6, period: 6 }] }),
        S("pulse", 1.8, 6.8, { glow: true, parts: [{ part: "tendrils", poly: [0, 47, 100, 47, 100, 100, 0, 100], hinge: [50, 47], motion: "skew", deg: 1.5, period: 6.8 }] }),
        S("pulse", 1.5, 8, { glow: true, parts: [{ part: "tendrils", poly: [0, 53, 100, 53, 100, 100, 0, 100], hinge: [50, 53], motion: "skew", deg: 1.3, period: 8 }] }),
      ],
    },
  },
  emberlisk: {
    biome: { id: "kiln-caldera", name: "Kiln Caldera", summary: "An obsidian chamber in the volcano's heart, its cracks holding restrained molten light.", tones: ["#b8643a", "#3a1830", "#0d050c"], particle: "embers", lift: 0.08, soften: 1.5 },
    anatomy: { locomotion: "crawls", tail: true, emissive: true },
    idle: {
      summary: "Low, heavy breathing like a kiln's draw; embers lift from the caldera.",
      glowFrom: ["accent"],
      glowLevel: 0.85,
      stages: [
        S("rock", 1, 5),
        S("breathe", 1.3, 4.6, { parts: [{ part: "tail", poly: [66, 34, 82, 34, 82, 57.5, 66, 57.5], hinge: [66, 54], motion: "bend", deg: 3, period: 5.6 }] }),
        S("breathe", 1.2, 5.4, { glow: true, parts: [{ part: "tail", poly: [82, 30, 97, 30, 97, 60, 82, 60], hinge: [82, 48.8], motion: "bend", deg: 3, period: 6.2 }] }),
        S("breathe", 1, 6.6, { glow: true, parts: [{ part: "tail", poly: [80, 36, 99, 36, 99, 70, 80, 70], hinge: [80, 63.8], motion: "bend", deg: 2.5, period: 7.4 }] }),
      ],
    },
  },
  neonyx: {
    biome: { id: "lantern-gardens", name: "Lantern Abyss Gardens", summary: "A midnight sea floor garden of magenta and cyan anemones that answer its lure.", tones: ["#a04ab0", "#2a0f4a", "#07020f"], particle: "plankton" },
    anatomy: { locomotion: "swims", tail: true, fins: true, lure: true, emissive: true },
    idle: {
      summary: "Hangs in the dark with a slow swim-drift, lure swinging just ahead of its jaws.",
      glowFrom: ["accent", "eye"],
      glowLevel: 0.8,
      stages: [
        S("swim", 1.2, 6.6, { glow: true }),
        S("swim", 1.4, 7.4, {
          glow: true,
          parts: [
            { part: "lure", poly: [61, 24, 84, 24, 84, 43.5, 70, 43.5, 66, 41.5, 64.5, 41, 61.5, 40], hinge: [63, 40.6], motion: "sway", deg: 4, period: 3.4 },
            { part: "fin", poly: [12, 45, 29, 45, 29, 72, 12, 72], hinge: [29, 59.7], motion: "bend", deg: 5, period: 3.8 },
          ],
        }),
        S("swim", 1.3, 8.6, {
          glow: true,
          parts: [
            { part: "lure", poly: [64.5, 14, 92, 14, 92, 38.5, 77.5, 38.5, 74, 36.4, 69, 36.6, 66, 36.2, 64.5, 30], hinge: [67.2, 36.5], motion: "sway", deg: 3, period: 4 },
            { part: "fin", poly: [0, 50, 21, 50, 21, 88, 0, 88], hinge: [21, 67.5], motion: "bend", deg: 3.5, period: 4.4 },
          ],
        }),
        S("swim", 1.1, 10.2, {
          glow: true,
          parts: [{ part: "lure", poly: [66, 2, 98, 2, 98, 37, 84, 37, 82, 30, 76.5, 27.5, 71.5, 24.5, 68.5, 24.5, 66, 20], hinge: [70, 25], motion: "sway", deg: 2.4, period: 5 }],
        }),
      ],
    },
  },
  aurorath: {
    biome: { id: "aurora-sky", name: "Polar Aurora Sky", summary: "The upper polar sky above a sea of cloud, hung with teal and violet aurora.", tones: ["#4fd0b8", "#15354a", "#040b16"], particle: "none", lift: -0.12, calm: 0.75, soften: 2 },
    anatomy: { locomotion: "glides", tail: true, fins: true, tendrils: true, emissive: true },
    idle: {
      summary: "Glides with immense slowness, banking gently; its aurora curtains trail behind.",
      stages: [
        S("glide", 1.1, 9),
        S("glide", 1.3, 10, { parts: [{ part: "tendrils", poly: [25, 55.5, 65, 55.5, 65, 80, 25, 80], hinge: [45, 55.5], motion: "skew", deg: 2.4, period: 7 }] }),
        S("glide", 1.2, 12, {
          parts: [
            { part: "tendrils", poly: [15, 57.5, 80, 57.5, 80, 84, 15, 84], hinge: [47, 57.5], motion: "skew", deg: 2, period: 8.4 },
            { part: "tail", poly: [83, 22, 99, 22, 99, 52, 83, 52], hinge: [83, 38], motion: "bend", deg: 3, period: 6 },
          ],
        }),
        S("glide", 1, 14),
      ],
    },
  },
  zephrax: {
    biome: { id: "jetstream-isles", name: "Jetstream Cloud Isles", summary: "Towering cloud and floating rock islets in the jetstream, charged faintly from within.", tones: ["#6f9ad8", "#173a7a", "#040b24"], particle: "motes" },
    anatomy: { locomotion: "coils", tail: true, emissive: true },
    idle: {
      summary: "Never still: rides its cloud on a restless rise and settle with a slow turn of the coil.",
      // its body runs into the painted cloud, so it moves whole; its electric runes pulse
      glowFrom: ["accent"],
      glowLevel: 0.85,
      stages: [S("hover", 1.4, 5, { glow: true }), S("coil", 1.4, 5.4, { glow: true }), S("coil", 1.4, 6, { glow: true }), S("coil", 1.2, 7.2, { glow: true })],
    },
  },
  prismara: {
    biome: { id: "prism-throne", name: "Prism Throne Garden", summary: "A crystalline court of tall prisms that split the light into soft colour on violet stone.", tones: ["#c9a8e8", "#4a2a7a", "#120624"], particle: "motes", lift: -0.1, calm: 0.72, soften: 2 },
    anatomy: { locomotion: "stands", wings: true, tail: true },
    idle: {
      summary: "Holds a regal display: slow breath and a deliberate weight shift beneath its fan.",
      stages: [
        S("rock", 1, 5),
        S("stalk", 1.2, 5.2),
        // the shard fan breathes open and closed behind the body
        S("stalk", 1, 6.2, {
          parts: [
            { part: "wing", poly: [10, 25, 40, 25, 40, 85, 10, 85], hinge: [40, 55], motion: "fold", deg: 2.5, period: 7.2 },
            { part: "wing", poly: [60, 25, 92, 25, 92, 85, 60, 85], hinge: [60, 55], motion: "fold", deg: 2.5, period: 7.2 },
          ],
        }),
        S("stalk", 0.8, 7.6, {
          parts: [
            { part: "wing", poly: [5, 15, 38, 15, 38, 80, 5, 80], hinge: [38, 50], motion: "fold", deg: 2, period: 8.6 },
            { part: "wing", poly: [62, 15, 95, 15, 95, 80, 62, 80], hinge: [62, 50], motion: "fold", deg: 2, period: 8.6 },
          ],
        }),
      ],
    },
  },
  aurelion: {
    biome: { id: "gilded-sanctum", name: "Gilded Slot Sanctum", summary: "A golden temple hall of engraved columns where every slot since genesis is remembered.", tones: ["#e7b862", "#5a3814", "#140a04"], particle: "motes", floor: 0.42 },
    anatomy: { locomotion: "stands", wings: true, tail: true },
    idle: {
      summary: "Majestic, measured breathing; it rarely moves, and when it does it is deliberate.",
      stages: [
        S("rock", 1, 5.4),
        S("breathe", 1.3, 5),
        S("breathe", 1.1, 6, {
          parts: [
            { part: "wing", poly: [2, 18, 20, 18, 38, 40, 38, 62, 2, 62], hinge: [38, 48], motion: "fold", deg: 2.5, period: 7.6 },
            { part: "wing", poly: [62, 40, 80, 18, 98, 18, 98, 62, 62, 62], hinge: [62, 48], motion: "fold", deg: 2.5, period: 7.6 },
          ],
        }),
        S("breathe", 0.9, 7.6),
      ],
    },
  },
  solvanth: {
    biome: { id: "corona-sanctuary", name: "Corona Sanctuary", summary: "An ancient sky sanctuary near an eclipsed sun, its gilded ring-ruins drifting in the corona's warmth.", tones: ["#f0c070", "#6a3a2a", "#140812"], particle: "motes" },
    anatomy: { locomotion: "coils", fins: true, emissive: true },
    idle: {
      summary: "Coiled and vast: a slow breath along the coil and an unhurried turn about its sun.",
      stages: [S("coil", 1, 6), S("coil", 1.1, 6.6), S("coil", 1, 7.8), S("coil", 0.8, 9.6)],
    },
  },
  pyraurum: {
    biome: { id: "pyre-summit", name: "Golden Pyre Summit", summary: "Old altar ruins on a summit wreathed in warm smoke, where the phoenix burns and rises.", tones: ["#f0a858", "#6a2a18", "#160606"], particle: "embers", floor: 0.62 },
    anatomy: { locomotion: "flies", wings: true, tail: true, emissive: true },
    idle: {
      summary: "Holds the air on a slow rise and fall; embers drift up past it.",
      stages: [
        S("rock", 1.1, 5),
        S("hover", 1.4, 5.8),
        // flame plumes trail from the body and stream with the rise and fall
        S("hover", 1.6, 6.6, { parts: [{ part: "tail", poly: [5, 66, 51.5, 66, 51.5, 95, 5, 95], hinge: [40, 66], motion: "skew", deg: 2.4, period: 4.6 }] }),
        S("hover", 1.3, 8, {
          parts: [
            { part: "wing", poly: [2, 8, 40, 8, 40, 62, 2, 62], hinge: [40, 45], motion: "fold", deg: 2.5, period: 6.4 },
            { part: "wing", poly: [60, 8, 98, 8, 98, 62, 60, 62], hinge: [60, 45], motion: "fold", deg: 2.5, period: 6.4 },
          ],
        }),
      ],
    },
  },
  aurelith: {
    biome: { id: "gilded-tide", name: "Gilded Tide", summary: "Warm evening water lit gold from the surface, where its shadow turns the sea to molten light.", tones: ["#e8b860", "#1f5a5a", "#04161a"], particle: "bubbles" },
    anatomy: { locomotion: "swims", fins: true },
    idle: {
      summary: "Swims slowly and serenely, banking a little with each long stroke.",
      stages: [
        S("swim", 1.1, 8),
        S("glide", 1.2, 9),
        // the great flippers paddle slowly beneath the shell
        S("glide", 1.2, 10.5, { parts: [{ part: "fin", poly: [28, 66, 76, 66, 76, 90, 28, 90], hinge: [47, 66], motion: "skew", deg: 2.5, period: 7.6 }] }),
        S("glide", 1, 12.5, { parts: [{ part: "fin", poly: [26, 67, 80, 67, 80, 92, 26, 92], hinge: [48, 67], motion: "skew", deg: 2, period: 9 }] }),
      ],
    },
  },
  velynx: {
    biome: { id: "glyph-archive", name: "Glyphwalk Archive", summary: "A moonlit alley of an ancient archive, its stone walls carved with faint teal glyphs it has walked.", tones: ["#4a7a86", "#1a1f38", "#05060d"], particle: "glyphs", lift: 0.16, floor: 0.26 },
    anatomy: { locomotion: "stands", tail: true, ears: true, emissive: true },
    idle: {
      summary: "Poised on its toes with a slow weight shift; its tail sways in an unhurried S and its glyphs breathe with light.",
      glowFrom: ["accent", "wingEdge", "horn"],
      stages: [
        S("rock", 1, 4.8, { glow: true }),
        S("stalk", 1.2, 5, { glow: true, parts: [{ part: "tail", poly: [55.8, 47, 80, 47, 80, 75, 58, 75, 58, 59, 55.8, 54], hinge: [58, 70.8], motion: "sway", deg: 2, period: 4.2 }] }),
        S("stalk", 1, 5.8, { glow: true, parts: [{ part: "tail", poly: [58.6, 37, 92, 37, 92, 78, 59.5, 78, 59.5, 66, 58.6, 47, 57.9, 47, 57.9, 40.6, 58.6, 40.6], hinge: [59.5, 73.4], motion: "sway", deg: 1.8, period: 5.2 }] }),
        S("stalk", 0.8, 7.2, { glow: true, parts: [{ part: "tail", poly: [59, 35, 97, 35, 97, 80.5, 59, 80.5], hinge: [59, 77], motion: "sway", deg: 1.5, period: 6.4 }] }),
      ],
    },
  },
  nyxara: {
    biome: { id: "duskwood", name: "Duskwood Edge", summary: "The edge of a pale-trunked wood at deep dusk, threaded with ribbons of violet mist.", tones: ["#8a7ac0", "#262048", "#08061a"], particle: "motes", calm: 0.85, soften: 1.5 },
    anatomy: { locomotion: "walks", tail: true, ears: true, emissive: true },
    idle: {
      summary: "Light-footed: a quick breath and a small shift of weight, its ribbon tail drifting on the air.",
      stages: [
        S("rock", 1, 4.6),
        S("breathe", 1.4, 4.2, { parts: [{ part: "ribbon", poly: [67.5, 25, 80, 25, 80, 57.5, 67.5, 57.5], hinge: [67.5, 53], motion: "bend", deg: 3.5, period: 4.4 }] }),
        S("stalk", 1.1, 5.2, { parts: [{ part: "ribbon", poly: [74, 22, 99, 22, 99, 64, 74, 64], hinge: [74, 52], motion: "bend", deg: 3, period: 5.2 }] }),
        // its twin ribbons loop back across their own base, so the Ascended moves whole
        S("stalk", 0.9, 6.6),
      ],
    },
  },
  thalor: {
    biome: { id: "sunken-bastion", name: "Sunken Bastion", summary: "The ruined pillars of a drowned fortress in cold teal water, the trench it has patrolled forever.", tones: ["#4a9aa0", "#0f3a48", "#021216"], particle: "bubbles" },
    anatomy: { locomotion: "swims", tail: true, fins: true, emissive: true },
    idle: {
      summary: "Holds its station with slow authority, a heavy swim-drift with its head lowered like a shield.",
      glowFrom: ["accent"],
      glowLevel: 0.7,
      stages: [
        S("swim", 1, 7.6),
        S("swim", 1.1, 8.4, { parts: [{ part: "tail", poly: [70, 30, 86, 30, 86, 72, 70, 72], hinge: [70, 53.3], motion: "bend", deg: 4, period: 4.6 }] }),
        S("swim", 1, 9.6, { glow: true, parts: [{ part: "tail", poly: [80, 25, 96, 25, 96, 75, 80, 75], hinge: [80, 52.7], motion: "bend", deg: 3, period: 5.4 }] }),
        S("swim", 0.8, 11.6, { glow: true, parts: [{ part: "tail", poly: [62, 74, 99, 74, 99, 99, 50, 99, 50, 86, 62, 86], hinge: [76, 74], motion: "skew", deg: 2.2, period: 6.4 }] }),
      ],
    },
  },
};

/** The neutral scene for a species without one of its own: a dark vault, CSS only, still. */
export const SEALED_SCENE: SceneDef = {
  biome: { id: "sealed-vault", name: "Sealed Vault", summary: "Unrevealed.", tones: ["#3a3456", "#141024", "#050409"], particle: "none" },
  anatomy: { locomotion: "hovers" },
  idle: { summary: "Still.", stages: [S("rock", 0, 6), S("rock", 0, 6), S("rock", 0, 6), S("rock", 0, 6)] },
};

/** Assets produced by scripts/creature-scenes.mjs (plates and glow maps), keyed by species id. */
export interface SceneAssets {
  plate: string | null;
  glow: (string | null)[];
}
const ASSETS = (manifest as { species: Record<string, SceneAssets> }).species;

/** Scenes registered at runtime (none today); a registered scene wins over the built-in one. */
const RUNTIME = new Map<string, { scene: SceneDef; assets: SceneAssets | null }>();

export function registerScene(speciesId: string, scene: SceneDef, assets: SceneAssets | null = null): void {
  RUNTIME.set(speciesId, { scene, assets });
}

export function sceneOf(speciesId: string): SceneDef {
  return RUNTIME.get(speciesId)?.scene ?? SCENES[speciesId] ?? SEALED_SCENE;
}

export function sceneAssets(speciesId: string): SceneAssets | null {
  return RUNTIME.get(speciesId)?.assets ?? ASSETS[speciesId] ?? null;
}

export function stageIdle(speciesId: string, stage: number): StageIdle {
  return sceneOf(speciesId).idle.stages[Math.max(0, Math.min(3, Math.round(stage)))];
}
