# Handoff: Creature Biomes & Animations → Creature Art lane

## Scope
A painted biome background and a species-specific idle animation for every creature
(28 species × 4 stages), shown on the homepage, Collection, Hatchery and detail views.

## Done (all pushed; integration went through Website & Preview into design/eclipse-vigil-code)
- feature/creature-biomes `b949248`: 22 public biome plates (Runway, 88 credits, ledger in
  docs/creature-scenes/generation-ledger.md), idle system, 46 part rigs, glow maps, QA scripts.
  `0cecdeb` rig tear fixes (Velynx 3, Neonyx 3); `73deae2` check/build without the plate masters;
  `b949248` glow maps rebuilt from the fbb4ecb art.
- feature/biomes-mythic-secret `2673092`: biomes for Astravex, Orbelith, Eventide, Helivane, GENESIS
  and Nullborn, made with no credits by `scripts/scene-remix.py` (repainted from existing plates).
  Merged as 42d39c4.
- feature/scene-idle-cap `aab0aea`: fixes the Collection idle cost (18–27% → about 0%). Not yet integrated.
- review/creature-biomes-aurelith-skew `01f48b2`: review boards only. Do not integrate.

## How biomes and scenes are built
- Config: `src/lib/creatureScenes.ts`. SCENES has one entry per species: biome (tones, particle, focus,
  lift, calm, floor, soften), anatomy, and idle (body motion, amp, period, part rigs, glow).
  STAGE_FRAMING sets the zoom, light, blur and vignette for each stage.
- Render: `src/components/creature/CreatureScene.tsx` (plate, light wash, floor fade, particles,
  vignette), `IdleArt.tsx` (nested body layers; parts are clip-path polygons of the creature's own art)
  and `scenes.css` (all keyframes; off-screen pause; reduced motion).
- Assets: plate masters live in `art/scenes/<id>/plate.png`, which is gitignored, so only my container
  has them. `node scripts/creature-scenes.mjs build` encodes them to `public/scenes/<id>/plate.webp`
  (1024), derives `glow-<n>.webp` from the shipped creature art, and writes `src/data/creatureScenes.json`.
  Without a master, the committed plate.webp is kept.
- QA: `creature-scenes.mjs check` (plates, glow staleness, canon C5 emission limits);
  `scripts/qa/scene-parts.py` (rig gap ≤ 6px, tear ≤ 3px at both extremes);
  `scene-readability.py` (creature edge contrast on its biome); `scenes-site.mjs` (browser, 33 checks).

## Performance limits found
- Each idle frame used to re-rasterise the blurred plate under the moving creature. Fix: `.sl-biome`
  gets `will-change: transform`, and active card idle layers are promoted.
- No more than CARD_IDLE_CAP = 8 card scenes idle at once (CreatureScene.tsx).
- Cards and the quiet size run one body layer, with no parts, particles or glow.
- Absolute fps in headless Chrome without a GPU means nothing; compare on vs off (the perf check does).

## Open bugs and risks
- feature/scene-idle-cap is not merged yet. Until it is, the desktop perf check fails on the site branch.
- When the creature art changes, glow maps go stale: rerun `creature-scenes.mjs build` (check flags it).
- Rig polygons are fitted to the current paintings. A repaint that moves the silhouette needs scene-parts.py again.
- Eventide's Hatchling has never been painted, so it stays a still vector drawing on its biome.

## Pending owner decisions
- Mythic and Secret plates are free remixes. Painting them like the other 22 would cost about 24 Runway credits.
- Canon W2 forbids nebula blobs, so Astravex has no nebula sky unless the owner relaxes the rule.
- Creature Studio's round-2 art (ee43c64) was on hold. If it is approved, rebuild the glow maps.

## Gotchas
- Tailwind v4 utilities are layered, and scenes.css is not. Never set `position` in scenes.css (CreatureScene adds it).
- Glow maps must stay within the C5 limits (Common 3%, Rare 5%, Epic and Legendary 10%, Mythic 15%).
  Raise `glowLevel` to shrink a map.
- A part polygon whose edge cuts through solid art splits it (the "tear"). Keep cut edges on the hinge line.
- Browser freeze tests must account for negative animation delays.

## Next steps
1. Integrate feature/scene-idle-cap (aab0aea) into the site branch and re-run scenes-site.mjs.
2. After any art change: `node scripts/creature-scenes.mjs build`, then `check`, then `scene-parts.py`.
3. Optional: repaint the six Mythic and Secret plates (owner decision above).
