# Solanites

**Discover your creature. Hatch the extraordinary. Watch your Solanite grow stronger through its evolution.**

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

The **Prototype simulation controls** at the bottom of the Hatchery let you change time speed (real time up to 1 day/second), skip ahead, reset the demo, and drag the mock balance to see what happens when it falls below the threshold or qualifies for another egg. Demo eggs follow the real per-egg schedules (incubation 1 min, 5 min, 15 min, 1 h, 6 h, then 12 h; growing up 1 min, 5 min, 15 min, 1 h, 3 h, then 6 h).

Sound is off by default; turn it on with the speaker button in the nav. All sounds are synthesized with Web Audio, so there are no audio files.

## What's built

- **Landing page**: hero egg with pointer parallax and particles, a strip of creatures, a showcase of the six rarities with live hatch rates, the five-stage lifecycle and the three-step explanation.
- **Hatchery**: wallet and eligibility status, egg cards with live progress, time held and time left. Click an egg for the stage stepper, progress ring, timers and sealed rarity. Also: claiming eggs (capped by balance), dormant and paused states, the hatch reveal sequence, creature cards with evolution progress, and renaming creatures.
- **Hatch reveal**: a charge-up that lasts longer for rarer creatures, cracking sounds, a flash and particle burst, then the rarity reveal. Epic and above get light rays, Mythic gets a nebula, and Secret gets prism rays and a glitch effect. Each rarity has its own chord.
- **Collection**: all 28 species with rarity, element and discovery filters, plus a detail view with all four evolution forms, stats, personality and lore. Mythic and Secret species stay hidden until you hatch one.
- **How It Works**: the three steps, the lifecycle, a **live rules table generated from the config**, the hatch probabilities, and notes on how a production version would be secured.
- **Leaderboard**: Most Evolved, Longest Holders and Rarest Discoveries, with a podium. Uses deterministic simulated data.

### Creature artwork

The creatures are original vector art drawn in code. There are no image files.

- **One body plan per species.** All 24 are different: a leaf-armoured quadruped, a sail-finned eel, a feather-ringed orb, a manta, an arching inchworm, a crystal fox, a swan-necked serpent, a stilt-legged bird, a moth, a glass jellyfish, an armoured salamander, an angler-wyrm, a sky whale, a ring-coiled serpent, a prism peacock, a rearing dragon, a leviathan around a sun, a phoenix in flight, a gilded turtle, a star-antlered stag, a ringed planet-being, an eclipse dragonfly, a polyhedron construct and an inverted nine-tailed fox.
- **Shared rendering kit** (`src/components/creature/kit.tsx`). It keeps them in one universe: one key light, the same gradient materials, the same eye construction and exactly one Solgem per creature.
- **Four separately drawn forms.** Every species has its own Eggling, Hatchling, Evolved and Ascended drawing (see `docs/creature-art/stage-redesign.md`). The Ascended form also gains a halo.
- **Rarity shows in the design.** Commons have simple silhouettes. Legendaries and Mythics are large, ornate or cosmic compositions. The rarity aura adds effects on top.

The full audit and species design matrix are in [`docs/creature-design.md`](docs/creature-design.md).

Eggs (`src/components/egg/EggArt.tsx`) have three shell patterns and five hue sets, chosen by each egg's seed. Cracks appear progressively, the core pulses like a heartbeat, the creature's silhouette shows inside from Stage 3, and each stage has its own animation.

## First-visit intro

A short, skippable intro (`src/components/intro/`) plays on a first visit that lands on `/` or `/hatchery`. Deep links to other pages never show it. Entering or skipping stores a non-sensitive `solanites:intro:v1` flag in localStorage, so later visits go straight in. It respects reduced motion and has no audio.

- Replay: **Replay intro** in the footer or on the Hatchery.
- Review on any deployment: add `?intro=1` to the URL (or `?intro=0` to suppress it).

## Project structure

```
src/
  config/
    gameConfig.ts        ← ALL gameplay rules (tokens/egg, durations, rarity weights, policies)
    chain.ts             ← token mint + RPC URL from env vars
  lib/
    progression.ts       ← pure rules engine: advance(), eggStage(), evolutionOf(), rollSpecies()
    species.ts           ← the 28 species (palette, archetype, lore, stats)
    rarity.ts, rng.ts, format.ts, sound.ts
  services/
    wallet/              ← WalletAdapter interface, demoWallet, injectedWallet (experimental)
    token/               ← TokenBalanceProvider interface, MockBalanceProvider, RpcBalanceProvider
    registry/types.ts    ← SolaniteRegistry interface: the future server authority
  state/HatcheryProvider.tsx  ← prototype state + simulated clock (acts as a local registry)
  components/
    creature/            ← CreatureArt (shell), kit.tsx (shared look), species/* (one renderer per species)
    egg/, hatchery/, landing/, layout/, ui/
  data/leaderboard.ts    ← simulated leaderboard
  app/                   ← Next.js routes: / /hatchery /collection /how-it-works /leaderboard
```

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, self-hosted fonts (Unbounded, Inter, JetBrains Mono).

## Gameplay rules

Egg rules are in `src/config/eggProgression.ts`; everything else (rarity, evolution, stage thresholds) is in `src/config/gameConfig.ts`. The How It Works page reads both, so it updates when the config changes.

| Rule | Value |
|---|---|
| Total supply | 1,000,000,000 $SLNT |
| Tokens per egg | 1,000,000 (0.1% of supply). Eggs = verified balance ÷ 1,000,000, rounded down |
| Max eggs per wallet | No cap |
| Incubation | Egg 1: 1 min · egg 2: 5 min · egg 3: 15 min · egg 4: 1 h · egg 5: 6 h · egg 6 onwards: 12 h. One at a time (`sequential`), on the server clock (`eggProgression.incubationScheduleMs`) |
| Growing up | A hatched Eggling becomes a fully grown Hatchling after: creature 1: 1 min · 2: 5 min · 3: 15 min · 4: 1 h · 5: 3 h · 6 onwards: 6 h of qualifying holding, counted from when its egg hatched (`eggProgression.initialGrowthScheduleMs`). The first egg is therefore hatched at 1:00 and fully grown at 2:00 |
| Balance drops | Earned eggs are kept and keep incubating; new eggs need tokens that haven't earned one |
| Transfers | Tokens that earned an egg carry that "credit" to the receiving wallet, so they can't earn it twice |
| Evolution | Counted from maturity: Evolved after 30 min more qualifying holding, Ascended after 2 h, then Ascended II at 8 h, III at 24 h, IV at 3 days, V at 7 days, VI at 30 days (`gameConfig.evolution`) |
| Rarity weights | Common 40 · Rare 30 · Epic 17 · Legendary 8 · Mythic 3.5 · Secret 1.5 |
| Hatching | Manual reveal; the outcome is sealed on the server when the egg is earned |
| Holder distribution | Planned: 2 hours after launch, the developer supply allocated for redistribution divided equally among eligible holders. Terms not yet published; not implemented. The page is hidden until launch |

## Holder tracking, eggs and holder rewards

- **Eggs (no wallet connection):** the server tracks every holder from Solana (`/api/cron/sync`, `/api/webhooks/solana`), issues eggs into Postgres and serves them at `GET /api/holders/:address`. The Hatchery's **Find my eggs** takes a public address.
- **Holder rewards (`/rewards`, hidden until launch):** presents the planned holder distribution (`src/config/holderDistribution.ts`). While `REWARDS_PAGE_LIVE` is off the page answers 404 (`/claims` redirects there) and nothing links to it. Terms the owner hasn't set stay hidden. **Nothing distributes yet**: see "Holder distribution" in `docs/holder-tracking.md` for what is still needed. The earlier launch-fee claim backend (`/api/claims/*`) remains in the code, unused by the site.

Architecture, audit, configuration (env checklist, scheduler, `/api/health`), staging plan, decisions still needed and limitations: [`docs/holder-tracking.md`](docs/holder-tracking.md).

```bash
npm test               # 165 tests (+3 real-Postgres tests when TEST_DATABASE_URL is set): tracker, claims, routes, remediation, progression
npm run dev:fixtures   # the site with local fixture holders (labelled as fixture data; refused in production)
```

