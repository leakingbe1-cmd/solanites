#!/usr/bin/env python3
"""
Checks every idle part rig (src/lib/creatureScenes.ts) against the creature's own artwork.

For each part at both extremes of its motion it rebuilds the frame exactly as the browser
does (the body with the part's region cut out, the part clipped to its slightly grown region
and turned about its hinge, or skewed from its attachment line) and measures:

  gap    pixels that were solid creature and now show through (the join opening)   must be ~0
  tear   how far the part moves wherever its region's edge cuts through solid art      must be ≤ 3px
         (an edge across a tail tip or a head rim splits it, even when nothing shows through)
  move   how far the part's tip travels, in px at 1024                              must be gentle

It also checks that a part lies on the body: the hinge must sit on solid artwork.
With --sheet DIR it writes a contact sheet per species: the region over the art, both
extremes and the difference, for visual review.

usage: python3 scripts/qa/scene-parts.py rigs.json [--sheet DIR]
(rigs.json is written by `node scripts/creature-scenes.mjs rigs`.)
"""
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
STAGES = ["1-eggling", "2-hatchling", "3-evolved", "4-ascended"]
N = 1024
SS = 4  # supersampling for polygon edges


def poly_mask(poly, size=N):
    m = Image.new("L", (size * SS, size * SS), 0)
    pts = [(poly[i] / 100 * size * SS, poly[i + 1] / 100 * size * SS) for i in range(0, len(poly), 2)]
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return m.resize((size, size), Image.LANCZOS)


def dilate(poly, by):
    n = len(poly) // 2
    area = sum(poly[2 * i] * poly[2 * ((i + 1) % n) + 1] - poly[2 * ((i + 1) % n)] * poly[2 * i + 1] for i in range(n))
    sign = 1 if area > 0 else -1
    out = []
    for i in range(n):
        px, py = poly[2 * ((i - 1) % n)], poly[2 * ((i - 1) % n) + 1]
        cx, cy = poly[2 * i], poly[2 * i + 1]
        nx, ny = poly[2 * ((i + 1) % n)], poly[2 * ((i + 1) % n) + 1]
        e1 = _norm(cy - py, -(cx - px))
        e2 = _norm(ny - cy, -(nx - cx))
        m = _norm(e1[0] + e2[0], e1[1] + e2[1])
        out += [cx + sign * m[0] * by, cy + sign * m[1] * by]
    return out


def _norm(x, y):
    d = math.hypot(x, y) or 1
    return (x / d, y / d)


def transform(img, rig, t):
    """The part layer at signed fraction t of its peak (CSS rotate is clockwise; skewX shifts x by tan·(y−origin))."""
    hx, hy = rig["hinge"][0] / 100 * N, rig["hinge"][1] / 100 * N
    deg = rig["deg"] * t
    if rig["motion"] == "skew":
        k = math.tan(math.radians(deg))
        # output (x, y) samples input (x − k·(y − hy), y)
        return img.transform((N, N), Image.AFFINE, (1, -k, k * hy, 0, 1, 0), resample=Image.BICUBIC)
    if rig["motion"] == "fold":
        sc = 1 - rig["deg"] * 0.01 * abs(t)  # scaleX toward the attachment line (eases closed and back)
        # output x samples input hx + (x − hx)/sc
        return img.transform((N, N), Image.AFFINE, (1 / sc, 0, hx - hx / sc, 0, 1, 0), resample=Image.BICUBIC)
    if rig["motion"] == "bend":
        k = math.tan(math.radians(deg))
        # skewY: output (x, y) samples input (x, y − k·(x − hx))
        return img.transform((N, N), Image.AFFINE, (1, 0, 0, -k, 1, k * hx), resample=Image.BICUBIC)
    # PIL rotates counter-clockwise for positive angles; CSS rotate(+) is clockwise
    return img.rotate(-deg, resample=Image.BICUBIC, center=(hx, hy))


def displacement(rig, x, y):
    """How far a point of the part moves at the peak, in px at 1024."""
    hx, hy = rig["hinge"][0] / 100 * N, rig["hinge"][1] / 100 * N
    k = math.tan(math.radians(abs(rig["deg"])))
    if rig["motion"] == "bend":
        return abs(k * (x - hx))
    if rig["motion"] == "skew":
        return abs(k * (y - hy))
    if rig["motion"] == "fold":
        return abs((x - hx) * rig["deg"] * 0.01)
    return math.hypot(x - hx, y - hy) * math.radians(abs(rig["deg"]))


def frame(art, rigs, t):
    """Body with every region cut out, then each part transformed on top."""
    alpha = art.getchannel("A")
    body_keep = Image.new("L", (N, N), 255)
    layers = []
    for rig in rigs:
        hard = poly_mask(rig["poly"])
        body_keep = ImageChops.subtract(body_keep, hard)
        grown = poly_mask(dilate(rig["poly"], 0.3))
        part = art.copy()
        part.putalpha(ImageChops.multiply(alpha, grown))
        layers.append(transform(part, rig, t))
    body = art.copy()
    body.putalpha(ImageChops.multiply(alpha, body_keep))
    out = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    out.alpha_composite(body)
    for layer in layers:
        out.alpha_composite(layer)
    return out


def check(species, stage, rigs):
    art = Image.open(ROOT / "public/creatures" / species / f"{STAGES[stage]}.webp").convert("RGBA").resize((N, N))
    alpha = art.getchannel("A")
    results = []
    frames = {}
    # the seam: where a region's edge cuts through solid body, i.e. solid art lies on both
    # sides of the edge within a few px (a tail tip merely passing near the edge is not a seam)
    solid = alpha.point(lambda v: 255 if v > 240 else 0)
    seam = Image.new("L", (N, N), 0)
    tears = []
    for rig in rigs:
        inside = poly_mask(rig["poly"]).point(lambda v: 255 if v > 127 else 0)
        ring = ImageChops.subtract(poly_mask(dilate(rig["poly"], 0.45)), poly_mask(dilate(rig["poly"], -0.45)))
        near_in = ImageChops.multiply(solid, inside).filter(ImageFilter.MaxFilter(9))
        near_out = ImageChops.subtract(solid, inside).filter(ImageFilter.MaxFilter(9))
        crossing = ImageChops.multiply(ImageChops.multiply(near_in, near_out), ImageChops.multiply(ring, solid))
        cut = crossing.load()
        tears.append(max((displacement(rig, x, y) for y in range(0, N, 2) for x in range(0, N, 2) if cut[x, y] > 128), default=0))
        if rig["motion"] not in ("skew", "bend", "fold"):
            # a rotating part joins the body at its hinge; only the cut there is a seam
            disk = Image.new("L", (N, N), 0)
            hx, hy, rad = rig["hinge"][0] / 100 * N, rig["hinge"][1] / 100 * N, 0.06 * N
            ImageDraw.Draw(disk).ellipse([hx - rad, hy - rad, hx + rad, hy + rad], fill=255)
            crossing = ImageChops.multiply(crossing, disk)
        seam = ImageChops.lighter(seam, crossing)
    for t in (-1, 1):
        f = frame(art, rigs, t)
        frames[t] = f
        fa = f.getchannel("A")
        gap = sum(1 for s_, a in zip(seam.get_flattened_data(), fa.get_flattened_data()) if s_ > 128 and a < 160)
        results.append(gap)
    tips = []
    for rig in rigs:
        hx, hy = rig["hinge"]
        far = max(math.hypot(rig["poly"][i] - hx, rig["poly"][i + 1] - hy) for i in range(0, len(rig["poly"]), 2))
        far_px = far / 100 * N
        if rig["motion"] in ("skew", "bend"):
            tips.append(far_px * math.tan(math.radians(abs(rig["deg"]))))
        elif rig["motion"] == "fold":
            reach = max(abs(rig["poly"][i] - hx) for i in range(0, len(rig["poly"]), 2))
            tips.append(reach / 100 * N * abs(rig["deg"]) * 0.01)
        else:
            tips.append(far_px * math.sin(math.radians(abs(rig["deg"]))))
        on = alpha.getpixel((min(N - 1, int(hx / 100 * N)), min(N - 1, int(hy / 100 * N))))
        # a skew's hinge is its attachment line, not a point on the body
        rig["_hinge_alpha"] = 255 if rig["motion"] in ("skew", "bend", "fold") else on
    return art, frames, results, tips, tears


def sheet(art, frames, rigs, path):
    S = 384
    out = Image.new("RGB", (S * 4, S), (7, 6, 13))
    ov = Image.new("RGBA", (N, N), (30, 28, 44, 255))
    ov.alpha_composite(art)
    d = ImageDraw.Draw(ov)
    for rig in rigs:
        pts = [(rig["poly"][i] / 100 * N, rig["poly"][i + 1] / 100 * N) for i in range(0, len(rig["poly"]), 2)]
        d.polygon(pts, outline=(255, 200, 80, 255))
        hx, hy = rig["hinge"][0] / 100 * N, rig["hinge"][1] / 100 * N
        d.ellipse([hx - 8, hy - 8, hx + 8, hy + 8], outline=(255, 80, 80, 255), width=3)
    panels = [ov]
    for t in (-1, 1):
        p = Image.new("RGBA", (N, N), (30, 28, 44, 255))
        p.alpha_composite(frames[t])
        panels.append(p)
    diff = ImageChops.difference(frames[-1].convert("RGB"), frames[1].convert("RGB"))
    panels.append(diff.point(lambda v: min(255, v * 3)).convert("RGBA"))
    for i, p in enumerate(panels):
        out.paste(p.convert("RGB").resize((S, S)), (i * S, 0))
    out.save(path)


def main():
    rigs_file = Path(sys.argv[1])
    sheet_dir = Path(sys.argv[sys.argv.index("--sheet") + 1]) if "--sheet" in sys.argv else None
    data = json.loads(rigs_file.read_text())
    failures = 0
    for species, stages in data.items():
        for stage_str, rigs in stages.items():
            stage = int(stage_str)
            if not rigs:
                continue
            art, frames, gaps, tips, tears = check(species, stage, rigs)
            worst_gap = max(gaps)
            notes = []
            ok = worst_gap <= 6
            for rig, tear in zip(rigs, tears):
                if tear > 3:
                    ok = False
                    notes.append(f"{rig['part']} region edge splits solid art, moving {tear:.1f}px there (max 3)")
            for rig, tip in zip(rigs, tips):
                if rig["_hinge_alpha"] < 128:
                    ok = False
                    notes.append(f"{rig['part']} hinge off the body (alpha {rig['_hinge_alpha']})")
                if tip > 22:
                    ok = False
                    notes.append(f"{rig['part']} tip moves {tip:.1f}px (max 22)")
            label = f"{species} stage {stage + 1}: " + ", ".join(f"{r['part']} {r['motion']} ±{r['deg']}° tip {t:.1f}px" for r, t in zip(rigs, tips))
            print(("✓ " if ok else "✗ ") + label + f"; gap {worst_gap}px, tear {max(tears):.1f}px" + (f"; {'; '.join(notes)}" if notes else ""))
            failures += 0 if ok else 1
            if sheet_dir:
                sheet_dir.mkdir(parents=True, exist_ok=True)
                sheet(art, frames, rigs, sheet_dir / f"{species}-{stage + 1}.png")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
