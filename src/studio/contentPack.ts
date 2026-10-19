/**
 * Starter X content pack: eight reviewed drafts for the Phoenix campaign.
 *
 * Drafts only. Nothing here is posted anywhere; the Content Studio shows them
 * with copy buttons and `npm run campaign:render` writes the matching assets
 * and `docs/campaign/x-content-pack.md`. Every figure is read from `FACTS`.
 */

import { generate, defaultInput } from "./copy";
import { FACTS } from "./facts";
import { STILLS, type CanvasFormatId, type CreativeCopy, type Graphic } from "./render/draw";

export interface PackAsset {
  /** File under public/campaign/. */
  file: string;
  kind: "static" | "video" | "endcard";
  format: CanvasFormatId;
  graphic?: Graphic;
  still?: number;
  copy?: Partial<CreativeCopy>;
  description: string;
}

export interface PackPost {
  n: number;
  id: string;
  title: string;
  objective: string;
  slot: string;
  caption: string;
  cta: string;
  asset: PackAsset;
  /** Optional poll to attach (X allows up to 4 options of 25 characters). */
  poll?: string[];
  thread?: string[];
}

const legendary = FACTS.rarityChances.find((r) => r.id === "legendary")!.species;
const mythic = FACTS.rarityChances.find((r) => r.id === "mythic")!.species;
const secret = FACTS.rarityChances.find((r) => r.id === "secret")!.species;
const pct = (c: number) => {
  const p = c * 100;
  return `${p >= 10 ? p.toFixed(0) : String(Number(p.toFixed(1)))}%`;
};
const odds = FACTS.rarityChances.map((r) => `${r.label} ${pct(r.chance)}`).join("\n");

export const CONTENT_PACK: PackPost[] = [
  {
    n: 1,
    id: "phoenix-reveal",
    title: "Phoenix reveal",
    objective: "Establish the Phoenix as the face of Solanites before any explanation. Pure awareness: make people stop scrolling.",
    slot: "Day 1",
    caption: `This is the face of Solanites.\n\n${FACTS.phoenix.name}, ${FACTS.phoenix.epithet}. One of ${legendary} Legendary species waiting inside the eggs.\n\nIt burns, falls, and rises again. Brighter every time.`,
    cta: "Follow for the reveal",
    asset: {
      file: "stills/x-01-phoenix-reveal.jpg",
      kind: "static",
      format: "x-image",
      graphic: "phoenix",
      still: STILLS.wingsRaised,
      copy: { eyebrow: `${FACTS.phoenix.name} · Legendary · ${FACTS.phoenix.element}`, headline: "THE PHOENIX\n*RISES.*", sub: `${FACTS.phoenix.epithet}. One of ${legendary} Legendary species.` },
      description: "Phoenix with raised wings on the right, headline on the left.",
    },
  },
  {
    n: 2,
    id: "hatchery",
    title: "The hatchery",
    objective: "Explain the core loop in one scannable post, so new followers understand what they would actually do.",
    slot: "Day 2",
    caption: `Inside the Hatchery:\n\n→ Every ${FACTS.tokensPerEgg} ${FACTS.symbol} you hold backs one egg\n→ It glows, cracks and stirs through ${FACTS.eggStages.length} stages\n→ You hatch it yourself and the rarity is revealed\n→ Then you name what came out\n\nNo wallet connection needed to look up eggs.`,
    cta: "Enter the Hatchery",
    asset: {
      file: "stills/x-02-hatchery.jpg",
      kind: "static",
      format: "x-image",
      graphic: "stages",
      still: STILLS.wingsRaised,
      copy: { eyebrow: "The Hatchery", headline: "WATCH IT\n*COME ALIVE.*", sub: `From ${FACTS.eggStages[0]} to ${FACTS.eggStages.at(-1)}, then you open it.` },
      description: "Incubation stepper (the four real egg stages and the four forms) beside the Phoenix.",
    },
  },
  {
    n: 3,
    id: "collection",
    title: "Collection discovery",
    objective: "Show the depth of the catalogue with the confirmed species count, and seed the collecting instinct.",
    slot: "Day 3",
    caption: `${FACTS.speciesCount} species. ${FACTS.elements.length} elements. ${FACTS.formCount} forms each.\n\nFrom Mossling to ${FACTS.phoenix.name}, every Solanite has its own body plan and original art.\n\n${mythic} Mythic and ${secret} Secret species stay classified until someone hatches one.\n\nHow many can you find?`,
    cta: "Explore the Collection",
    asset: {
      file: "stills/x-03-collection.jpg",
      kind: "static",
      format: "x-image",
      graphic: "species",
      still: STILLS.wingsRaised,
      copy: { eyebrow: "The Collection", headline: `*${FACTS.speciesCount}* SPECIES\nTO DISCOVER.`, sub: `${FACTS.elements.length} elements. ${FACTS.formCount} forms each. Some still classified.` },
      description: `All ${FACTS.elements.length} elements as chips under the species count.`,
    },
  },
  {
    n: 4,
    id: "rarity",
    title: "Rarity",
    objective: "Explain the real rarity system with the published weights. Transparent, not hype: no outcome is promised.",
    slot: "Day 4",
    caption: `${FACTS.rarityCount} bloodlines:\n\n${odds}\n\nEach egg's rarity is sealed when it's earned and revealed when it hatches. Those are the published odds, and no outcome is guaranteed.`,
    cta: "See the full rules",
    asset: {
      file: "stills/x-04-rarity.jpg",
      kind: "static",
      format: "x-image",
      graphic: "rarity",
      still: STILLS.wingsRaised,
      copy: { eyebrow: "The Bloodlines", headline: `*${FACTS.rarityCount}* RARITY\nTIERS.`, sub: "Sealed when the egg is earned. Revealed when it hatches." },
      description: "The six tiers with their in-game colours and published hatch weights.",
    },
  },
  {
    n: 5,
    id: "brand-intro",
    title: "Brand introduction",
    objective: "The pinned explainer for people discovering the project for the first time.",
    slot: "Pin it",
    caption: `Solanites in one line:\n\nHold ${FACTS.symbol}, earn eggs, and hatch creatures that keep evolving for as long as you hold.\n\n${FACTS.speciesCount} species. ${FACTS.rarityCount} rarity tiers. ${FACTS.forms[0]} to ${FACTS.forms.at(-1)}.\n\nNo wallet needed to explore.`,
    cta: "Enter the Hatchery",
    asset: {
      file: "stills/endcard-16x9.jpg",
      kind: "endcard",
      format: "landscape",
      still: STILLS.wingspan,
      description: "The campaign end card: logo, key figures and the website.",
    },
    thread: generate({ ...defaultInput("intro", "x-thread") }).thread,
  },
  {
    n: 6,
    id: "video-launch",
    title: "Cinematic video launch",
    objective: "Lead with the Phoenix film as the teaser. Upload natively for autoplay; add the link in a reply once the domain is final.",
    slot: "Day 5",
    caption: `Not just another egg.\n\n${FACTS.speciesCount} species to discover. ${FACTS.rarityCount} rarity tiers. Every one of them starts inside a shell.`,
    cta: "Enter the Hatchery",
    asset: {
      file: "ads/solanites-phoenix-16x9.mp4",
      kind: "video",
      format: "landscape",
      description: "The 11.6 s Phoenix advert, 16:9. Use the 1:1 or 4:5 cut if it's going into a feed ad.",
    },
  },
  {
    n: 7,
    id: "community",
    title: "Community engagement",
    objective: "Start a genuine conversation around a real feature (naming). Replies, not clicks, so the caption carries no link.",
    slot: "Day 6",
    caption: "You can name every Solanite you hatch.\n\nWhat's the first name going on yours?",
    cta: "Reply with yours",
    poll: ["Legendary", "Mythic", "Secret", "Whatever hatches"],
    asset: {
      file: "stills/x-07-community.jpg",
      kind: "static",
      format: "x-image",
      graphic: "question",
      still: STILLS.emerging,
      copy: { eyebrow: "Community", headline: "WHAT WILL\nYOU *NAME* IT?", sub: "Every creature you hatch can carry its own name." },
      description: "Question card. Optional follow-up poll: which bloodline are you hoping for?",
    },
  },
  {
    n: 8,
    id: "website",
    title: "Website traffic",
    objective: "Direct response: give three concrete things to do on the site, none of which need a wallet. Add the final link (or point to the profile link) once the domain is settled.",
    slot: "Day 7",
    caption: `You don't need a wallet to look around.\n\n→ Browse the Collection, ${FACTS.speciesCount} species and some still classified\n→ Try the Hatchery with a demo wallet\n→ Look up the eggs on any public address`,
    cta: "Enter the Hatchery",
    asset: {
      file: "stills/x-08-explore.jpg",
      kind: "static",
      format: "x-image",
      graphic: "cta",
      still: STILLS.wingsRaised,
      copy: { eyebrow: "No sign-up", headline: "NO WALLET\n*NEEDED.*", sub: "", points: ["Browse the Collection", "Try the Hatchery demo", "Look up any wallet's eggs"] },
      description: "Three things to do on the site, plus the CTA button.",
    },
  },
];

export function packMarkdown(posts: PackPost[] = CONTENT_PACK): string {
  const out = [
    "# Solanites X content pack · Phoenix campaign",
    "",
    "Drafts for review. Nothing here is posted automatically. Generated from `src/studio/contentPack.ts` by `npm run campaign:render`; every figure comes from the live game config.",
    "",
    "Assets live in `public/campaign/` (also downloadable from the Content Studio at `/studio`).",
    "",
  ];
  for (const p of posts) {
    out.push(`## Post ${p.n}: ${p.title}`, "", `**Objective:** ${p.objective}  `, `**When:** ${p.slot}  `, `**Creative:** \`public/campaign/${p.asset.file}\`, ${p.asset.description}  `, `**CTA:** ${p.cta}`, "", "```text", p.caption, "```", "");
    if (p.poll) out.push(`**Poll (optional reply):** ${p.poll.join(" / ")}`, "");
    if (p.thread) {
      out.push("**Optional thread:**", "");
      p.thread.forEach((t, i) => out.push(`${i + 1}.`, "", "```text", t, "```", ""));
    }
  }
  return out.join("\n");
}
