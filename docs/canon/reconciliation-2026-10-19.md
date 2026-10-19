# Reconciliation report: `creature-studio/art-direction` vs `design/creative-direction`

Compared 2026-10-19 by reading both branches only, with no merge or edits to `design/creative-direction`.
- `creature-studio/art-direction`: `docs/creature-studio/*`, latest commit before this report `c35db64`.
- `design/creative-direction`: `docs/design/creative-direction.md` (v1), `art-direction-v2.md`, `phase-1.md`, `mossling/*.svg`; commits `d2c8637` → `ed422c6` (19:46–20:51 UTC).

Proposed resolution for every conflict: [`solanites-art-canon.md`](solanites-art-canon.md).

## 1. Conflicts

| # | Topic | creature-studio | design/creative-direction | Canon proposal |
|---|---|---|---|---|
| 1 | **Rendering style** | Hand-painted 2D (owner decision 3) | v2 §3.2.6: "stylised realism, a collectible sculpture under museum light… not flat vector" | Hand-painted 2D (C1). Sculpture styling removed. |
| 2 | **Ground in artwork** | No ground, no cast shadow; transparent | v1 §2.7.3: every creature stands on a contact shadow + gilt floor glint; v2 §3.2.6: "contact shadow on a matte obsidian ground"; phase 1: Threshold horizon at 62% | No ground in artwork (C5). Site-side ground is open decision 1. |
| 3 | **Key light** | "Warm-neutral" from upper left | Warm gold `#ffe2a8` from 11 o'clock | Warm gold `#ffe2a8`, upper left (C2). Creature-studio docs to change. |
| 4 | **Rim light** | "Cool cyan-violet" from the right | Violet `#7d5cf0` at 40–60% from behind and lower right | Restrained violet, strong enough for readability (C3). |
| 5 | **Halos** | Banned in artwork | "Ascended gains a halo" (Pyraurum ember → halo); phoenix key art keeps its halo | Banned in creature art; Pyraurum is open decision 4; phoenix is open decision 3. |
| 6 | **Stage scale in frame** | ~80% for every stage | 40 / 55 / 75 / 90%+, Ascended may break the frame | Open decision 2 (proposed 45 / 60 / 78 / 88%, no frame-breaking). |
| 7 | **Mossling anatomy** | Low grazer, leaf-shingle moss bed, **keeps antlers**, sapling at Ascended; turtle read explicitly avoided | "Mossy boulder"; **drops the antlers**; Ascended is a "grove-tortoise" with a stone shell and canopy tree | Shipped body plan with antlers (C8, owner decision 1). Mossling is flagged for individual review, so the boulder idea can be shown as a B option, not adopted by default. |
| 8 | **Prototype set** | Velynx, Mossling, Cryovant | Mossling, Duskwing, Pyraurum | Open decision 5. |
| 9 | **Final asset format** | One file per species × stage | Plans a "4-stage evolution sheet" per prototype first | Sheets are studies only (C12). |
| 10 | **Generation budget** | Round 1: ≤ 180 credits (20 spent) | Phoenix phase: separate "ceiling 180"; v2 plan ≈ 660 credits; Mossling 2K sheet ≈ 20 | One ledger and one budget for the workspace (G1–G2). |
| 11 | **Model size** | 1K concepts | 2K stills | 1K for concepts (G4). |
| 12 | **Phoenix key art** | Not in scope | Photoreal "hammered molten gold, filmic contrast" prompts | Open decision 3. |
| 13 | **Rarity glow** | Emission budgets by rarity, from anatomy only | "No other glow"; rarity glow removed from UI | Compatible: C4 budgets, UI glow removed. |
| 14 | **Velynx** | Upright biped (brief); V-A came out quadruped | No Velynx brief | Upright biped, mandatory (§3 below). |

Compatible and kept: one Solgem per creature in a fixed position; 48 px silhouette test; species-specific eyes; three-quarter views; constellations and Vigil as UI-only devices; classified species never exposing real art.

## 2. Generations that are not this session's

This session made exactly **one** paid generation: V-A, task `d966d96d-da0c-44e3-9bce-f45fb74b1768`, 20:34:35 UTC (balance 2,035 → 2,015).

Runway lists four more image generations in the same workspace a minute later. Each was read with Runway's free task lookup and downloaded to temporary scratch space for verification only. **They are not in the repo**, because their origin is unconfirmed.

| Created (UTC) | Task ID | Runway title | Size | Subject (from its prompt) |
|---|---|---|---|---|
| 20:35:23.915 | `a0a5fc33-c8a2-4106-8240-028d6fdd6cdc` | "Hand-painted 2D fantasy key art illustration_ stylised paint" | 2752 × 1536 (16:9, 2K) | "the Eclipse Phoenix" under an eclipsed sun |
| 20:35:49.773 | `ce879099-1938-4539-98f9-166b7401c495` | "Hand-painted 2D creature illustration for a premium creature" | 2048 × 2048 (1:1, 2K) | Mossling grazer with antlers |
| 20:35:50.264 | `fb118638-b10e-4989-a6ab-1a307f34143a` | same title | 2048 × 2048 (1:1, 2K) | Velynx, "slender upright digitigrade feline" |
| 20:35:50.781 | `6144d91e-a725-4214-83ba-2e0eb610bebb` | same title | 2048 × 2048 (1:1, 2K) | Cryovant gem-cut bell |

Balance went from 2,015 (after V-A) to 1,935, a drop of 80, matching four images at 20 credits.

**Evidence about origin (facts only):**
- None of the four task IDs appear in this session's tool calls. This session's only generation call returned `d966d96d…`.
- The three creature prompts closely reuse text from the creature-studio briefs (`prototypes/velynx.md`, `mossling.md`, `cryovant.md`, `round-1.md`), for example "roof tiles", "graduated diamond shards", "cool appraisal" and "notched second point". They also include phrases that appear in neither branch's documents, such as "Warm gold key light from the upper left, cool cyan-violet rim light" and "no environment or ground". Those briefs are public in the repository.
- The phoenix prompt ("the Eclipse Phoenix", hand-painted 2D) does not match either phoenix prompt in `design/creative-direction` `phase-1.md` §1.4 (which are photoreal "hammered molten gold").
- `design/creative-direction` commits `83018c0` (20:46) and `ed422c6` (20:51) say "0 of 180 credits spent" and record the balance as 1,935.
- The Runway task records available to this session do not include who started a task, or from which client.

**Update (verified ~20:57 UTC):** the transcript of the website session "Solanites interactive website" (`session_01Qca9PBkzcSh9jGSXfnMYCN`, branch `design/eclipse-vigil-code`, not on GitHub) lists all four task IDs as its own "Concept Round One" and records "Actual cost: 80 of 180" from a starting balance of 2,015. That is a **third workstream** generating creature concepts. See `generation-ledger.md`.

**Observation relevant to the Velynx problem:** `fb118638` asked for an "upright digitigrade feline… standing on its toes" and it is also on all fours. With V-A, that is two independent generations that read this wording as a four-legged cat (§3).

## 3. Velynx: required brief changes

V-A is kept, unchanged, as a **rendering reference only** (paint handling, face, leaf tail). It is not an anatomy or posture template.

Mandatory for every Velynx concept:

| Requirement | Wording the prompt must use (the word "digitigrade" alone is not enough) |
|---|---|
| **Upright biped** | "stands upright on its two hind legs only; torso vertical; both forelimbs held off the ground; only the hind feet touch anything" |
| **Long fingers** | "slender hands with four long, articulated fingers, held near the chest" |
| **Cheek tufts** | "pronounced backward-sweeping cheek tufts" |
| **Ear notch** | "each ear has a clearly visible notch two-thirds of the way up, splitting the tip into two points" |
| **Strong violet rim** | "a strong violet rim light outlines the back, ears, tail and the right side of the body" |
| **Warm gold key** | "warm gold key light from the upper left lighting the face and chest" |
| **Glyph tile** | "one hind foot rests on a small floating square cyan glyph tile; the other foot is on nothing" |
| **Dark-background readability** | "charcoal fur painted mid-grey-violet in the light, never pure black"; checked with C9 |
| **Reference images** | The shipped Evolved render tagged `@pose` with "match the upright two-legged stance of @pose". V-A tagged `@finish` with "use @finish for paint handling only, not for pose or anatomy". |

Acceptance checks before showing a Velynx concept as a candidate: forelimbs off the ground; head above both shoulders; four fingers visible on at least one hand; the ear notch visible in the 48 px black-fill; C9 met; glyph tile under one hind foot; emission ≤ 10%; no letters in glyphs.

## 3a. Design branch alignment (commit `dfe90a6`, 20:56 UTC)

`design/creative-direction` now names `docs/creature-studio/art-bible.md` and `prototypes/*.md` as the authority for creature art. It retracts the sculpture style, the ground-in-artwork rule, its Mossling brief and studies, and its Duskwing/Pyraurum prototypes, and it moves its phoenix prompt to hand-painted 2D with no halo. That resolves conflicts 1, 2, 5 (phoenix), 7, 8 and 12 on that branch. **One gap remains:** it adopts the art bible's *current* lighting text (warm-neutral key, cyan-violet rim), which the owner has now asked to change to a warm gold key and a restrained violet rim. Once the canon is approved and the art bible updated, that branch follows automatically.

## 4. Exact changes required before the next concept can be approved

1. **Owner approves the canon** (`solanites-art-canon.md`), including open decisions 1–5 in its §4.
2. **Creature-studio branch** (this workstream; no credits):
   - `art-bible.md` §7: key light becomes warm gold `#ffe2a8`; rim light becomes restrained violet; add C9's readability measure; add a "superseded by canon where they conflict" header.
   - `prototypes/velynx.md` §9 and `round-1.md`: rewrite the Velynx prompts with §3's wording and the two-reference setup; mark V-A "rendering reference only".
   - `round-1.md`: remaining prompts switch to warm gold key light and violet rim, and add C9 to the review checks.
   - `tools/build-concept-board.py`: add the C9 numbers to each concept.
3. **Design branch** (that workstream's edits, not made here): mark v2 §3.2 rule 6, the Mossling boulder/tortoise studies and the 2K evolution-sheet step as superseded or pending canon; adopt the shared ledger; apply the generation pause.
4. **Ledger:** create `docs/canon/generation-ledger.md` with the five known tasks (V-A plus the four in §2) and the balance history.
5. **Budget:** owner states one cap for the next batch across both workstreams. Of Round 1's 180, 20 is spent by this workstream; whether the other 80 count against it is the owner's call.
6. Only then: one Velynx concept with the corrected brief (20 credits), checked against §3's acceptance list before anything else is generated.
