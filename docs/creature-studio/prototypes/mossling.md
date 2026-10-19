# Prototype 2: Mossling, The Patient Sprout

Common · Verdant · dex 1 · catalogued · renderer `src/components/creature/species/mossling.tsx` · personality: Patient, Curious, Loyal.

> *"Mosslings sleep beneath the roots of validator groves, growing a little greener with every block their keeper holds."*

Original references: [`../baseline/common.webp`](../baseline/common.webp) (Mossling row), `docs/creature-art/reference/species/mossling.webp`, `docs/creature-art/reference/mossling-detail.webp`, `creatureDesigns.json → species.mossling`.

## 1. What must remain recognisable

- **Low, broad, domed quadruped** with short sturdy legs: the slowest, most grounded creature in the set.
- **Overlapping leaf shingles** along the back.
- **Branching antlers** that become a small tree crown with blossoms at Ascended, and a **sapling growing from its back** at Ascended.
- Solgem on the **forehead**.
- Verdant green family; spores; calm, patient temperament.

## 2. What changes, and why

The vector Mossling reads as a green hippo with a tortoise shell; the snout is a pig disc and the Ascended root-feet are white stick lines. The painted sheet went the other way, to a big-eyed sprout-deer. The redesign keeps the vector body plan (low grazer) and takes the sheet's charm and moss.

**New anatomy.** A small **mossy grazer**, like a pygmy hippo crossed with a musk deer and a hedgehog-shaped back garden.
- Head held low, **long soft muzzle** with a rounded nose pad (no snout disc), small ears that sit sideways like leaves.
- Body a low dome; legs short with **three blunt hoof-toes** and bark-textured shins.
- The back is a **moss bed**: leaf shingles grow out of moss in rows, like roof tiles, rather than a hard shell. This removes the turtle read.
- Short leafy tail.

**Silhouette read:** a low dome with antlers rising at the front. Black-fill test: antlers + dome.

## 3. Face and personality

- **Default expression: content and sleepy.** Heavy upper lids, eyes two-thirds closed, a soft closed smile, slight lean of the head toward the viewer.
- Large dark-green glossy eyes with one catchlight; when they open fully (Eggling, or as an animation beat) they are startlingly curious.

## 4. Signature details

- Moss bed with leaf shingles.
- Antlers in pale wood with fine grain, carrying a few leaves (Hatchling) → many (Evolved) → blossoms (Ascended).
- Tiny glowing spores drifting **close** to the back (within one body-width).
- Forehead Solgem half-buried in moss.

## 5. Materials, texture, light and colour

- Moss: clustered broken edges, warm yellow-green where lit, cool blue-green in shadow.
- Leaves: flat planes with one vein, warm transmitted light at the edges.
- Skin/face: pale sage `#d8f7d0` belly and muzzle, mid green `#3fbf7f`, shadow `#145c43`.
- Emission: only spores and faint vein lines in leaves at Ascended. Glow budget ≤ 3%.
- Distinct from Sproutwyrm: Mossling is **blue-green moss and pale wood**; Sproutwyrm moves to **yellow-green and bark brown**.

## 6. Elemental identity (Verdant)

Rounded, layered, growing upward. Life accumulates on the creature over time: moss, then leaves, then a whole little grove.

## 7. Idle animation concept

Tier B (layered 2D).
- **Loop (5 s, slow):** a deep breath that lifts the moss bed, two antler leaves sway, a slow blink, an occasional ear flick. One spore drifts up and fades.
- Layers: body, head, antlers, ears, eyelids, spores. All transforms are small rotations and scales, so CSS/SVG is enough.

## 8. Evolution

| | Eggling | Hatchling | Evolved | Ascended |
|---|---|---|---|---|
| Form | round moss puff with stubby legs, sitting | small calf standing, still big-headed | broad grazer walking slowly | ancient walking grove, slow regal stride |
| Head : body | 1 : 1.6 | 1 : 2.3 | 1 : 3 | 1 : 3.5 |
| Antlers | one sprout with two leaves | short forked twigs, few leaves | full branching antlers | wide crown like a small tree, glowing leaves and blossoms |
| Back | soft moss fuzz | first shingles on shoulders | full leaf-shingle moss bed | moss bed with a **sapling and small crystals growing from it** |
| Legs | nubs | visible, knobbly knees | bark-plated shins | thick, rooted-looking feet that leave moss behind |
| Eyes | wide open, curious | open, alert | heavy-lidded, content | heavy-lidded, wise |

Continuity anchors: green moss family, pale-wood antlers, forehead Solgem, low head carriage, heavy-lidded calm.

## 9. Generation prompts

Use the shared style block from [`velynx.md`](velynx.md) §9. Reference images: Mossling baseline row, `mossling-detail.webp`.

1. **Eggling.** A tiny round moss-covered creature sitting like a soft puff, stubby nub legs, wide-open dark-green glossy eyes full of curiosity, a short soft muzzle with a rounded nose pad, leaf-shaped ears pointing sideways. A single sprout with two leaves on its head beside a small diamond gem half-buried in moss on its forehead.
2. **Hatchling.** A small, big-headed mossy calf standing on short knobbly legs with three blunt hoof-toes, head low and curious, alert open eyes. Short forked pale-wood antlers with a few leaves. The first leaf shingles grow out of moss on its shoulders. Diamond gem on the forehead.
3. **Evolved.** A low, broad, domed quadruped grazer walking slowly forward with its head low. Long soft muzzle, heavy-lidded content eyes, soft closed smile. Its back is a bed of moss with rows of overlapping leaf shingles like roof tiles (not a shell). Full branching pale-wood antlers with fine grain and leaves. Bark-textured shins, short leafy tail. A few tiny glowing spores close to its back. Diamond gem in the moss on its forehead.
4. **Ascended.** A large, ancient, low and broad mossy grazer with a slow regal stride, wise heavy-lidded eyes. Wide antlers like a small tree crown with softly glowing leaves and small blossoms. A young sapling and a few small green crystals grow from the moss bed on its back. Thick feet that leave moss behind. Faint glowing veins in the leaves, a few spores close to the body. Diamond gem in the moss on its forehead.
