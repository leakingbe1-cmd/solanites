# Solanites X gameplay infographics

> **21 Oct update (owner decisions):** infographic **2** (old odds 60/25/10/3.8/1/0.2, Mythic/Secret silhouettes) and **5** (Collection screenshot with Mythic/Secret cards) are RETIRED and must not be posted. Live odds are 40/30/17/8/3.5/1.5: use the art-free odds card on `marketing/plan`. Infographics **1, 3 and 4** are still cleared. Post 1's demo screens must keep their visible "demo" label.

Five infographic posts that follow the "Gameplay Rules" format: a big headline, a structured panel, and enough detail to reward zooming in. Each one teaches one real part of the game. They are drafts for review. Nothing here has been posted or scheduled.

**Rules for this set:**

- Every gameplay statement is checked against the code (sources are listed under each post).
- Anything that is configured but not yet proven on mainnet is left out of the images and captions: egg-earning thresholds, timers, automatic tracking, wallet requirements and claims.
- No links, addresses, scannable codes, dates or launch details.

`build/validate.mjs` enforces these rules on the captions, the rendered text and the OCR'd pixels of every export.

## Files

| # | Post | 4:5 (1440×1800, main) | 1:1 (1440×1440, alternative) |
|---|---|---|---|
| 1 | From egg to Solanite | `export/4x5/01-from-egg-to-solanite.jpg` | `export/1x1/01-from-egg-to-solanite.jpg` |
| 2 | Six tiers. Which will you find? | `export/4x5/02-six-tiers.jpg` | `export/1x1/02-six-tiers.jpg` |
| 3 | Every legend has a beginning | `export/4x5/03-every-legend.jpg` | `export/1x1/03-every-legend.jpg` |
| 4 | Which one are you hatching? | `export/4x5/04-which-one.jpg` | `export/1x1/04-which-one.jpg` |
| 5 | More than just a creature collection | `export/4x5/05-inside-solanites.jpg` | `export/1x1/05-inside-solanites.jpg` |

Paths are relative to `campaign/x-gameplay-infographics/`. Contact sheet: `export/contact-sheet.jpg`. The square versions are separate layouts, not crops: the headline is smaller, the lede is dropped and panels are rearranged, so nothing is cut off.

## Suggested order

One post every day or two, in the numbered order: how hatching works, then rarity, evolution, the reply-bait pick, and finally the look inside. Post 4 is the strongest reply prompt. If replies on post 2 are strong, you can move post 4 up to straight after it.

---

## Post 1 · From egg to Solanite

**Image:** `export/4x5/01-from-egg-to-solanite.jpg`

**Caption**

```text
Every Solanite starts as an egg.

Dormant → Awakening → Stirring → Ready to hatch.

Then you press hatch. The rarity was sealed the moment the egg was created, so nothing you do at the reveal can change it.

What are you hoping is inside yours?
```

**Follow-up reply**

```text
Be honest: do you hatch the second it's ready, or let it sit there glowing for a while first?
```

**Purpose:** Teach the egg lifecycle and the sealed, manual reveal. It builds anticipation without promising any rule about earning eggs or how long they take.

**What the image shows:** the four egg stages, using the site's own egg art (Awakening from 35% incubated, Stirring from 70%), plus two genuine Hatchery demo screens: the charge-up ("Something is breaking through…") and an Epic reveal.

**Sources**

- Stage names: `src/lib/progression.ts` (`EGG_STAGE_NAMES`, `eggStage`).
- 35% and 70% thresholds: `src/config/gameConfig.ts` (`eggs.crackingAt: 0.35`, `eggs.stirringAt: 0.7`).
- The silhouette appears from Stirring: `src/components/egg/EggArt.tsx`; server side, `src/server/tracker/service.ts` (`showSpecies … >= stirringAt`).
- Manual hatch: `gameConfig.policies.manualHatch: true`; `src/app/api/eggs/[id]/hatch/route.ts`.
- Species sealed when the egg is created: `src/server/tracker/service.ts` (the `rollSpecies(seed, …)` result is stored when the egg row is inserted); demo eggs in `src/state/HatcheryProvider.tsx`.
- Screens: Hatchery demo, captured from a local run of the current code (`campaign/x-gameplay-infographics/source/ui/charge.jpg`, `reveal.jpg`).

**Approval status:** Ready for review.

**Outstanding before posting:**

- The screens are from the demo, and the image labels them "Hatchery demo". Confirm you are happy showing demo screens before tracked eggs are live.
- "Sealed when the egg is created" is how the code works. The roll is not yet independently verifiable (commit-reveal is decision 9 in `docs/holder-tracking.md`). The copy deliberately says "can't change it", not "provably fair".

---

## Post 2 · Six tiers. Which will you find?

**Image:** `export/4x5/02-six-tiers.jpg`

**Caption**

```text
Six rarity tiers. The odds per egg:

Common 60%
Rare 25%
Epic 10%
Legendary 3.8%
Mythic 1%
Secret 0.2%

Mythic and Secret species stay classified until someone hatches one.

Which tier are you hunting?
```

**Follow-up reply**

```text
There are only 2 Secret species, and both are classified. Best guess at what they look like?
```

**Purpose:** The data post. It shows the exact odds and tier colours, how many species are in each tier, and the classified mystery at the top.

**Sources**

- Odds: `src/config/gameConfig.ts` (`rarityWeights`: 60 / 25 / 10 / 3.8 / 1 / 0.2, which sum to 100). The roll is weighted by tier, then uniform within the tier: `rollRarity` / `rollSpecies` / `rarityChances` in `src/lib/progression.ts`.
- Tier names, colours and taglines: `src/lib/rarity.ts` (`RARITIES`).
- Species per tier (6 / 5 / 5 / 6 / 4 / 2, 28 total): `src/lib/species.ts`.
- Mythic and Secret are classified until hatched: `src/app/collection/page.tsx` (`discovery(s) === "classified"`). Their art appears only as silhouettes (`CreatureArt silhouette`), the same treatment the site uses.
- Representative art: Mossling, Duskwing, Neonyx and Pyraurum (rows), Aurelion (hero), and the Astravex and GENESIS silhouettes. GENESIS and Astravex are not named anywhere in the image or copy.

**Approval status:** Ready for review. **Needs sign-off on publishing exact odds.**

**Outstanding before posting:**

- **Legendary is 3.8% in the config.** The original Gameplay Rules post and the site's rarity cards round it to 4%. This post uses the exact 3.8%. Decide which figure is public and keep it the same everywhere: the site rounds in `src/components/landing/RarityShowcase.tsx` and on the How It Works bars.
- Confirm the rarity weights are final for launch. The odds are already visible on the site, but publishing them on X makes them a public commitment.

---

## Post 3 · Every legend has a beginning

**Image:** `export/4x5/03-every-legend.jpg`

**Caption**

```text
Pyraurum, Phoenix of the Golden Pyre.

Eggling → Hatchling → Evolved → Ascended.

Every Solanite grows through four forms, and all 28 species have their own drawing for each one. The Ascended form gets a halo.

Which form is your favourite?
```

**Follow-up reply**

```text
Eggling Pyraurum or Ascended Pyraurum. Cute or majestic, pick a side.
```

**Purpose:** Show the evolution system with real art from one species, without inventing requirements, abilities or timing.

**Sources**

- Form names: `src/config/gameConfig.ts` (`evolution.names`: Eggling, Hatchling, Evolved, Ascended).
- Four separately drawn forms per species and the Ascended halo: `src/components/creature/CreatureArt.tsx` (`stage` 0–3, `Halo` when `evo === 3`) and `docs/creature-art/stage-redesign.md`.
- Pyraurum: Legendary, Ember, "Phoenix of the Golden Pyre" (`src/lib/species.ts`). Form descriptions are quoted from `src/data/creatureDesigns.json` (`pyraurum.stages[].summary`).
- Neonyx (Epic) and Frostkit (Common) strips: `src/lib/species.ts`; art from the same renderer.
- All artwork is rendered from the site's own `CreatureArt` component by `build/art.mjs`. No generated imagery is used.

**Approval status:** Ready for review.

**Outstanding before posting:** None for the copy. The image and caption deliberately leave out how or when a creature evolves: evolution timing (30 min / 2 h after maturity) and the Ascension ranks are still listed as decisions 7 and 11 in `docs/holder-tracking.md`.

---

## Post 4 · Which one are you hatching?

**Image:** `export/4x5/04-which-one.jpg`

**Caption**

```text
Three Solanites. You only get to pick one.

1. Pyraurum, the Legendary phoenix
2. Zephrax, the Epic storm dragon
3. Cryovant, the Rare crystal jellyfish

Reply with 1, 2 or 3 and tell us why.
```

**Follow-up reply**

```text
Rarity isn't everything. Would you take a Rare you love over a Legendary you don't?
```

**Purpose:** The easiest possible reply: a number and a reason. It uses three real species from three different tiers, so the choice is about taste, not just rarity.

**Sources**

- Names, epithets, rarities, elements and personality traits: `src/lib/species.ts` (Pyraurum: Legendary, Ember; Zephrax: Epic, Storm; Cryovant: Rare, Crystal).
- Quotes:
  - Pyraurum and Cryovant: their Ascended `summary` in `src/data/creatureDesigns.json`.
  - Zephrax: its `lore` in `src/lib/species.ts`, word for word.
- "Phoenix", "storm dragon" and "crystal jellyfish" come from each species' `silhouette` description in `creatureDesigns.json`.
- All three are shown in their Ascended form, which the cards label.

**Approval status:** Ready for review.

**Outstanding before posting:** None. The post says these species are in the collection, not that anyone can hatch them yet.

---

## Post 5 · More than just a creature collection

**Image:** `export/4x5/05-inside-solanites.jpg`

**Caption**

```text
More than a list of creatures.

Hatch reveals that get bigger the rarer the creature. 28 species to discover, with Mythic and Secret hidden until hatched. Every species in all four forms, with stats and lore.

Hatchery screens are from the demo. What should we show next?
```

**Follow-up reply**

```text
First stop when you get in: the Hatchery or the Collection?
```

**Purpose:** Show the product with genuine screens, so the series ends on something concrete rather than a promise.

**What the image shows:** real screens captured from the current code. Hatchery screens carry the "Hatchery demo" label. No browser chrome, navigation bar, address, wallet or token figures appear in any crop.

**Sources**

- Rarity-scaled reveal: `src/components/hatchery/HatchReveal.tsx`. `CHARGE_MS` runs from 1.8 s for Common to 4.2 s for Secret; rays appear from Epic, a nebula for Mythic, and prism rays for Secret (README, "What's built").
- Collection with rarity, element and status filters, and classified Mythic and Secret species: `src/app/collection/page.tsx`.
- All four forms, stats and lore: `src/components/creature/CreatureDetail.tsx`.
- Screens: `source/ui/reveal.jpg`, `charge.jpg`, `collection.jpg`, `collection-mythic.jpg`, `detail-stages.jpg`.

**Approval status:** Needs your confirmation before posting.

**Outstanding before posting:**

- Confirm the Collection and Hatchery are reachable by the public, in this form, on the day it is posted. I verified them on a local build of the current code, not on the private deployment.
- The caption says nothing about tracking, wallets or claims, and it labels the Hatchery screens as the demo.

---

## Excluded on purpose

These are in the code but are left out of every image and caption until they are confirmed in production or approved:

| Topic | Why it is excluded | Where it lives |
|---|---|---|
| 1,000,000 $SLNT per egg, token supply | Tokenomics confirmation is still decision 6; mainnet tracking has never run | `src/config/eggProgression.ts`, `docs/holder-tracking.md` §5–6 |
| Incubation and growing-up timers (1 min → 12 h) | Decision 11; not verified in production | `eggProgression.incubationScheduleMs`, `initialGrowthScheduleMs` |
| "Automatic on-chain tracking, no wallet needed" | "Not yet run against Solana mainnet" (`docs/holder-tracking.md`, status line) | `src/server/tracker/*`, `/api/holders/:address` |
| Evolution timing and Ascension ranks II–VI | Decisions 7 and 11 (a proposal) | `gameConfig.evolution` |
| Launch fee claims | No refund policy, and payouts are not built | `src/app/claims`, `docs/holder-tracking.md` |
| Leaderboard | Simulated data | `src/data/leaderboard.ts` |
| Mythic and Secret species art and names | Classified on the site until hatched | `src/app/collection/page.tsx` |

## Issues for your review

1. **Legendary 3.8% vs 4%.** See post 2. The earlier Gameplay Rules post rounded it to 4%.
2. **The earlier Gameplay Rules post** publicly stated the egg threshold, the timers and automatic tracking. None of these is verified on mainnet yet (`docs/holder-tracking.md`). This set does not repeat them.
3. **Site observation:** on the Collection page, a faint horizontal glow band runs across the first row of cards in headless Chromium. It shows faintly in the Collection screenshot used in post 5. It may be a GPU-less rendering artefact. Worth checking in a real browser.
4. **Pyraurum's lore** ("…brighter each time its keeper refuses to sell") was deliberately not quoted, because it reads as holding or selling advice. The stage summary is used instead.

## Rebuilding

```bash
npm ci
node campaign/x-gameplay-infographics/build/art.mjs        # re-export creature and egg art from the site's components
node campaign/x-gameplay-infographics/build/render.mjs     # all ten images (fails on clipped cards or overlapping text)
node campaign/x-gameplay-infographics/build/validate.mjs   # privacy, claims, facts, caption length, scannable-code and OCR checks
python3 campaign/x-gameplay-infographics/build/contact_sheet.py
```

Requirements: Playwright's Chromium, `python3` with Pillow and `opencv-python-headless`, and `tesseract`. The UI screens in `source/ui/` were captured from `npm run dev` with the demo (no environment variables, so no chain or database access) and cropped to exclude the navigation bar and the dev-tools badge. To refresh them, capture the same views again; nothing in `build/` fetches anything from the network.
