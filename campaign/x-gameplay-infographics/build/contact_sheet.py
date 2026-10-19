"""Contact sheet of all ten exports for quick review: 4:5 row on top, 1:1 row below.

    python3 campaign/x-gameplay-infographics/build/contact_sheet.py
Writes export/contact-sheet.jpg.
"""
import glob
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
EXPORT = os.path.join(HERE, "..", "export")
FONT = os.path.join(HERE, "fonts", "inter-latin-wght-normal.woff2")

W, GAP, PAD, LABEL = 560, 28, 48, 44
rows = [sorted(glob.glob(os.path.join(EXPORT, r, "*.jpg"))) for r in ("4x5", "1x1")]
heights = [round(W * 1800 / 1440), W]
sheet_w = PAD * 2 + 5 * W + 4 * GAP
sheet_h = PAD * 2 + sum(h + LABEL for h in heights) + GAP + 70
sheet = Image.new("RGB", (sheet_w, sheet_h), (8, 8, 16))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype(FONT, 22)
    title = ImageFont.truetype(FONT, 30)
except OSError:
    font = title = ImageFont.load_default()
draw.text((PAD, PAD - 8), "Solanites · X gameplay infographics · 4:5 (top) and 1:1 (bottom)", fill=(236, 235, 247), font=title)
y = PAD + 70
for files, h in zip(rows, heights):
    for i, f in enumerate(files):
        x = PAD + i * (W + GAP)
        sheet.paste(Image.open(f).convert("RGB").resize((W, h), Image.LANCZOS), (x, y))
        draw.text((x, y + h + 10), os.path.relpath(f, EXPORT), fill=(166, 163, 196), font=font)
    y += h + LABEL + GAP
out = os.path.join(EXPORT, "contact-sheet.jpg")
sheet.save(out, quality=90)
print("wrote", os.path.relpath(out, os.path.join(HERE, "..")), sheet.size)
