# Handoff to the website builder

> **Updated for the approved canon (2026-10-19):** `docs/canon/solanites-art-canon.md`. Items 1, 2 and 5–7 below are required by the canon's website rules W1–W3.

Changes the Creature Studio needs in shared code. Nothing here has been changed on the `creature-studio/art-direction` branch. Each item is for the website builder to implement on their own branch.

## 1. No rays, nebula or aura behind painted art (decision 4, canon W2)

**Where:** `src/components/creature/CreatureArt.tsx`, `function Aura` (around line 232). It runs for both the vector and the raster branch (`showAura && !silhouette && <Aura …/>`).

**What it draws today:**

| Rarity | Layers |
|---|---|
| all | radial `aura` disc, r = 175, pulsing (`sl-aura-pulse`) |
| Legendary, Secret | 18 spinning rays (`sl-spin-slow`) at opacity 0.7 / 0.5 |
| Mythic | 3 blurred nebula circles (opacity 0.75), a star-field rect (0.55, twinkling), 2 orbit ellipses |
| Epic | 2 spinning dashed rings |

**Required by canon W2 when a raster stage is shown** (`asset && imageSrc` is truthy): no rays, nebula, star-field, orbits, rings or aura disc behind painted artwork. The vector fallback may keep its current treatment until its stage is replaced.

*(Superseded: the earlier "tone down to ≤ 0.15 / ≤ 0.3 and keep the base aura disc and ground shadow" wording.)*

## 2. Style text in shared data (decision 3)

`src/data/creatureDesigns.json → style.prompt` says "Stylised but physically convincing 3D character". Proposed replacement, matching the art bible:

> Hand-painted 2D creature illustration for a premium creature-collecting game. Clean graphic silhouette, coloured linework that thins in the light, soft painted volume in three values with controlled brush texture. Warm gold key light (#FFE2A8) from the upper left, restrained violet rim light from behind. Three-quarter view facing left at eye level. Full body centred at the stage framing target (45/60/78/88%). Transparent background; no ground, shadow, horizon, halo, rays, sparkles, lightning, text, logo or frame.

`style.negative` should add: "no 3D render, no logo, no emblem". This also changes the generated `docs/creature-art/prompts.md` after `npm run art:prompts`.

## 3. Logos on creatures (decision 2)

GENESIS's vector renderer (`src/components/creature/species/genesis.tsx`) draws Solana-style bars. Once a glyph is chosen (`docs/creature-studio/glyph/`), the vector fallback should use it too, so the vector and painted versions agree.

## 4. Later: integrating approved art

Not needed yet. When a prototype line is approved, its four files move from `art/creature-studio/<id>/` to `art/creatures/<id>/` and `npm run art:build` publishes them. No component change is required for stills. The animation steps are in `evolution-and-animation.md` §6.

## 5. No ground or shadow under creatures, eggs or the phoenix (canon W1)

`CreatureArt.tsx` draws a blurred ground-shadow ellipse (`<ellipse cx="200" cy="376" … filter=blur8>`) in both the raster and vector branches. Canon W1 removes contact shadows, floor glints, pedestals and horizon lines from the website presentation as well as from the art. Any Threshold horizon line, egg pedestal or floor glint planned on `design/creative-direction` or `design/eclipse-vigil-code` is superseded.

## 6. No decorative halos (canon C6, W2)

`CreatureArt.tsx` adds `<Halo>` to every Ascended vector form (`evo === 3`). Under the canon no species has a decorative halo, Pyraurum included. Removing it changes how the shipped vector fallback looks, so it is listed here for the website workstream to schedule rather than changed from this branch.

## 7. Phoenix hero (canon W3)

The existing phoenix stays live until a hand-painted replacement is separately approved. Free layout tests and a CSS-only proposal using the existing image are in `docs/canon/phoenix-layout/`. The proposal's CSS is a candidate change for the website workstream, not applied here.
