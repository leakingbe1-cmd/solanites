"""Local, no-credit fix (owner request): roots Astravex Ascended's three neck spurs into the neck. Run once after process-overhaul.py and local-fixes.py regenerate astravex-4 (it is not idempotent): python3 -I docs/creature-studio/tools/astravex-neck.py"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
C = Path(sys.argv[1]) if len(sys.argv) > 1 else None; src = Path("art/creature-studio/overhaul/final/astravex/4-ascended.png")
im = Image.open(src).convert("RGBA"); a = np.asarray(im).astype(float)
rgb = a[..., :3]
# dorsal line of the neck (1024 px coords), drawn along the back of the neck from head to withers
LINE = [(612, 300), (590, 345), (565, 395), (535, 440), (500, 475), (455, 500), (420, 515), (380, 528), (335, 545), (300, 562)]
m = Image.new("L", im.size, 0); ImageDraw.Draw(m).line(LINE, fill=255, width=3)
line = np.asarray(m) > 0
dist = ndimage.distance_transform_edt(~line)
# which side of the line: inside the neck = to the lower right
poly = Image.new("L", im.size, 0); ImageDraw.Draw(poly).polygon(LINE + [(300, 760), (800, 760), (800, 250)], fill=255)
inside = (np.asarray(poly) > 0) & (a[..., 3] > 200)
purple = (rgb[..., 2] - rgb[..., 0] > 18) & (rgb.mean(-1) < 215)
lum = rgb.mean(-1)
band = inside & purple & (lum > 125) & (dist < 75)
grey = lum[..., None] * np.ones(3)
pale = np.array([236, 230, 240.])
neck = grey * 0.55 + pale * 0.45  # desaturated toward the neck's pale tone, value kept
fade = np.clip((dist - 12) / 28, 0, 1) * band
fade = ndimage.gaussian_filter(fade, 1.5) * band
out = rgb * (1 - fade[..., None]) + neck * fade[..., None]
# root crease: soft darker violet just inside the line where spurs meet it
spur_rows = purple & ~inside
roots = ndimage.binary_dilation(spur_rows, iterations=6) & inside & (dist < 10)
crease = ndimage.gaussian_filter(roots.astype(float), 2.5) * 0.45
out = out * (1 - crease[..., None]) + np.array([70, 52, 140]) * crease[..., None]
res = np.dstack([np.clip(out, 0, 255), a[..., 3]]).astype(np.uint8)
Image.fromarray(res, "RGBA").save(src)
crop = Image.fromarray(res, "RGBA").crop((250, 250, 700, 700)); t = Image.new("RGBA", crop.size, (7, 6, 13, 255)); t.alpha_composite(crop)
o = Image.open(src).convert("RGBA").crop((250, 250, 700, 700)); t2 = Image.new("RGBA", o.size, (7, 6, 13, 255)); t2.alpha_composite(o)
b = Image.new("RGB", (900, 450)); b.paste(t2.convert("RGB"), (0, 0)); b.paste(t.convert("RGB"), (450, 0)); (b.save(C / "astra-fix-compare.png") if C else None)
