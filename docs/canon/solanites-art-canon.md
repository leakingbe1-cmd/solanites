# Solanites art canon

**Status: PROPOSED, awaiting owner approval. Not yet binding.** Drafted 2026-10-19 on `creature-studio/art-direction` to reconcile that branch with `design/creative-direction`. Neither branch has been merged or overwritten.

Once approved, this is the **one authoritative document** for creature and key art. Both workstreams follow it, and where any older document disagrees, this one wins:

- `docs/creature-studio/art-bible.md` and the `prototypes/` briefs (creature-studio)
- `docs/design/creative-direction.md`, `art-direction-v2.md` and `phase-1.md` (design)

Site UI rules that do not touch artwork (type, buttons, plates, the Vigil ring, motion) stay with `design/creative-direction`.

**How it gets into both branches without a merge:** after approval, this single file is copied to the same path on each branch (`docs/canon/solanites-art-canon.md`). Each workstream then adds a "superseded by the canon" note to its own conflicting sections. Nobody edits the other workstream's branch.

## 1. Name and scope

The direction is **The Celestial Atlas**, with the Eclipse Vigil merged in (as `design/creative-direction` `phase-1.md` §2 defines). For artwork, that means three things:

- **Eclipse light:** one warm gold key light, plus a thin violet rim.
- **The Vigil:** time and progress belong to the UI ring, never to the artwork.
- **The Atlas:** gold engraving and constellations belong to the UI, never to the artwork.

## 2. Rules for all creature artwork

| # | Rule | Value |
|---|---|---|
| C1 | **Finish** | Stylised, **hand-painted 2D** illustration: a clean graphic silhouette, coloured linework (darkest local colour, never black) that thins in the light, painted volume in three values, and visible but controlled brushwork. **Not** 3D render, **not** "collectible sculpture / museum light", not photoreal, not flat vector, not anime or chibi. |
| C2 | **Key light** | Warm gold (`#ffe2a8`) from the upper left (11 o'clock). The only key light. |
| C3 | **Rim light** | Restrained violet (`#7d5cf0` family) along the back and right edges of the silhouette, from behind and lower right. Strong enough to separate a dark body from a dark background (C9); never a glow halo. The element colour may tint the rim up to about 25%. |
| C4 | **Emission** | Only from anatomy (glyphs, lure, seams, eyes from Epic up, the Solgem). Budget as a share of the silhouette: Common ≤ 3%, Rare ≤ 5%, Epic and Legendary ≤ 10%, Mythic ≤ 15%, Secret free. |
| C5 | **Never in the artwork** | Ground planes, horizon lines, contact or cast shadows, floor glints, pedestals, light cones, halos, radial rays, sparkle stars, lens flares, lightning, particles more than one body-width from the creature, text, logos (including Solana marks; the Solanites glyph is Epoch Ring), frames. |
| C6 | **Background** | Delivered transparent; reviewed on flat obsidian `#07060d`. Any ground or shadow is drawn by the site, not the artwork (§4). |
| C7 | **Camera** | Three-quarter view facing left, eye level. Frontal symmetry only for Mythic "deity" forms and abstract Secret forms. |
| C8 | **Identity** | Every species keeps its shipped body plan, name, element, rarity, Solgem position and evolution count. Where references disagree, the shipped body plan wins. Stormquill, Aurelion, Zephrax and Mossling get an individual review before their designs lock. |
| C9 | **Readability** | A solid black-fill at 48 px identifies the species. In colour at 48 px on `#07060d`, the body (not only its accents) reads: downscaled to 48 px, the creature's pixels (luminance > 20 of 255) have a **median luminance ≥ 70 and a 25th percentile ≥ 45**. Calibrated on real images: V-A scores 54 / 40 (fails; its body visibly disappears), a warmer-lit Velynx scores 70 / 50 (borderline pass), and a Mossling scores 97 / 77 (pass). |
| C10 | **Stages** | Each stage changes at least two of: head-to-body proportion, primary shape, pose, appendage count. One signature trait persists and grows. Ascended must change the silhouette or posture, not just add glow. |
| C11 | **Faces** | Species-specific eyes (shape, lids, pupils) and a readable expression (brow or lid, eye, mouth corner). One catchlight per eye, upper left. |
| C12 | **Delivery** | One file per species × stage, 1024 × 1024, transparent, via the existing pipeline. Multi-stage sheets are studies only, never final assets. |

## 3. Generation governance (both workstreams)

| # | Rule |
|---|---|
| G1 | **One credit ledger** for the shared Runway workspace: `docs/canon/generation-ledger.md`. Every generation is logged with its task ID, time (UTC), workstream, prompt file, model, size and the measured balance before and after. |
| G2 | **One budget.** Caps are approved per batch by the owner and apply to the workspace, not to each workstream separately. |
| G3 | **No generation** without a written prompt in the repo and the owner's approval for that batch. Exploratory or unlogged runs are not allowed. |
| G4 | Model and size for concepts: nano-banana-pro, 1K, square (measured 20 credits per image). 2K or 4K only with approval. |
| G5 | **Pause:** as of 2026-10-19 all paid generation in both workstreams is paused until the owner approves otherwise. |

## 4. Decisions the owner still needs to make (not decided by this draft)

1. **Site-side ground treatment.** `creative-direction.md` §2.7 has the site draw a contact shadow and a gilt floor glint under every creature and egg, and phase 1 places them on a Threshold horizon. The shipped site already draws a soft shadow ellipse. This canon keeps all ground out of the *artwork* (C5). Whether the *site* adds the gilt floor glint or Threshold under creatures is a separate decision. Default until decided: the existing shadow only.
2. **Stage scale inside the frame.** v2 asks for Eggling 40%, Hatchling 55%, Evolved 75%, Ascended 90%+ of frame height (breaking the frame allowed). The creature-studio spec uses about 80% for every stage, because the site scales stages itself. Proposed: progressive 45 / 60 / 78 / 88%, never breaking the frame.
3. **Phoenix key art finish.** The design branch's phoenix prompts are photoreal "hammered molten gold, filmic". Does C1 (hand-painted 2D) also apply to the hero phoenix, or only to creatures?
4. **Halos.** v2 makes Pyraurum's tail ember become a halo at Ascended. C5 forbids halos in artwork. Either allow a halo as anatomy for Pyraurum only, or drop it.
5. **Prototype set.** Creature-studio: Velynx, Mossling, Cryovant. Design: Mossling, Duskwing, Pyraurum. Proposed: one set, owned by one workstream.
