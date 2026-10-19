"""Free local post-processing for generated creature art (no paid background removal).

1. Cut-out: the background is a flat colour (sampled from the image border). Alpha
   ramps from 0 to 1 as a pixel's colour distance from that background goes from
   `t0` to `t1`. Semi-transparent edge pixels are "decontaminated" (the background
   colour is divided back out) so no grey fringe shows on the dark site cards.
2. Framing: the creature's bounding box is scaled so its larger side hits the stage's
   canon C13 occupancy target (45 / 60 / 78 / 88 % of 1024) and centred. Only
   downscaling is allowed; if the target would need upscaling the script refuses.

  python3 -I docs/creature-studio/tools/cutout-and-frame.py <in.png> <out.png> <stage 1-4> [t0 t1]

Writes <out.png> (1024 x 1024 RGBA) and prints the measured occupancy and edge stats.
"""
import sys

from PIL import Image, ImageFilter

TARGETS = {1: 0.45, 2: 0.60, 3: 0.78, 4: 0.88}
SIZE = 1024


def border_colour(im):
    w, h = im.size
    px = im.load()
    pts = [px[x, y] for x in range(0, w, 8) for y in (0, 1, h - 2, h - 1)] + [px[x, y] for y in range(0, h, 8) for x in (0, 1, w - 2, w - 1)]
    pts.sort(key=sum)
    mid = pts[len(pts) // 4: 3 * len(pts) // 4]  # trimmed mean ignores stray marks at the edge
    return tuple(sum(c[i] for c in mid) / len(mid) for i in range(3))


def cutout(im, t0=10.0, t1=48.0):
    im = im.convert("RGB")
    bg = border_colour(im)
    w, h = im.size
    src = im.load()
    out = Image.new("RGBA", (w, h))
    dst = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            d = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            a = 0.0 if d <= t0 else 1.0 if d >= t1 else (d - t0) / (t1 - t0)
            if a <= 0:
                dst[x, y] = (0, 0, 0, 0)
                continue
            if a < 1:  # remove the background's contribution from the edge colour
                r = min(255, max(0, round((r - (1 - a) * bg[0]) / a)))
                g = min(255, max(0, round((g - (1 - a) * bg[1]) / a)))
                b = min(255, max(0, round((b - (1 - a) * bg[2]) / a)))
            dst[x, y] = (r, g, b, round(a * 255))
    # drop isolated specks: alpha survives only where a 5px neighbourhood is mostly solid
    alpha = out.getchannel("A")
    solid = alpha.filter(ImageFilter.MedianFilter(5)).point(lambda v: 255 if v > 0 else 0)
    out.putalpha(Image.composite(alpha, Image.new("L", alpha.size, 0), solid))
    return out, bg


def frame(rgba, stage):
    box = rgba.getchannel("A").point(lambda v: 255 if v >= 32 else 0).getbbox()
    if not box:
        raise SystemExit("no creature pixels")
    crop = rgba.crop(box)
    target = TARGETS[stage] * SIZE
    scale = target / max(crop.size)
    if scale > 1.0001:
        raise SystemExit(f"stage {stage} target needs {scale:.2f}x upscaling; generate larger instead")
    crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(crop, ((SIZE - crop.width) // 2, (SIZE - crop.height) // 2))
    return canvas, scale


if __name__ == "__main__":
    src, dst, stage = sys.argv[1], sys.argv[2], int(sys.argv[3])
    t0, t1 = (float(sys.argv[4]), float(sys.argv[5])) if len(sys.argv) > 5 else (10.0, 48.0)
    rgba, bg = cutout(Image.open(src), t0, t1)
    framed, scale = frame(rgba, stage)
    framed.save(dst, optimize=True)
    a = framed.getchannel("A")
    hist = a.histogram()
    semi = sum(hist[1:255])
    box = a.point(lambda v: 255 if v >= 32 else 0).getbbox()
    occ = max(box[2] - box[0], box[3] - box[1]) / SIZE * 100
    print({"background": [round(c) for c in bg], "scale": round(scale, 3), "occupancy": round(occ, 1), "target": TARGETS[stage] * 100,
           "centre": [round((box[0] + box[2]) / 2 / SIZE * 100, 1), round((box[1] + box[3]) / 2 / SIZE * 100, 1)], "semiTransparentPx": semi})
