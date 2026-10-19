# Solanites creature inventory and audit

Milestone A, items 1, 2 and 4. Source of truth for names, rarity, element, discovery and stage count is the repository, not this file: `src/lib/species.ts`, `src/lib/discovery.ts`, `src/config/gameConfig.ts` and `src/data/creatureDesigns.json`. The machine-readable mapping is [`asset-map.json`](asset-map.json), regenerated with `node docs/creature-studio/tools/build-asset-map.mjs`.

## 1. What the collection actually is

| | |
|---|---|
| Species | **28** (6 Common, 5 Rare, 5 Epic, 6 Legendary, 4 Mythic, 2 Secret) |
| Evolution | Every species has **4 stages**: Eggling, Hatchling, Evolved, Ascended (`creatureDesigns.json → stageNames`). No species has fewer or more. |
| Stage slots | **112** (28 × 4) |
| Hidden entries | Mythic and Secret species are `classified` until the viewer hatches one (`discovery.ts`). In the UI, a hidden Secret shows rarity **"Unknown"** (`CreatureDetail.tsx:118`, `RarityBadge.tsx:15`). "Unknown" in the brief therefore means the **Secret** tier: GENESIS and Ø NULLBORN. |
| Shipped artwork | **Procedural SVG drawn in code**, one renderer per species: `src/components/creature/species/<file>.tsx`, assembled by `src/components/creature/CreatureArt.tsx`. There are no raster creature files in `public/`. |
| Raster pipeline | Already built but unused: `art/creatures/<id>/<n>-<stage>.png` (git-ignored masters) → `npm run art:build` → `public/creatures/<id>/*.webp` + `src/data/creatureAssets.json`. All 112 slots are `null`. `CreatureArt` shows a raster when present and falls back to the vector otherwise. |
| Painted references | `docs/creature-art/reference/overview-sheet.webp` (20 species rows painted as AI concept art, Mythic row shown only as "???"), `mossling-detail.webp`, 20 per-species strips cut from it, and `velynx-inspiration.png`. **No painted reference exists** for Velynx stages, Nyxara, Thalor, Helivane, Astravex, Orbelith, Eventide, GENESIS or NULLBORN. |
| Baseline renders | [`baseline/`](baseline/): every current stage rendered from the shipped code, one sheet per rarity, produced by `tools/render-baseline.mjs`. These are the "originals" every redesign is compared against. |

### Two sources of "original" that disagree

The shipped vector art and the painted overview sheet are not the same designs. Where they conflict, this audit treats the **shipped vector + `creatureDesigns.json` text** as canon (it is what players have seen and what the stage descriptions in the detail view say) and the overview sheet as **finish and mood reference only**. Conflicts that need a decision are flagged ⚠ below and collected in §4.

## 2. Master inventory

Effort: **L** light refinement · **M** substantial redesign keeping the body plan · **H** rebuild of anatomy and face around the same identity. Animation tier (see `evolution-and-animation.md` §3): **A** browser-only, **B** layered 2D rig, **C** image-to-video candidate.

| Dex | Id | Name | Epithet | Rarity | Element | Discovery | Renderer | Floats | Painted ref | Effort | Anim |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `mossling` | Mossling | The Patient Sprout | Common | Verdant | catalogued | `mossling.tsx` | no | sheet + detail | **H** | B |
| 2 | `driftfin` | Driftfin | Tide-Whisperer | Common | Tidal | catalogued | `driftfin.tsx` | yes | sheet | M | A |
| 3 | `pallow` | Pallow | The Pearl Herald | Common | Lumen | catalogued | `pallow.tsx` | yes | sheet | M | A |
| 4 | `glimmeray` | Glimmeray | Shallows Drifter | Common | Tidal | catalogued | `glimmeray.tsx` | yes | sheet | M | A |
| 5 | `sproutwyrm` | Sproutwyrm | Coil of the Canopy | Common | Verdant | catalogued | `sproutwyrm.tsx` | no | sheet | M | B |
| 6 | `frostkit` | Frostkit | Little Glacier | Common | Frost | catalogued | `frostkit.tsx` | no | sheet | **H** | B |
| 7 | `abyssal-vael` | Vael | Of the Abyssal Trench | Rare | Tidal | catalogued | `vael.tsx` | no | sheet | **H** | B |
| 8 | `stormquill` | Stormquill | Thunder's Courier | Rare | Storm | catalogued | `stormquill.tsx` | no | sheet | **H** | B |
| 9 | `duskwing` | Duskwing | Twilight Sentinel | Rare | Shadow | catalogued | `duskwing.tsx` | yes | sheet | M | A |
| 10 | `cryovant` | Cryovant | Shard Glider | Rare | Crystal | catalogued | `cryovant.tsx` | yes | sheet | M | A |
| 11 | `emberlisk` | Emberlisk | Kiln-Hearted | Rare | Ember | catalogued | `emberlisk.tsx` | no | sheet | M | B |
| 12 | `neonyx` | Neonyx | The Lantern Wyrm | Epic | Lumen | catalogued | `neonyx.tsx` | yes | sheet | M | B |
| 13 | `aurorath` | Aurorath | Veil of Northern Fire | Epic | Aether | catalogued | `aurorath.tsx` | yes | sheet | M | C |
| 14 | `zephrax` | Zephrax | Coil of Living Current | Epic | Storm | catalogued | `zephrax.tsx` | yes | sheet | **H** | C |
| 15 | `prismara` | Prismara | Refractor Queen | Epic | Crystal | catalogued | `prismara.tsx` | no | sheet | **H** | B |
| 26 | `nyxara` | Nyxara | The Ribbon of Dusk | Epic | Shadow | catalogued | `nyxara.tsx` | no | none | M | B |
| 16 | `aurelion` | Aurelion | Sovereign of the Gilded Slot | Legendary | Solar | catalogued | `aurelion.tsx` | no | sheet | **H** | C |
| 17 | `solvanth` | Solvanth | The Sunscale Leviathan | Legendary | Solar | catalogued | `solvanth.tsx` | yes | sheet | **H** | C |
| 18 | `pyraurum` | Pyraurum | Phoenix of the Golden Pyre | Legendary | Ember | catalogued | `pyraurum.tsx` | no | sheet | M | C |
| 19 | `aurelith` | Aurelith | The Gilded Tide | Legendary | Solar | catalogued | `aurelith.tsx` | yes | sheet | M | B |
| 25 | `velynx` | Velynx | The Glyphwalker | Legendary | Shadow | catalogued | `velynx.tsx` | no | inspiration only | **H** | C |
| 27 | `thalor` | Thalor | The Deepwarden | Legendary | Tidal | catalogued | `thalor.tsx` | yes | none | **H** | B |
| 20 | `astravex` | Astravex | Platinum Starforged | Mythic | Nebula | **classified** | `astravex.tsx` | no | none ("???") | M | C |
| 21 | `orbelith` | Orbelith | The Celestine Coil | Mythic | Aether | **classified** | `orbelith.tsx` | yes | none | **H** | B |
| 22 | `eventide` | Eventide | Wing of the Last Light | Mythic | Void | **classified** | `eventide.tsx` | yes | none | M | C |
| 28 | `helivane` | Helivane | The Sunpiercer | Mythic | Solar | **classified** | `helivane.tsx` | no | none | **H** | C |
| 23 | `genesis` | GENESIS | Slot Zero | Secret ("Unknown") | Prism | **classified** | `genesis.tsx` | yes | none | **H** | B |
| 24 | `nullborn` | Ø NULLBORN | The Unindexed | Secret ("Unknown") | Void | **classified** | `nullborn.tsx` | no | none | M | B |

Every row's stage slots, master paths, public paths and redesign candidate paths are in [`asset-map.json`](asset-map.json).

## 3. Creature-by-creature audit

Collection-wide weaknesses (seen in almost every renderer, so not repeated per creature):

- **Same face kit everywhere.** All eyes come from one `Eye()` component with the same socket, gradient iris and specular dot; most species have a tiny single visible eye in profile with no brow, lid or mouth acting. Faces cannot carry personality.
- **Inflated-tube anatomy.** Bodies are radial-gradient ellipses and constant-width tubes. Limbs are cylinders without joints, so creatures read as balloon toys rather than animals (Frostkit, Stormquill, Vael, Velynx legs).
- **Uniform glossy material.** One gradient + white specular blob on every surface: moss, ice, gold, velvet and glass all look like the same plastic.
- **Decoration stands in for evolution.** Ascended forms get a CSS halo, sparkle stars and more glow. Halos appear on all 28 Ascended forms, and the rarity aura (starburst rays for Legendary, nebula for Mythic, scan lines for Secret) sits behind every creature.
- **Starbursts and sparkles.** Four-point sparkles and radial rays are baked into every Legendary/Mythic/Secret frame and compete with the silhouette at thumbnail size.
- **Inconsistent camera.** Side profiles, front views and top-down views are mixed (documented in `docs/creature-design.md`), so the collection grid has no shared eye-line.

Each entry: **Strengths · Weaknesses · Silhouette/anatomy · Face/personality · Preserve · Effort · Evolution · Animation.**

### Common

**#1 Mossling** (Verdant). *Strengths:* clear "slow grazer with a garden on its back" idea; Ascended sapling-on-back is a genuinely good story beat. *Weaknesses:* reads as a green hippo-turtle; pig-like snout disc; leaf shell looks like a tortoise shell; Ascended root-feet drawn as white stick lines. *Silhouette:* low dome, short stump legs, small antlers; good low-wide read but muddled head. *Face:* currently blank; potential for a sleepy, heavy-lidded, contented face. *Preserve:* low domed body, leaf-shingle back, branching antlers, sapling crown at Ascended, patient temperament. ⚠ The painted sheet shows a big-eyed sprout-deer instead; keep the vector's body plan, take the sheet's charm and moss texture. *Effort:* H (head and legs rebuilt). *Evolution:* moss puff → antlered calf → shingled grazer → walking grove; stage logic is sound, needs better anatomy. *Animation:* B: breathing back, antler leaves sway, slow blink.

**#2 Driftfin** (Tidal). *Strengths:* clear tadpole → eel → sea-dragon arc; translucent sail fin. *Weaknesses:* Hatchling and Evolved are near-identical horizontal tubes; whiskers are thin lines; tiny eye. *Silhouette:* long horizontal ribbon; thin at thumbnail. *Face:* playful, curious; needs a larger eye and a smiling mouth line. *Preserve:* horizontal ribbon body, sail fin, glowing lateral dots, S-curl Ascended. *Effort:* M. *Evolution:* differentiate Hatchling (one dorsal sail) and Evolved (sail + paired veil fins + whisker barbels). *Animation:* A: sine wave along the body (SVG/CSS skew on sliced raster) and fin flutter.

**#3 Pallow** (Lumen). *Strengths:* the most distinctive Common: a floating pearl with one eye and a feather sunburst. *Weaknesses:* Evolved is a generic starburst; tassels read as legs; "eye on a ball" can feel cold. *Silhouette:* radial; strong but identical to a sun icon at small size. *Face:* one big gentle eye with a heavy upper lid gives "hopeful, proud". *Preserve:* pearl orb, single eye, layered feather rings, hanging tassels. *Effort:* M. Replace the symmetrical star with asymmetric overlapping feather tiers like a tilted ruff. *Evolution:* feathers should grow in tiers (down → first quills → ruff → seraph wing-fans). *Animation:* A: slow rotation of feather tiers, eye blink, tassel sway.

**#4 Glimmeray** (Tidal). *Strengths:* widest silhouette in the set; spotted back. *Weaknesses:* top-down view breaks the shared camera; face is two dots and a smile; Ascended adds outline ribbons only. *Silhouette:* wide diamond; very readable. *Face:* shy, should look up at the viewer from under its cephalic lobes. *Preserve:* manta shape, spots, whip tail, light ribbons at Ascended. *Effort:* M (move to three-quarter banking view). *Evolution:* fine; Ascended needs a structural change (wing-tip filaments become light-catching sails). *Animation:* A: wing undulation via mesh warp or two-frame flap.

**#5 Sproutwyrm** (Verdant). *Strengths:* arching inchworm is a great comic silhouette; bud head. *Weaknesses:* body is a string of identical green balls; Mossling and Sproutwyrm share the same green and the same sprouts, so the two Verdants blur together. *Silhouette:* arch; readable. *Face:* stubborn, hungry; give it a wide jaw and determined brow. *Preserve:* segmented arch, root legs, bud/tulip hood, leaf wings at Ascended. *Effort:* M. Shift palette yellow-green and bark brown to separate from Mossling's blue-green moss. *Evolution:* good; hood blossoms progressively. *Animation:* B: inchworm arch-and-stretch loop (segment rig).

**#6 Frostkit** (Frost). *Strengths:* the Eggling kitten is charming; frost breath at Ascended. *Weaknesses:* Hatchling/Evolved are stiff table-like bodies with cylinder legs and a flat head; "faceted ice" never appears; Ascended neck is giraffe-like. *Silhouette:* generic quadruped. *Face:* brave and clumsy; currently expressionless profile. *Preserve:* fox/kit, crystal ears, ice spines, crystal tail(s), frost breath, crystal crown at Ascended. *Effort:* H. *Evolution:* fluffy kit → gangly kit (oversized paws) → crystal fox → regal fox with three crystal tails. *Animation:* B: tail flick, ear twitch, breath puff.

### Rare

**#7 Vael** (Tidal). *Strengths:* rising swan-neck from coils is elegant; bioluminescent veins in the lore. *Weaknesses:* drawn as a blue inflatable tube; the ledger-script veins are absent; head is a dolphin. *Silhouette:* tall S-neck; strong. *Face:* solemn and ancient; long skull, deep-set eye, no cuteness at Evolved+. *Preserve:* coils, rising neck, crest fin, ribbon trails, glowing veins. *Effort:* H. *Evolution:* keep, but the Ascended hood/crest must be anatomy (a cobra-like frilled hood), not added glow. *Animation:* B: neck sway, ribbon drift, vein pulse.

**#8 Stormquill** (Rare, Storm). *Strengths:* lightning-barred feathers; crest of quills. *Weaknesses:* the vector is a stilt-legged heron but the painted sheet is a crested griffin-chick ⚠; Hatchling legs are lines; Ascended mixes both ideas. *Silhouette:* tall stalking bird; good vertical contrast with the round Commons. *Face:* restless, fierce; hooked beak, narrowed eye. *Preserve:* quill crown, barred wings, long legs, courier personality. *Effort:* H, after the ⚠ decision. *Evolution:* chick → gangly → stalking heron → storm-bird with raised wings. *Animation:* B: crest quills bristle, head-cock, occasional crackle.

**#9 Duskwing** (Shadow). *Strengths:* eye-spot wings are iconic; velvet. *Weaknesses:* Eggling caterpillar face is the shared cartoon face; body is stacked spheres. *Silhouette:* broad four-wing butterfly; reads well. *Face:* guarded, mysterious; hooded eyes behind feathery antennae. *Preserve:* four wings with eye-spots, feathered antennae, velvet, scalloped edges. *Effort:* M. *Evolution:* larva → soft newly-unfolded wings → velvet moth → sentinel with tails; good. *Animation:* A: wing open/close via scaleX on separated wings; eye-spots "blink".

**#10 Cryovant** (Crystal). *Strengths:* faceted bell, chain-like shard tendrils; strong concept. *Weaknesses:* Eggling and Hatchling use the googly cartoon eyes; the bell is a wireframe not ice; Ascended "chandelier" arms plus rainbow rays are noise. *Silhouette:* dome + hanging lines; readable, but thin tendrils vanish small. *Face:* precise, cold; eyes as a row of inner lights under the rim. *Preserve:* faceted bell, crystal tendrils, inner glow, chandelier idea at Ascended. *Effort:* M. *Evolution:* bud → bell → gem-cut dome → crown-spired chandelier. *Animation:* A: bell contraction pulse, tendril sway, refraction glint.

**#11 Emberlisk** (Ember). *Strengths:* violet hide with molten seams is the most original palette in the set. *Weaknesses:* Evolved is flat and low; armour plates look like stickers; feet are white stubs. *Silhouette:* low salamander; readable but long and thin. *Face:* hot-headed and generous: wide grin, ember-glow mouth. *Preserve:* violet hide, molten cracks, dorsal plates, tail club at Ascended. *Effort:* M. *Evolution:* newt → raised salamander → armoured salamander → titan; good. *Animation:* B: seam glow pulse, tongue flick, tail sway.

### Epic

**#12 Neonyx** (Lumen). *Strengths:* anglerfish lure, neon teeth; strong. *Weaknesses:* Ascended adds a serpent tail that reads as a separate creature; glow everywhere. *Silhouette:* round head + lure; very readable. *Face:* vain, electric: big toothy grin, side-eye. *Preserve:* lure lantern, glowing maw, frill, photophores. *Effort:* M. *Evolution:* keep, make the Ascended "wyrm" body a continuous anatomy. *Animation:* B: lure bob, jaw open, photophore chase.

**#13 Aurorath** (Aether). *Strengths:* sky whale with aurora curtains is iconic. *Weaknesses:* curtains are flat rectangles; dull teal. *Silhouette:* large mass; strong. *Face:* dreamy, wise; small kind eye with crease lines. *Preserve:* whale, aurora curtains, star skin at Ascended. *Effort:* M. *Animation:* C: aurora curtains are the one effect that genuinely needs flowing motion.

**#14 Zephrax** (Storm). *Strengths:* Eastern storm dragon on clouds. *Weaknesses:* the clouds are cartoon cumulus stickers that dominate the frame; body plan no longer the documented ring coil ⚠; very similar to many existing dragon designs. *Silhouette:* long serpent; risks reading as a generic lóng. *Face:* wild, impatient, mouth open. *Preserve:* coiling serpent, lightning mane, bolt tail, cloud riding. *Effort:* H (reduce clouds to vapour streams, push the ring-coil silhouette). *Animation:* C: coil flow and lightning.

**#15 Prismara** (Crystal). *Strengths:* peacock with a prism-shard fan; jewel crown. *Weaknesses:* body is an owl-like purple egg; rainbow shards on everything; thumbnail is noisy. *Silhouette:* fan; strong. *Face:* regal, fickle; long neck, haughty lidded eye. *Preserve:* shard fan, crown, display posture. *Effort:* H. *Evolution:* fan should grow from 3 → 7 → 13 → tiered shards. *Animation:* B: fan fold/unfold, refraction sweep.

**#26 Nyxara** (Shadow). *Strengths:* looping ribbon tail; figure-eight Ascended. *Weaknesses:* anatomy is a stiff jackal; Ascended neck bend is awkward; no painted reference. *Silhouette:* fox + ribbon; good. *Face:* elusive, curious: looking back over the shoulder. *Preserve:* indigo fox, ribbon tail, crescent ears, looking-back pose. Must stay clearly distinct from Velynx and Frostkit. *Effort:* M. *Animation:* B: ribbon tail loop.

### Legendary

**#16 Aurelion** (Solar). *Strengths:* only true dragon; crown of horns. *Weaknesses:* sitting chubby dragon reads as a mascot at every stage; the painted sheet shows a winged lion-dragon on all fours ⚠. *Silhouette:* frontal sitting; weak for a Legendary. *Face:* majestic, just; currently cartoon. *Preserve:* gold scale armour, crown of horns, great wings, rearing posture (design bible). *Effort:* H. *Animation:* C (flagship).

**#17 Solvanth** (Solar). *Strengths:* serpent coiled around a sun is a striking idea. *Weaknesses:* coils read as a spring (noted in the previous redesign); generic dragon head. *Silhouette:* orb + coil; strong if the coil is legible. *Face:* ancient, benevolent; long whiskered face, calm eye. *Preserve:* sun orb, gold scales, coil. *Effort:* H. *Animation:* C: orbiting coil and sun corona.

**#18 Pyraurum** (Ember). *Strengths:* flame plumage and climbing pose at Evolved. *Weaknesses:* it is "a phoenix" with no twist; Eggling chick is generic; competes with the site's phoenix hero/intro (`public/hero/phoenix-*`). *Silhouette:* raised wings; strong. *Face:* proud. *Preserve:* golden pyre phoenix, flame streamers, rebirth lore. Needs one owned feature (e.g. ember-glass crest or ash-grey underwing). *Effort:* M. Coordinate with the website builder so it does not clash with the hero phoenix. *Animation:* C.

**#19 Aurelith** (Solar). *Strengths:* gilded sea turtle with hex inlay; serene. *Weaknesses:* Ascended roof tier reads as a second shell; gold-on-gold low contrast. *Silhouette:* dome + flippers; strong. *Face:* heavy-lidded, wise. *Preserve:* hex-inlaid shell, flippers, molten gold trail. *Effort:* M. *Animation:* B: flipper strokes, trail ripple.

**#25 Velynx** (Shadow). *Prototype, see `prototypes/velynx.md`.* *Strengths:* black body with teal glyph circuits and a long S-curved tail; strong graphic identity. *Weaknesses:* tube limbs; Hatchling → Evolved → Ascended mostly scale up; the inspiration image leans toward an existing famous slender psychic cat creature, an originality risk. *Preserve:* black/teal/violet palette, circuit glyphs, long swept-back ears, long S-curved tail with a teal tip, chest Solgem, mischievous confidence. *Effort:* H. *Animation:* C (flagship).

**#27 Thalor** (Tidal). *Strengths:* armoured brow; cathedral fins at Ascended. *Weaknesses:* reads as an ordinary fish; scales are clip-art; same tidal blue as Driftfin/Vael. *Silhouette:* fish; weak for a Legendary. *Face:* steadfast, protective; heavy brow plate, square jaw. *Preserve:* armoured brow, shield plates, deep-trench guardian role, crescent tail. *Effort:* H (push it toward a coelacanth/placoderm armoured giant with lobed fins). *Animation:* B.

### Mythic (classified until discovered)

**#20 Astravex** (Nebula). *Strengths:* star-field flank, constellation antlers. *Weaknesses:* legs are thin cylinders; body is a grey bean. *Silhouette:* stag + antlers; strong. *Face:* infinite, calm; serene closed-mouth face. *Preserve:* platinum stag/kirin, star-field window in the flank, constellation antlers, nebula mane. *Effort:* M. *Animation:* C: star-field parallax inside the flank (can also be done in browser with a masked layer, tier B fallback).

**#21 Orbelith** (Aether). *Strengths:* a planet that learned to watch. *Weaknesses:* Ascended is busy (noted previously); eyes on the ring are tiny. *Silhouette:* ringed sphere; iconic but very close to a generic planet icon. *Face:* the one big eye must carry everything. *Preserve:* banded orb, ring lined with eyes, adopted moons, comet tendrils. *Effort:* H. *Animation:* B: ring rotation, moons orbit (pure layer transforms).

**#22 Eventide** (Void). *Strengths:* eclipse head + glass dragonfly wings; the most original Mythic. *Weaknesses:* eclipse head with two dots reads as a cartoon alien. *Silhouette:* four wings + disc; strong. *Face:* silent, merciful; no mouth, eyes as two pale crescents in the corona. *Preserve:* eclipse head, four glass wings holding dead stars, segmented tail. *Effort:* M. *Animation:* C: wing shimmer and corona flicker.

**#28 Helivane** (Solar). *Strengths:* falcon + sun disc. *Weaknesses:* reads as a cartoon owl/parrot; perch branch at Evolved; Ascended front pose duplicates Pyraurum's. *Silhouette:* raptor; weak. *Face:* fierce, radiant; falcon malar stripe. *Preserve:* falcon, corona folded in the wings, stoop/dive motif. *Effort:* H. *Animation:* C: stoop loop.

### Secret ("Unknown", classified)

**#23 GENESIS** (Prism). *Strengths:* abstract polyhedron is the right rule-break. *Weaknesses:* busy Ascended; the scan-line overlay and rays dominate. *Silhouette:* geometric. *Face:* a single lens/visor eye. *Preserve:* nested polyhedra, single eye, Solana-coloured light (purple/green), orbiting bars. *Effort:* H (simplify). *Animation:* B: nested shells counter-rotate.

**#24 Ø NULLBORN** (Void). *Strengths:* inverted white nine-tailed fox with void eyes is memorable. *Weaknesses:* glitch overlay redraws the figure several times (performance); faces are cute-cartoon. *Silhouette:* tail fan; strong. *Face:* glitched curiosity: head tilt, void eyes with magenta pin-light. *Preserve:* inverted palette, tail count progression (1 → 3 → 7 → 9), third eye at Ascended. *Effort:* M. *Animation:* B: tails fan, glitch done as a cheap CSS clip-path slice rather than redraws.

## 4. Decisions (resolved at Milestone A review)

Recorded in full in [`decisions.md`](decisions.md).

1. **Canon:** the shipped body plan is the starting point where references disagree. Stormquill, Aurelion, Zephrax and Mossling are **flagged for individual review** before their final designs lock.
2. **No third-party logos** on any creature. An original Solanites glyph replaces them (see [`glyph/`](glyph/)).
3. **Stylised, hand-painted 2D.** No 3D renders.
4. **Website rays and nebula** behind replacement art are to be toned down by the website builder (see [`website-builder-handoff.md`](website-builder-handoff.md)).
5. **Originals preserved.** All original SVG artwork stays; replacements are generated only into the isolated review folder.

## 5. Redesign priority order

Order for Milestone C, after the three prototypes are approved. It front-loads creatures players see most (Commons, by drop weight 60%) and the weakest designs, and batches by element so palettes are tuned together.

| Batch | Species | Why |
|---|---|---|
| P (prototypes) | Velynx, Mossling, Cryovant | Contrasting silhouettes (upright biped, low quadruped, floating radial), three elements, three rarities |
| 1 | Frostkit, Sproutwyrm, Driftfin, Glimmeray, Pallow | Remaining Commons; 60% of hatches |
| 2 | Stormquill, Vael, Emberlisk, Duskwing | Remaining Rares; Stormquill and Vael are H effort |
| 3 | Prismara, Zephrax, Neonyx, Aurorath, Nyxara | Epics; Zephrax and Prismara need the most work |
| 4 | Aurelion, Solvanth, Thalor, Pyraurum, Aurelith | Legendaries; flagship animation candidates |
| 5 | Helivane, Orbelith, Astravex, Eventide | Mythics; also need silhouette assets for "???" |
| 6 | GENESIS, Ø NULLBORN | Secret ("Unknown"); last because they deliberately break the rules the others establish |
