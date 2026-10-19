"""Free local "paint pass" over an existing creature render (no paid generation).

Input: a transparent PNG of an existing creature stage (render-vector-hires.mjs, 2048 px).
Output: a 1024 x 1024 transparent PNG framed to the canon C13 stage target.

What it changes (canon C1-C3), and nothing else; anatomy, palette and identity are the
original drawing's:
  * form light: pseudo-normals from the silhouette's distance field give each limb and body
    part a soft rounded volume, lit by a warm gold key (#FFE2A8) from the upper left and
    falling into cool shadow on the lower right;
  * a restrained violet rim (#7D5CF0) along edges that face away from the key;
  * coloured linework: an outline in the darkest local colour that thickens on the shadow side
    and fades where the light hits;
  * painted texture: soft directional brush grain (strokes at about -35 degrees) and a slight
    flattening of the original gradients, so surfaces read as painted rather than airbrushed.

  python3 -I docs/creature-studio/tools/paint-pass.py <in.png> <out.png> <stage 1-4> [--seed N]
"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

KEY = np.array([255, 226, 168]) / 255.0  # #FFE2A8
RIM = np.array([125, 92, 240]) / 255.0  # #7D5CF0
LIGHT = np.array([-0.62, -0.62, 0.48])  # from the upper left, slightly toward the viewer
LIGHT = LIGHT / np.linalg.norm(LIGHT)
TARGETS = {1: 0.45, 2: 0.60, 3: 0.78, 4: 0.88}
OUT = 1024


def brush_grain(shape, seed):
    rng = np.random.default_rng(seed)
    n = rng.standard_normal(shape)
    # anisotropic blur, rotated: long strokes along about -35 degrees
    n = ndimage.rotate(n, 35, reshape=False, mode="wrap")
    n = ndimage.gaussian_filter(n, sigma=(1.2, 9.0))
    n = ndimage.rotate(n, -35, reshape=False, mode="wrap")
    n = (n - n.mean()) / (n.std() + 1e-6)
    return n


def paint(rgba, seed=7):
    a = rgba[..., 3] / 255.0
    rgb = rgba[..., :3] / 255.0
    solid = a > 0.5
    h, w = a.shape
    scale = w / 2048.0

    # 1. soften the vector's smooth gradients slightly (paint has flatter value groups)
    flat = np.stack([ndimage.median_filter(rgb[..., c], size=max(3, int(5 * scale))) for c in range(3)], -1)
    rgb = 0.55 * rgb + 0.45 * flat

    # 2. form light from the silhouette: distance field -> height -> normals
    dist = ndimage.distance_transform_edt(solid)
    height = np.sqrt(np.clip(dist / (40 * scale), 0, 1))  # rounded within ~40 px of every edge
    height = ndimage.gaussian_filter(height, 6 * scale)
    gy, gx = np.gradient(height)
    nz = np.full_like(gx, 0.35)
    norm = np.sqrt(gx ** 2 + gy ** 2 + nz ** 2)
    nx, ny, nz = -gx / norm, -gy / norm, nz / norm
    lam = np.clip(nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2], 0, 1)
    # a broad upper-left to lower-right falloff across the whole creature as well
    yy, xx = np.mgrid[0:h, 0:w]
    ys, xs = np.nonzero(solid)
    if len(xs):
        cx, cy, span = xs.mean(), ys.mean(), max(np.ptp(xs), np.ptp(ys), 1)
        broad = np.clip(0.5 - ((xx - cx) + (yy - cy)) / (1.6 * span), 0, 1)
    else:
        broad = np.zeros_like(a)
    light = np.clip(0.55 * lam + 0.45 * broad, 0, 1)[..., None]
    warm = rgb * (0.80 + 0.32 * light) * (1 - 0.18 * light) + KEY * 0.18 * light ** 1.5
    shade = 1 - 0.20 * (1 - light)  # cool, slightly violet shadow side
    rgb = warm * shade + (1 - shade) * np.array([0.10, 0.08, 0.20])

    # 3. violet rim on edges facing away from the key (back and lower right)
    edge_band = (dist > 0) & (dist < 9 * scale)
    away = np.clip(nx * 0.7 + ny * 0.7, 0, 1)  # normals pointing right/down
    rim = (edge_band * away * np.clip(1 - dist / (9 * scale), 0, 1))[..., None] * 0.55
    rgb = rgb * (1 - rim) + RIM * rim

    # 4. coloured linework: darkest local colour, thick in shadow, lost in the light
    outer = solid & ~ndimage.binary_erosion(solid, iterations=max(1, int(3 * scale)))
    local_dark = np.stack([ndimage.minimum_filter(rgb[..., c], size=max(5, int(9 * scale))) for c in range(3)], -1) * 0.7
    line_w = np.clip(1.0 - light[..., 0] * 1.2, 0, 1)
    line = (outer * line_w)[..., None] * 0.85
    rgb = rgb * (1 - line) + local_dark * line

    # 5. painted grain, strongest in the mid tones
    grain = brush_grain(a.shape, seed)[..., None]
    lum = rgb.mean(-1, keepdims=True)
    rgb = rgb * (1 + 0.045 * grain * (1 - np.abs(lum - 0.5) * 1.4))

    rgb = np.clip(rgb, 0, 1)
    out = np.dstack([rgb * 255, a * 255]).round().astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def frame(img, stage):
    box = img.getchannel("A").point(lambda v: 255 if v >= 32 else 0).getbbox()
    crop = img.crop(box)
    target = TARGETS[stage] * OUT
    s = target / max(crop.size)
    if s > 1.0001:
        raise SystemExit(f"stage {stage}: would need {s:.2f}x upscaling; render larger")
    crop = crop.resize((round(crop.width * s), round(crop.height * s)), Image.LANCZOS)
    canvas = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
    canvas.alpha_composite(crop, ((OUT - crop.width) // 2, (OUT - crop.height) // 2))
    return canvas


if __name__ == "__main__":
    src, dst, stage = sys.argv[1], sys.argv[2], int(sys.argv[3])
    seed = int(sys.argv[sys.argv.index("--seed") + 1]) if "--seed" in sys.argv else 7
    rgba = np.asarray(Image.open(src).convert("RGBA")).astype(np.float64)
    frame(paint(rgba, seed), stage).save(dst, optimize=True)
