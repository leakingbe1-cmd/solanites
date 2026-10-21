"""contact-sheet.png: the ten posts (2 x 5), then the header and avatar, for quick review."""
import glob, os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
F = os.path.join(ROOT, "template", "fonts", "inter-latin-wght-normal.woff2")
font = ImageFont.truetype(F, 22) if os.path.exists(F) else ImageFont.load_default()
title = ImageFont.truetype(F, 30) if os.path.exists(F) else font
posts = sorted(glob.glob(os.path.join(ROOT, "posts", "*.jpg")))
TW, TH, G, P = 720, 405, 28, 56
cols = 2
rows = (len(posts) + cols - 1) // cols
W = P * 2 + cols * TW + (cols - 1) * G
H = P + 60 + rows * (TH + 40 + G) + 300 + P
sheet = Image.new("RGB", (W, H), (7, 6, 10))
d = ImageDraw.Draw(sheet)
d.text((P, P - 10), "Solanites · X campaign · 10 posts (1600×900), header (1500×500), avatar", fill=(239, 232, 218), font=title)
y0 = P + 60
for i, f in enumerate(posts):
    x, y = P + (i % cols) * (TW + G), y0 + (i // cols) * (TH + 40 + G)
    sheet.paste(Image.open(f).convert("RGB").resize((TW, TH), Image.LANCZOS), (x, y))
    d.text((x, y + TH + 8), os.path.basename(f), fill=(189, 179, 163), font=font)
y = y0 + rows * (TH + 40 + G)
banner = Image.open(os.path.join(ROOT, "profile", "x-header-1500x500.png")).convert("RGB").resize((TW + 200, int((TW + 200) / 3)), Image.LANCZOS)
sheet.paste(banner, (P, y))
d.text((P, y + banner.height + 8), "profile/x-header-1500x500.png", fill=(189, 179, 163), font=font)
av = Image.open(os.path.join(ROOT, "profile", "x-avatar-400x400.png")).convert("RGB").resize((240, 240), Image.LANCZOS)
mask = Image.new("L", av.size, 0); ImageDraw.Draw(mask).ellipse((0, 0, 239, 239), fill=255)
sheet.paste(av, (W - P - 240, y), mask)
d.text((W - P - 240, y + 248), "x-avatar (circle preview)", fill=(189, 179, 163), font=font)
out = os.path.join(ROOT, "contact-sheet.png")
sheet.save(out, optimize=True)
print("wrote contact-sheet.png", sheet.size)
