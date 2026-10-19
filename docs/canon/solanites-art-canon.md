# Solanites art canon

**Version 2 · 2026-10-19 · canonical for all artwork.** Written on `design/eclipse-vigil-code` at the owner's request ("one canonical art direction document"). It is version 1 (Creature Studio's proposal, `creature-studio/art-direction` commit `33ce366`) with the owner's later decisions applied and the evidence from the website round-1 audit (`website-round-1-audit.md`). Every change from version 1 is listed in §6, so the other two branches can adopt this file verbatim at the same path. Nobody edits another workstream's branch.

Where an older document disagrees with this one about artwork, this one wins:

- `docs/creature-studio/art-bible.md` and `prototypes/*` (Creature Studio)
- `docs/design/creative-direction.md`, `art-direction-v2.md`, `phase-1.md`, `alignment.md` (design)
- the website session's Phase A and B1 review pages

Site UI rules that do not touch artwork (type, buttons, plates, the 12-tick ring, motion) stay with the design branch and the website code.

## 1. Name and scope

The direction is **The Eclipse Vigil** (approved by the owner by that name). The design branch's **Celestial Atlas** vocabulary (constellations, gold engraving, the Threshold) survives only as *site UI* devices. For artwork, the direction means three things:

- **Eclipse light:** one warm gold key light, a restrained violet rim, deep cosmic darkness. Light comes from the eclipse corona and from Solgems, nowhere else.
- **The Vigil:** time and progress belong to the UI ring, never to the artwork.
- **The world, not the interface:** constellations, engraving, frames and ground are drawn by the site, never baked into artwork.

## 2. Rules for all creature artwork

| # | Rule | Value |
|---|---|---|
| C1 | **Finish** | Stylised, **hand-painted 2D** illustration: a clean graphic silhouette, coloured linework (darkest local colour, never black) that thins in the light, painted volume in three values, and visible but controlled brushwork. **Not** 3D render, not "collectible sculpture / museum light", not photoreal, not flat vector, not anime or chibi. |
| C2 | **Key light** | Warm gold (`#ffe2a8`) from the upper left (11 o'clock). The only key light. |
| C3 | **Rim light** | Restrained violet (`#7d5cf0` family) along the back and right edges, from behind and lower right. Strong enough to separate a dark body from a dark background (C9); never a glow halo. The element colour may tint the rim up to about 25%. |
| C4 | **Emission** | Only from anatomy (glyphs, lure, seams, eyes from Epic up, the Solgem). Budget as a share of the silhouette: Common ≤ 3%, Rare ≤ 5%, Epic and Legendary ≤ 10%, Mythic ≤ 15%, Secret free. |
| C5 | **Never in the artwork** | Ground planes, horizon lines, contact or cast shadows, floor glints, pedestals, light cones, halos, radial rays, sparkle stars, lens flares, lightning, **coloured glow or bloom in the air around the creature**, particles more than one body-width away, text, logos (including Solana marks), frames. Mechanical joints (rings, rivets, plates at elbows and knees) unless the species is built of metal. |
| C6 | **Background** | Delivered transparent; reviewed on flat obsidian `#07060d`. Any ground or shadow is drawn by the site (§5, decision 1). |
| C7 | **Camera** | Three-quarter view facing left, eye level. Frontal symmetry only for Mythic "deity" forms and abstract Secret forms. |
| C8 | **Identity** | Every species keeps its shipped body plan, **palette family** (`src/lib/species.ts`), name, element, rarity, Solgem position and evolution count. Where references disagree, the shipped body plan wins. Stormquill, Aurelion, Zephrax and Mossling get an individual review before their designs lock. |
| C9 | **Readability** | A solid black-fill at 48 px identifies the species. In colour at 48 px on `#07060d`, pixels with luminance > 20 of 255 have a **median ≥ 70 and a 25th percentile ≥ 45**. |
| C10 | **Stages** | Each stage changes at least two of: head-to-body proportion, primary shape, pose, appendage count. One signature trait persists and grows. Ascended changes the silhouette or posture, not just the glow. |
| C11 | **Faces** | Species-specific eyes (shape, lids, pupils) and a readable expression (brow or lid, eye, mouth corner) matching the species' written temperament. One catchlight per eye, upper left. No human make-up conventions (eyeliner, lashes) unless the brief asks for them. |
| C12 | **Delivery** | One file per species × stage. **Master 2048 × 2048 transparent** (owner decision), larger where the final display size needs it; the pipeline delivers 1024 and thumbnails and never enlarges. Every master passes `scripts/lib/image-quality.mjs` (not upscaled) and a 100% review. Multi-stage sheets are studies only. |

## 3. The Eclipse Phoenix (hero key art)

| # | Rule |
|---|---|
| P1 | Same finish as C1 (hand-painted 2D), owner decision. It is the **monumental mythic figure** of the world: more scale, detail and presence than any creature, but the same light and paint. |
| P2 | It must read as a **phoenix**, not an eagle or griffin: long trailing tail plumes, a crest, flight feathers whose tips turn to corona light. It must stay distinct from Pyraurum (the collectible Ember phoenix). |
| P3 | The eclipse is in the sky, **not centred behind the head** (that reads as a halo, C5). |
| P4 | Desktop: the left 40% stays clear for the headline (mean luminance < 8%, measured by `docs/design/tools/phoenix_qa.py`), clipped highlights < 0.5%. |
| P5 | A **separate portrait composition** for phones (figure in the top 55%), never a crop of the landscape one. |
| P6 | Masters: desktop ≥ 2560 × 1440 native (3840 × 2160 preferred), mobile ≥ 1080 × 1920; `scripts/hero-art.mjs` validates and encodes. |

## 4. Shared assets and governance

| # | Rule |
|---|---|
| A1 | **Glyph: the Epoch Ring**, Creature Studio's mark B (`docs/creature-studio/glyph/mark-b-epoch-ring.svg`), implemented as `src/components/brand/EpochRing.tsx`. It replaces every third-party mark on creatures. At 12 px its 4-unit stroke falls to about 1 px; a heavier small-size cut is an open item (§5). |
| G1 | **One credit ledger** for the shared Runway workspace: `docs/canon/generation-ledger.md` (on `creature-studio/art-direction`). Every generation is logged with its task ID, time (UTC), workstream, prompt, model, size and the balance before and after. |
| G2 | **One budget.** Caps are approved per batch by the owner and apply to the workspace, not to each workstream. |
| G3 | **No generation** without a written prompt in the repo and the owner's approval for that batch. |
| G4 | Concepts: nano-banana-pro, **2K**. Measured: 1K and 2K both cost 20 credits per image in this workspace, and the 2K outputs carry native detail (spectral check), so 2K costs nothing extra and can be inspected at production size. 4K only with approval and a measured price. |
| G5 | **Pause:** all paid generation in every workstream is paused until the owner approves a batch. |
| G6 | Originals are preserved: review images stay byte-for-byte in review folders (`art/creature-studio/…`, `art/review/…`); shipped SVG artwork is never edited for redesign work; nothing reaches `art/creatures/` until a complete set is approved. |

## 5. Decisions still open (owner)

1. **Site-side ground under creatures and eggs** (design v1 gilt floor glint / Threshold vs the current soft shadow). Default until decided: the existing shadow only.
2. **Stage scale in frame.** Proposed 45 / 60 / 78 / 88% of frame height, never breaking the frame.
3. **Pyraurum's Ascended halo** as anatomy, or none.
4. **Transparent production output.** nano-banana-pro cannot output transparency. Options: a model that can (seedream-5-pro, gpt-image-2; prices not yet measured) or Runway background removal (sam3, birefnet-v2; price not yet measured). Needs one measured test before stages.
5. **Small-size Epoch Ring cut** (heavier strokes below 16 px).
6. **Shared data text:** `src/data/creatureDesigns.json → style.prompt` still says "3D character". Changing it alters generated prompt docs; website builder to change on approval.

Decided since version 1: phoenix finish (P1), prototype set (Velynx, Mossling, Cryovant), master size (C12), direction name (§1), concept size (G4).

## 6. Changes from version 1 (`33ce366`)

| Where | Version 1 | Version 2 | Why |
|---|---|---|---|
| §1 name | The Celestial Atlas | The Eclipse Vigil (Atlas devices are UI only) | Owner approved "The Eclipse Vigil" by name |
| C5 | — | adds glow in the air, mechanical joints | Round-1 audit: Cryovant's air glow fills its 48 px black-fill; Velynx grew mechanical joint rings |
| C8 | — | adds palette family | Round-1 audit: Mossling drifted from hue 150° to 45° |
| C11 | — | no human make-up conventions | Round-1 audit: Velynx eyeliner and lashes |
| C12 | 1024 × 1024 delivery | 2048 master, 1024 delivered | Owner decision |
| §3 | phoenix was open decision 3 | P1–P6 | Owner decision; phase-1 QA checks adopted |
| A1 | glyph referenced in C5 only | Epoch Ring rule | Two drawings were both called "Epoch Ring"; mark B was selected first and is canonical |
| G4 | 1K concepts | 2K concepts | Same measured price; inspectable at production size |
| §5 | 5 open decisions | 3 carried (ground, scale, Pyraurum), 3 new (transparency, small glyph, shared style text) | Phoenix, prototype set decided by owner |
