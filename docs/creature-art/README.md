# Solanites creature artwork: audit, spec and production pipeline

## Status

| | |
|---|---|
| Species in the catalogue | 24 (names, ids, rarities, elements unchanged) |
| Stages per species | 4: Eggling, Hatchling, Evolved, Ascended |
| Stage assets required | **96** |
| Stage assets delivered | **0**. See [`checklist.md`](checklist.md), which is regenerated on every build |
| What the site shows meanwhile | The procedural vector art, labelled **"Placeholder art"** in the creature detail view |

Every stage of every species has a written design, a generation prompt, a validated slot in the asset manifest, and a place in the UI. What is missing is the artwork itself. It could not be produced in this development environment: there is no image-generation tool, API key or GPU, and outbound image APIs are blocked. **No placeholder is reported as finished art.**

## 1. Audit

| Area | Finding |
|---|---|
| Creature rendering | Hand-written SVG drawn in code (`src/components/creature/species/*.tsx`), one renderer per species. There were no raster or 3D assets. |
| Evolution | One drawing per species, with stage-dependent proportions (bigger horns, wings and so on), plus a halo at the top stage. That counts as "scaling one design", which the new direction rules out. |
| Can it reach the reference? | **No.** The reference (`reference/`) is painterly, 3D-rendered character art with fur, moss, refraction and subsurface light. Hand-coded SVG can't reach that, and adding more gradients wouldn't change it. **The pipeline has to switch to raster artwork per stage**, which is what this change sets up. |
| Data | `src/lib/species.ts`: 24 species with id, name, rarity, element, palette, lore and stats. Untouched. |
| Discovery | Mythic and Secret species are classified until hatched; the rule is now shared in `src/lib/discovery.ts`. |
| Stage names | Renamed in `gameConfig.evolution.names` to Eggling, Hatchling, Evolved, Ascended. The time thresholds are unchanged. |
| Checkpoint | Local tags `checkpoint/pre-art-overhaul-main` and `checkpoint/pre-art-overhaul-species`. The proxy refused to push tags. The `main` and `species-redesign` branches on GitHub are unchanged and serve as restore points. |

## 2. Art direction and asset spec

The art direction is set by the reference sheets you supplied:

- `reference/overview-sheet.webp`: all species × 4 stages.
- `reference/mossling-detail.webp`: the detail-view target.
- `reference/species/<id>.webp`: one strip per species, cut from the sheet, for briefing only.

The per-species designs (silhouette, anatomy, face, posture, materials, effects, and all four stages) live in **`src/data/creatureDesigns.json`**. That one file feeds the generation prompts, the stage descriptions in the detail view, and the tests.

| Property | Requirement |
|---|---|
| One file per | species × stage. Never a sheet that gets cropped. |
| Size | ≥ 768 px; 1024 × 1024 recommended (square) |
| Background | Transparent PNG/WebP preferred. Opaque dark backgrounds are accepted and faded into the card with a vignette, but transparent art is required for classified-species silhouettes. |
| Framing | Full body, centred, about 80% of frame height, no cropped limbs or tails |
| Camera | Three-quarter view facing slightly left, eye level, the same for every image |
| Lighting | Key light from upper left, cool rim light from right, soft ambient fill |
| Stages | Eggling, Hatchling, Evolved and Ascended must be different drawings with changing anatomy, never one image resized |

## 3. Producing the art

1. **Generate.** Open [`prompts.md`](prompts.md). It has one complete prompt per species and stage (96). Generate each image separately in your image tool, using the matching strip in `reference/species/` as the style reference.
2. **Save the source master** as `art/creatures/<species-id>/<n>-<stage>.png`, for example:
   ```
   art/creatures/mossling/1-eggling.png
   art/creatures/mossling/2-hatchling.png
   art/creatures/mossling/3-evolved.png
   art/creatures/mossling/4-ascended.png
   ```
   Species ids: `mossling driftfin pallow glimmeray sproutwyrm frostkit abyssal-vael stormquill duskwing cryovant emberlisk neonyx aurorath zephrax prismara aurelion solvanth pyraurum aurelith astravex orbelith eventide genesis nullborn`.
3. **Build.** Run `npm run art:build`. For each file it:
   - checks it against the spec, and rejects files that are too small or unreadable;
   - rejects **near-duplicates**, so one image can't be reused for two stages or two species, even resized or re-encoded;
   - fits it to 1024 × 1024 and writes an optimised WebP plus a 384 px thumbnail to `public/creatures/<id>/`;
   - writes a **silhouette-only** version for Mythic and Secret species, so the "???" view never downloads the real art;
   - regenerates `src/data/creatureAssets.json` (the manifest the site reads) and `checklist.md`.
4. **Review** the site (`npm run dev`). Stages with real art show it; the rest keep the vector placeholder.
5. **Commit** `public/creatures/`, `src/data/creatureAssets.json` and `docs/creature-art/checklist.md`. The source masters in `art/creatures/` are git-ignored because they're large; keep them somewhere safe.

`npm run art:check` runs the same validation without writing anything. It exits with an error if any supplied file is invalid, so it can run in CI.

Alternatively, send me the images in a session and I'll place them, build and verify.

## 4. How the site uses the art

- `CreatureArt` (used by every page: collection, Hatchery cards, hatch reveal, landing, leaderboard) shows the asset for the creature's **actual stage** when one exists. Otherwise it shows the vector placeholder. Pages need no changes as art arrives.
- **Detail view:**
  - the four stages side by side, with names and descriptions from the design bible;
  - the current stage highlighted;
  - an owned creature's future stages shown as locked silhouettes, with the real unlock time;
  - a large render of the selected stage with its design notes;
  - related species (same element, then same rarity);
  - Prev/Next navigation in the collection.
- **Classified species:** only their silhouette file is ever requested, and their names, stages and lore stay hidden.
- **Known limit:** files in `public/` are publicly downloadable by anyone who guesses the path. Fully secret art for unreleased species would need a server-side gate.
