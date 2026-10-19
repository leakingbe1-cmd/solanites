"""Downloads finished overhaul generations named in art/creature-studio/overhaul/tasks.tsv.

Output URLs are signed and only appear in Runway tool results, so they are read from a text
file (e.g. the session transcript) given on the command line. Each image is saved unmodified as
art/creature-studio/overhaul/raw/<key>-<task8>.png; existing files are skipped.

  python3 -I docs/creature-studio/tools/fetch-overhaul.py <file-with-urls> [...]
"""
import re
import sys
import urllib.request
from pathlib import Path

OUT = Path("art/creature-studio/overhaul/raw")
URL = re.compile(r"https://dnznrvs05pmza\.cloudfront\.net/gemini/[^\"'\\\s]+?/images/([0-9a-f-]{36})/[^\"'\\\s]+?\.png\?_jwt=[A-Za-z0-9._-]+")

urls = {}
for f in sys.argv[1:]:
    for m in URL.finditer(Path(f).read_text(errors="ignore")):
        urls[m.group(1)] = m.group(0)
OUT.mkdir(parents=True, exist_ok=True)
rows = [l.split("\t") for l in Path("art/creature-studio/overhaul/tasks.tsv").read_text().splitlines()[1:] if l.strip()]
got = missing = 0
for key, task, *_ in rows:
    dst = OUT / f"{key}-{task[:8]}.png"
    if dst.exists():
        continue
    if task not in urls:
        missing += 1
        continue
    urllib.request.urlretrieve(urls[task], dst)
    got += 1
print(f"downloaded {got}, still pending {missing}")
