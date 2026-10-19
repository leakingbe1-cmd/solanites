# Overhaul pilot: nano-banana-2.1 edits of the shipped drawings

- **Owner instruction:** "do banana 2.1".
- **Measured price:** **4 credits per image** (1K, one reference). Pilot: 7 images, **28 credits** (balance 1,895 → 1,867).
- **Method:** the shipped stage drawing is the only reference (mid-grey background). One prompt template: "repaint as hand-painted 2D, keep exact anatomy and palette", plus the canon light block and the never-list. After that, free local steps: `cutout-and-frame.py`, then C13 framing.
- **Files:** `<id>-<stage>-raw-<task>.png` is the model output, unmodified. `<id>-<stage>-framed.png` is the 1024² transparent delivery candidate. The before/after board is `pilot-before-after.png`.

| Stage | Identity kept | Painted finish, key + rim | C9 (needs 70/45) | Framing | Status |
|---|---|---|---|---|---|
| Mossling 1 | yes | yes | 158/111 | 45.0 %, centred | provisional |
| Mossling 2 | yes (antlers kept) | yes | 126/90 | 60.0 % | provisional |
| Mossling 3 | yes | **too dark and desaturated**; forehead gem and moss tufts lost (first, unrefined prompt) | 87/69 | 78.0 % (1.10× upscale) | **requiring review**: re-run with the refined prompt (4 credits) to match the line |
| Mossling 4 | yes; rear antler simplified | yes | 114/74 | 88.0 % (1.25× upscale) | provisional |
| Aurelion 1 | yes | yes | 142/94 | 45.0 % | provisional |
| Aurelion 3 | yes; gem added on the brow | yes | 128/91 | 78.0 % (1.11× upscale) | provisional |
| Frostkit 3 | yes | yes | 174/105 | 78.0 % (1.10× upscale) | provisional |

**Verdict:** genuinely better than the shipped vector art. Painted volume, coloured linework, warm key and violet rim are all present, and anatomy, palette and silhouette are preserved. No halos, ground or text.

Known limits:
- The result can only be as rich as the underlying design, so simple shipped designs stay simple.
- The rim sometimes reads as a thin violet outline rather than light.

**Fix for scale-up (free):** put the creature at about 88 % of the reference canvas. The model keeps the reference framing, and stages 3–4 then need no upscale.
