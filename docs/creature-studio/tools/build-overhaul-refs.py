"""Builds the edit references and prompts for the nano-banana-2.1 overhaul (free, local).

For every non-classified species x stage still to do, takes the shipped drawing rendered by
render-vector-hires.mjs (2048 px, transparent), places it on flat mid-grey at ~86 % of a 1024
canvas (so the model's output needs no upscaling for stages 3-4) and writes:
  art/creature-studio/refs/<id>-<n>.png
  art/creature-studio/refs/prompts.json   {"<id>-<n>": "<prompt>"}
Classified (Mythic, Secret) species are never written here: this folder is public.

  python3 -I docs/creature-studio/tools/build-overhaul-refs.py <hires dir> <species.json>
species.json: [{id, rarity, element, palette: {...}}] exported from src/lib/species.ts.
"""
import json
import sys
from pathlib import Path

from PIL import Image

CLASSIFIED = {"mythic", "secret"}
OUT = Path("art/creature-studio/refs")
DONE = {"mossling-1", "mossling-2", "mossling-4", "aurelion-1", "aurelion-3", "frostkit-3"}  # pilot, approved
STAGE = {1: "Eggling", 2: "Hatchling", 3: "Evolved", 4: "Ascended"}

PROMPT = (
    "Repaint @creature as a stylised hand-painted 2D illustration. Keep this exact creature: identical anatomy, "
    "silhouette, pose, proportions, body plan, number of limbs, face and every small detail of the reference "
    "(horns, ears, wings, fins, spikes, tails, gems, markings, glyphs). Keep the reference's colour palette with "
    "the same hues and saturation: body {body}, light {bodyLight}, shadow {bodyDark}, belly {belly}, accents {accent}, "
    "eyes {eye}; do not desaturate, do not shift it toward brown, yellow or grey. Only change the rendering: painted "
    "volume in three values, visible but controlled brushwork, coloured linework in the darkest local colour (never "
    "black) that thins in the light. Lighting: a warm gold key light (#FFE2A8) from the upper left that only warms the "
    "lit highlights, plus a restrained violet rim light (#7D5CF0) from behind on the back and outer edges. One small "
    "catchlight per eye, upper left. Perfectly flat plain mid-grey background, creature centred, same size and "
    "position as the reference, fully in frame. No ground, no shadow under the creature, no halo, no glow aura, no "
    "rays, no sparkles, no particles, no text, no frame. Not 3D render, not glossy plastic, not photoreal, not flat "
    "vector, not anime."
)


def ref(src):
    im = Image.open(src).convert("RGBA")
    crop = im.crop(im.getchannel("A").point(lambda v: 255 if v >= 32 else 0).getbbox())
    s = 880 / max(crop.size)
    crop = crop.resize((round(crop.width * s), round(crop.height * s)), Image.LANCZOS)
    bg = Image.new("RGBA", (1024, 1024), (128, 128, 128, 255))
    bg.alpha_composite(crop, ((1024 - crop.width) // 2, (1024 - crop.height) // 2))
    return bg.convert("RGB")


if __name__ == "__main__":
    hires, species = Path(sys.argv[1]), json.load(open(sys.argv[2]))
    OUT.mkdir(parents=True, exist_ok=True)
    prompts = {}
    for sp in species:
        if sp["rarity"] in CLASSIFIED:
            continue
        for n in range(1, 5):
            key = f"{sp['id']}-{n}"
            if key in DONE:
                continue
            ref(hires / f"{key}.png").save(OUT / f"{key}.png", optimize=True)
            prompts[key] = PROMPT.format(**sp["palette"])
    json.dump(prompts, open(OUT / "prompts.json", "w"), indent=1)
    print(f"{len(prompts)} references")
