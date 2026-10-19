"""Builds the Round 1 concept comparison page from files in the review folder.

For each species: the original Evolved stage (rendered from the shipped SVG)
beside each concept that exists, plus 48 px colour and black-fill thumbnails
for the readability check. Missing concepts show as "not generated".
Never reads from or writes to the production pipeline (art/creatures, public/).

  python3 -I docs/creature-studio/tools/build-concept-board.py <baselineDir> <out.html> [notes.json]
"""
import base64
import html
import io
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
REVIEW = ROOT / "art/creature-studio/round-1"
SPECIES = [
    ("velynx", "Velynx", "Legendary · Shadow", [("A", "fence-walker", "Fence-walker"), ("B", "glyph-scribe", "Glyph-scribe")]),
    ("mossling", "Mossling", "Common · Verdant", [("A", "grazer", "Grazer"), ("B", "moss-fawn", "Moss fawn")]),
    ("cryovant", "Cryovant", "Rare · Crystal", [("A", "gem-cut-bell", "Gem-cut bell"), ("B", "lantern", "Lantern")]),
]
BG = (7, 6, 13)


def uri(im, size, q=82):
    im = im.convert("RGB").resize((size, size), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=q)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def silhouette(im):
    """Black-fill test: anything clearly brighter than the dark background becomes a solid light shape."""
    g = im.convert("L")
    mask = g.point(lambda v: 255 if v > 34 else 0)
    out = Image.new("RGB", im.size, BG)
    out.paste((214, 210, 235), mask=mask)
    return out


def cell(label, im, note=""):
    if im is None:
        return f'<figure class="c missing"><div class="ph">Not generated</div><figcaption>{html.escape(label)}</figcaption></figure>'
    w, h = im.size
    return (
        f'<figure class="c"><img src="{uri(im, 512)}" alt="{html.escape(label)}">'
        f'<div class="t48"><img src="{uri(im, 48, 90)}" alt="" width="48" height="48"><img src="{uri(silhouette(im), 48, 90)}" alt="" width="48" height="48"><span>48 px · black-fill</span></div>'
        f'<figcaption>{html.escape(label)}<span>{w}×{h}</span></figcaption>{note}</figure>'
    )


def main():
    base, out = Path(sys.argv[1]), Path(sys.argv[2])
    notes = json.loads(Path(sys.argv[3]).read_text()) if len(sys.argv) > 3 else {}
    rows, chosen = [], []
    for sid, name, tag, concepts in SPECIES:
        cells = [cell("Original · Evolved (shipped SVG)", Image.open(base / f"{sid}-3.png"))]
        for key, slug, title in concepts:
            f = REVIEW / f"{sid}-{key}-{slug}.png"
            im = Image.open(f) if f.exists() else None
            n = notes.get(f"{sid}-{key}")
            cells.append(cell(f"{key} · {title}", im, f'<p class="note">{html.escape(n)}</p>' if n else ""))
            if im is not None and notes.get("preferred", {}).get(sid) == key:
                chosen.append((name, im))
        rows.append(f'<section><h2>{name}<span>{tag}</span></h2><div class="row">{"".join(cells)}</div></section>')
    group = ""
    if chosen:
        group = '<section><h2>Preferred three together<span>cohesion check</span></h2><div class="row">' + "".join(cell(n, im) for n, im in chosen) + "</div></section>"
    page = Path(__file__).with_name("concept-board.tpl.html").read_text()
    out.write_text(page.replace("{{ROWS}}", "\n".join(rows)).replace("{{GROUP}}", group).replace("{{SUMMARY}}", notes.get("summary", "")))
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
