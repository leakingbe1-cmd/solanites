/**
 * Template-based copy generator for the Content Studio.
 *
 * No external API: every line is assembled from the campaign templates below
 * and the verified feature lines in `facts.ts`, so output can only repeat what
 * the project actually does. Anything the user types (main message, campaign
 * details) is passed through and run through the same claim checks.
 */

import { eggProgression } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { formatSpan } from "@/lib/format";
import { CANVAS_FORMATS, STILLS, type CanvasFormatId, type CreativeCopy, type Graphic, type GraphicData } from "./render/draw";
import { FACTS, FEATURES, PRELAUNCH, displayUrl, featureAllowed, type FeatureId } from "./facts";
import { X_LIMIT, lintClaims, lintPrelaunch, revealsSite, xLength, type ClaimWarning } from "./xText";

export type CampaignId = "intro" | "phoenix" | "hatching" | "collection" | "rarity" | "hatchery" | "community" | "launch" | "awareness";
export type PlatformId = "x-post" | "x-thread" | "x-video" | "vertical-video" | "static" | "poster";

export interface Platform {
  id: PlatformId;
  label: string;
  kind: "video" | "static";
  formats: CanvasFormatId[];
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  "x-post": { id: "x-post", label: "X post", kind: "static", formats: ["x-image", "poster-4x5", "square", "portrait"] },
  "x-thread": { id: "x-thread", label: "X thread", kind: "static", formats: ["x-image", "square", "portrait"] },
  "x-video": { id: "x-video", label: "X video advert", kind: "video", formats: ["landscape", "square", "portrait"] },
  "vertical-video": { id: "vertical-video", label: "Vertical social video", kind: "video", formats: ["vertical"] },
  static: { id: "static", label: "Static image advert", kind: "static", formats: ["square", "portrait", "x-image", "vertical"] },
  poster: { id: "poster", label: "Promotional poster", kind: "static", formats: ["poster-4x5", "poster"] },
};

const n = FACTS.speciesCount;
const S = FACTS.symbol;
const BRAND_TAGLINE = "YOUR *SOLANITE* IS WAITING.";
const later = eggProgression.incubationScheduleMs.slice(1).map(formatSpan);

/** A second factual sentence per feature, for threads. */
const MORE: Record<FeatureId, string> = {
  species: "Each one has its own body plan, from a leaf-armoured quadruped to a sky whale to a phoenix in flight.",
  rarity: "The rarer the creature, the bigger the reveal: Epic and above get light rays, Mythic a nebula, Secret prism rays.",
  loop: `Eggs incubate, open when you choose to hatch them, then grow from ${FACTS.forms[0]} to ${FACTS.forms.at(-1)}.`,
  evolution: "Commons start with simple silhouettes. Legendaries and Mythics grow into large, ornate, cosmic compositions.",
  eggs: `Eggs = balance ÷ ${FACTS.tokensPerEgg}, rounded down. Eggs you've earned are kept even if your balance drops.`,
  walletless: "Paste any public address into Find my eggs. No signature, no connection, no sign-up.",
  sealed: "Nobody picks it and nothing rerolls it. The hatch is the reveal.",
  classified: "Their entries stay dark until the first one is found.",
  incubation: `After that: ${later.slice(0, -1).join(", ")}, then ${later.at(-1)} per egg, one at a time.`,
  ascension: `Rank ${FACTS.finalRank} takes ${formatSpan(gameConfig.evolution.ascensionRanksMs.at(-1)!)} of holding after your creature grows up.`,
  rename: "Name it after a friend, a meme, or the moment it hatched.",
  demo: "The demo starts with a pre-grown collection and an egg that's ready to hatch.",
  phoenix: FACTS.phoenix.lore,
};

interface Template {
  label: string;
  /** Overlay headlines; `*word*` renders in gold. */
  headlines: string[];
  /** Plain first lines for captions and threads. */
  openers: string[];
  support: string;
  eyebrow: string;
  features: FeatureId[];
  graphic: Graphic;
  still: number;
  cta: string;
  hashtags: string[];
  /** Engagement posts keep the link out of the caption. */
  link: boolean;
  /** Features the support line already states; threads and captions skip them. */
  covered?: FeatureId[];
  /** Overlay points for the "cta" and "choices" graphics (default: the feature labels). */
  points?: string[];
  /** Prelaunch teaser version of this template, merged over it while PHASE is "prelaunch". */
  teaser?: Partial<Omit<Template, "teaser" | "label">>;
  /** Set when the campaign can't run in the teaser phase at all. */
  heldInPrelaunch?: string;
  /** Extra warning shown for this campaign. */
  note?: string;
}

const RARITY_LIST = FACTS.rarityLabels.join(", ");

export const CAMPAIGNS: Record<CampaignId, Template> = {
  intro: {
    label: "Project introduction",
    headlines: ["NOT JUST ANOTHER *EGG.*", "HOLD. HATCH. *EVOLVE.*", "A NEW WORLD IS WAITING TO *HATCH.*"],
    openers: ["Solanites is a creature-collecting world on Solana.", `Hold ${S}. Earn eggs. Hatch creatures that keep evolving.`, "Not just another egg."],
    support: `Hold ${S} and eggs arrive on their own. Hatch them, collect ${n} species and watch each one grow through ${FACTS.formCount} forms.`,
    eyebrow: "◇ Genesis Hatchery · Season 0",
    features: ["species", "rarity", "loop"],
    graphic: "stats",
    still: STILLS.wingsRaised,
    cta: "Enter the Hatchery",
    hashtags: ["#Solanites", "#Solana"],
    link: true,
    teaser: {
      openers: ["Solanites is a creature-collecting world on Solana.", "Something is about to hatch.", "Not just another egg."],
      support: `${n} species. ${FACTS.rarityCount} rarity tiers. Every one of them starts inside an egg.`,
      cta: "Follow for the reveal",
    },
  },
  phoenix: {
    label: "Phoenix reveal",
    headlines: ["THE PHOENIX *RISES.*", "BORN IN *FIRE.*", "EVERY EGG HOLDS *SOMETHING.*"],
    openers: ["This is the face of Solanites.", "Some eggs hold fire.", `Meet ${FACTS.phoenix.name}.`],
    support: `${FACTS.phoenix.name}, ${FACTS.phoenix.epithet}. One of ${FACTS.rarityChances.find((r) => r.id === "legendary")!.species} Legendary species in the Hatchery.`,
    eyebrow: `${FACTS.phoenix.name} · Legendary · ${FACTS.phoenix.element}`,
    features: ["phoenix", "species", "rarity"],
    graphic: "phoenix",
    still: STILLS.wingspan,
    cta: "Enter the Hatchery",
    hashtags: ["#Solanites", "#Solana"],
    link: true,
    teaser: { support: `${FACTS.phoenix.name}, ${FACTS.phoenix.epithet}. One of ${FACTS.rarityChances.find((r) => r.id === "legendary")!.species} Legendary species waiting inside the eggs.`, cta: "Follow for the reveal" },
  },
  hatching: {
    label: "Egg hatching campaign",
    headlines: ["NOT JUST ANOTHER *EGG.*", "IT'S *STIRRING.*", "WATCH IT *COME ALIVE.*"],
    openers: ["Your egg doesn't just sit there.", "Every egg goes through four stages before it opens.", "It glows. It cracks. It stirs."],
    support: `It glows, cracks and stirs, from ${FACTS.eggStages[0]} to ${FACTS.eggStages.at(-1)}. Then you hatch it, and its rarity is revealed in light.`,
    eyebrow: "Incubation",
    features: ["sealed", "incubation", "loop"],
    graphic: "stages",
    still: STILLS.vortex,
    cta: "Enter the Hatchery",
    hashtags: ["#Solanites"],
    link: true,
    teaser: {
      support: `It glows, cracks and stirs, from ${FACTS.eggStages[0]} to ${FACTS.eggStages.at(-1)}. Then it opens.`,
      features: ["loop", "evolution", "species"],
      cta: "The story begins soon",
    },
  },
  collection: {
    label: "Species and collection",
    headlines: [`*${n}* SPECIES. ONE *COLLECTION.*`, "HOW MANY CAN YOU *FIND?*", `*${n}* TO DISCOVER.`],
    openers: [`${n} species. ${FACTS.elements.length} elements. ${FACTS.rarityCount} rarity tiers.`, `There are ${n} Solanites. How many will you find?`, "The Collection is open."],
    support: `Every species has its own body plan and ${FACTS.formCount} separately drawn forms. ${FACTS.classified.join(" and ")} species stay classified until someone hatches one.`,
    eyebrow: "The Collection",
    features: ["species", "evolution", "classified"],
    graphic: "species",
    still: STILLS.wingsRaised,
    cta: "Explore the Collection",
    hashtags: ["#Solanites"],
    link: true,
    teaser: { cta: "The story begins soon" },
  },
  rarity: {
    label: "Rarity and discovery",
    headlines: [`*${FACTS.rarityCount}* BLOODLINES.`, "RARITY IS *SEALED* AT BIRTH.", "COMMON TO *SECRET.*"],
    openers: ["Six bloodlines. Which one is inside your egg?", "Your egg's rarity is decided before it hatches.", `${FACTS.rarityCount} tiers. One reveal.`],
    support: "Each egg's rarity is sealed when it's earned and revealed when it hatches. The odds are published on the site, and no outcome is guaranteed.",
    covered: ["sealed"],
    eyebrow: "The Bloodlines",
    features: ["rarity", "sealed", "classified"],
    graphic: "rarity",
    still: STILLS.vortex,
    cta: "See the odds",
    hashtags: ["#Solanites"],
    link: true,
    teaser: { support: "Six tiers, from Common to Secret. Nobody chooses which one hatches.", features: ["rarity", "classified", "species"], cta: "Follow for the reveal" },
    heldInPrelaunch: "The rarity odds and sealing describe live hatching, which needs production verification.",
  },
  hatchery: {
    label: "Hatchery promotion",
    headlines: ["ENTER THE *HATCHERY.*", "WATCH IT *COME ALIVE.*", "NO SIGN-UP. JUST *HATCH.*"],
    openers: ["Step inside the Hatchery.", "Your eggs, live.", "The Hatchery, explained in one post."],
    support: "Look up any wallet's eggs without connecting one, or try the demo. Watch incubation live, hatch when it's ready, and name what comes out.",
    eyebrow: "The Hatchery",
    features: ["walletless", "demo", "rename"],
    graphic: "cta",
    still: STILLS.wingsRaised,
    cta: "Enter the Hatchery",
    hashtags: ["#Solanites"],
    link: true,
    teaser: { support: "Every egg wakes slowly. It glows, cracks and stirs before it opens.", features: ["loop", "rename", "species"], cta: "Follow for the reveal" },
    heldInPrelaunch: "Promotes using the website's Hatchery, which isn't revealed yet.",
  },
  community: {
    label: "Community growth",
    headlines: ["WHAT WILL YOU *NAME* IT?", "WHICH BLOODLINE IS *YOURS?*", "WHO ARE YOU *HATCHING* FIRST?"],
    openers: ["Every Solanite you hatch can carry its own name. What's yours called?", `${RARITY_LIST}. Which one are you hoping for, and why?`, `${n} species. If you could pick your first hatch, which would it be?`],
    support: "Drop it below.",
    covered: ["rename"],
    eyebrow: "Community",
    features: ["rename", "rarity", "species"],
    graphic: "question",
    still: STILLS.emerging,
    cta: "Reply with yours",
    hashtags: ["#Solanites"],
    link: false,
    teaser: {
      headlines: ["WHICH CREATURE WOULD YOU *HATCH?*", "WHAT WILL YOU *NAME* IT?", "WHICH BLOODLINE IS *YOURS?*"],
      openers: ["Every legend starts somewhere. When your egg hatches, what are you hoping for?", "Every Solanite you hatch will carry a name you choose. What's yours called?", `${RARITY_LIST}. Which one are you hoping for, and why?`],
      support: "Reply with your pick.",
      graphic: "choices",
      points: ["PHOENIX", "SOMETHING RARE", "THE UNKNOWN"],
      cta: "Reply with your pick",
    },
  },
  launch: {
    label: "Launch announcement",
    headlines: ["THE HATCHERY *AWAKENS.*", "GENESIS · *SEASON 0.*", "SEASON 0 *BEGINS.*"],
    openers: ["Genesis Hatchery · Season 0.", "The Hatchery awakens.", "Introducing Solanites."],
    support: `Hold ${S}, earn eggs automatically, then hatch and evolve ${n} species.`,
    eyebrow: "◇ Genesis Hatchery · Season 0",
    features: ["eggs", "species", "walletless"],
    graphic: "stats",
    still: STILLS.wingspan,
    cta: "Enter the Hatchery",
    hashtags: ["#Solanites", "#Solana"],
    link: true,
    note: "Add the confirmed launch date and any official links in Campaign details. The generator never invents a date.",
    teaser: { support: `${n} species are waiting. The reveal is coming.`, cta: "Follow for the reveal" },
    heldInPrelaunch: "Launch announcements wait until you authorise the official reveal.",
  },
  awareness: {
    label: "General brand awareness",
    headlines: [BRAND_TAGLINE, "HATCH THE *EXTRAORDINARY.*", "DISCOVER YOUR *CREATURE.*"],
    openers: ["Discover your creature. Hatch the extraordinary.", "Your Solanite is waiting.", "Some things are worth holding."],
    support: "Watch your Solanite grow stronger through its evolution.",
    eyebrow: "Solanites",
    features: ["loop", "species", "walletless"],
    graphic: "phoenix",
    still: STILLS.wingspan,
    cta: "Enter the Hatchery",
    hashtags: ["#Solanites", "#Solana"],
    link: true,
    teaser: { cta: "Follow for the reveal" },
  },
};

export const CAMPAIGN_IDS = Object.keys(CAMPAIGNS) as CampaignId[];

export interface StudioInput {
  campaign: CampaignId;
  platform: PlatformId;
  message: string;
  audience: string;
  features: FeatureId[];
  cta: string;
  url: string;
  details: string;
  variant: number;
}

export interface GeneratedContent {
  headline: string;
  support: string;
  callouts: string[];
  caption: string;
  thread: string[];
  cta: string;
  hashtags: string[];
  creative: CreativeCopy;
  graphic: Graphic;
  still: number;
  notes: string[];
}

/** A campaign's template for the current phase (the teaser version during prelaunch). */
export function template(id: CampaignId): Template {
  const t = CAMPAIGNS[id];
  const merged = PRELAUNCH && t.teaser ? { ...t, ...t.teaser } : t;
  return { ...merged, features: merged.features.filter(featureAllowed) };
}

export function defaultInput(campaign: CampaignId = "intro", platform: PlatformId = "x-video"): StudioInput {
  const t = template(campaign);
  return { campaign, platform, message: "", audience: "", features: [...t.features], cta: t.cta, url: "", details: "", variant: 0 };
}

const plain = (s: string) => s.replace(/\*/g, "");
const sentence = (s: string) => {
  const p = plain(s).trim();
  if (!p) return p;
  const cased = p === p.toUpperCase() ? p.charAt(0) + p.slice(1).toLowerCase() : p;
  return /[.!?]$/.test(cased) ? cased : `${cased}.`;
};
const firstSentence = (s: string) => s.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? s;
const pick = <T,>(xs: T[], i: number) => xs[((i % xs.length) + xs.length) % xs.length];

/** Fits a post to X's limit by dropping optional parts in order. */
function fitPost(parts: { text: string; optional?: number }[]): string {
  let live = parts.filter((p) => p.text);
  const join = () => live.map((p) => p.text).join("\n\n");
  const order = [...new Set(live.map((p) => p.optional).filter((o): o is number => o !== undefined))].sort((a, b) => a - b);
  for (const o of order) {
    if (xLength(join()) <= X_LIMIT) break;
    live = live.filter((p) => p.optional !== o);
  }
  return join();
}

export function generate(input: StudioInput): GeneratedContent {
  const t = template(input.campaign);
  const v = input.variant;
  // held features are dropped while the teaser phase is on, whatever was picked
  const chosen = (input.features.length ? input.features : t.features).filter(featureAllowed).map((id) => FEATURES[id]).filter(Boolean);
  // creatives show every chosen feature; text skips what the support line already says
  const feats = chosen.filter((f) => !t.covered?.includes(f.id));
  // no links of any kind before the official reveal
  const url = PRELAUNCH ? "" : input.url.trim();
  const shownUrl = url ? displayUrl(url) : "";
  const cta = input.cta.trim() || t.cta;
  const message = input.message.trim();
  const details = input.details.trim();
  const audience = input.audience.trim();

  const headline = message ? message : pick(t.headlines, v);
  // creatives set every headline in caps, as the campaign typography does
  const overlay = message ? message.toUpperCase() : headline;
  const opener = message ? sentence(message) : pick(t.openers, v);
  const support = t.support;
  const hashtags = t.hashtags.slice(0, 2);
  // without a URL (the teaser default) link posts simply end on their copy
  const linkLine = !t.link ? `${cta} ↓` : url ? `${cta} → ${url}` : "";

  const caption = fitPost([
    { text: opener },
    { text: details, optional: 3 },
    { text: opener.includes(firstSentence(support)) ? "" : support, optional: 1 },
    { text: feats.slice(0, 2).map((f) => f.line).join(" "), optional: 0 },
    { text: linkLine },
    { text: hashtags.join(" "), optional: 2 },
  ]);

  const thread: string[] = [];
  thread.push(fitPost([{ text: opener }, { text: firstSentence(support) === opener ? "" : support, optional: 0 }, { text: "A quick thread ↓" }]));
  if (details) thread.push(fitPost([{ text: details }]));
  if (audience) thread.push(fitPost([{ text: `For ${audience}, here's what Solanites actually does.` }, { text: feats[0] ? `${feats[0].line} ${MORE[feats[0].id]}` : "", optional: 0 }]));
  feats.slice(audience ? 1 : 0, 4).forEach((f) => thread.push(fitPost([{ text: f.line }, { text: MORE[f.id], optional: 0 }])));
  thread.push(fitPost([{ text: !t.link ? "Your turn." : url ? "See it for yourself." : "Your Solanite is waiting." }, { text: linkLine }, { text: hashtags.join(" "), optional: 0 }]));

  const creative: CreativeCopy = {
    hook: overlay,
    callouts: chosen.slice(0, 3).map((f) => f.callout),
    tagline: BRAND_TAGLINE,
    cta,
    url: shownUrl,
    eyebrow: t.eyebrow,
    headline: overlay,
    sub: input.campaign === "community" ? "" : firstSentence(support),
    stats: [
      { value: String(FACTS.speciesCount), label: "species" },
      { value: String(FACTS.rarityCount), label: "rarity tiers" },
      { value: String(FACTS.formCount), label: "evolution forms" },
    ],
    points: t.points ?? chosen.slice(0, 3).map((f) => f.label),
    signoff: PRELAUNCH ? cta.toUpperCase() : "",
  };

  const notes: string[] = [];
  if (PRELAUNCH && t.heldInPrelaunch) notes.push(`HOLD until the reveal: ${t.heldInPrelaunch}`);
  if (PRELAUNCH && input.url.trim()) notes.push("The URL was left out: links are locked during the prelaunch teaser phase.");
  const dropped = input.features.filter((id) => !featureAllowed(id));
  if (dropped.length) notes.push(`Held until launch and left out: ${dropped.map((id) => FEATURES[id].label).join(", ")}.`);
  if (t.note && !details) notes.push(t.note);
  if (message || details) notes.push("Your main message and campaign details are used as written. Check any claims in them before posting.");

  return {
    headline: plain(headline),
    support,
    callouts: creative.callouts.map(plain),
    caption,
    thread,
    cta: url ? `${cta}: ${url}` : cta,
    hashtags,
    creative,
    graphic: t.graphic,
    still: t.still,
    notes,
  };
}

/** Claim warnings across everything a draft would publish. */
export function checkContent(c: Pick<GeneratedContent, "caption" | "thread" | "creative">): ClaimWarning[] {
  const all = [c.caption, ...c.thread, ...creativeText(c.creative)].join("\n");
  return [...lintClaims(all), ...(PRELAUNCH ? lintPrelaunch(all) : [])];
}

const creativeText = (c: CreativeCopy) => [c.hook, c.headline, c.sub, c.eyebrow, c.tagline, c.cta, c.url, c.signoff, ...c.callouts, ...c.points, ...c.stats.flatMap((s) => [s.value, s.label])];

/**
 * Render-time guard: refuses creative copy that would reveal the site or the
 * coin during the teaser phase. The render script calls it for every asset, so
 * no export can carry a URL by accident.
 */
export function assertPrelaunchSafe(c: CreativeCopy, label = "creative") {
  if (!PRELAUNCH) return;
  const text = creativeText(c).join("\n");
  const problems = [...(c.url ? [{ match: c.url, reason: "URL field must be empty" }] : []), ...lintPrelaunch(text)];
  if (problems.length || revealsSite(text)) throw new Error(`${label} breaks the prelaunch rule: ${problems.map((p) => `"${p.match}" (${p.reason})`).join("; ") || "reveals the site"}`);
}

export function graphicData(): GraphicData {
  return {
    elements: [...FACTS.elements],
    rarities: FACTS.rarityChances.map((r) => ({ label: r.label, color: r.color, chance: r.chance, classified: FACTS.classified.includes(r.label) })),
    eggStages: [...FACTS.eggStages],
    forms: [...FACTS.forms],
  };
}

/** The master campaign: the copy the committed MP4s and stills are rendered with. */
export const MASTER_INPUT: StudioInput = defaultInput("intro", "x-video");
export const MASTER_CREATIVE: CreativeCopy = generate(MASTER_INPUT).creative;

export const formatLabel = (id: CanvasFormatId) => CANVAS_FORMATS[id].label;
