# Solanites art bible

> **Governed by the approved canon** ([`../canon/solanites-art-canon.md`](../canon/solanites-art-canon.md), 2026-10-19). Where this file and the canon disagree, the canon wins. Lighting (§1, §7), framing (§10) and the no-ground and no-halo rules (§9) were updated to match it.

Milestone A, item 3. One rulebook for every creature, every stage and every artist or generation tool. When a rule here conflicts with an older document (`docs/creature-design.md`, `docs/creature-art/README.md`), this file wins for new artwork; data such as names, rarity, element and stage count still come from the code.

## 1. What we keep

- **Stylised 2D creature art** on a **dark cosmic stage**. The app supplies the stage (card, aura, shadow); the creature art supplies the creature only.
- Names, ids, elements, element colour families, rarity tiers, discovery rules and the four stages (Eggling, Hatchling, Evolved, Ascended).
- Each species' body plan from the shipped vector art (`docs/creature-design.md` §3). No two species share one.
- **The Solgem**: every Solanite carries exactly one diamond-cut gem. Its position is part of the species identity (`docs/creature-design.md` §2).
- Warm gold key light (`#FFE2A8`) from the upper left, restrained violet rim light from behind (canon C2, C3).

## 2. The look in one sentence

> *Hand-painted 2D creature illustrations with clean graphic silhouettes, coloured linework, soft painted volume and one honest light source, where each creature's own body produces the only glow in the frame.*

Think premium creature-collector card art and animated-feature character sheets, not 3D renders, not glossy vector icons and not neon fantasy wallpaper.

## 3. Shape language and anatomy

1. **Design from the silhouette first.** Fill the creature solid black. At 64 px it must still say what it is and which species it is. If it does not, fix the shape, not the colour.
2. **One dominant mass, one secondary, one accent.** Mossling: dome back / head / antlers. Cryovant: bell / tendril curtain / crown spire. Velynx: ears / torso / tail disc.
3. **Real joints.** Limbs taper and bend: shoulder, elbow or knee, wrist or ankle, toes. No constant-width tubes, no cylinders, no balloon limbs.
4. **Weight.** Grounded creatures press into the ground: flattened pads, weight shifted onto a leg. Floating creatures show it through trailing parts that lag behind the body.
5. **Straight against curve.** Every design pairs soft organic curves with a few straight or angular elements (horn edges, crystal facets, armour rims). Pure blobs read as toys; pure angles read as robots.
6. **Proportions by stage** (head height : total body height, measured standing):

| Stage | Head : body | Eye : head width | Feet / base | Character |
|---|---|---|---|---|
| Eggling | 1 : 1.6 – 2 | 0.30 – 0.38 | oversized, soft | vulnerable, curious |
| Hatchling | 1 : 2.2 – 2.8 | 0.24 – 0.30 | still large, gangly limbs | eager, clumsy |
| Evolved | 1 : 3 – 4 | 0.16 – 0.22 | species-true | confident, typical of the species |
| Ascended | 1 : 3.5 – 5 | 0.14 – 0.20 | species-true, more grounded or more aerial | transformed, iconic |

Non-humanoid plans (orbs, jellyfish, polyhedra) apply the same idea to their core: the "head" is the part with the eyes.

## 4. Eyes, faces and personality

- **Faces act.** Every species gets a readable expression built from **brow or lid line + eye shape + mouth corner**. A two-dot face is not a face.
- **Eyes are species-specific**, not one shared component: lidded almond (Mossling, Aurelith), slit pupils (Velynx, Emberlisk, Nyxara), round wet eyes (Driftfin, Frostkit Eggling), photophore rows (Cryovant, Neonyx), single great eye (Pallow, Orbelith, GENESIS), crescent sparks (Eventide).
- **One catchlight per eye**, upper left, matching the key light. Never two.
- **Eye glow only from Epic up**, and only as a soft iris emission, never a bloom that hides the pupil.
- **Each species has a default expression** written in its brief (patient, smug, wary...). Every stage keeps that expression's DNA; Eggling exaggerates it.
- **Three-quarter view, facing the viewer's left**, eyes visible. Profile-only views are allowed only where the body plan requires it (Driftfin, Glimmeray), and then the head still turns toward the viewer.

## 5. Linework

- **Coloured line, not black.** Outer contour in the darkest local colour (`palette.bodyDark` region), around 3–4 px at 1024 px. Interior lines 1.5–2 px, lighter.
- **Lost edges in the light**: the contour thins or disappears where the key light hits (upper left) and thickens on the shadow side and under the body.
- No outer glow line, no white "sticker" outline.

## 6. Shading and texture

- **Three values plus one accent**: light, mid, shadow, and either a rim light or an emissive feature. Not a full gradient on every shape.
- **Painted, not airbrushed.** Visible but controlled brush texture on surfaces; soft gradients only for subsurface (ears, fins, membranes) and emission.
- **Texture by material**, used sparingly and concentrated where the light falls:

| Material | Treatment | Used by |
|---|---|---|
| Moss / fur / down | broken edge clusters, not individual hairs | Mossling, Frostkit (Eggling), Nyxara, Astravex mane |
| Leaf / petal | flat colour planes, one vein line, warm transmitted light | Mossling, Sproutwyrm |
| Scales / armour | read as overlapping plates with a lit edge, not a pattern stamp | Emberlisk, Aurelion, Solvanth, Thalor |
| Skin / membrane | smooth, subsurface red-shift in thin areas | Driftfin, Vael, Glimmeray, Aurorath |
| Feather | grouped into tracts (coverts, flights), never a symmetric fan of identical blades | Pallow, Stormquill, Prismara, Pyraurum, Helivane |
| Ice / crystal / glass | hard facet planes, internal refraction, a single sharp specular, background colour visible through it | Frostkit, Cryovant, Prismara, Eventide wings, GENESIS |
| Metal / gold | warm local colour, dark reflected environment, crisp highlight; gold is never yellow-white everywhere | Legendary Solar line |
| Void / star-field | a masked window of deep space inside the silhouette, with a clean edge | Astravex flank, Eventide wings, Aurorath Ascended, NULLBORN accents |

## 7. Lighting and colour

- **Key:** warm gold `#FFE2A8` from the upper left (canon C2). **Rim:** restrained violet (`#7D5CF0` family) from behind, catching the back and outer edges; strong enough to separate a dark body from a dark background, never a glow halo (canon C3). **Fill:** low and dim. *(Superseded: "warm-neutral" key and "cool cyan-violet rim from the right".)*
- **Value structure:** creatures sit mid-to-light against a near-black card. Shadow sides stay above about 12% luminance so the silhouette never vanishes into the background.
- **Palette discipline:** each species uses its `palette` from `species.ts` as anchor colours: 60% body family, 30% secondary (belly/wing), 10% accent. The accent is the element colour and the only saturated hue.
- **Glow budget** (emissive area as a share of the creature silhouette): Common ≤ 3%, Rare ≤ 5%, Epic ≤ 10%, Legendary ≤ 10%, Mythic ≤ 15%, Secret free. Glow comes from **anatomy** (veins, lure, seams, gem, eyes), never from the air around the creature.

## 8. Elemental families

| Element | Species | Shape cue | Material cue | Effect motif (restrained) | Avoid |
|---|---|---|---|---|---|
| Verdant | Mossling, Sproutwyrm | rounded, layered, growing upward | moss, leaf, bark | drifting spores, bud glow | sticker leaves, neon green |
| Tidal | Driftfin, Glimmeray, Vael, Thalor | flowing S-curves, fins | wet skin, membrane, barnacle armour | lateral-line dots, bioluminescent veins | water splashes, bubbles everywhere |
| Lumen | Pallow, Neonyx | radial, a single light source | pearl, down, dark skin with photophores | one lantern or one eye that lights the face | starbursts |
| Frost | Frostkit | angular, faceted, spiky ruffs | packed snow fur + clear ice | breath mist | snowflake icons |
| Storm | Stormquill, Zephrax | zig-zag, swept-back, crests | barred feathers, charged scales | thin arc lines between crest points | lightning bolts as stickers, cartoon clouds |
| Shadow | Duskwing, Nyxara, Velynx | slender, elongated, ears and wings | velvet, matte black | violet/teal glyph lines on the body | purple smoke clouds |
| Crystal | Cryovant, Prismara | facets, chandeliers, fans | ice-glass, prism | refraction glints, colour split at edges only | rainbow everywhere |
| Ember | Emberlisk, Pyraurum | jagged, rising | violet hide / gold-red plumage, cooled-lava crust | seams that glow from inside | fire clip-art |
| Aether | Aurorath, Orbelith | vast, slow, curved | teal-to-violet bands | aurora curtains, orbiting moons | generic nebula backdrop |
| Solar | Aurelion, Solvanth, Aurelith, Helivane | crowns, discs, radiant arrangement in the anatomy | worked gold, sun-bleached ivory | one sun disc or corona per creature | radial ray bursts behind the creature |
| Nebula | Astravex | elegant, tall | platinum hide, star-field windows | constellation lines in antlers | sparkles |
| Void | Eventide, NULLBORN | inverted, eclipsed | negative space, glass | dark corona, glitch slices | heavy chromatic aberration |
| Prism | GENESIS | pure geometry | obsidian facets, Solana purple/green light | nested shells | scan-line overlays baked into art |

## 9. Rarity and complexity

Rarity raises **design ambition**, not the amount of glitter.

| Rarity | Major shapes | Signature features | Emissive budget | What makes it special |
|---|---|---|---|---|
| Common | 3 | 1 | ≤ 3% | Charm. The best faces in the collection; these are what most players own. Never "filler". |
| Rare | 3–4 | 1–2 | ≤ 5% | An unusual structure (a rising neck, a glass body, four wings) |
| Epic | 4 | 2 | ≤ 10% | A built-in light source that is part of the anatomy |
| Legendary | 4–5 | 2–3 | ≤ 10% | Scale and presence; fills the frame; a regal or ancient acting choice |
| Mythic | 4–5 | 2–3 | ≤ 15% | Cosmic anatomy: space visible *inside* the body |
| Secret | free | free | free | Breaks the rules on purpose, so it must still pass the thumbnail test |

**Not allowed baked into any artwork:** halos, radial ray bursts, four-point sparkle stars, lens flares, floating particles further than one body-width from the creature, text, frames, ground planes, contact or cast shadows, floor glints, horizon lines. No halos for any species, including Pyraurum (canon C6). The website must not add ground, shadows, halos or auras behind artwork either (canon W1–W2).

## 10. Presentation and composition (production spec)

Matches the existing raster pipeline (`scripts/creature-art.mjs`, `creatureDesigns.json → style.spec`):

- One file per species × stage, **1024 × 1024**, **transparent** PNG master (`art/creature-studio/<id>/<n>-<stage>.png` while in review).
- Full body, no cropped limbs, tails or wings. **Stage framing (canon C13):** occupancy 45% / 60% / 78% / 88% for stages 1–4, ±3 points, measured as the larger side of the creature's bounding box ÷ frame size with `docs/canon/measure-framing.py`.
- **Placement:** bounding-box centre at 50% / 50% of the frame, ±3 points, for every species. There is no ground line. *(Superseded: "about 80% of frame" for every stage and "ground line at 88%".)*
- Three-quarter view facing left, camera at the creature's eye level, the same for every image.
- Delivered WebP ≤ 400 KB (enforced by `art:build`), 384 px thumbnail generated by the pipeline.

## 11. Thumbnail and grid rules

Every stage must pass these before review:

1. **Black-fill test**: the solid silhouette at 64 px is identifiable as its species.
2. **Squint test**: at 128 px, the face and the signature feature are still the first two things you see.
3. **Grid test**: placed in the 4-column collection grid next to the same element's other species, it reads as a *different* creature, not a recolour.
4. **Dark-card test**: on `#07060d` with the app's aura, no edge disappears and nothing glows past its budget.
5. **Stage-row test**: the four stages side by side read as one creature growing up (see `evolution-and-animation.md`).

## 12. Consistency checklist for generated images

AI generation is a tool, not the art director. Reject or paint over any image with:

- extra or fused limbs, extra eyes, asymmetric eyes that are not designed, melted claws or toes;
- texture that changes material mid-surface, random jewellery, belts, armour straps or "fantasy filigree" not in the brief;
- symbols, letters or pseudo-text in glyphs (Velynx's glyphs must be the approved glyph set);
- a different camera angle or light direction from the spec;
- style drift toward 3D render, anime, chibi mascot, or recognisable existing franchise creatures.

Every accepted image is checked against the species brief, the stage brief and the five thumbnail rules, and its prompt, seed, model and any paint-over notes are recorded in the asset map.
