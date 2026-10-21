# Aurelion: scope report

Legendary · Solar · "Sovereign of the Gilded Slot". This is the showpiece of the scope test.

## Method

The brief assumed Blender models and rigs. The owner chose the local AI pipeline instead (21 Oct), because an
earlier Blender test of Mossling looked plasticky next to the painted site art. Everything still runs locally on
the owner's PC, uses no paid services and no Runway, and costs nothing per image.

1. **Start images.** Each stage's current site art (`public/creatures/aurelion/<n>-<stage>.webp`) is placed on a
   dark Solar-tinted background at the same scale and position for every stage.
2. **Restyle (image to image).** DreamShaper XL Turbo (SDXL) in ComfyUI repaints each start image in the
   realistic render style at a denoise of 0.55 to 0.65, so the silhouette, pose, palette and signature features
   come from the existing art.
3. **Cutout.** rembg (isnet-general-use) removes the background to give the transparent stills. The `_dark`
   stills keep the generated background.
4. **Idle loops (image to video).** Wan 2.2 TI2V 5B (GGUF Q6_K) generates 73 frames at 640×640 from each dark
   still. Each loop is built as frames 1→73→1 (145 frames, 6.04 s at 24 fps), so the first and last frames are
   identical.

No `.blend` files, rigs or 3D materials exist for this creature, because none were made.

## Time

| Step | Time |
|---|---|
| Start images (script, in the cloud workspace) | ~2 min |
| Stills: 30 generations at ~20 s each on the RTX 2060 SUPER | ~10 min of GPU time |
| Picking, eye-colour check | ~5 min |
| Cutouts | 9 s |
| Loops: 4 clips at 285–310 s each | ~20 min of GPU time |
| Packaging (loop encode, contact sheet) | ~2 min |
| **Total** | **~40 min, of which ~30 min the PC is busy** |

## Attempts

- Stills: one round of 24 options (6 per stage), plus one round of 6 for Ascended to fix the eye colour.
- Loops: one attempt per stage. All four were usable first time.

## Files

| File | Size |
|---|---|
| stills/eggling.png / _dark | 0.78 / 0.91 MB |
| stills/hatchling.png / _dark | 0.79 / 0.95 MB |
| stills/evolved.png / _dark | 0.88 / 0.93 MB |
| stills/ascended.png / _dark | 1.14 / 1.13 MB |
| loops/eggling.mp4 | 0.83 MB |
| loops/hatchling.mp4 | 1.06 MB |
| loops/evolved.mp4 | 0.83 MB |
| loops/ascended.mp4 | 1.37 MB |
| contact-sheet.jpg | 0.27 MB |

## Problems and notes

- **Eye colour drift.** The first round gave green, blue and amber eyes across the options. The picks use amber
  throughout, and the eyes glow a brighter orange-amber at Ascended. This is deliberate, but flag it if a strict
  match is wanted.
- **Identity.** The silhouette, body plan, gold and cream palette, wing shape, horns, tail tuft and Ascended sun
  crown all carry over from the site art. The Ascended chest sun emblem is less visible than in the original.
- **Loop seams.** There's no jump at the seam, because the loop plays forward then reverse. The trade-off is
  that drifting light motes reverse direction halfway through. At this level of motion it's hard to notice.
- **Artefacts.** None found in the picks. The cutouts keep the fine wing edges cleanly.
- **Framing.** All stages share the same camera and ground line. Each stage keeps its relative size from the
  site art, so the Eggling is smaller in frame than the Ascended.
