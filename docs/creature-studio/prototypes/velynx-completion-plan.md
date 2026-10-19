# Velynx: completion and animation plan (costed, nothing approved yet)

Status 2026-10-19: Evolved v1 generated (20 credits). Velynx ceiling **80**, so **60 remain** (none authorised). Shared budget 180, so 160 remain. **No spending without separate owner approval for each image.**

## 1. Known prices

| Operation | Price | Evidence |
|---|---|---|
| nano-banana-pro, 1K, with reference images (new image **or** edit of an existing one) | **20 credits** | Measured twice in this workspace with references: V-A (1 reference) 2,035 → 2,015; Evolved v1 (2 references) 1,935 → 1,915. An edit is the same call with the source image as reference 0. |
| nano-banana-2.1, 1K | **unknown** | Available in the workspace. Not published for the Runway app; the tool's cost notes are truncated; only token prices and other platforms' prices exist. Not confirmable without spending, so not used. |
| Local cut-out, framing, checks, recolour tests, CSS animation and environments | **0** | `tools/cutout-and-frame.py`, `docs/canon/measure-framing.py`, browser checks |
| Runway background removal (sam3 / birefnet-v2) | unknown, not needed | the local cut-out passed on v1 |
| Image-to-video | unknown; quote before any approval | not part of this plan |

**How to confirm the 2.1 price for free:** in the Runway web app, choose Nano Banana 2.1 at 1K. The app shows the credit cost on the generate button before anything runs. If you read that number, option (a) becomes possible.

## 2. Static stages within the 80 ceiling

| Step | What | Method | Credits |
|---|---|---|---|
| 0 | Evolved v1 | done | 20 (spent) |
| 1 | **Evolved v2**: v1 edited to charcoal fur, stronger violet rim; anatomy, pose, silhouette and details unchanged | nano-banana-pro edit, v1 as reference 0, mid-grey background | 20 |
| 2 | **Hatchling** | edit-style generation: Evolved v2 for identity, shipped Hatchling drawing for pose | 20 |
| 3 | **Ascended** | same method with the shipped Ascended pose | 20 |
| | **Total with nano-banana-pro** | | **80, the ceiling** |
| 4 | **Eggling** | not funded within 80 at 20 per image | needs either a confirmed cheaper price (option a) or a later approval |

So at the known price, **80 covers the corrected Evolved plus two more stages, not all four.**

- **(a) Confirm the 2.1 price**, then run steps 2–4 on it. At its ~4-credit API price, steps 1–4 would total about 32, giving **~52 overall**. That's an estimate until the app shows the real number.
- **(b) Stay on nano-banana-pro:** run steps 1–3 now (60, reaching 80), and leave the Eggling on the shipped drawing until you decide.

Every stage, at no cost: local cut-out; framing to 45 / 60 / 78 / 88 % (downscaling only); the readability (C9) and emission checks; comparison with the shipped drawing; and a preview through the real `art:build` pipeline in a throwaway copy.

## 3. Environments (separate from the creature art)

Velynx backdrop as a website layer only, built with CSS and existing tokens, no paid art:
- a dusk gradient: obsidian `#07060d` fading to deep violet, with a faint teal cast high on the right;
- a very low-contrast grid of Velynx glyph marks (the existing `glyph/velynx-glyphs.svg`), drifting slowly;
- no ground, horizon, halo, rays, sparkles or particles (canon W1, W2).

Cost **0**. A paid painted backdrop would need its own estimate and approval.

## 4. Animation (after the four static stages are approved)

| Tier | Where | What | Cost |
|---|---|---|---|
| A: CSS on the single image | everywhere, including grids | idle breathing (scale 1–2 % from the feet), slow bob, glyph glow pulsing through a locally extracted cyan mask, a backdrop glyph drift; all off under reduced motion | 0 |
| B: local layers | detail view, hatch reveal | tail sway and ear flick need the tail and ears cut onto their own layers. The parts behind them would need repainting; locally that is feasible only where nothing is hidden (the tail curve on Velynx). Blinks need painted eyelid overlays, which are possible locally but should be checked against the face quality | 0 (local), or a few 20-credit edits for clean hidden areas, quoted per stage |
| C: image-to-video | Ascended only, if A and B are not enough | a 4–5 s idle loop from the approved still | quote first (Runway video is priced per second) |

Recommended order: A for all four stages, then B for Ascended's tail, and C only if you still want more motion after seeing A and B.
