# Creature art overhaul: pricing check, pilot proposal, ledger, integration checklist

Status 2026-10-19: proposal (historical). **Superseded:** the owner later approved the full overhaul; see `overhaul-acceptance.md` for the outcome.

## 1. Brief (owner, relayed 19 Oct)
- **Scope:** 28 existing species × 4 stages = 112 final artworks.
- **Edit, don't generate:** edit the existing artwork rather than generating new creatures.
- **Identity:** each species keeps its own silhouette, palette, personality, name, rarity and lore. Velynx is the quality bar, not a template.
- **Art direction:** canon C1–C13. Hand-painted 2D, `#FFE2A8` key from the upper left, restrained violet rim, no glossy 3D, no halos, no ground or floor glints, no excessive gradients. Framing 45 / 60 / 78 / 88 % ±3.
- **Budget:** a hard maximum of about 400 credits, which is not permission to spend.
  - Confirm the real price in the Runway UI before generating.
  - Keep a reserve for corrections.
  - No pricier model without approval.
  - No bulk run until the pilot passes.
  - Stop if the projection exceeds the budget or quality is inconsistent.

## 2. Pricing check (done, free)
| Model | Price per 1K image with a reference | Source |
|---|---|---|
| nano-banana-pro | **20** (measured 4×, including edits) | balance deltas, ledger |
| nano-banana-2.1 | **unconfirmed** | not exposed by the Runway connector |
| nano-banana-2-lite | **unconfirmed** | same |
| seedream-5-flash | **unconfirmed**; supports transparent PNG output, which would skip the local cut-out | same |
| gen-4-image-turbo | **unconfirmed** | same |

The connector (`whoami`, tool schemas, docs resources) lists the available models but no per-model prices. The free check is in the Runway web app: pick each model at 1K with one reference image attached, and read the credit number on the generate button.

**Owner action:** read those four numbers and send them over. Nothing runs.

## 3. Budget arithmetic
- 111 new images are needed. Velynx Evolved v2 exists but isn't approved, so it may be replaced too.
- A 20 % correction reserve means first attempts may use 400 / 1.2 ≈ 333 credits. So the **price must be ≤ 3 credits per image** for the whole catalogue to fit.

| Price per image | 111 first attempts | + 20 % reserve | Fits 400? |
|---|---|---|---|
| 2 | 222 | 266 | yes |
| 3 | 333 | 400 | just |
| 4 | 444 | 533 | **no**: stop and ask (raise the cap, or cut scope) |
| 20 (pro) | 2,220 | — | no |

## 4. Smallest useful pilot (proposal; needs your approval of price and scope)
- **Model pick:** 2 images. Mossling Evolved, edited on the two cheapest suitable models, using the same input and prompt.
- **Pilot:** 6 images. The winning model on Mossling stages 1, 2 and 4, plus Aurelion stages 1 and 3, plus Frostkit stage 3.
  - That gives Mossling's whole line (the consistency test).
  - It covers a Common, a Rare-like pale species and a complex winged Legendary.
  - It includes the hardest framing cases: Eggling at 45 % and Ascended at 88 %.
- **Total: 8 images.** At 3 credits that is ≈ 24; at 4 it is ≈ 32. The exact number is quoted once the UI prices are known.

**Method per image:**
- The shipped stage drawing is the only reference (`render-vector-hires.mjs`, 2048 px). The prompt says: *keep this exact creature, anatomy, pose, proportions and palette; repaint it as hand-painted 2D* plus the canon light block.
- No Velynx image is used as a reference, so Velynx anatomy can't leak in. Velynx sets the quality bar only.
- Afterwards, free local steps: cut-out, framing (`measure-framing.py`), the readability check (C9) and the emission check (C5). The before/after board is added to `art/creature-studio/pilot/`.

**Pass criteria:**
1. Identity matches the shipped drawing (same silhouette at a 48 px black fill).
2. It reads as painted, not vector or 3D.
3. Key light and rim follow the canon.
4. No halos, ground or text.
5. Framing within ±3.
6. The four Mossling stages look like one creature.

**No retries inside the pilot.** A failure is reported, not regenerated.

## 5. Completion ledger
Template, filled as work happens:

| Species | Stage | File | Model | Task | Credits | Status (finished / provisional / placeholder / requiring review / rejected) |
|---|---|---|---|---|---|---|
| velynx | 3 | `art/creature-studio/velynx/3-evolved-v2-raw-21e98b40.png` | nano-banana-pro | 21e98b40 | 20 (earlier brief) | requiring review |
| 4 species | 1–4 | `art/creature-studio/free-paint-pass/` | local, free | — | 0 | rejected (worse than the originals) |

- **Spent under this brief:** 0 of 400. **Remaining:** 400.
- **Outstanding:** 112 stages.

## 6. Website integration checklist (for the website session; no website code is edited here)
1. **When to move files:** only when a species' full 4-stage line is approved. Move `art/creature-studio/<id>/<n>-<stage>.png` to `art/creatures/<id>/`, then run `npm run art:build` on `design/eclipse-vigil-code`.
2. **File names:** `1-eggling.png`, `2-hatchling.png`, `3-evolved.png`, `4-ascended.png`. Each is 1024², transparent, and framed to C13.
3. **Classified art (the four Mythic and two Secret species listed in `src/server/classified`):**
   - Never put it under `public/` or `public/creatures/<id>/`; a guessable URL leaks the species.
   - Serve it only through the website session's server-side classified path (non-guessable, access-checked).
   - Never list it in `src/data/creatureAssets.json` or anything else in the client bundle.
4. **Presentation:** `ornament="vigil"` (no aura, ground ellipse or halo; canon W1–W2). Environments stay separate CSS layers.
5. **Checks:** verify the vector fallback still renders for unmigrated species, and run the 48 px readability check on the live card.
