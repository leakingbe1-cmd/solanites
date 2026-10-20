#!/usr/bin/env python3
"""
Can every creature still be read in front of its biome, at every stage, at card size?

For each public species × stage it rebuilds the card as the browser draws it (the plate framed
by STAGE_FRAMING: zoom toward the focus, exposure, saturation, depth-of-field blur, vignette;
the transparent creature art on top), downsampled to a small Collection card, and measures:

  edge   mean colour distance between the creature's outline and the plate right behind it
         (the plate without the creature, locally averaged), 0–255; a bright rim on a dark
         body counts, as it does for the eye
  calm   standard deviation of the background luminance inside the creature's box (busyness)

Calibration: the same measure on the canon's review background (flat #07060d, canon C7/C9),
which the approved art already reads on. A stage passes when its biome keeps the outline at
least as distinct as EDGE_MIN, or no worse than RELATIVE_MIN of the review background.
With --sheet DIR it also writes one contact sheet per species (four stages at card size).

usage: python3 scripts/qa/scene-readability.py framing.json [--sheet DIR]
(framing.json is written by `node scripts/creature-scenes.mjs framing`.)
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
STAGES = ["1-eggling", "2-hatchling", "3-evolved", "4-ascended"]
CARD = 160
EDGE_MIN = 40
RELATIVE_MIN = 0.8


def framed_plate(plate, frame, focus, size):
    z = frame["zoom"]
    fx, fy = focus[0] / 100 * plate.width, focus[1] / 100 * plate.height
    w = plate.width / z
    # CSS scales about the focus, so the visible window keeps the focus at the same relative spot
    left = fx - (fx / plate.width) * w
    top = fy - (fy / plate.height) * w
    img = plate.crop((round(left), round(top), round(left + w), round(top + w))).resize((size, size), Image.LANCZOS)
    img = ImageEnhance.Brightness(img).enhance(frame["light"])
    img = ImageEnhance.Color(img).enhance(frame["sat"])
    if frame["blur"]:
        # cards use 0.6 of the stage blur (CreatureScene)
        img = img.filter(ImageFilter.GaussianBlur(frame["blur"] * 0.6 * size / 1024))
    # vignette: transparent to 40% of the ellipse, then toward rgba(5,4,10,bv)
    v = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(v)
    steps = 24
    for i in range(steps, 0, -1):  # concentric ellipses, drawn from the outside in
        t = i / steps
        a = 0 if t < 0.4 else int(255 * frame["vignette"] * (t - 0.4) / 0.6)
        rx, ry = size * 0.72 * t, size * 0.70 * t
        cx, cy = size * 0.5, size * 0.48
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=a)
    v = v.filter(ImageFilter.GaussianBlur(size / 40))
    dark = Image.new("RGB", (size, size), (5, 4, 10))
    return Image.composite(dark, img, v)


def lum(img):
    return img.convert("L")


def measure(species, stage, plate, frame, focus):
    bg = framed_plate(plate, frame, focus, CARD) if plate else Image.new("RGB", (CARD, CARD), (7, 6, 13))
    art = Image.open(ROOT / "public/creatures" / species / f"{STAGES[stage]}.webp").convert("RGBA").resize((CARD, CARD), Image.LANCZOS)
    card = bg.convert("RGBA")
    card.alpha_composite(art)
    a = art.getchannel("A").point(lambda v: 255 if v > 160 else 0)
    inner = ImageChops.subtract(a, a.filter(ImageFilter.MinFilter(5)))
    behind = bg.filter(ImageFilter.BoxBlur(3))
    dists = [
        (((c[0] - b[0]) ** 2 + (c[1] - b[1]) ** 2 + (c[2] - b[2]) ** 2) / 3) ** 0.5
        for m, c, b in zip(inner.get_flattened_data(), card.convert("RGB").get_flattened_data(), behind.get_flattened_data())
        if m
    ]
    edge = sum(dists) / max(1, len(dists))
    Lb = lum(bg)
    box = a.getbbox() or (0, 0, CARD, CARD)
    crop = list(Lb.crop(box).get_flattened_data())
    mean = sum(crop) / len(crop)
    calm = (sum((x - mean) ** 2 for x in crop) / len(crop)) ** 0.5
    return card.convert("RGB"), edge, calm


def main():
    data = json.loads(Path(sys.argv[1]).read_text())
    sheet_dir = Path(sys.argv[sys.argv.index("--sheet") + 1]) if "--sheet" in sys.argv else None
    framing = data["framing"]
    fails = 0
    rows = []
    for species, info in data["species"].items():
        if not info["plate"]:
            print(f"- {species}: no plate (gradient fallback), skipped")
            continue
        plate = Image.open(ROOT / "public" / info["plate"].lstrip("/")).convert("RGB")
        cards = []
        for stage in range(4):
            f = dict(framing[stage])
            f["light"] *= 1 + info.get("lift", 0)
            f["sat"] *= info.get("calm", 1)
            card, edge, calm = measure(species, stage, plate, f, info["focus"])
            _, ref, _ = measure(species, stage, None, f, info["focus"])
            ok = edge >= EDGE_MIN or edge >= RELATIVE_MIN * ref
            fails += 0 if ok else 1
            rows.append((species, stage, edge, ref, calm, ok))
            cards.append(card)
        if sheet_dir:
            sheet_dir.mkdir(parents=True, exist_ok=True)
            out = Image.new("RGB", (CARD * 4 + 30, CARD), (0, 0, 0))
            for i, c in enumerate(cards):
                out.paste(c, (i * (CARD + 10), 0))
            out.save(sheet_dir / f"{species}.png")
    for species, stage, edge, ref, calm, ok in rows:
        print(f"{'✓' if ok else '✗'} {species} stage {stage + 1}: edge {edge:5.1f} (review bg {ref:5.1f}, {edge / ref:4.0%})  calm {calm:5.1f}")
    print(f"{len(rows) - fails}/{len(rows)} stages readable (edge ≥ {EDGE_MIN}, or ≥ {RELATIVE_MIN:.0%} of the review background)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
