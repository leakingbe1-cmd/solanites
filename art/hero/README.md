# Hero masters

Masters for the homepage Eclipse Phoenix. They are git-ignored; `scripts/hero-art.mjs build`
encodes them into `public/hero/eclipse/` and writes `src/data/heroAssets.json`.

| File | Composition | Minimum | Preferred |
|---|---|---|---|
| `eclipse-phoenix-desktop.png` | landscape, figure right of centre, left 40% kept dark for the headline | 2560 × 1440 | 3840 × 2160 |
| `eclipse-phoenix-mobile.png` | its own portrait composition, figure in the top 55% | 1080 × 1920 | 1440 × 2560 |

Only native generator output is accepted. The pipeline rejects masters that are too small or
that measure as upscaled, and it never produces a width larger than the master. Every master is
reviewed at 100% (face, feather edges, one material area) before it is approved.

Until an approved desktop master exists the manifest stays empty and the site shows the retired
2000 × 1116 still.
