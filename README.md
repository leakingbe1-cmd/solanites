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

- **Landing page**: a single lit hero egg on a plinth with subtle pointer parallax, a slow procession of creatures, a showcase of the six rarities with live hatch rates, the five-stage lifecycle and the three-step explanation.
- **Hatchery**: a status line (balance, eligibility, collection, next egg) above an incubation chamber, where the selected egg sits alone under the light with its stage stepper, progress dial, timers and sealed rarity. A rack of egg slots below lets you choose which egg is in the chamber. Also: claiming eggs (capped by balance), dormant and paused states, the hatch reveal sequence, creature cards with evolution progress, and renaming creatures.
- **Hatch reveal**: darkness and a single light. The egg trembles for longer the rarer it is, the shell gives way in a measured flash, and the creature emerges from shadow under a light sweep. Fine particles appear only for Epic and above. Legendary draws a gilded ring, Mythic fades in a starfield, and Secret inverts the flash. Each rarity has its own chord.
- **Collection**: all 12 species with rarity, element and discovery filters, plus a detail view with all four evolution forms, stats, personality and lore. Mythic and Secret species stay hidden until you hatch one.
- **How It Works**: the three steps, the lifecycle, a **live rules table generated from the config**, the hatch probabilities, and notes on how a production version would be secured.
- **Leaderboard**: Most Evolved, Longest Holders and Rarest Discoveries, with a podium. Uses deterministic simulated data.

### Art direction

The site has the feel of an obsidian archive: near-black grounds, platinum type set in Cormorant Garamond and Inter, and one restrained violet/electric-blue light. Hairline rules replace cards and glows. Effects are kept for creatures and for the hatching moment.

### Creature artwork

There are 12 species, two per rarity tier. Every species has **its own body plan**, so rarity comes from anatomy and material, not from recolouring:

| Tier | Species | Body plan |
|---|---|---|
| Common | Mossling | Low armoured shellback; a garden grows on its slate shell |
| Common | Driftfin | Veil-finned aerial eel |
| Rare | Duskwing | Obsidian raptor perched on a ledge; its wings unfold only at Apex |
| Rare | Cryovant | Stag with living crystal antlers and spine |
| Epic | Neonyx | Rising hooded serpent with lantern organs |
| Epic | Aurorath | Sky-ray with an aurora held inside its membranes |
| Legendary | Aurelion | The archive's only true dragon: obsidian and gilded armour |
| Legendary | Pyraurum | Crane-like phoenix crowned with blade feathers |
| Mythic | Astravex | No continuous body: a platinum mask and armour orbiting a star |
| Mythic | Orbelith | Leviathan whose body is a window into space |
| Secret | GENESIS | Geometric being built from three slanted bars |
| Secret | NULLBORN | Inverted, many-eyed moth |

All the art is vector, drawn in code (`src/components/creature/species/*`). A shared kit (`kit.tsx`) gives every species the same lighting: key light from the upper left, a rim light, small intense eyes and a surface texture. Evolution grows anatomy (crests, crystals, armour, feathers, orbiting plates) rather than just scaling the drawing.

The eggs (`src/components/egg/EggArt.tsx`) are drawn as physical obsidian. The surface relief comes from an SVG lighting filter, with a fine platinum inlay and fissures that hold more light at each stage.

**Asset note:** these are hand-built vector illustrations, not painted or 3D-rendered artwork. For a launch-grade collection, commission painted or rendered key art for each species in this same art direction, starting with the Legendary, Mythic and Secret tiers. `CreatureArt` can then switch to those images, keeping the vector versions as small thumbnails.

Species retired in the redesign are mapped to a replacement of the same rarity (`LEGACY_SPECIES` in `src/lib/species.ts`), so collections saved before the redesign still load. Rarity weights and every other rule are unchanged.

## Project structure

```
src/
  config/
    gameConfig.ts        ← ALL gameplay rules (tokens/egg, durations, rarity weights, policies)
    chain.ts             ← token mint + RPC URL from env vars
  lib/
    progression.ts       ← pure rules engine: advance(), eggStage(), evolutionOf(), rollSpecies()
    species.ts           ← the 12 species (body plan, palette, lore, stats)
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

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, self-hosted fonts (Cormorant Garamond, Inter, JetBrains Mono).

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
