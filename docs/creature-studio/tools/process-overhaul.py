"""Cuts out, frames and checks every downloaded overhaul generation (free, local).

For each species x stage, the LAST row in art/creature-studio/overhaul/tasks.tsv wins (corrections
come later). Its raw file is cut out and framed to the canon C13 target and written as
  art/creature-studio/overhaul/final/<id>/<n>-<stage>.png   (1024 x 1024, transparent)
with the C9 48 px readability numbers in art/creature-studio/overhaul/status.json.
Classified species are refused: their art must never be written into this public repository.

  python3 -I docs/creature-studio/tools/process-overhaul.py [board-name id,id,...]
"""
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path("art/creature-studio/overhaul")
STAGES = ["eggling", "hatchling", "evolved", "ascended"]
CLASSIFIED = {"086f90d3cfd8e943", "635f6faa80eccaf4", "6be2ea8b0b28eea0", "aeebad4a796fcc2e", "b9a8facfd00a4ea9", "e3bb8b00106b7d9b"}  # sha256(id)[:16] of the Mythic and Secret species
BG = (7, 6, 13, 255)
PIPELINE = 2  # 2: detached specks cleared before framing (canon C13 measure ignores them)

spec = importlib.util.spec_from_file_location("cf", "docs/creature-studio/tools/cutout-and-frame.py")
cf = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cf)
cf.MAX_UPSCALE = 1.3  # pilot stages framed before the tighter references; flagged in status


def c9(im):
    tile = Image.new("RGBA", im.size, BG)
    tile.alpha_composite(im)
    s = np.asarray(tile.convert("L").resize((48, 48), Image.LANCZOS)).astype(float)
    v = s[s > 20]
    return round(float(np.median(v))), round(float(np.percentile(v, 25)))


def drop_specks(rgba, n):
    """Clears detached specks smaller than 0.1 % of the delivered frame, the size the canon's C13
    measure ignores, so a stray fleck can neither stretch the framing box nor stay in the art."""
    a = np.asarray(rgba).copy()
    solid = a[..., 3] >= 32
    lab, k = ndimage.label(solid, structure=np.ones((3, 3)))
    if k < 2:
        return rgba, 0
    sizes = ndimage.sum(solid, lab, range(1, k + 1))
    boxes = ndimage.find_objects(lab)
    keep = np.zeros(k, bool)
    keep[int(np.argmax(sizes))] = True
    for _ in range(3):  # the delivered scale depends on which parts are kept
        y0 = min(boxes[i][0].start for i in np.nonzero(keep)[0]); y1 = max(boxes[i][0].stop for i in np.nonzero(keep)[0])
        x0 = min(boxes[i][1].start for i in np.nonzero(keep)[0]); x1 = max(boxes[i][1].stop for i in np.nonzero(keep)[0])
        s = cf.TARGETS[n] * 1024 / max(y1 - y0, x1 - x0)
        keep = sizes * s * s >= 1024 * 1024 * 0.001
    specks = np.isin(lab, 1 + np.nonzero(~keep)[0])
    kept = np.isin(lab, 1 + np.nonzero(keep)[0])
    clear = ndimage.binary_dilation(specks, iterations=3) & ~ndimage.binary_dilation(kept, iterations=3)
    a[..., 3][clear] = 0
    return Image.fromarray(a, "RGBA"), int((~keep).sum())


def raw_for(key, task):
    for d in (ROOT / "raw", Path("art/creature-studio/pilot")):
        hit = sorted(d.glob(f"{key}-*{task[:8]}*.png"))
        if hit:
            return hit[0]
    return None


latest = {}
for line in (ROOT / "tasks.tsv").read_text().splitlines()[1:]:
    if line.strip():
        key, task, *_ = line.split("\t")
        latest[key] = task
status = json.loads((ROOT / "status.json").read_text()) if (ROOT / "status.json").exists() else {}
for key, task in latest.items():
    sid, n = key.rsplit("-", 1)
    if hashlib.sha256(sid.encode()).hexdigest()[:16] in CLASSIFIED:
        raise SystemExit(f"refusing to write classified art into the public repo: {key}")
    src = raw_for(key, task)
    if not src:
        continue
    dst = ROOT / "final" / sid / f"{n}-{STAGES[int(n) - 1]}.png"
    if dst.exists() and status.get(key, {}).get("task") == task and status[key].get("pipeline") == PIPELINE:
        continue
    rgba, _ = cf.cutout(Image.open(src), 10.0, 48.0)
    rgba, specks = drop_specks(rgba, int(n))
    framed, scale = cf.frame(rgba, int(n))
    dst.parent.mkdir(parents=True, exist_ok=True)
    framed.save(dst, optimize=True)
    med, p25 = c9(framed)
    status[key] = {"task": task, "raw": str(src), "scale": round(scale, 3), "c9": [med, p25],
                   "c9_pass": med >= 70 and p25 >= 45, "upscaled": scale > 1.0001, "specks": specks, "pipeline": PIPELINE}
(ROOT / "status.json").write_text(json.dumps(dict(sorted(status.items())), indent=1))

if len(sys.argv) > 2:
    name, ids = sys.argv[1], sys.argv[2].split(",")
    T = 240
    hires = Path(sys.argv[3]) if len(sys.argv) > 3 else None
    board = Image.new("RGBA", (T * 8, T * len(ids) + 30), BG)
    d = ImageDraw.Draw(board)
    d.text((8, 8), "each stage: before (shipped) | after (overhaul)", fill=(200, 190, 220, 255))
    for r, sid in enumerate(ids):
        for n in range(1, 5):
            after = ROOT / "final" / sid / f"{n}-{STAGES[n - 1]}.png"
            pair = []
            if hires:
                b = Image.open(hires / f"{sid}-{n}.png").convert("RGBA")
                b = b.crop(b.getchannel("A").point(lambda v: 255 if v >= 32 else 0).getbbox())
                t = cf.TARGETS[n] * 1024 / max(b.size)
                b = b.resize((round(b.width * t), round(b.height * t)), Image.LANCZOS)
                c = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
                c.alpha_composite(b, ((1024 - b.width) // 2, (1024 - b.height) // 2))
                pair.append(c)
            pair.append(Image.open(after).convert("RGBA") if after.exists() else Image.new("RGBA", (1024, 1024)))
            for j, im in enumerate(pair):
                tile = Image.new("RGBA", (1024, 1024), BG)
                tile.alpha_composite(im)
                board.paste(tile.resize((T - 4, T - 4), Image.LANCZOS), ((n - 1) * 2 * T + j * T + 2, 30 + r * T))
            st = status.get(f"{sid}-{n}")
            if st:
                d.text(((n - 1) * 2 * T + T + 6, 30 + r * T + T - 18), f"C9 {st['c9'][0]}/{st['c9'][1]}", fill=(255, 226, 168, 255))
        d.text((6, 34 + r * T), sid, fill=(255, 226, 168, 255))
    (ROOT / "boards").mkdir(exist_ok=True)
    board.convert("RGB").save(ROOT / "boards" / f"{name}.png")
print(f"{sum(1 for k in status)} stages processed; C9 fails: {[k for k, v in status.items() if not v['c9_pass']]}")
