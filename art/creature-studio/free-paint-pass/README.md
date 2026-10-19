# Free paint pass, representative batch 1: REJECTED (not genuinely better)

Status: **requiring review / rejected as a direction**. Cost: 0 credits.

Batch: Mossling, Cryovant, Frostkit, Aurelion, all four stages (16 files). Method:
1. `docs/creature-studio/tools/render-vector-hires.mjs`: shipped SVG renders, 2048 px transparent, from `design/eclipse-vigil-code` @ 7d67ac9.
2. `docs/creature-studio/tools/paint-pass.py`: local form light (#FFE2A8 key, upper left), violet rim, coloured outline, brush grain, then C13 framing.

Boards:
- `batch1-before-after.png`: the original (framed identically) beside the paint pass.
- `aurelion-3-zoom.png`: Aurelion Evolved at full size.

## Measured
Framing passes (for example, Aurelion stage 3: 78.0%, centre 50.0 / 50.0).

## Visual verdict
**Worse, not better:**
- Colours desaturate and go muddy. Frostkit turns grey; Aurelion's gold dulls.
- The grain reads as brushed metal or noise, not paint.
- The violet rim is barely visible.
- The underlying drawing still reads as flat vector: anatomy, faces and shape language are unchanged, because a filter cannot repaint them.
- It does not approach the Velynx benchmark.

## Conclusion
A post-process filter cannot turn the shipped vector art into hand-painted 2D at the Velynx standard. The gap is in the drawing (anatomy, faces, shape design), not the surface. Not scaled to the other 24 species, per the brief ("verify that the results are genuinely better" before scaling).

The tools are kept, because the hi-res render and framing steps are reusable for any future method.
