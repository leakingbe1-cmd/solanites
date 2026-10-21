# Runway production plan (not generated: needs owner approval)

## What exists (checked in the Runway library, no credits spent)

| Asset | Runway task | Native output | Usable on the site? |
|---|---|---|---|
| Phoenix awakening, 5 s | `afb503f1` | 1280 × 720 (Seedance 2, 720p) | No: below the 1080p rule |
| Phoenix rebirth, 10 s | `2095f8b0` | 1280 × 720 | No |
| Phoenix key art still | `47944db5` (alt. `af8f2172`) | 2K still | Yes, as the hero still (2000 × 1116 copy in the repo) |
| Dark opening still | `3aba2fd9` | 2K still | Reference only |
| Sound design | `a126a68c` | audio | Not used (no autoplay audio) |

Balance at the time of this plan: 2,035 credits (plan 1,735 + purchased 300). Nothing was
generated for this release; the homepage awakening is built from the still with CSS and SVG.

## Proposed sequences (only if approved)

All at **native 1080p or above** (Seedance 2 offers 1080p; the per-second 1080p rate was not shown
by the tool, so confirm the exact cost in Runway before generating; the 720p rate on this account
was about 30 credits per second). Each must be checked at its original output resolution and
rejected if anatomy, detail or lighting is weak.

### A. Phoenix awakening (homepage hero, promo, brand)

- Purpose: replace the CSS awakening with real motion behind the same layout.
- Composition: start frame = darkness with a faint eclipse; end frame = the existing key art, so it
  lands on the still the site already uses. Phoenix right of centre on 16:9, leaving the left 45%
  dark for the headline; slow push-in, no cuts, no lightning.
- Formats: 16:9 at 1920 × 1080 (desktop) and a native 9:16 at 1080 × 1920 (phones: head and body
  framed in the top 55%), each 5-8 s, silent.
- Estimate: 2 shots × 8 s at the 1080p rate, plus ~20 credits for a 9:16 start still.

### B. The Hatchery chamber (Hatchery atmosphere)

- Purpose: a slow looping plate behind the Hatchery entrance, under the existing UI.
- Composition: a single egg suspended over an engraved platform in an ancient chamber, matching the
  site's chamber (twelve marks on the platform, arch, light from above). Static camera, subtle
  particles, seamless loop.
- Formats: 16:9 1920 × 1080, 6 s loop; phones use a 1080 × 1920 crop or a native 9:16.
- Estimate: 1-2 shots × 6 s at the 1080p rate, plus a reference still (~20).

### C. Legendary creature reveal (Collection highlight, promo)

- Purpose: one featured reveal in the Collection and promotion.
- Must use an existing official species as reference (for example Pyraurum or Aurelion from
  `docs/creature-art/reference/species/`); no new species, no redesigns without approval.
- Same lighting, materials and grade as A and B.
- Estimate: 1 still (~20) + 1 shot × 6-8 s at the 1080p rate.

### Delivery

Runway's file host is blocked from the build environment, so finished clips must be downloaded
from the Runway library and committed (or uploaded) into `art/`.
