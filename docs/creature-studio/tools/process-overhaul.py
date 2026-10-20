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

ROOT = Path("art/creature-studio/overhaul")
STAGES = ["eggling", "hatchling", "evolved", "ascended"]
CLASSIFIED = {"086f90d3cfd8e943", "635f6faa80eccaf4", "6be2ea8b0b28eea0", "aeebad4a796fcc2e", "b9a8facfd00a4ea9", "e3bb8b00106b7d9b"}  # sha256(id)[:16] of the Mythic and Secret species
BG = (7, 6, 13, 255)
PIPELINE = 3  # 2: detached specks cleared before framing; 3: painted holes restored from the raw
KEEP_HOLES = {"aurelion-1"}  # restoring only one eye ring would make the eyes mismatch

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
# stages with local fixes are always regenerated, so local-fixes.py always starts from fresh output
FIXED = {j["key"] for j in json.loads((ROOT / "local-fixes.json").read_text())} if (ROOT / "local-fixes.json").exists() else set()
for key, task in latest.items():
    sid, n = key.rsplit("-", 1)
    if hashlib.sha256(sid.encode()).hexdigest()[:16] in CLASSIFIED:
        raise SystemExit(f"refusing to write classified art into the public repo: {key}")
    src = raw_for(key, task)
    if not src:
        continue
    dst = ROOT / "final" / sid / f"{n}-{STAGES[int(n) - 1]}.png"
    if dst.exists() and status.get(key, {}).get("task") == task and status[key].get("pipeline") == PIPELINE and key not in FIXED:
        continue
    raw = Image.open(src)
    rgba, _ = cf.cutout(raw, 10.0, 48.0)
    if key not in KEEP_HOLES:
        rgba, _ = cf.restore_painted_holes(raw, rgba)
    rgba, specks = cf.drop_specks(rgba, int(n))
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
