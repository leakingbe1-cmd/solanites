# Solanites

**Hold Solana. Hatch the extraordinary. The longer you hold, the stronger they grow.**

A front-end prototype for the Solanites holder experience: holders of the token get eggs, the eggs develop while the balance is held, and each one hatches into a collectible creature that keeps evolving as long as the holder keeps holding.

> ⚠️ **Prototype:** wallets, balances, timers and leaderboard data are **simulated mock data**. In the default demo mode nothing is read from or written to Solana, and no tokens, NFTs or on-chain records are created.

## Run locally

Requires Node.js 18.18+ (tested on Node 22).

```bash
npm install
npm run dev          # http://localhost:3000
# or a production build
npm run build && npm start
```

Open **The Hatchery** → **Enter with Demo Wallet**. The demo wallet starts with a mock balance of 52,000 tokens and a pre-grown collection:

| Slot | State |
|---|---|
| 1 | Hatched **Duskwing** "Nightwarden" (Ascendant form) |
| 2 | Hatched **Mossling** (Hatchling form) |
| 3 | Egg **ready to hatch** (click *Hatch Now*) |
| 4 | Egg in Stage 3 (stirring) |
| 5 | Egg in Stage 2 (awakening, cracks showing) |

The **Prototype simulation controls** at the bottom of the Hatchery let you change time speed (real time up to 1 day/second), skip ahead, reset the demo, and drag the mock balance to see what happens when it falls below the threshold or qualifies for another egg. The default speed is 1 hour/second, so the 7-day incubation takes about 3 minutes.

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
- **Evolution grows anatomy.** Antlers branch, quills multiply, wings spread and tendrils lengthen from Hatchling to Apex. The Apex form also gains a halo.
- **Rarity shows in the design.** Commons have simple silhouettes. Legendaries and Mythics are large, ornate or cosmic compositions. The rarity aura adds effects on top.

The full audit and species design matrix are in [`docs/creature-design.md`](docs/creature-design.md).

Eggs (`src/components/egg/EggArt.tsx`) have three shell patterns and five hue sets, chosen by each egg's seed. Cracks appear progressively, the core pulses like a heartbeat, the creature's silhouette shows inside from Stage 3, and each stage has its own animation.

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

## Gameplay rules (prototype assumptions)

All rules are in `src/config/gameConfig.ts`. The How It Works page reads them directly, so it updates when the config changes.

| Rule | Prototype value |
|---|---|
| Total supply | 10,000,000 |
| Tokens per egg | 10,000 (0.1% of supply) |
| Max eggs per wallet | 6 |
| Incubation | 7 days of qualifying hold. Stage 2 at 35%, Stage 3 at 70% |
| Evolution | Hatchling → Fledgling at 14 days → Ascendant at 45 days → Apex at 120 days (holding time after hatching) |
| Rarity weights | Common 60 · Rare 25 · Epic 10 · Legendary 3.8 · Mythic 1 · Secret 0.2 |
| Balance below threshold | `pause`: progress freezes and resumes when the balance is restored. Options: `pause` \| `reset` \| `continue` |
| Which eggs lose backing | The newest first. The oldest N records stay backed when the balance covers N |
| Claim cap | Eggs + creatures owned ≤ ⌊balance / tokensPerEgg⌋ (and ≤ max) |
| Hatching | Manual: the holder triggers the reveal. `manualHatch: false` hatches automatically |
| Egg transfer | `locked` (descriptive only; no transfer flow exists in the prototype) |
| Creature transfer | `transferable-resets-progress` (descriptive only) |
| Rarity | Rolled from a seed when the egg is granted, hidden until it hatches |

## Connecting to Solana later

1. **Token mint**: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SOLANITES_MINT` (and optionally `NEXT_PUBLIC_SOLANA_RPC_URL`).
2. **Wallets**: `services/wallet/injectedWallet.ts` already connects to Phantom, Solflare or Backpack through the injected provider. It is shown as *experimental* in the UI. You can swap in `@solana/wallet-adapter-react` by implementing the `WalletAdapter` interface.
3. **Balances**: `services/token/rpcBalance.ts` reads the SPL balance with `getTokenAccountsByOwner`. With a real wallet, the Hatchery checks this every 60 seconds. This is **for display only**.
4. **Authority**: implement `SolaniteRegistry` (`services/registry/types.ts`) as an API client and replace the reducer's claim, hatch and tick logic in `HatcheryProvider` with calls to it. The UI only reads the context, so it doesn't need to change.

### Production security requirements

The client must never be trusted for eligibility or progression. A production backend should:

- Authenticate wallets with a **signed nonce** (Sign-In With Solana), not just a connection.
- **Snapshot balances on a fixed schedule** (or index token transfers) and run `advance()` from `lib/progression.ts` on the server. The module is pure and has no browser dependencies, so it can be reused there.
- Enforce `tokensPerEgg` and `maxEggsPerWallet` on claims, atomically.
- Roll rarity with **commit-reveal** (or VRF) so results can't be predicted, peeked at or rerolled. The prototype stores `speciesId` on the client, which is acceptable only for a demo.
- Treat `localStorage` and the simulated clock as prototype-only. They are trivial to tamper with.
