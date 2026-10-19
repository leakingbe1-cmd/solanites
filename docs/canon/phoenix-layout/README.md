# Phoenix hero: free layout tests (existing image only)

Run 2026-10-19 against the live homepage code on `creature-studio/art-direction`. The app code there is identical to `main` (`f6d6ed5`). The site ran locally with `SOLANITES_FIXTURES=1 npx next dev`, `?intro=0` and reduced motion. **The image was not generated, edited, upscaled or overwritten.** Variants are CSS injected at test time only; no site file was changed.

Reproduce with `phoenix-layout-test.mjs` in this folder. Screenshots and raw numbers are in `results/`.

## What is being tested

- **Image:** `public/hero/phoenix-2000.webp`, 2000 × 1116; the browser picked this file at every width.
- **Composition:** frontal and symmetrical, wings spanning x 60–1940 of the 2000 px width, eyes at (1020, 373).
- **Canon problems the CSS can't fix:** a baked-in **halo** and **violet lightning** (canon C6), and a **photoreal**, not hand-painted, finish (C1). Under canon W3 it stays live until a replacement is approved.

**How each metric was measured:**
- **Text background:** each text box was measured on a screenshot taken with the hero copy hidden, using the 95th-percentile background luminance. "White contrast" is the WCAG ratio of white text against that p95.
- **Bright:** the share of pixels with relative luminance > 0.18.
- **Upscale factor:** device pixels per source pixel; above 1 means the browser enlarges the image.

Dimensions alone do not prove sharpness. Below 1 the image is shown at or below native size, but its own softness (soft face, clipped eyes; see `design/creative-direction` `art-direction-v2.md` §1.3) stays.

## Results

| Viewport | Variant | Upscale | Eyes at (x%, y%) | Clipped landmarks | Headline: p95 L / white contrast / bright | Lede | CTA row |
|---|---|---|---|---|---|---|---|
| 1440 × 900 | current | 0.94 | 64.3, 35.3 | right wingtip, tail tip | 0.075 / 8.4:1 / 1% | 8.5:1 / 0% | 16.4:1 / 0% |
| 1440 × 900 | proposal A | 0.84 | 71.2, 34.9 | right wingtip | 0.027 / **13.7:1** / 0% | 19.3:1 / 0% | 18.8:1 / 0% |
| 1920 × 1080 | current | **1.25** | 64.3, 34.4 | right wingtip, tail tip | 0.089 / 7.6:1 / 1% | **6.9:1** / 0% | 12.8:1 / 1% |
| 1920 × 1080 | proposal A | 0.97 | 71.0, 33.4 | right wingtip | 0.048 / **10.8:1** / 0% | 18.8:1 / 0% | 16.5:1 / 0% |
| 390 × 844 @3x | current | **1.27** | 52.1, 18.7 | both wingtips | 0.010 / 17.7:1 / 0% | 19.8:1 | 19.8:1 |
| 390 × 844 @3x | proposal A | 1.04 | 51.8, 15.4 | both wingtips | 0.003 / 19.8:1 / 0% | 19.8:1 | 19.8:1 |
| 430 × 932 @3x | current | **1.40** | 52.1, 18.7 | both wingtips | 0.012 / 17.0:1 / 0% | 19.8:1 | 19.8:1 |
| 430 × 932 @3x | proposal A | 1.15 | 51.9, 15.3 | both wingtips | 0.003 / 19.8:1 / 0% | 19.8:1 | 19.8:1 |

**Proposal A** (CSS only, in `phoenix-layout-test.mjs`):
- **Desktop:** the art is confined to the right 60% of the hero, the image sits at 50% / 32% inside that box, and a stronger left fade is applied.
- **Phones:** a 46svh art band with the image at 50% / 22%, and the copy fade starting at 30svh.

## Findings

1. **Contrast already passes; proposal A widens the margin.**
   - All text measures at least 6.9:1 against the brightest 5% of the background, at every width and in both variants.
   - The weakest case is the desktop lede at 1920 (6.9:1), because a darkened left wing sits behind it.
   - Proposal A raises the desktop headline to 10.8–13.7:1 and the lede to above 18:1.
2. **Text over feathers.**
   - **Desktop, current:** the headline and lede sit over the left wing. It is darkened by the shade gradient, so under 1% of pixels count as bright, but the feathers are still visible behind the words.
   - **Desktop, proposal A:** there is near-black space behind the copy. The left wing's outer feathers still lie under the shade, but none read as bright (0%).
   - **Phones:** in both variants the copy sits below the bird. No text overlaps feathers.
3. **Upscaling.** The current CSS enlarges the 2000 px file at 1920 desktop (1.25×) and on phones (1.27–1.40×). Proposal A brings desktop to native size or below (0.84–0.97×) and phones to 1.04–1.15×.
4. **Clipping and focal point.**
   - **Desktop:** the right wingtip is cropped in every variant. The current layout also crops the tail tip; proposal A keeps it in frame.
   - **Phones:** both wingtips are cropped in every variant. A wide, frontal, wing-to-edge composition can't fit a portrait frame without cropping.
   - **Focal point:** the eyes sit at 64–71% across on desktop and at 15–19% down on phones.
5. **What CSS can't fix.** No layout of this image removes the halo or lightning, makes it hand-painted, gives phones the whole bird, or keeps the full wingspan on desktop clear of the copy column. So the existing image **cannot meet the approved canon's composition target**. It stays live under W3, and proposal A is the best CSS-only interim.

## Replacement brief (for separate approval; nothing generated)

Two native images from one design: 16:9 desktop and 9:16 mobile.

- **Finish:** hand-painted 2D (canon C1). Warm gold `#FFE2A8` key light from the upper left; restrained violet rim from behind (C2, C3).
- **Never in the image:** halo, rays, sparkles, lightning, lens flare, ground, horizon, text or logo (C6).
- **Composition, 16:9:**
  - Three-quarter view turned toward the left.
  - The whole bird, both wingtips and the tail stay inside the **right 60%** of the frame.
  - The eyes sit at about **66% across, 30% down**.
  - The near wing rises up and back, cropped by the top edge.
  - The far wing folds down behind the body.
  - The **left 40%** is empty near-black: no feathers or light enter it.
- **Composition, 9:16:**
  - The whole bird, wingtips included, sits inside the **top 50%** of the frame, with the eyes at about 50% across, 20% down.
  - Wings are raised in a narrow V, not spread flat, so they fit the width.
  - The lower 50% is empty near-black for the copy.
- **Face:**
  - Long elegant skull, hooked beak, heavy-lidded amber eyes with one catchlight each.
  - The eyes are not glowing and not clipped.
  - Feathers grouped into clear tracts painted as flat warm-gold planes.
  - One cut-diamond Solgem on the chest is the only strong emission.
- **Resolution:** native 2752 × 1536 (16:9) and 1536 × 2752 (9:16). No upscaling to reach these sizes.
- **Acceptance, re-run with `phoenix-layout-test.mjs` after swapping the file locally (never in production paths):**
  - headline and lede ≥ 7:1 at all four widths;
  - bright share under the copy = 0%;
  - the whole bird in frame at all four widths;
  - upscale ≤ 1.0 on desktop and ≤ 1.1 on phones;
  - highlight clipping < 0.5% (`design/creative-direction` `tools/phoenix_qa.py`).
- **Starting point:** the design branch's `alignment.md` §3 prompt (built on website task `a0a5fc33`) already matches most of this. It needs the 9:16 framing above and a re-check against C2/C3.
