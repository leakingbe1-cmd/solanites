# Animation asset audit

Rule: every video or raster animation used on the website must be at least 1920 × 1080
(landscape), 1080 × 1920 (portrait), 1080 × 1080 (square), or 1080 px on the short edge for other
ratios, measured on the native source, not an upscale. CSS and SVG animation is exempt but must
render cleanly at every size and density.

Measured with `ffprobe` on the files themselves (release `release-premium-overhaul`).

## Served by the website

| File | Type | Native size | Ratio | Size | Purpose | Passes | Action |
|---|---|---|---|---|---|---|---|
| `public/hero/phoenix-2000.webp` | Still image, animated by CSS (slow breath, awakening light) | 2000 × 1116 | 1.79:1 | 224 KB | Homepage hero | Yes (short edge 1116) | Kept |
| `public/hero/phoenix-2000.jpg` | Same, JPEG fallback | 2000 × 1116 | 1.79:1 | 348 KB | Hero fallback | Yes | Kept |
| `public/hero/phoenix-1200.webp` | Smaller variant of the hero still | 1200 × 670 | 1.79:1 | 96 KB | Phone hero | **No** (short edge 670) | **Removed**; phones get the 2000 px file |
| `public/intro/phoenix-16x9.{webm,mp4}` | Video | 1280 × 720 | 16:9 | 3.7 / 3.4 MB | First-visit intro | **No** (native 720p) | **Removed** from the site |
| `public/intro/phoenix-9x16.{webm,mp4}` | Video | 720 × 1280 | 9:16 | 2.4 / 1.9 MB | First-visit intro, phones | **No** | **Removed** |
| `public/intro/phoenix-*-poster.jpg` | Still frames of the above | 1280 × 720 / 720 × 1280 | | | Intro posters | No | **Removed** |

After this release the site serves **no video and no frame-based raster animation**. The only
raster image is the hero still, which passes.

## Exempt (vector or CSS)

| Asset | Type | Notes |
|---|---|---|
| Creature artwork (`components/creature`, 28 species × 4 forms) | SVG with CSS motion | `src/data/creatureAssets.json` lists no raster stage art (0 of 112), so every creature renders as vector |
| Eggs (`components/egg/EggArt`) | SVG with CSS motion | |
| Sigil (`components/brand/Sigil`) | SVG, CSS stroke draw | |
| Hero awakening, eclipse ring, embers (`components/landing/PhoenixHero`) | CSS and SVG over the passing still | |
| Hatchery chamber (`components/hatchery/HatcheryChamber`) | SVG and CSS | |
| Cosmic backdrop and realm light (`components/layout`) | CSS gradients | |

## Not on the website (for reference)

| File | Native size | Note |
|---|---|---|
| `art/intro/clip-1-awakening.mp4`, `clip-2-rebirth.mp4` | 1280 × 720 | Runway source footage (Seedance 2, 720p). Below the rule; kept as source only |
| `art/promo/solanites-x-*.mp4` | 1920 × 1080 / 1080 × 1920 / 1080 × 1080 | Frame sizes pass, but the footage inside is **upscaled from 720p**, so by this rule they do not count as native 1080p. Campaign assets, not used on the site |
| `art/intro/phoenix-still.png` | 2000 × 1116 | Source of the hero still |

## To bring video back

Generate native 1080p (or larger) footage first (see `docs/runway-production-plan.md`), check it at
its original output resolution, then encode web versions without downscaling below 1920 × 1080 /
1080 × 1920.
