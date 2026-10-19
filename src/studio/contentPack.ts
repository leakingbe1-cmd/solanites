/**
 * X content pack for the Phoenix teaser campaign.
 *
 * Drafts only. Nothing here is posted or scheduled anywhere; the Content
 * Studio shows them with copy buttons and `npm run campaign:render` writes
 * the matching assets and `docs/campaign/x-content-pack.md`. Every figure is
 * read from `FACTS`.
 *
 * "approved" means approved in principle for the prelaunch teaser phase (no
 * links, no token details, nothing that needs live egg tracking); every post
 * still needs the owner's sign-off before it goes out. "hold" posts wait for
 * the official reveal and for production verification.
 */

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
  /** A follow-up reply to post under the main post. */
  reply?: string;
  /** Extra sizes of the same creative. */
  altAssets?: PackAsset[];
  status: "approved" | "hold";
  /** Why a held post has to wait. */
  holdReason?: string;
}

const legendary = FACTS.rarityChances.find((r) => r.id === "legendary")!.species;
const mythic = FACTS.rarityChances.find((r) => r.id === "mythic")!.species;
const secret = FACTS.rarityChances.find((r) => r.id === "secret")!.species;
const pct = (c: number) => {
  const p = c * 100;
  return `${p >= 10 ? p.toFixed(0) : String(Number(p.toFixed(1)))}%`;
};
const odds = FACTS.rarityChances.map((r) => `${r.label} ${pct(r.chance)}`).join("\n");
const choiceCopy = { eyebrow: "Every legend starts somewhere", headline: "WHICH CREATURE\nWOULD YOU *HATCH?*", sub: "", points: ["PHOENIX", "SOMETHING RARE", "THE UNKNOWN"], signoff: "REPLY WITH YOUR PICK" };
const TRACKING = "Needs live egg tracking in production (token mint, Solana data, database), which is not verified, and names the token.";

export const CONTENT_PACK: PackPost[] = [
  {
    n: 1,
    id: "first-engagement",
    title: "First post: which creature would you hatch?",
    objective: "Open @solanites_ with a question anyone can answer. Builds recognition and replies before anything is revealed.",
    slot: "Day 1 · first post",
    status: "approved",
    caption: `Every legend starts somewhere. 🐦‍🔥\n\n${FACTS.speciesCount} creatures. One world. Your story hasn't begun yet.\n\nWhen your egg hatches, what are you hoping for?\n\n🔥 A Phoenix\n⚡ Something rare\n👁️ Something nobody has seen before\n\nReply with your pick.\n\nSOLANITES. The beginning is near.`,
    reply: `Phoenix pickers are aiming high: it's one of ${legendary} Legendary species.\n\nWhatever you're hoping for, what would you name your first hatch? 👇`,
    cta: "Reply with your pick",
    asset: {
      file: "stills/x-00-which-creature-4x5.jpg",
      kind: "static",
      format: "poster-4x5",
      graphic: "choices",
      still: STILLS.wingsRaised,
      copy: choiceCopy,
      description: "4:5 portrait: the Phoenix with three choices (Phoenix, Something rare, The unknown). A 1:1 version is included.",
    },
    altAssets: [{ file: "stills/x-00-which-creature-1x1.jpg", kind: "static", format: "square", graphic: "choices", still: STILLS.wingsRaised, copy: { ...choiceCopy, headline: "WHICH CREATURE WOULD\nYOU *HATCH?*" }, description: "1:1 version." }],
  },
  {
    n: 2,
    id: "phoenix-reveal",
    title: "Phoenix reveal",
    objective: "Establish the Phoenix as the face of Solanites. Pure awareness: make people stop scrolling.",
    slot: "Day 2",
    status: "approved",
    caption: `This is the face of Solanites.\n\n${FACTS.phoenix.name}, ${FACTS.phoenix.epithet}. One of ${legendary} Legendary species waiting inside the eggs.\n\nIt burns, falls, and rises again. Brighter every time.\n\nFollow for the reveal.`,
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
    n: 3,
    id: "collection",
    title: "Collection discovery",
    objective: "Show the depth of the catalogue with the confirmed species count and seed the collecting instinct.",
    slot: "Day 3",
    status: "approved",
    caption: `${FACTS.speciesCount} species. ${FACTS.elements.length} elements. ${FACTS.formCount} forms each.\n\nFrom Mossling to ${FACTS.phoenix.name}, every Solanite has its own body plan and original art.\n\n${mythic} Mythic and ${secret} Secret species stay classified until someone hatches one.\n\nHow many will you find? The story begins soon.`,
    cta: "The story begins soon",
    asset: {
      file: "stills/x-03-collection.jpg",
      kind: "static",
      format: "x-image",
      graphic: "species",
      still: STILLS.wingsRaised,
      copy: { eyebrow: "The Collection", headline: `*${FACTS.speciesCount}* SPECIES\nTO DISCOVER.`, sub: `${FACTS.elements.length} elements. ${FACTS.formCount} forms each. Some still classified.`, signoff: "THE STORY BEGINS SOON" },
      description: `All ${FACTS.elements.length} elements as chips under the species count.`,
    },
  },
  {
    n: 4,
    id: "video-launch",
    title: "Cinematic Phoenix film",
    objective: "Lead with the Phoenix film. Upload the MP4 natively so it autoplays.",
    slot: "Day 4",
    status: "approved",
    caption: `Not just another egg.\n\n${FACTS.speciesCount} species to discover. ${FACTS.rarityCount} rarity tiers. Every one of them starts inside a shell.\n\nFollow for the reveal.`,
    cta: "Follow for the reveal",
    asset: {
      file: "ads/solanites-phoenix-16x9.mp4",
      kind: "video",
      format: "landscape",
      description: "The 11.6 s Phoenix film, 16:9. The 1:1 and 4:5 cuts suit feed placements, 9:16 suits Stories.",
    },
  },
  {
    n: 5,
    id: "community",
    title: "Community: name it",
    objective: "A second genuine conversation starter, around naming. Replies, not clicks.",
    slot: "Day 5",
    status: "approved",
    caption: "Every Solanite you hatch will carry a name you choose.\n\nWhat's the first name going on yours?",
    cta: "Reply with yours",
    poll: ["Legendary", "Mythic", "Secret", "Whatever hatches"],
    asset: {
      file: "stills/x-07-community.jpg",
      kind: "static",
      format: "x-image",
      graphic: "question",
      still: STILLS.emerging,
      copy: { eyebrow: "Community", headline: "WHAT WILL\nYOU *NAME* IT?", sub: "Every creature you hatch will carry its own name.", signoff: "REPLY WITH YOURS" },
      description: "Question card. Optional follow-up poll: which bloodline are you hoping for?",
    },
  },
  {
    n: 6,
    id: "hatchery",
    title: "The hatchery (hold)",
    objective: "Explain the core loop once the Hatchery can be revealed.",
    slot: "After the reveal",
    status: "hold",
    holdReason: TRACKING,
    caption: `Inside the Hatchery:\n\n→ Every ${FACTS.tokensPerEgg} ${FACTS.symbol} you hold backs one egg\n→ It glows, cracks and stirs through ${FACTS.eggStages.length} stages\n→ You hatch it yourself and the rarity is revealed\n→ Then you name what came out\n\nNo wallet connection needed to look up eggs.`,
    cta: "Enter the Hatchery (after the reveal)",
    asset: {
      file: "stills/x-02-hatchery.jpg",
      kind: "static",
      format: "x-image",
      graphic: "stages",
      still: STILLS.wingsRaised,
      copy: { eyebrow: "The Hatchery", headline: "WATCH IT\n*COME ALIVE.*", sub: `From ${FACTS.eggStages[0]} to ${FACTS.eggStages.at(-1)}, then it opens.` },
      description: "Incubation stepper (the four real egg stages and the four forms) beside the Phoenix.",
    },
  },
  {
    n: 7,
    id: "rarity",
    title: "Rarity (hold)",
    objective: "Explain the rarity system with the published weights once hatching is live.",
    slot: "After the reveal",
    status: "hold",
    holdReason: "Quotes hatch odds and server-side sealing, which describe live hatching. Needs production verification.",
    caption: `${FACTS.rarityCount} bloodlines:\n\n${odds}\n\nEach egg's rarity is sealed when it's earned and revealed when it hatches. Those are the published odds, and no outcome is guaranteed.`,
    cta: "See the full rules (after the reveal)",
    asset: {
      file: "stills/x-04-rarity.jpg",
      kind: "static",
      format: "x-image",
      graphic: "rarity",
      still: STILLS.wingsRaised,
      copy: { eyebrow: "The Bloodlines", headline: `*${FACTS.rarityCount}* RARITY\nTIERS.`, sub: "Sealed when the egg is earned. Revealed when it hatches." },
      description: "The six tiers with their in-game colours and hatch weights.",
    },
  },
  {
    n: 8,
    id: "brand-intro",
    title: "Brand introduction (hold)",
    objective: "The pinned explainer for launch day.",
    slot: "Launch day",
    status: "hold",
    holdReason: TRACKING,
    caption: `Solanites in one line:\n\nHold ${FACTS.symbol}, earn eggs, and hatch creatures that keep evolving for as long as you hold.\n\n${FACTS.speciesCount} species. ${FACTS.rarityCount} rarity tiers. ${FACTS.forms[0]} to ${FACTS.forms.at(-1)}.\n\nNo wallet needed to explore.`,
    cta: "Enter the Hatchery (after the reveal)",
    asset: {
      file: "stills/endcard-16x9.jpg",
      kind: "endcard",
      format: "landscape",
      still: STILLS.wingspan,
      description: "The campaign end card: logo, key figures and the teaser CTA.",
    },
  },
  {
    n: 9,
    id: "website",
    title: "Website traffic (hold)",
    objective: "Direct response once the site is revealed: three things to do there.",
    slot: "After the reveal",
    status: "hold",
    holdReason: "Sends people to the website, which stays unrevealed until you authorise it. Add the official link then.",
    caption: `You don't need a wallet to look around.\n\n→ Browse the Collection, ${FACTS.speciesCount} species and some still classified\n→ Try the Hatchery with a demo wallet\n→ Look up the eggs on any public address`,
    cta: "Enter the Hatchery (after the reveal)",
    asset: {
      file: "stills/x-08-explore.jpg",
      kind: "static",
      format: "x-image",
      graphic: "cta",
      still: STILLS.wingsRaised,
      copy: { eyebrow: "No sign-up", headline: "NO WALLET\n*NEEDED.*", sub: "", points: ["Browse the Collection", "Try the Hatchery demo", "Look up any wallet's eggs"], cta: "Follow for the reveal" },
      description: "Three things to do on the site, plus a CTA button.",
    },
  },
];

export function packMarkdown(posts: PackPost[] = CONTENT_PACK): string {
  const approved = posts.filter((p) => p.status === "approved").length;
  const out = [
    "# Solanites X content pack · Phoenix teaser campaign",
    "",
    "**PRELAUNCH TEASER PHASE.** Drafts for review only: nothing is posted or scheduled automatically. No website or preview links, contract addresses, launch dates or token details appear in any approved post or creative.",
    "",
    `${approved} posts are approved in principle for the teaser phase; ${posts.length - approved} are on hold until the official reveal and production verification. Every post still needs your sign-off before it goes out.`,
    "",
    "Generated from `src/studio/contentPack.ts` by `npm run campaign:render`; every figure comes from the live game config. Assets live in `public/campaign/`.",
    "",
  ];
  for (const p of posts) {
    out.push(
      `## Post ${p.n}: ${p.title}`,
      "",
      `**Status:** ${p.status === "approved" ? "APPROVED IN PRINCIPLE (teaser-safe)" : `HOLD. ${p.holdReason}`}  `,
      `**Objective:** ${p.objective}  `,
      `**When:** ${p.slot}  `,
      `**Creative:** \`public/campaign/${p.asset.file}\`${p.altAssets?.length ? ` (also ${p.altAssets.map((a) => `\`${a.file}\``).join(", ")})` : ""}: ${p.asset.description}  `,
      `**CTA:** ${p.cta}`,
      "",
      "```text",
      p.caption,
      "```",
      "",
    );
    if (p.reply) out.push("**Follow-up reply:**", "", "```text", p.reply, "```", "");
    if (p.poll) out.push(`**Poll (optional reply):** ${p.poll.join(" / ")}`, "");
    if (p.thread) {
      out.push("**Optional thread:**", "");
      p.thread.forEach((t, i) => out.push(`${i + 1}.`, "", "```text", t, "```", ""));
    }
  }
  return out.join("\n");
}
