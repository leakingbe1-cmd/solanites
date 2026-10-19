"""Upscale the two source frames once so the browser never has to stretch them.

Writes build/.cache/*.jpg (git-ignored). Run by render.mjs automatically.
"""
import os
import sys
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "source")
OUT = os.path.join(HERE, ".cache")
os.makedirs(OUT, exist_ok=True)

JOBS = [
    # (source, output, scale, unsharp percent)
    ("phoenix-still.png", "phoenix-still@2x.jpg", 2.0, 70),
    ("rebirth-frame.png", "rebirth-frame@3x.jpg", 3.0, 90),
]

for src, out, scale, amount in JOBS:
    dst = os.path.join(OUT, out)
    if os.path.exists(dst) and "--force" not in sys.argv:
        continue
    im = Image.open(os.path.join(SRC, src)).convert("RGB")
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.4, percent=amount, threshold=2))
    im.save(dst, quality=95, subsampling=0)
    print("prepared", out, im.size)
