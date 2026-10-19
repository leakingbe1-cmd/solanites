# Alignment: one art bible, one set of prompts

Recorded 2026-10-19. Applies to everything on `design/creative-direction`. Where any older document on this branch disagrees with this file, this file wins.

## 1. Which document is authoritative

| Subject | Authority | Where |
|---|---|---|
| Creature art: style, anatomy, faces, lighting, materials, glow budget, composition, thumbnail tests | **Creature Studio art bible** | `docs/creature-studio/art-bible.md` on `creature-studio/art-direction` |
| Species identity and generation prompts (Velynx, Mossling, Cryovant, then the rest) | **Creature Studio prototype briefs** | `docs/creature-studio/prototypes/*.md` on the same branch |
| Phoenix key art | Hand-painted 2D under the same art bible (§2, §5–§7), with the prompt in §3 below | this file |
| Website UI: tokens, type, motion, Celestial Atlas motifs (constellations, Threshold horizon, 12-tick ring, restrained engraving) | `creative-direction.md` + `art-direction-v2.md` §2, as amended in §2 below | this branch |

This branch does not keep its own creature prompts or creature style rules any more.

## 2. What this branch retracts or amends

| Earlier text on this branch | Status | Replaced by |
|---|---|---|
| `art-direction-v2.md` §3.2 rule 6: "stylised realism, a collectible sculpture under museum light… contact shadow on a matte obsidian ground" | **Retracted** | Art bible §2: hand-painted 2D illustration |
| Any rule that puts a ground plane or floor into creature artwork | **Retracted** | Art bible §9–§10: no ground planes in the art. The app may draw one soft contact shadow at the bible's ground line (88% of frame height); the art never contains one |
| `creative-direction.md` §2.7 "violet rim from behind and lower right" | **Amended** | Art bible §7: key warm-neutral from the upper left; rim cool cyan-violet from the right/behind; dim low fill |
| `creative-direction.md` §2.7 `CreaturePortrait` light cone, grade and aura | **Amended** | Temporary treatment for the existing vector art only. Retired when painted art arrives; no aura behind painted creatures |
| `art-direction-v2.md` §3.3 Mossling ("mossy boulder", antlers dropped, stone shell, tortoise Ascended) and `phase-1.md` §3 Mossling studies, `docs/design/mossling/*.svg` | **Superseded; do not use** | `prototypes/mossling.md`: low domed grazer, moss bed with leaf shingles (not a shell), pale-wood antlers that become a tree crown with blossoms, forehead Solgem, sapling at Ascended, content and sleepy, Eggling wide-eyed |
| `art-direction-v2.md` §3.3 Duskwing and Pyraurum prototypes | **Withdrawn** | The prototypes are Velynx, Mossling and Cryovant (Creature Studio decisions log) |
| `art-direction-v2.md` §1.4 and `phase-1.md` §1.4 phoenix prompts ("photoreal VFX", "filmic", gold halo) | **Superseded** | §3 below: hand-painted 2D, no halo |
| "The Eclipse Vigil" | Informal description from the website session's unified-direction page, not a project name | The working name stays **The Celestial Atlas** |

Kept unchanged: palette tokens, Cormorant/Inter type, motion tokens, the sigil, constellations, the Threshold horizon, the 12-tick ring, restrained gold engraving, and the labelling rule (existing / temporary / proposed / study / not yet made).

## 3. Phoenix key art: the single prompt
Built on the website session's Eclipse Phoenix prompt (Runway task `a0a5fc33…`, which already follows the art bible). It changes one thing: the composition, so the left 40% stays dark.

**Settings:** model `nano-banana-pro`, `imageSize: 2K` (2752 × 1536), `ratio: 16:9`, `count: 1`, **no reference images**. These are the exact settings of the four 20:35 UTC generations, which together cost exactly 80 credits (2,015 → 1,935), so 20 credits each.

**Prompt:**
> Hand-painted 2D fantasy key art illustration, stylised painterly concept art for a premium creature-collector game, not a 3D render and not photoreal. A monumental mythic phoenix, the Eclipse Phoenix, in three-quarter view, its head turned toward the left of the frame. The whole bird, including both wingtips and the tail, stays inside the right 60% of a wide frame. The near wing rises steeply upward and slightly back, cropped by the top edge; the far wing folds down behind the body into shadow. Above and behind its head, a vast eclipsed sun: a black disc ringed by a thin, controlled gold corona. Feathers are grouped into clear tracts (coverts, secondaries, long flight feathers), painted as flat warm-gold planes with crisp edges, the tips dissolving into corona light rather than fire. Warm gold key light from the upper left, a cool blue-violet starlight rim along the right edges of the silhouette, deep near-black shadows. A single cut-diamond Solgem glows ember-orange at the centre of its chest, the only strong emission in the image. Proud, ancient, calm expression: a long elegant skull, a hooked beak, a heavy-lidded amber eye with one small catchlight, no glowing eyes. The left 40% of the frame is empty near-black space with only the faintest trace of nebula: no wing, no feathers and no light enter it. Restrained palette of obsidian black, deep violet-blue, burnished gold and ember. Visible but controlled brushwork, clean graphic silhouette, coloured linework. No halo, no lightning, no sparkles, no lens flare, no radial rays, no text, no logo, no frame.

**Acceptance (measured with `tools/phoenix_qa.py`):** ≥ 1920 × 1080 native; clipped highlights < 0.5%; headline-zone (left 40%) mean luminance < 8%; face and eye readable at 100%; desktop and phone crop tests reviewed.

**Free alternative first:** `a0a5fc33` already exists. It measures 2752 × 1536 with 0.06% clipping (pass), but its left wing crosses the headline zone (16.3% mean luminance, fail). It can be reviewed or used for layout tests at no cost.

## 4. Velynx and Mossling: identity check of the existing images
| Image | Brief | Result |
|---|---|---|
| V-A, `d966d96d` (Creature Studio, 1K) | Velynx Evolved: upright, digitigrade, weight on one leg | **Fails**: stands on all fours (Creature Studio's own review agrees) |
| `fb118638` (website session, 2K) | Same Velynx brief | **Fails the same way**: quadruped. Ears, notched tips, glyphs, eyes, leaf-tipped tail and chest gem are right |
| `ce879099` (website session, 2K) | Mossling Evolved per `prototypes/mossling.md` | **Matches** the agreed identity: low grazer, moss bed with leaf shingles, pale-wood antlers with leaves, forehead Solgem, heavy-lidded content face |

Two prompts in a row asking for "upright… standing on its toes" produced a quadruped, so the text alone is not enough for Velynx. Any further Velynx attempt needs a pose reference (for example the shipped upright vector Velynx as a reference image) and a review of cost before it runs. That decision belongs to the Creature Studio workstream and you.
