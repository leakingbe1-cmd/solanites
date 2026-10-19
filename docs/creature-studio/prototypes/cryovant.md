# Prototype 3: Cryovant, Shard Glider

Rare · Crystal · dex 10 · catalogued · renderer `src/components/creature/species/cryovant.tsx` · personality: Precise, Cold, Elegant.

> *"Cryovant's bell is grown from lattice ice — every facet a frozen hash, every shard tendril a broken one."*

Original references: [`../baseline/rare.webp`](../baseline/rare.webp) (Cryovant row), `docs/creature-art/reference/species/cryovant.webp`, `creatureDesigns.json → species.cryovant`.

## 1. What must remain recognisable

- **Floating crystal jellyfish**: a faceted bell with hanging **chains of diamond shards**.
- Two ribbon oral arms; inner glowing core.
- Solgem at the **core** of the bell.
- Ascended "chandelier" idea: a crown spire and cascading chains.
- Clear blue refractive crystal; precise, cold, elegant.

## 2. What changes, and why

The vector bell is a wireframe dome with cartoon googly eyes at Eggling and Hatchling, and the Ascended adds rainbow rays and wire arms that clutter the thumbnail.

**New anatomy.**
- The bell is **cut like a gemstone**: a faceted crown on top (table + bezel facets) above a **soft frosted skirt** at the rim. Hard facets over soft frost is the species' material contrast.
- Instead of two big eyes: a **ring of small photophore eyes** under the rim (5 at Evolved), with the two front ones larger, so it has a face without becoming a cartoon.
- Tendrils: shard chains of **graduated** diamonds (large near the bell, tiny at the tips) so they read as one curtain at thumbnail size, plus two smooth ribbon arms in the centre.
- Core: the Solgem floats inside the bell, visible through the facets and refracted into two or three offset copies.

**Silhouette read:** gem-cut dome over a tapering curtain. Black-fill test: faceted top edge + curtain.

## 3. Face and personality

- **Default expression: cool appraisal.** The two front photophores are slightly narrowed (lit as horizontal ovals), the bell tilts a few degrees as if inspecting the viewer.
- Eggling keeps big round photophores to stay endearing, but they are lights, not cartoon eyes with pupils.

## 4. Signature details

- Gem-cut bell crown; frosted skirt with tiny icicle points.
- Graduated shard chains.
- Refracted Solgem core.
- At Ascended, a **spire** of crystal grows from the bell crown, and chains loop between the bell rim points like a chandelier.

## 5. Materials, texture, light and colour

- Crystal: hard facet planes, background colour visible through it, a single sharp specular per facet group on the warm gold key-light side (upper left), restrained violet rim from behind (canon C2, C3).
- Frost: soft, matte, slightly blue-white `#bff3ff`.
- Body family `#1b4fa8` / `#6fb6ff` / `#0a1c4a`; accent `#7affff`.
- Refraction: spectral colour split allowed **only along 2–3 facet edges**, never as rainbow rays.
- Glow budget ≤ 5%: the core and photophores.

## 6. Elemental identity (Crystal)

Facets, chandeliers and fans; light enters and is bent. Cryovant is the cold, clear Crystal; Prismara is the warm, colourful one. Cryovant must never become rainbow.

## 7. Idle animation concept

Tier A (browser-only).
- **Loop (3.5 s):** bell contracts and relaxes (scaleY 0.96 ↔ 1.0 with a slight delay on the skirt), creature drifts up a few pixels on each pulse, shard chains lag behind and sway, the core glints once per loop, photophores blink in sequence around the ring.
- Layers: bell, skirt, chains (2–3 groups), ribbon arms, core glint.

## 8. Evolution

| | Eggling | Hatchling | Evolved | Ascended |
|---|---|---|---|---|
| Bell | small rounded crystal bud, few facets | taller bell, first table facet | full gem-cut crown + frosted skirt | larger bell with frost filigree on the skirt and a **crystal spire** on top |
| Photophores | 2 big round lights | 3 lights | ring of 5, front two larger | ring of 7, front two narrowed |
| Tendrils | 3 short shard chains | 5–6 chains | many long chains + 2 ribbon arms | cascading chains looping between rim points like a chandelier |
| Core | faint | soft glow | bright, refracted twice | bright, refracted three times |
| Attitude | wide-eyed, bobbing | curious drift | cool appraisal | serene authority |

Continuity anchors: blue crystal family, frosted skirt, shard-chain tendrils, core Solgem, photophore ring.

## 9. Generation prompts

Use the shared style block from [`velynx.md`](velynx.md) §9 (for a floating creature: centred in frame, no shadow). Reference images: Cryovant baseline row, `reference/species/cryovant.webp`.

1. **Eggling.** A tiny floating crystal jellyfish bud: a small rounded bell of clear blue ice with only a few facets and a soft frosted rim, two big round glowing photophore lights under the rim like wide eyes, three short chains of graduated diamond shards hanging below. A faint diamond gem glows inside the bell.
2. **Hatchling.** A small floating crystal jellyfish with a taller faceted bell of clear blue ice and a frosted skirt, three small photophore lights under the rim, five or six hanging chains of graduated diamond shards. A softly glowing diamond gem visible inside the bell.
3. **Evolved.** A floating crystal jellyfish whose bell is cut like a gemstone: sharp faceted crown over a soft frosted blue-white skirt with tiny icicle points. A ring of five small glowing photophores under the rim, the front two slightly narrowed in cool appraisal. Many long chains of graduated diamond shards hanging in a curtain, two smooth translucent ribbon arms in the centre. A bright diamond gem core visible inside the bell, refracted into two faint copies. Spectral colour only on two or three facet edges.
4. **Ascended.** A large floating crystal jellyfish like a living chandelier: a gem-cut bell with frost filigree on its skirt and a tall crystal spire growing from its crown, a ring of seven photophores under the rim, cascading chains of graduated diamond shards looping between the rim points, two long ribbon arms. A brilliant diamond gem core refracted into three copies. Serene and precise. No rainbow rays.
