# Handoff: creature artwork (from the Creature Studio session)

## Scope
Painted 2D overhaul of all 28 species × 4 stages (112). Source finals, pipeline, ledger and fixes all live on `creature-studio/art-direction` (tip `a7b96af`, never merged; the site took its art via `art:build`).

## Done (SHAs on creature-studio/art-direction)
- 111/112 finals in `art/creature-studio/overhaul/final/<id>/<n>-<stage>.png` (1024², transparent, C13 framing). Eventide Hatchling was never generated.
- `e694fe0`–`dceeab4`: the 88 public finals. `62f237d`: Nyxara 4 readability. `cd9e173`: speck clean-up.
- `fbb4ecb`: pipeline 3 (painted-hole restoration) plus local fixes (Frostkit 2–3 ears, Nyxara 2–3 ribbon, Mossling, Sproutwyrm, Zephrax, Aurelion 1).
- `ee43c64`: Driftfin 2 tail, Solvanth 2 head–neck. `924569e`: Solvanth 1–2 tails. `a7b96af`: Frostkit 4 (manager's override).
- `ca84448`: Mythic and Secret finals published (owner decision 2026-10-20). `73dbd30`/`93f4c91`: sealed previews (now superseded).
- Credits: overhaul 127 images, 524 credits (1,895 → 1,371); biomes 88 credits separately; balance 1,283 at last check. Ledger: `docs/canon/generation-ledger.md`, per image `art/creature-studio/overhaul/tasks.tsv`.

## Pipeline and asset locations
- Raw Runway outputs: `art/creature-studio/overhaul/raw/` (gitignored; local only).
- `python3 -I docs/creature-studio/tools/process-overhaul.py` (cut-out, hole restoration, specks, framing, C9 status), then `docs/creature-studio/tools/local-fixes.py` (applies `overhaul/local-fixes.json`; overrides in `overhaul/overrides/`). Then `astravex-neck.py` exactly once; it is not idempotent.
- Site: copy `final/<id>/` → `art/creatures/<id>/` (gitignored masters) → `npm run art:build` → `public/creatures/<id>/*.webp` + `src/data/creatureAssets.json`. `node scripts/creature-art.mjs check` must report 0 invalid.
- Boards: `art/creature-studio/overhaul/boards/` (batch-A…E before/after, local-fixes, local-fixes-2).

## Design canon and known art issues
- Canon: `docs/canon/solanites-art-canon.md`. Warm key `#FFE2A8` from the upper left, violet rim `#7D5CF0`, no halos, rays or ground; framing 45/60/78/88 %; C9 48 px readability.
- Identity notes: Velynx stays charcoal (never taupe); Pallow 4 keeps its ring; Cryovant 4 and Helivane have no rays or halo; the Cryovant crystal chains and Frostkit frost breath are intentional detached pieces.
- C9 below threshold (20): Aurorath 1, Duskwing 2–3, Emberlisk 1/2/4, Neonyx 1/2/4, Nyxara 2, Prismara 1, Velynx 1–4, Eventide 1, Genesis 1–4.
- Not fixed (need a repaint): Solvanth 2–3 necks (owner accepted as is), Solvanth 1 head on its coil, Driftfin 4 tail ring, Aurelith flipper roots. Pyraurum 4 has a "low detail" warning.

## Open bugs/risks
- Eventide has 3 painted stages; the site's all-or-nothing guard keeps it fully vector.
- `astravex-neck.py` runs on whatever is on disk: running it twice double-applies the fix.
- Raw files and the private classified scratch are not in git, but every image can be re-downloaded from Runway by task ID (tasks.tsv).
- Earlier commits (`684aef0`, `cc3a2b4`) name classified ids in history; that is moot since the publication.

## Pending owner decisions
- Eventide: show 3 paintings plus a vector Hatchling, or paint the Hatchling (4 credits, needs a reference upload).
- C9 exceptions for the non-Shadow dark stages.
- The new direction (premium realism like the homepage phoenix) supersedes the painted 2D style: decide whether the 111 finals stay as V1 while that is explored.

## Gotchas
- Never upscale the 1024 masters; `MAX_UPSCALE` is 1.3 and only for pipeline framing.
- process-overhaul regenerates every stage listed in local-fixes.json, so the pair is idempotent; edit the JSON, never the PNGs directly.
- The `art:build` copy-pixel check flags near-duplicate stages; the C13 framing check rejects stray specks if they stretch the box.

## Next steps
- For the realism direction: keep species anatomy and palettes from the finals and `src/lib/species.ts`; prototype one species, run `scripts/creature-art.mjs check`, and compare at 48 px before scaling.
