# Evolution and animation guidelines

Milestone A item 6, plus the first draft of Milestone D (per-creature animation recommendations), so the website builder can plan around it early.

## 1. Evolution rules

The stage count and names are data and do not change: **Eggling → Hatchling → Evolved → Ascended** for every species (`creatureDesigns.json → stageNames`, timing in `gameConfig.evolution`). No extra stages, no merged stages, no renamed species.

1. **Continuity anchors.** Each species lists 4–6 anchors that appear unchanged at every stage: palette family, eye colour and shape family, Solgem position, one marking pattern, one signature body part. A player must be able to match a random Eggling to its Ascended without labels.
2. **Proportions mature.** Follow the head : body table in the art bible (§3). Eggling is round and big-eyed; each stage lengthens limbs and shrinks the head relative to the body. Never simply scale a drawing up.
3. **One new structural idea per stage.** Antlers → shingles → sapling (Mossling). Dots → lines → full glyph circuit → glyphs leaving the body (Velynx). Write it down in the brief before generating.
4. **Personality ages, it does not swap.** Eggling exaggerates the species' default expression (curious, eager), Evolved is the canonical expression, Ascended is the calm, confident version of the same character.
5. **Ascended is a transformation, not decoration.** Its new idea must change the silhouette or the creature's relation to the world: a new posture (Velynx walking the glyph path), a new body part (Cryovant's spire), the body becoming habitat (Mossling's grove). More glow, a halo, sparkles or extra ornaments do not count.
6. **Complexity budget grows by stage, capped by rarity.** Ascended may add one major shape over Evolved; it still passes the 64 px black-fill test.
7. **Classified species** (Mythic, Secret) also need a clean silhouette at every stage, because the "???" view uses it. The pipeline generates silhouettes from transparent masters automatically (`art:build`), so the masters must have clean alpha.

Review artefact per species: a **stage row** (four stages at the same scale on one ground line) and its **black-fill row** beneath. The Velynx sheet in `prototypes/velynx.md` §8 is the template.

## 2. How animation fits the site today

- `CreatureArt` already animates vector creatures with CSS: `sl-bob` (grounded, 5 s), `sl-hover` (floating, 6 s) and an eye blink on `.sl-eye` (`src/app/globals.css`), and switches it off for `prefers-reduced-motion`.
- When a raster stage exists, `CreatureArt` renders an `<img>` inside a `.sl-creature` wrapper. Only the wrapper-level bob/hover can apply; there is no blink, no part motion.
- `CreatureArt` is used on the collection grid, hatchery cards, hatch reveal, detail view, leaderboard and several landing sections, so anything heavier than a CSS transform must be limited to the large views.

## 3. Animation tiers

| Tier | Technique | Asset needed | Where it runs | Cost |
|---|---|---|---|---|
| **A: browser** | CSS/SVG transforms on the single raster: bob or hover, breathing (scaleY 1–2%), squash on floating pulses, a glint sweep using a masked gradient, a blink from a small eyelid overlay | the 1024 master + an optional eyelid PNG (≤ 10 KB) | everywhere, including grids | negligible |
| **B: layered 2D** | the master split into 4–8 parts (body, head, ears/antlers, tail, wings, eyelids, glow mask) with pivots; animated with CSS keyframes or a tiny rig (no runtime library needed) | layered PSD/PNG export + a JSON of pivots | detail view, hatch reveal; grids fall back to tier A | low; one extra request per layer, or a sprite atlas |
| **C: image-to-video** | Runway image-to-video from the approved still, 4–5 s, cut to a seamless loop, then encoded | 1 approved still + motion prompt | detail view and hatch reveal for flagship creatures only | generation credits once; 300–900 KB per loop |
| **C+: flagship** | tier C plus hand fixes (loop seam, colour match to the still), possibly a special hatch-reveal clip | as C | landing hero, hatch reveal of Legendary+ | most expensive; selected species only |

Rules for every tier: the animated creature must match the approved still (same design, palette and proportions); motion respects `prefers-reduced-motion` (show the still); a static still is always the first paint and the fallback.

## 4. Per-creature recommendation (draft for Milestone D)

| Species | Rarity | Tier | Idle concept |
|---|---|---|---|
| Mossling | Common | B | breathing moss bed, antler leaves sway, slow blink |
| Driftfin | Common | A | body wave (sliced skew), fin flutter |
| Pallow | Common | A | feather tiers rotate slowly in opposite directions, eye blink |
| Glimmeray | Common | A | wing undulation, hover |
| Sproutwyrm | Common | B | inchworm arch-and-stretch, bud hood opens |
| Frostkit | Common | B | tail flick, ear twitch, breath puff |
| Vael | Rare | B | neck sway, ribbon drift, vein pulse |
| Stormquill | Rare | B | crest bristle, head cock, small arc between crest quills |
| Duskwing | Rare | A | wings open/close, eye-spot blink |
| Cryovant | Rare | A | bell pulse, chain lag, core glint |
| Emberlisk | Rare | B | seam glow pulse, tongue flick |
| Neonyx | Epic | B | lure bob, jaw open, photophore chase |
| Aurorath | Epic | C | aurora curtains flowing, slow tail stroke |
| Zephrax | Epic | C | coil flow, lightning along the mane |
| Prismara | Epic | B | fan fold/unfold, refraction sweep |
| Nyxara | Epic | B | ribbon tail figure-eight, glance back |
| Aurelion | Legendary | C+ | wing settle, crown glint, breath |
| Solvanth | Legendary | C | coil orbit around the sun, corona |
| Pyraurum | Legendary | C | flame plumage flicker, wingbeat |
| Aurelith | Legendary | B | flipper strokes, gold trail ripple |
| Velynx | Legendary | C+ | weight shift, tail curl, ear flicks, glyph message sweep |
| Thalor | Legendary | B | fin ripple, brow turns toward viewer |
| Astravex | Mythic | C | mane flow, star-field drift inside flank (B fallback: masked parallax) |
| Orbelith | Mythic | B | ring rotation, moons orbit, great eye blink |
| Eventide | Mythic | C | wing shimmer, corona flicker |
| Helivane | Mythic | C | wing mantle, corona flare |
| GENESIS | Secret | B | nested shells counter-rotate, eye focus |
| Ø NULLBORN | Secret | B | tail fan, cheap clip-path glitch slice |

Totals: tier A 5, tier B 14, tier C 7, tier C+ 2. Image-to-video is proposed for **9 species** (the Evolved stage first; other stages only if the result justifies it), the rest stay credit-free.

## 5. Performance and file size

- **Stills:** 1024 WebP ≤ 400 KB (pipeline-enforced), 384 px thumb for grids. Grids must only ever load the thumb.
- **Layered (B):** parts packed in one WebP sprite atlas per stage, ≤ 250 KB, loaded only by the detail view and hatch reveal.
- **Video (C):** 512–720 px square, 4 s loop, 24 fps. Encode **WebM VP9** (≤ 600 KB) plus **MP4 H.264** fallback (≤ 900 KB) with the still as `poster`. Because Safari support for alpha video is unreliable, encode on the card's dark background colour (`#07060d` with the rarity aura baked faintly) rather than with alpha, and fade the edges into the card.
- Load video lazily (IntersectionObserver), `muted playsinline loop`, pause when off-screen, never autoplay more than one video at a time, and never in the collection grid.
- `prefers-reduced-motion`: still image only.
- Budget per page: collection grid ≤ 2 MB of creature imagery on first load (28 thumbs ≈ 28 × 30–45 KB).

## 6. Rollout plan for the website builder (draft)

1. **Stills first.** Approved stage masters go through the existing pipeline (`art/creatures/` → `npm run art:build`). No component change is needed: `CreatureArt` already prefers raster over vector per stage, and the vector stays as the fallback for any missing stage.
2. **Tier A** needs one small change in `CreatureArt`'s raster branch (blink overlay and breathing on the image). Owned by the website builder.
3. **Tier B** needs a new optional manifest field (layers + pivots) and a layered renderer used only by the detail view and hatch reveal.
4. **Tier C** needs an optional `video` field per stage in `creatureAssets.json` and a `<video>` branch for the detail view and hatch reveal.
5. Each step ships behind the existing fallbacks, so a half-finished collection never shows a broken creature.
