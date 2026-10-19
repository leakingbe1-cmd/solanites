# Handoff to the website builder

Changes the Creature Studio needs in shared code. Nothing here has been changed on the `creature-studio/art-direction` branch. Each item is for the website builder to implement on their own branch.

## 1. Tone down rays and nebula behind replacement art (decision 4)

**Where:** `src/components/creature/CreatureArt.tsx`, `function Aura` (around line 232). It runs for both the vector and the raster branch (`showAura && !silhouette && <Aura …/>`).

**What it draws today:**

| Rarity | Layers |
|---|---|
| all | radial `aura` disc, r = 175, pulsing (`sl-aura-pulse`) |
| Legendary, Secret | 18 spinning rays (`sl-spin-slow`) at opacity 0.7 / 0.5 |
| Mythic | 3 blurred nebula circles (opacity 0.75), a star-field rect (0.55, twinkling), 2 orbit ellipses |
| Epic | 2 spinning dashed rings |

**Requested when a raster stage is shown** (`asset && imageSrc` is truthy), keeping the vector branch as is until its art is replaced:

- Rays: remove, or at most 6–8 very soft rays at opacity ≤ 0.15, not spinning.
- Nebula: opacity ≤ 0.3, no star-field rect (painted Mythics carry their own star-field inside the body).
- Orbits and Epic rings: opacity ≤ 0.3, no spin.
- Keep the base aura disc and the ground shadow; they place the creature in the card.
- Keep `prefers-reduced-motion` behaviour.

A simple way to do this is a `quiet` prop on `Aura` that the raster branch sets.

## 2. Style text in shared data (decision 3)

`src/data/creatureDesigns.json → style.prompt` says "Stylised but physically convincing 3D character". Proposed replacement, matching the art bible:

> Hand-painted 2D creature illustration for a premium creature-collecting game. Clean graphic silhouette, coloured linework that thins in the light, soft painted volume in three values with controlled brush texture. Key light from the upper left, cool rim light from the right. Three-quarter view facing left at eye level. Full body centred, about 80% of the frame. Transparent background; no ground, halo, rays, sparkles, text, logo or frame.

`style.negative` should add: "no 3D render, no logo, no emblem". This also changes the generated `docs/creature-art/prompts.md` after `npm run art:prompts`.

## 3. Logos on creatures (decision 2)

GENESIS's vector renderer (`src/components/creature/species/genesis.tsx`) draws Solana-style bars. Once a glyph is chosen (`docs/creature-studio/glyph/`), the vector fallback should use it too, so the vector and painted versions agree.

## 4. Later: integrating approved art

Not needed yet. When a prototype line is approved, its four files move from `art/creature-studio/<id>/` to `art/creatures/<id>/` and `npm run art:build` publishes them. No component change is required for stills. The animation steps are in `evolution-and-animation.md` §6.
