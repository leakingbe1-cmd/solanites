import "server-only";

/**
 * Each Solanite species' permanent stock identity: one publicly traded company per species.
 *
 * Server only, so tickers never ship in the browser bundle: Mythic and Secret species stay
 * classified, and a ticker would hint at a classified creature's identity. The browser gets a
 * species' link through /api/market/:speciesId, which applies the same discovery rules.
 *
 * Every ticker and exchange was checked against public listings on 19 Oct 2026 (see
 * docs/stock-links.md for sources and the entries flagged for review). Editing this file is
 * the only change needed to remap a species; no UI component holds a ticker.
 *
 * The link is presentation and game flavour only. It never moves money, buys or sells
 * anything, and never changes ownership, rarity, hatch odds, evolution or rewards.
 */

export type Exchange = "NYSE" | "Nasdaq";

export interface StockLink {
  speciesId: string;
  ticker: string;
  company: string;
  exchange: Exchange;
  sector: string;
  /** Why this company suits the creature. */
  connection: string;
  /** How the link shows in the creature's interface (its art and palette never change). */
  visualIdentity: string;
  /** Set when the listing is affected by a pending corporate event and should be re-checked. */
  review?: string;
}

/** Where every price and daily change comes from (see src/server/market/provider.ts). */
export const MARKET_DATA_SOURCE = "Massive (formerly Polygon.io) stock aggregates, US consolidated tape";

const accentChip = (name: string) => `Ticker chip ringed in ${name}'s palette accent; chart area tinted with it. The line and the up/down signal stay neutral.`;

export const STOCK_LINKS: StockLink[] = [
  // Common
  { speciesId: "mossling", ticker: "DE", company: "Deere & Company", exchange: "NYSE", sector: "Industrials · agricultural machinery",
    connection: "The Patient Sprout carries a garden on its back; Deere tends the world's fields.", visualIdentity: accentChip("Mossling") },
  { speciesId: "driftfin", ticker: "RCL", company: "Royal Caribbean Cruises Ltd.", exchange: "NYSE", sector: "Consumer discretionary · cruise lines",
    connection: "A calm, playful wanderer of the open water, like a cruise fleet.", visualIdentity: accentChip("Driftfin") },
  { speciesId: "pallow", ticker: "SNAP", company: "Snap Inc.", exchange: "NYSE", sector: "Communication services · social media",
    connection: "The Pearl Herald carries messages; a small white-feathered herald for the white-ghost messenger.", visualIdentity: accentChip("Pallow") },
  { speciesId: "glimmeray", ticker: "SBUX", company: "Starbucks Corporation", exchange: "Nasdaq", sector: "Consumer discretionary · restaurants",
    connection: "A serene creature of the shallows for the company whose emblem is a siren of the sea.", visualIdentity: accentChip("Glimmeray") },
  { speciesId: "sproutwyrm", ticker: "CMG", company: "Chipotle Mexican Grill, Inc.", exchange: "NYSE", sector: "Consumer discretionary · restaurants",
    connection: "A stubborn, hungry caterpillar of the canopy, always looking for fresh greens.", visualIdentity: accentChip("Sproutwyrm") },
  { speciesId: "frostkit", ticker: "YETI", company: "YETI Holdings, Inc.", exchange: "NYSE", sector: "Consumer discretionary · outdoor equipment",
    connection: "The Little Glacier keeps the cold; YETI is named for the snow creature and sells it.", visualIdentity: accentChip("Frostkit") },

  // Rare
  { speciesId: "abyssal-vael", ticker: "RIG", company: "Transocean Ltd.", exchange: "NYSE", sector: "Energy · offshore drilling",
    connection: "Vael of the Abyssal Trench watches the deep water where Transocean drills.", visualIdentity: accentChip("Vael"),
    review: "Transocean agreed in Feb 2026 to acquire Valaris (expected to close H2 2026). RIG is the acquirer and should keep its listing; re-check after close." },
  { speciesId: "stormquill", ticker: "FDX", company: "FedEx Corporation", exchange: "NYSE", sector: "Industrials · logistics",
    connection: "Thunder's Courier: restless, quick, always delivering.", visualIdentity: accentChip("Stormquill") },
  { speciesId: "duskwing", ticker: "CRWD", company: "CrowdStrike Holdings, Inc.", exchange: "Nasdaq", sector: "Information technology · cybersecurity",
    connection: "The Twilight Sentinel guards in the dark; a winged guardian for the company with the falcon.", visualIdentity: accentChip("Duskwing") },
  { speciesId: "cryovant", ticker: "GLW", company: "Corning Incorporated", exchange: "NYSE", sector: "Information technology · glass and optical materials",
    connection: "The Shard Glider is precise, cold and elegant crystal; Corning makes the glass.", visualIdentity: accentChip("Cryovant") },
  { speciesId: "emberlisk", ticker: "XOM", company: "ExxonMobil Holdings Corporation", exchange: "NYSE", sector: "Energy · integrated oil and gas",
    connection: "Kiln-Hearted and hot-headed: a creature that runs on fire.", visualIdentity: accentChip("Emberlisk") },

  // Epic
  { speciesId: "neonyx", ticker: "NFLX", company: "Netflix, Inc.", exchange: "Nasdaq", sector: "Communication services · streaming",
    connection: "The Lantern Wyrm draws everyone in with a glow in the dark, like a screen at night.", visualIdentity: accentChip("Neonyx") },
  { speciesId: "aurorath", ticker: "DIS", company: "The Walt Disney Company", exchange: "NYSE", sector: "Communication services · entertainment",
    connection: "Dreamy and wise, the Veil of Northern Fire paints the sky with wonder.", visualIdentity: accentChip("Aurorath") },
  { speciesId: "zephrax", ticker: "TSLA", company: "Tesla, Inc.", exchange: "Nasdaq", sector: "Consumer discretionary · electric vehicles",
    connection: "The Coil of Living Current: wild, brilliant, impatient electricity.", visualIdentity: accentChip("Zephrax") },
  { speciesId: "prismara", ticker: "CMCSA", company: "Comcast Corporation", exchange: "Nasdaq", sector: "Communication services · media and broadband",
    connection: "A dazzling prism peacock for the company behind NBC's rainbow peacock and Peacock.", visualIdentity: accentChip("Prismara"),
    review: "Comcast is separating into two companies within about a year (Q2 2026 results). Re-check which company keeps CMCSA and Peacock when the split completes." },
  { speciesId: "nyxara", ticker: "PLTR", company: "Palantir Technologies Inc.", exchange: "Nasdaq", sector: "Information technology · data analytics software",
    connection: "The Ribbon of Dusk is elusive and curious, at home in the shadows: the seeing stone in the dark.", visualIdentity: accentChip("Nyxara") },

  // Legendary
  { speciesId: "aurelion", ticker: "NVDA", company: "NVIDIA Corporation", exchange: "Nasdaq", sector: "Information technology · semiconductors",
    connection: "The Sovereign of the Gilded Slot for the sovereign of AI computing.", visualIdentity: accentChip("Aurelion") },
  { speciesId: "solvanth", ticker: "NEE", company: "NextEra Energy, Inc.", exchange: "NYSE", sector: "Utilities · renewable power",
    connection: "The Sunscale Leviathan coils around a captive sun; NextEra is the largest generator of power from wind and sun.", visualIdentity: accentChip("Solvanth") },
  { speciesId: "pyraurum", ticker: "AMD", company: "Advanced Micro Devices, Inc.", exchange: "Nasdaq", sector: "Information technology · semiconductors",
    connection: "The phoenix that burns, falls and rises again: AMD's famous comeback.", visualIdentity: accentChip("Pyraurum") },
  { speciesId: "aurelith", ticker: "NEM", company: "Newmont Corporation", exchange: "NYSE", sector: "Materials · gold mining",
    connection: "The Gilded Tide wears a shell of gold; Newmont is the world's largest gold miner.", visualIdentity: accentChip("Aurelith") },
  { speciesId: "velynx", ticker: "ADBE", company: "Adobe Inc.", exchange: "Nasdaq", sector: "Information technology · creative software",
    connection: "The Glyphwalker writes in living glyphs; Adobe built the tools of type and image.", visualIdentity: accentChip("Velynx") },
  { speciesId: "thalor", ticker: "JPM", company: "JPMorgan Chase & Co.", exchange: "NYSE", sector: "Financials · banking",
    connection: "The Deepwarden: steadfast, protective, ancient. A fortress in the deep.", visualIdentity: accentChip("Thalor") },

  // Mythic (classified until hatched)
  { speciesId: "astravex", ticker: "GOOGL", company: "Alphabet Inc. (Class A)", exchange: "Nasdaq", sector: "Communication services · search and AI",
    connection: "Omniscient and calm: a stag whose antlers map every star.", visualIdentity: accentChip("Astravex") },
  { speciesId: "orbelith", ticker: "RKLB", company: "Rocket Lab Corporation", exchange: "Nasdaq", sector: "Industrials · space launch and spacecraft",
    connection: "The Celestine Coil circles a world in orbit; Rocket Lab puts things there.", visualIdentity: accentChip("Orbelith") },
  { speciesId: "eventide", ticker: "LLY", company: "Eli Lilly and Company", exchange: "NYSE", sector: "Health care · pharmaceuticals",
    connection: "The Wing of the Last Light is silent, vast and merciful: medicine.", visualIdentity: accentChip("Eventide") },
  { speciesId: "helivane", ticker: "LMT", company: "Lockheed Martin Corporation", exchange: "NYSE", sector: "Industrials · aerospace and defence",
    connection: "The Sunpiercer: a fierce, unyielding raptor of the high sky.", visualIdentity: accentChip("Helivane") },

  // Secret (classified until hatched)
  { speciesId: "genesis", ticker: "COIN", company: "Coinbase Global, Inc.", exchange: "Nasdaq", sector: "Financials · digital asset exchange",
    connection: "Slot Zero, the genesis of the chain, for the exchange that brought crypto to public markets.", visualIdentity: accentChip("GENESIS") },
  { speciesId: "nullborn", ticker: "GME", company: "GameStop Corp.", exchange: "NYSE", sector: "Consumer discretionary · specialty retail",
    connection: "The Unindexed: glitched, curious, inverted. The market's most famous anomaly.", visualIdentity: accentChip("Ø NULLBORN") },
];

export const STOCK_LINK_BY_SPECIES: Record<string, StockLink> = Object.fromEntries(STOCK_LINKS.map((l) => [l.speciesId, l]));

export function stockLinkOf(speciesId: string): StockLink | null {
  // Own properties only: ids like "constructor" or "__proto__" must not resolve to anything.
  return Object.hasOwn(STOCK_LINK_BY_SPECIES, speciesId) ? STOCK_LINK_BY_SPECIES[speciesId] : null;
}
