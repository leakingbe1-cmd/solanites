# Solanites

**Hold Solana. Hatch the extraordinary. The longer you hold, the stronger they grow.**

A front-end prototype for the Solanites holder experience: holders of the token get eggs, the eggs develop while the balance is held, and each one hatches into a collectible creature that keeps evolving as long as the holder keeps holding.

> ⚠️ **Eggs are tracked automatically from on-chain data** once the server is configured (mint, RPC, database). See [`docs/holder-tracking.md`](docs/holder-tracking.md). The demo wallet and leaderboard are **simulated mock data**, and no tokens, NFTs or on-chain records are ever created.

## Run locally

Requires Node.js 18.18+ (tested on Node 22).

```bash
npm install
npm run dev          # http://localhost:3000
# or a production build
npm run build && npm start
```

Open **The Hatchery** → **Explore the demo**. The demo wallet starts with a mock balance of 5,200,000 tokens and a pre-grown collection:

| Slot | State |
|---|---|
| 1 | Hatched **Duskwing** "Nightwarden" (Ascendant form) |
| 2 | Hatched **Mossling** (Hatchling form) |
| 3 | Egg **ready to hatch** (click *Hatch Now*) |
| 4 | Egg in Stage 3 (stirring) |
| 5 | Egg in Stage 2 (awakening, cracks showing) |

The **Prototype simulation controls** at the bottom of the Hatchery let you change time speed (real time up to 1 day/second), skip ahead, reset the demo, and drag the mock balance to see what happens when it falls below the threshold or qualifies for another egg. Demo eggs follow the real per-egg schedule (5 min, 6 h, 24 h, 48 h, then 72 h).

Sound is off by default; turn it on with the speaker button in the nav. All sounds are synthesized with Web Audio, so there are no audio files.

## What's built

- **Landing page**: hero egg with pointer parallax and particles, a strip of creatures, a showcase of the six rarities with live hatch rates, the five-stage lifecycle and the three-step explanation.
- **Hatchery**: wallet and eligibility status, egg cards with live progress, time held and time left. Click an egg for the stage stepper, progress ring, timers and sealed rarity. Also: claiming eggs (capped by balance), dormant and paused states, the hatch reveal sequence, creature cards with evolution progress, and renaming creatures.
- **Hatch reveal**: a charge-up that lasts longer for rarer creatures, cracking sounds, a flash and particle burst, then the rarity reveal. Epic and above get light rays, Mythic gets a nebula, and Secret gets prism rays and a glitch effect. Each rarity has its own chord.
- **Collection**: all 24 species with rarity, element and discovery filters, plus a detail view with all four evolution forms, stats, personality and lore. Mythic and Secret species stay hidden until you hatch one.
- **How It Works**: the three steps, the lifecycle, a **live rules table generated from the config**, the hatch probabilities, and notes on how a production version would be secured.
- **Leaderboard**: Most Evolved, Longest Holders and Rarest Discoveries, with a podium. Uses deterministic simulated data.

### Creature artwork

The creatures are original vector art drawn by `src/components/creature/CreatureArt.tsx`. There are no external image files.

- **Four body types**: Drake, Serpent (coiled), Manta (cosmic ray) and Phoenix (feathered wyrm).
- **Built from parts**: horn styles, markings (stripes, runes, spots, veins, constellations), a palette and an elemental type per species.
- **Shared Solgem**: every creature has the same gem on its forehead, so the collection reads as one family.
- **Four evolution forms**: Hatchling (large head, horn nubs) → Fledgling → Ascendant → Apex (full horns and a halo).
- **Effects by rarity**:
  - Epic: glowing rings and runes.
  - Legendary: rotating golden rays and sparkles.
  - Mythic: nebula, starfield, orbit rings and star-filled bellies.
  - Secret: prism rays, glitch effect and scanlines.

Eggs (`src/components/egg/EggArt.tsx`) have three shell patterns and five hue sets, chosen by each egg's seed. Cracks appear progressively, the core pulses like a heartbeat, the creature's silhouette shows inside from Stage 3, and each stage has its own animation (wobble, shake, then a violent shake while hatching).

## Project structure

```
src/
  config/
    gameConfig.ts        ← ALL gameplay rules (tokens/egg, durations, rarity weights, policies)
    chain.ts             ← token mint + RPC URL from env vars
  lib/
    progression.ts       ← pure rules engine: advance(), eggStage(), evolutionOf(), rollSpecies()
    species.ts           ← the 24 species (palette, archetype, lore, stats)
    rarity.ts, rng.ts, format.ts, sound.ts
  services/
    wallet/              ← WalletAdapter interface, demoWallet, injectedWallet (experimental)
    token/               ← TokenBalanceProvider interface, MockBalanceProvider, RpcBalanceProvider
    registry/types.ts    ← SolaniteRegistry interface: the future server authority
  state/HatcheryProvider.tsx  ← prototype state + simulated clock (acts as a local registry)
  components/            ← creature/, egg/, hatchery/, landing/, layout/, ui/
  data/leaderboard.ts    ← simulated leaderboard
  app/                   ← Next.js routes: / /hatchery /collection /how-it-works /leaderboard
```

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, self-hosted fonts (Unbounded, Inter, JetBrains Mono).

## Gameplay rules

Egg rules are in `src/config/eggProgression.ts`; everything else (rarity, evolution, stage thresholds) is in `src/config/gameConfig.ts`. The How It Works page reads both, so it updates when the config changes.

| Rule | Value |
|---|---|
| Total supply | 1,000,000,000 SOLITE |
| Tokens per egg | 1,000,000 (0.1% of supply). Eggs = verified balance ÷ 1,000,000, rounded down |
| Max eggs per wallet | No cap |
| Incubation | Egg 1: 5 min · egg 2: 6 h · egg 3: 24 h · egg 4: 48 h · egg 5 onwards: 72 h. One at a time (`sequential`), on the server clock |
| Balance drops | Earned eggs are kept and keep incubating; new eggs need tokens that haven't earned one |
| Transfers | Tokens that earned an egg carry that "credit" to the receiving wallet, so they can't earn it twice |
| Evolution | Hatchling → Fledgling at 14 days → Ascendant at 45 days → Apex at 120 days |
| Rarity weights | Common 60 · Rare 25 · Epic 10 · Legendary 3.8 · Mythic 1 · Secret 0.2 |
| Hatching | Manual reveal; the outcome is sealed on the server when the egg is earned |
| Launch fee claims | Open 6 hours after launch; the only place a wallet is connected |

## Holder tracking, eggs and fee claims

- **Eggs (no wallet connection):** the server tracks every holder from Solana (`/api/cron/sync`, `/api/webhooks/solana`), issues eggs into Postgres and serves them at `GET /api/holders/:address`. The Hatchery's **Find my eggs** takes a public address.
- **Fee claims:** `/claims` opens 6 hours after `SOLANITES_LAUNCH_AT`. The wallet signs a message, verified on the server; one claim per wallet per period. **No refund policy is defined yet, so no amount is quoted, and payouts are not implemented.**

Architecture, audit, configuration, decisions still needed and limitations: [`docs/holder-tracking.md`](docs/holder-tracking.md).

```bash
npm test               # 103 tests: tracker, claims, routes, eligibility, progression (embedded Postgres + fixture chain)
npm run dev:fixtures   # the site with local fixture holders (labelled as fixture data; refused in production)
```

