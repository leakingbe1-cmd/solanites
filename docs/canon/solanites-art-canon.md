# Solanites art canon

**Status: APPROVED by the owner on 2026-10-19.** This is the one authoritative document for creature art, the phoenix and how artwork is presented on the website. It binds all three workstreams:

- creature-studio (`creature-studio/art-direction`)
- design (`design/creative-direction`)
- website (`design/eclipse-vigil-code`, the "Solanites interactive website" session)

Where any other document disagrees with this one, this one wins. Site UI rules that do not touch artwork (type, buttons, plates, the 12-tick Vigil ring, motion) stay with `design/creative-direction`.

**Branch isolation:** this file is maintained on `creature-studio/art-direction`. Other branches copy it verbatim to the same path (`docs/canon/solanites-art-canon.md`) and mark their own superseded sections; nobody edits another workstream's branch and nothing is merged to do this.

## 1. Name

The direction is **The Celestial Atlas** (the Eclipse Vigil folded in). For artwork:

- **Eclipse light:** warm gold key light plus a restrained violet rim.
- **The Vigil:** the 12-tick ring belongs to the UI only.
- **The Atlas:** constellations and engraving belong to the UI only, never to the artwork.

## 2. Artwork rules (creatures and the phoenix)

| # | Rule |
|---|---|
| C1 | **Finish.** Stylised, **hand-painted 2D** throughout, **including the phoenix**. Clean graphic silhouette, coloured linework (darkest local colour, never black) that thins in the light, painted volume in three values, visible but controlled brushwork. Not 3D render, not photoreal, not "collectible sculpture / museum light", not flat vector, not anime or chibi. |
| C2 | **Key light.** Warm gold **`#FFE2A8`** from the **upper left**. The only key light. |
| C3 | **Rim light.** Restrained **violet** (`#7D5CF0` family) from **behind**, catching the back and outer edges of the silhouette. It must be strong enough to separate a dark silhouette from a dark background (C9), and never becomes a glow halo around the creature. |
| C4 | **Identity.** Every species keeps its established identity, anatomy and distinctive silhouette: its shipped body plan, name, element, rarity, Solgem position and four evolution stages. Stormquill, Aurelion, Zephrax and Mossling get an individual review before their designs lock. **Mossling keeps its antlers.** |
| C5 | **Emission.** Only from anatomy (glyphs, lure, seams, eyes from Epic up, the Solgem), within the rarity limits as a share of the silhouette: Common ≤ 3%, Rare ≤ 5%, Epic ≤ 10%, Legendary ≤ 10%, Mythic ≤ 15%, Secret free. |
| C6 | **Never in the artwork:** ground planes, contact or cast shadows, floor glints, horizon lines, pedestals, light cones, **halos (including Pyraurum's: removed)**, radial rays, sparkle stars, lens flares, lightning, decorative particles, text, logos (no Solana marks; the Solanites glyph is Epoch Ring), frames. |
| C7 | **Background.** Final creature art is transparent; review images use flat `#07060d`. |
| C8 | **Camera.** Three-quarter view facing left, eye level. Frontal symmetry only for Mythic "deity" forms and abstract Secret forms. |
| C9 | **Readability.** The 48 px solid black-fill identifies the species. In colour, downscaled to 48 px on `#07060d`, the creature's pixels (luminance > 20/255) have a **median luminance ≥ 70 and a 25th percentile ≥ 45**. Calibration: V-A scores 54 / 40 (fail), Velynx `fb118638` 70 / 50, Mossling `ce879099` 97 / 77. |
| C10 | **Stages.** Each stage changes at least two of: head-to-body proportion, primary shape, pose, appendage count. One signature trait persists and grows. Ascended changes the silhouette or posture, not just glow. |
| C11 | **Faces.** Species-specific eyes and a readable expression (brow or lid, eye, mouth corner). One catchlight per eye, upper left. |
| C12 | **Delivery.** One file per species × stage, 1024 × 1024, transparent, through the existing pipeline. Multi-stage sheets are studies only. |
| C13 | **Stage framing.** Occupancy targets: stage 1 = **45%**, stage 2 = **60%**, stage 3 = **78%**, stage 4 = **88%** of the frame, ±3 points. Measured exactly as in §3. |

## 3. How framing is measured (C13)

Every asset is checked with `docs/canon/measure-framing.py` (free, local):

- **Frame:** the full delivered canvas (1024 × 1024).
- **Creature pixels:** alpha ≥ 32 on transparent files; on review images, luminance differing from the `#07060d` background by more than 16/255. A 3 px median filter is applied, and connected specks smaller than 0.1% of the frame are ignored.
- **Box:** the smallest rectangle containing all creature pixels.
- **Occupancy** = the larger of box height and box width ÷ frame size. The larger side is used so tall, long and wide body plans are judged alike.
- **Placement:** box centre at 50% / 50% of the frame, ±3 points. There is no ground line, because nothing stands on a floor.

Example: V-A measures 84.4% (stage 3 target 78%: **fail**), centre 55.8% / 49.4% (**fail**).

## 4. Website presentation rules

| # | Rule |
|---|---|
| W1 | **No ground in presentation either:** no contact shadows, floor glints, pedestals or horizon lines under creatures, eggs or the phoenix. |
| W2 | No decorative halos, rays, sparkles, nebula blobs or rarity auras behind artwork. Species glow comes only from the artwork, within C5. |
| W3 | The existing phoenix stays live until a replacement is separately approved. |

Where the current site breaks W1–W2 (the creature shadow ellipse, the Ascended halo, rarity auras), the fixes are listed in `docs/creature-studio/website-builder-handoff.md` for the website workstream.

## 5. Prototypes

The first three prototypes are **Velynx, Mossling and Cryovant**. No other species starts until their four-stage evolution lines are approved. Velynx requirements: `docs/canon/reconciliation-2026-10-19.md` §3 (upright biped, long fingers, cheek tufts, clear ear notch, strong violet rim, warm gold key, glyph tile under one foot, dark-background readability; V-A is a rendering reference only).

## 6. Credit policy

| # | Rule |
|---|---|
| G1 | **Shared future budget: 180 Runway credits** across all three workstreams. |
| G2 | The **80 credits** spent by the website session at 20:35 UTC and the **20 credits** spent on V-A are **historical** and outside this budget. |
| G3 | **ALL PAID GENERATION IS PAUSED.** No generation, retry, upscale, background removal or any other paid image operation. |
| G4 | The budget is **not** permission to generate. **Each image needs its own explicit owner approval** before it is generated. |
| G5 | Every generation is logged in `docs/canon/generation-ledger.md` with task ID, time, workstream, prompt location, model, size and balance before and after. |
| G6 | Concept model and size when approved: nano-banana-pro, 1K, square (measured 20 credits per image; 2K also measured at 20). |

## 7. Superseded rules

These rules are void in every workstream, whatever document they appear in:

| Superseded rule | Where it appeared | Replaced by |
|---|---|---|
| "Stylised realism, a collectible sculpture under museum light" | `design/creative-direction` `art-direction-v2.md` §3.2 rule 6 | C1 |
| Contact shadow, gilt floor glint, matte obsidian ground, Threshold horizon under subjects | `creative-direction.md` §2.7.3, `art-direction-v2.md` §2.3 and §3.2.6, `phase-1.md` §2 | C6, W1 |
| Photoreal phoenix ("hammered molten gold… filmic contrast", "photoreal VFX") | `art-direction-v2.md` §1.4, `phase-1.md` §1.4 | C1 (hand-painted 2D) |
| Mossling as a "mossy boulder", antlers dropped, stone shell, grove-tortoise | `art-direction-v2.md` §3.3, `phase-1.md` §3, `docs/design/mossling/*.svg` | C4 (antlers kept) |
| Pyraurum's ember becoming a halo at Ascended | `art-direction-v2.md` §3.3 | C6 (no halo) |
| "Warm-neutral" key light; "cool cyan-violet" rim from the right | `docs/creature-studio/art-bible.md` §7 (before this approval); `design/creative-direction` `alignment.md` | C2, C3 |
| ~80% framing for every stage; ground line at 88% | `docs/creature-studio/art-bible.md` §10 (before this approval) | C13, §3 |
| Eggling 40 / Hatchling 55 / Evolved 75 / Ascended 90%+, frame-breaking allowed | `art-direction-v2.md` §3.2 rule 5 | C13 |
| Duskwing and Pyraurum as prototypes | `art-direction-v2.md` §3.3 | §5 |
| Separate 180-credit ceilings per workstream | `phase-1.md` §1.2, creature-studio Round 1 | G1 |
