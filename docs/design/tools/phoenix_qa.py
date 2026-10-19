"""Phoenix key-art QA: measured checks and mobile crop tests for a hero still.

Usage: python3 -I docs/design/tools/phoenix_qa.py <image> <out_dir> [--portrait]

Writes <out_dir>/report.json and crop previews. Checks (from art-direction-v2.md §1.4):
- native size: landscape >= 1920 x 1080 (portrait >= 1080 x 1920)
- clipped highlights: under 0.5% of pixels at 254+ in any channel
- headline zone: mean luminance of the left 40% (landscape) or the lower 45% (portrait) under 8%
- face detail: edge energy in a user-given face box (optional, --face x0,y0,x1,y1 in 0..1 units)
Crop tests render the image the way the hero shows it on phones (object-fit: cover)
at 390 x 844 and 360 x 780, so the composition can be judged without a browser.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def cover_crop(im, w, h, focus_x=0.5, focus_y=0.4):
    """Crop like CSS object-fit: cover with object-position focus_x/focus_y."""
    iw, ih = im.size
    scale = max(w / iw, h / ih)
    sw, sh = iw * scale, ih * scale
    left = (sw - w) * focus_x
    top = (sh - h) * focus_y
    return im.resize((round(sw), round(sh)), Image.LANCZOS).crop((round(left), round(top), round(left) + w, round(top) + h))


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        sys.exit(__doc__)
    src, out = Path(args[0]), Path(args[1])
    portrait = "--portrait" in args
    face = None
    if "--face" in args:
        face = [float(v) for v in args[args.index("--face") + 1].split(",")]
    out.mkdir(parents=True, exist_ok=True)

    im = Image.open(src).convert("RGB")
    w, h = im.size
    a = np.asarray(im).astype(np.int32)
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]) / 255
    clipped = float(((a >= 254).any(axis=2)).mean() * 100)
    if portrait:
        zone = lum[int(h * 0.55):, :]
        zone_name = "lower 45%"
    else:
        zone = lum[:, : int(w * 0.4)]
        zone_name = "left 40%"
    zone_mean = float(zone.mean() * 100)
    zone_p95 = float(np.percentile(zone, 95) * 100)

    min_w, min_h = (1080, 1920) if portrait else (1920, 1080)
    report = {
        "file": str(src),
        "pixels": [w, h],
        "aspect": round(w / h, 4),
        "meets_minimum": w >= min_w and h >= min_h,
        "clipped_pct": round(clipped, 2),
        "clipping_ok": clipped < 0.5,
        "headline_zone": zone_name,
        "headline_zone_mean_lum_pct": round(zone_mean, 2),
        "headline_zone_p95_lum_pct": round(zone_p95, 2),
        "headline_zone_ok": zone_mean < 8,
    }
    if face:
        x0, y0, x1, y1 = (int(face[0] * w), int(face[1] * h), int(face[2] * w), int(face[3] * h))
        edges = np.asarray(im.convert("L").crop((x0, y0, x1, y1)).filter(ImageFilter.FIND_EDGES)).astype(float)
        report["face_edge_energy"] = round(float(edges.var()), 1)
        im.crop((x0, y0, x1, y1)).save(out / "face-100pct.png")

    # crop tests: how phones show it with object-fit: cover
    tests = []
    for vw, vh in [(390, 844), (360, 780)]:
        for fx in (0.5, 0.62):
            c = cover_crop(im, vw, vh, fx, 0.35)
            name = f"crop-{vw}x{vh}-x{int(fx * 100)}.png"
            c.save(out / name)
            tests.append(name)
    # desktop: full width at 16:9 viewports, with the headline zone outlined
    for vw, vh in [(1440, 900), (1920, 1080)]:
        c = cover_crop(im, vw, vh, 0.5, 0.4)
        d = ImageDraw.Draw(c)
        d.rectangle((0, 0, int(vw * 0.4), vh - 1), outline=(164, 140, 255), width=3)
        name = f"desktop-{vw}x{vh}.jpg"
        c.save(out / name, quality=88)
        tests.append(name)
    report["crop_tests"] = tests
    (out / "report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
