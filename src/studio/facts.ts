/**
 * Verified facts for promotional content.
 *
 * Every claim the Content Studio, the X content pack and the rendered adverts
 * make comes from here, and every value here is read from the live game
 * config or catalogue, never typed in by hand. If a rule changes in
 * `gameConfig`, `eggProgression` or `species`, the marketing copy follows.
 *
 * Deliberately NOT claimable: the leaderboard (simulated data), fee claims and
 * payouts (no refund policy, payouts not implemented), prices, partnerships,
 * launch dates, holder counts or any other figure the project can't verify.
 */

import { incubationMsFor } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { CLASSIFIED_RARITIES } from "@/lib/discovery";
import { formatNumber, formatSpan } from "@/lib/format";
import { EGG_STAGE_NAMES, rarityChances } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, SPECIES_BY_ID, speciesOfRarity } from "@/lib/species";

/**
 * Campaign phase. While this is "prelaunch" (the teaser phase) nothing may
 * reveal the website or the coin: URLs, preview links, contract addresses,
 * launch dates and token details are refused by the renderer, the copy
 * generator and the tests, and claims that need live egg tracking are held.
 * Switching to "launch" is a deliberate, reviewed code change: that change is
 * the authorisation for the official reveal.
 */
export const PHASE: "prelaunch" | "launch" = "prelaunch";
export const PRELAUNCH = PHASE === "prelaunch";

/** Teaser calls to action approved for the prelaunch phase. */
export const TEASER_CTAS = ["Follow for the reveal", "The story begins soon", "Which creature would you hatch?"] as const;

/**
 * No website URL is printed by default: the current campaign is a teaser for
 * X and the domain is going to change. Set one in the Studio's URL field once
 * it is final, and every caption and creative picks it up.
 */
export const displayUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const forms = gameConfig.evolution.names;
const chances = rarityChances(gameConfig);
const elements = Array.from(new Set(SPECIES.map((s) => s.element)));
const symbol = gameConfig.token.symbol;
const ascensionRanks = gameConfig.evolution.ascensionRanksMs.length;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export const FACTS = {
  speciesCount: SPECIES.length,
  rarityCount: RARITY_ORDER.length,
  rarityLabels: RARITY_ORDER.map((r) => RARITIES[r].label),
  /** Normalised hatch chances, as shown on the How It Works page. */
  rarityChances: RARITY_ORDER.map((r) => ({ id: r, label: RARITIES[r].label, color: RARITIES[r].color, chance: chances[r], species: speciesOfRarity(r).length })),
  classified: CLASSIFIED_RARITIES.map((r) => RARITIES[r].label),
  forms,
  formCount: forms.length,
  finalRank: ROMAN[ascensionRanks] ?? String(ascensionRanks + 1),
  elements,
  eggStages: EGG_STAGE_NAMES.filter(Boolean),
  symbol,
  tokensPerEgg: formatNumber(gameConfig.token.tokensPerEgg),
  maxEggs: gameConfig.eggs.maxEggsPerWallet,
  firstIncubation: formatSpan(incubationMsFor(1)),
  manualHatch: gameConfig.policies.manualHatch,
  phoenix: SPECIES_BY_ID["pyraurum"],
} as const;

const RARITY_LIST = `${FACTS.rarityLabels.slice(0, -1).join(", ")} and ${FACTS.rarityLabels.at(-1)}`;
const FORM_LIST = `${forms.slice(0, -1).join(", ")} and ${forms.at(-1)}`;

export type FeatureId =
  | "species"
  | "rarity"
  | "loop"
  | "evolution"
  | "eggs"
  | "walletless"
  | "sealed"
  | "classified"
  | "incubation"
  | "ascension"
  | "rename"
  | "demo"
  | "phoenix";

export interface Feature {
  id: FeatureId;
  /** Short label for the feature picker. */
  label: string;
  /** Overlay callout for creatives. `*word*` is drawn in gold. Keep under ~26 characters. */
  callout: string;
  /** One factual sentence for captions and threads. */
  line: string;
  /** Where the claim is verified in the codebase. */
  source: string;
  /**
   * Why this can't be promoted during the teaser phase, if it can't: it needs
   * live holder tracking in production (unverified) or would reveal the site.
   */
  heldUntilLaunch?: string;
}

const NEEDS_TRACKING = "Needs live egg tracking in production (mint, Solana data, database), which is not verified.";

export const FEATURES: Record<FeatureId, Feature> = {
  species: {
    id: "species",
    label: `${FACTS.speciesCount} species`,
    callout: `*${FACTS.speciesCount}* SPECIES TO DISCOVER`,
    line: `${FACTS.speciesCount} species to discover across ${elements.length} elements.`,
    source: "src/lib/species.ts",
  },
  rarity: {
    id: "rarity",
    label: `${FACTS.rarityCount} rarity tiers`,
    callout: `*${FACTS.rarityCount}* RARITY TIERS`,
    line: `${FACTS.rarityCount} rarity tiers: ${RARITY_LIST}.`,
    source: "src/lib/rarity.ts",
  },
  loop: {
    id: "loop",
    label: "Hatch, collect, evolve",
    callout: "HATCH. COLLECT. *EVOLVE.*",
    line: "Hatch your eggs, build your collection and watch every creature evolve.",
    source: "src/app/hatchery, src/app/collection",
  },
  evolution: {
    id: "evolution",
    label: `${FACTS.formCount} evolution forms`,
    callout: `*${FACTS.formCount}* FORMS TO GROW INTO`,
    line: `Every species has ${FACTS.formCount} separately drawn forms: ${FORM_LIST}.`,
    source: "src/config/gameConfig.ts → evolution.names",
  },
  eggs: {
    id: "eggs",
    label: `1 egg per ${FACTS.tokensPerEgg} ${symbol}`,
    callout: `*1 EGG* PER ${FACTS.tokensPerEgg} ${symbol}`,
    line: `Every ${FACTS.tokensPerEgg} ${symbol} you hold backs one egg${FACTS.maxEggs === null ? ", with no cap per wallet" : ""}.`,
    source: "src/config/eggProgression.ts → tokensPerEgg",
    heldUntilLaunch: NEEDS_TRACKING,
  },
  walletless: {
    id: "walletless",
    label: "No wallet needed to explore",
    callout: "*NO WALLET* NEEDED TO EXPLORE",
    line: "No wallet needed to explore. Eggs are tracked from public on-chain balances.",
    source: "src/app/page.tsx, src/app/api/holders",
    heldUntilLaunch: "Describes using the website, which is not revealed yet.",
  },
  sealed: {
    id: "sealed",
    label: "Rarity sealed when earned",
    callout: "RARITY *SEALED* AT BIRTH",
    line: "Each egg's rarity is sealed the moment it's earned. You find out when it hatches.",
    source: "README → Hatching: outcome sealed on the server",
    heldUntilLaunch: NEEDS_TRACKING,
  },
  classified: {
    id: "classified",
    label: `${FACTS.classified.join(" & ")} stay hidden`,
    callout: `*${FACTS.classified.join(" & ").toUpperCase()}*: CLASSIFIED`,
    line: `${FACTS.classified.join(" and ")} species stay classified in the Collection until you hatch one.`,
    source: "src/lib/discovery.ts",
  },
  incubation: {
    id: "incubation",
    label: `First egg: ${FACTS.firstIncubation}`,
    callout: `FIRST EGG: *${FACTS.firstIncubation.toUpperCase()}*`,
    line: `Your first egg incubates in ${FACTS.firstIncubation}. Later eggs take longer.`,
    source: "src/config/eggProgression.ts → incubationScheduleMs",
    heldUntilLaunch: NEEDS_TRACKING,
  },
  ascension: {
    id: "ascension",
    label: `Ascended ranks to ${FACTS.finalRank}`,
    callout: `ASCEND TO RANK *${FACTS.finalRank}*`,
    line: `After ${forms.at(-1)}, keep holding to climb Ascension ranks II to ${FACTS.finalRank}.`,
    source: "src/config/gameConfig.ts → ascensionRanksMs",
    heldUntilLaunch: NEEDS_TRACKING,
  },
  rename: {
    id: "rename",
    label: "Name your creature",
    callout: "*NAME* YOUR SOLANITE",
    line: "Every creature you hatch can be given its own name.",
    source: "src/components/hatchery/CreatureCard.tsx",
  },
  demo: {
    id: "demo",
    label: "Hatchery demo",
    callout: "TRY THE *HATCHERY* DEMO",
    line: "Try the Hatchery with a demo wallet. No tokens, no sign-up.",
    source: "src/services/wallet/demoWallet.ts",
    heldUntilLaunch: "Points people to the website, which is not revealed yet.",
  },
  phoenix: {
    id: "phoenix",
    label: `${FACTS.phoenix.name}, the ${RARITIES[FACTS.phoenix.rarity].label} phoenix`,
    callout: `*${FACTS.phoenix.name.toUpperCase()}* · ${RARITIES[FACTS.phoenix.rarity].label.toUpperCase()}`,
    line: `${FACTS.phoenix.name}, ${FACTS.phoenix.epithet}, is one of ${speciesOfRarity(FACTS.phoenix.rarity).length} ${RARITIES[FACTS.phoenix.rarity].label} species.`,
    source: "src/lib/species.ts → pyraurum",
  },
};

export const FEATURE_IDS = Object.keys(FEATURES) as FeatureId[];
/** Features that may be promoted in the current phase. */
export const featureAllowed = (id: FeatureId) => !(PRELAUNCH && FEATURES[id].heldUntilLaunch);
