# Prototype milestone: Velynx, Mossling, Cryovant

Milestone A item 5 (briefs) and the plan for Milestone B (the prototype images). These three are an **approval gate** for the art direction, not the scope of the project. Mass production (Milestone C) starts only after they are signed off.

## Why these three

| | Velynx | Mossling | Cryovant |
|---|---|---|---|
| Rarity | Legendary | Common | Rare |
| Element | Shadow | Verdant | Crystal |
| Body plan | upright digitigrade biped | low, broad quadruped | floating radial invertebrate |
| Silhouette | tall and vertical | low and wide | dome with a hanging curtain |
| Main material | matte fur + emissive glyphs | moss, leaf, bark | ice-glass with refraction |
| Hardest problem it tests | originality, face acting, a final stage that transforms rather than grows | charm at Common rarity without cartoon blandness | transparency and glow discipline on a body that *is* a light source |

If the rules in [`../art-bible.md`](../art-bible.md) work across these three, they cover every other body plan in the collection: quadrupeds (Frostkit, Nyxara, Astravex), bipeds (Aurelion), fliers, swimmers and abstract forms (Pallow, Orbelith, GENESIS).

## Briefs

- [`velynx.md`](velynx.md), with the dedicated **Velynx evolution design sheet**
- [`mossling.md`](mossling.md)
- [`cryovant.md`](cryovant.md)

Each brief lists what must stay recognisable, the new anatomy and face, signature details, materials and light, element, idle animation and the four stages, then the exact generation prompts.

## Generation plan (needs approval: uses paid credits)

**Superseded at the Milestone A review:** generation now starts with a small Round 1 of concepts ([`round-1.md`](round-1.md)); the stage counts below are kept for reference. Nothing below has been run. Image generation through the connected Runway workspace spends credits, and the brief forbids spending them without explicit approval.

| Step | Images | Notes |
|---|---|---|
| 1. Style lock | 3 species × Evolved stage × 4 variants = **12** | Evolved first: it is the species' "true" form. Pick one per species. |
| 2. Stages | 3 species × 3 remaining stages × 3 variants = **27** | Approved Evolved image passed as a reference so identity carries across stages. |
| 3. Fixes | up to **9** | Edit passes on the chosen images (limbs, faces, glyph cleanup). |
| **Total** | **≤ 48 images** | Recommended model: one that supports transparent output (`gpt-image-2` or `seedream-5-pro` in the Runway tool), 1K square. |

Reference images for every call: the species' baseline render from [`../baseline/`](../baseline/) (shipped vector art, for identity and body plan) and, for Velynx, `docs/creature-art/reference/velynx-inspiration.png` (for palette and markings only).

Accepted images are saved as `art/creature-studio/<id>/<n>-<stage>.png` (review area, not read by the site). Nothing is copied into `art/creatures/` (the folder the site's build reads) until a prototype is approved **and** the website builder agrees on integration.

## Milestone B review sheet

For each prototype, a comparison board: original vector stage row above, redesigned stage row below, plus the black-fill, 64 px and grid tests from art bible §11. The board is built locally from the approved files (no further generation).
