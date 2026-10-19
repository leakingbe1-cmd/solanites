"""Measures how much of the artwork frame a creature occupies (canon §2, C13).

Definition (the one every asset is checked against):
  frame      = the full delivered canvas (1024 x 1024 for final stage art).
  creature   = pixels with alpha >= 32 (transparent masters), or, for review images on
               the flat review background (#07060d), pixels whose luminance differs
               from the background by more than 16/255. A 3 px median filter is applied
               first, and connected specks smaller than 0.1% of the frame are ignored,
               so stray particles cannot stretch the box.
  box        = the smallest axis-aligned rectangle containing every creature pixel.
  occupancy  = max(box height, box width) / frame size, in percent. The larger side is
               used so tall, long and wide body plans are measured the same way.
  centre     = box centre as a percentage of frame width and height.

Targets: stage 1 = 45%, stage 2 = 60%, stage 3 = 78%, stage 4 = 88%, each +/- 3 points;
box centre at 50% / 50%, +/- 3 points (no ground line: nothing stands on a floor).

  python3 -I docs/canon/measure-framing.py <image> [stage 1-4]
"""
import sys

from PIL import Image, ImageFilter

TARGETS = {1: 45, 2: 60, 3: 78, 4: 88}
TOL = 3


def mask(im):
    if im.mode in ("RGBA", "LA") and im.getextrema()[-1][0] < 255:
        m = im.getchannel("A").point(lambda a: 255 if a >= 32 else 0)
    else:
        g = im.convert("L")
        bg = 7  # luminance of #07060d
        m = g.point(lambda v: 255 if abs(v - bg) > 16 else 0)
    return m.filter(ImageFilter.MedianFilter(3))


def drop_specks(m, min_px):
    """Remove 8-connected components smaller than min_px (iterative flood fill)."""
    w, h = m.size
    px = m.load()
    seen = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            if px[x, y] and not seen[y * w + x]:
                comp, stack = [], [(x, y)]
                seen[y * w + x] = 1
                while stack:
                    cx, cy = stack.pop()
                    comp.append((cx, cy))
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < w and 0 <= ny < h and px[nx, ny] and not seen[ny * w + nx]:
                                seen[ny * w + nx] = 1
                                stack.append((nx, ny))
                if len(comp) < min_px:
                    for cx, cy in comp:
                        px[cx, cy] = 0
    return m


def measure(path, stage=None):
    im = Image.open(path)
    w, h = im.size
    m = drop_specks(mask(im), int(w * h * 0.001))
    box = m.getbbox()
    if not box:
        return {"file": path, "error": "no creature pixels found"}
    x0, y0, x1, y1 = box
    occ = round(max(x1 - x0, y1 - y0) / max(w, h) * 100, 1)
    cx, cy = round((x0 + x1) / 2 / w * 100, 1), round((y0 + y1) / 2 / h * 100, 1)
    r = {"file": path, "frame": [w, h], "box": [x0, y0, x1, y1], "occupancy": occ, "centre": [cx, cy]}
    if stage:
        t = TARGETS[stage]
        r["target"] = t
        r["occupancyPass"] = abs(occ - t) <= TOL
        r["centrePass"] = abs(cx - 50) <= TOL and abs(cy - 50) <= TOL
    return r


if __name__ == "__main__":
    print(measure(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else None))
