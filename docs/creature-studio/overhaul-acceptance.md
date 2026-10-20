# Creature overhaul: acceptance record

Status 2026-10-20. Verified on `design/eclipse-vigil-code` @ `ec8a06a` (local production build, desktop 1440 and phone 390). No merge to `main`, no production deploy.

## 1. Finished species and stages

**Public catalogue: 22 species × 4 stages = 88 of 88 finished and live on the branch.** Masters are in `art/creature-studio/overhaul/final/<id>/<n>-<stage>.png`; per-stage status (task, scale, C9) is in `overhaul/status.json`.

| Rarity | Species (all four stages: Eggling, Hatchling, Evolved, Ascended) |
|---|---|
| Common | Mossling, Driftfin, Pallow, Glimmeray, Sproutwyrm, Frostkit |
| Rare | Abyssal Vael, Stormquill, Duskwing, Cryovant, Emberlisk |
| Epic | Neonyx, Aurorath, Zephrax, Prismara, Nyxara |
| Legendary | Aurelion, Solvanth, Pyraurum, Aurelith, Velynx, Thalor |

**Classified catalogue (4 Mythic, 2 Secret): 23 of 24 stages finished**, framed and checked (C13 framing 23/23 pass). They are held outside the repository; see §6.
- One Mythic Hatchling is not generated. Its private reference upload was refused by the session's safety classifier and was not retried; it needs the owner's go-ahead (one 4-credit image).
- The classified art is not on the site yet. The site's server-side classified path (a disclosed bundle after Developer Mode sign-in or a hatched egg) is in place, but per `ec8a06a` it serves vector art until the private store is connected.

**Total finished artworks: 111 of 112.**

Notes on identity:
- Pallow Ascended keeps its original ring (anatomy).
- Cryovant Ascended lost its rainbow rays, per canon W2 (no rays or halos behind artwork).
- Velynx stays charcoal (owner: Shadow creatures are never taupe).

## 2. On the site

- `public/creatures/` and `src/data/creatureAssets.json` at `ec8a06a` are byte-identical to `npm run art:build` from these finals: a rebuild changes 0 files.
- The site pipeline reports `88 of 112 stage assets supplied and valid · 24 missing (classified) · 0 invalid`. Its one warning: Pyraurum Ascended "little fine detail".
- Collection sweep (`creature-studio` script, 494 checks, 1440 and 390):
  - 28 plates: 22 painted, all loaded; 6 sealed silhouettes.
  - Every public species' detail shows its four painted stage thumbnails.
  - Selecting each stage shows that stage's painted image (loaded).
  - No horizontal overflow, no failed `/creatures/` request, no page error.
- Hatchery demo (1440 and 390):
  - Grown creatures are painted.
  - Hatch reveals show the painted Eggling.
  - After +28 simulated days every creature image loads from `/creatures/<public id>/` only. No overflow, no errors.
- Homepage Market Bond section: painted stages with the same ticker at every stage (site QA).

## 3. Before and after

Boards (each stage: shipped vector drawing | overhaul), regenerated from the final masters:
- `art/creature-studio/overhaul/boards/batch-A.png`: Mossling, Aurelion, Frostkit, Driftfin, Pallow, Glimmeray
- `batch-B.png`: Sproutwyrm, Abyssal Vael, Stormquill, Duskwing
- `batch-C.png`: Cryovant, Emberlisk, Neonyx, Aurorath
- `batch-D.png`: Zephrax, Prismara, Nyxara, Solvanth
- `batch-E.png`: Pyraurum, Aurelith, Velynx, Thalor

Classified before/after boards exist only privately.

## 4. Credits (Runway, measured from balance deltas)

| | Images | Credits |
|---|---|---|
| Public stages, first passes (nano-banana-2.1, 1K, 4 each) | 88 | 352 |
| Public corrections (Mossling 3, Aurorath 4, Velynx 1–4, Nyxara 4 at 4 each; Solvanth 4 neck fix on nano-banana-pro at 20) | 8 | 48 |
| Classified first passes | 23 | 92 |
| Classified colour corrections | 8 | 32 |
| Failed generations | 0 | 0 |
| **Overhaul total** | **127** | **524** (balance 1,895 → 1,371) |

- Per-image ledger: public stages in `overhaul/tasks.tsv`; classified stages in a private ledger (aggregate rows in `docs/canon/generation-ledger.md`).
- Before this brief, 140 credits were spent on concepts and the Velynx prototype (2,035 → 1,895). Project total since the first generation: **664**.

## 5. Stock pairings

- `src/server/market/stockLinks.ts` is unchanged from `75ceb10`: 28 species → ticker mappings, identical.
- In the UI, each of the 22 public details shows the same linked stock on all four stages, and the 22 pairings match the pre-integration build exactly.

## 6. Privacy (Mythic and Secret)

- `scripts/qa/classified-privacy.mjs`: **35/35** (public pages, JS, API and asset paths carry no classified name, epithet, lore or id; owner view does; no carry-over).
- `scripts/qa/developer-mode.mjs`: **33/33**.
- Extra checks:
  - None of the 117 private classified files (finals, raws, references, uploads) exists as a git object in any fetched branch.
  - `src/server/classified/art.json` never held an image or ciphertext in the branch history; the file is removed in `ec8a06a`.
  - No classified id under `public/`, `art/` or in `creatureAssets.json`.
  - No classified id and no inline image in the client bundle (`.next/static`).
  - This branch's references, prompts, task ledger and status file contain no classified species.
- Unit test `classifiedArt.test.ts` fails if any tracked file under `src/` embeds an image or a sealed stage.

## 7. Build, tests, preview, remaining defects

At `ec8a06a` (local):

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `vitest` | 379 passed, 3 skipped (Postgres integration, no database here) |
| `next build` | compiled |
| `scripts/qa/phoenix-site.mjs` | 202/202, including intro off: the homepage opens on the Phoenix still with no video request |
| `scripts/qa/button-contrast.mjs` | 16/16 |

Vercel built the preview of `ec8a06a` (status "success"). Its hostname is not reachable from the build container, so the checks above ran on an identical local production build.

Remaining:
1. One Mythic Hatchling not generated (owner go-ahead needed).
2. Classified painted art not on the site until the private store is connected (owner action). Until then classified species show vector art. When it is connected, a species with a missing stage stays all-vector so no line mixes painted and vector.
3. C9 48 px readability is below the threshold (median 70, p25 45) on 17 dark-palette stages: Aurorath 1, Duskwing 2–3, Emberlisk 1, 2, 4, Neonyx 1, 2, 4, Nyxara 1–3, Prismara 1 and Velynx 1–4. Each keeps its species palette. Each reads better than its shipped drawing at 48 px, except Velynx 4 (median 58 → 57, p25 38 → 42). Nyxara 4, which had regressed, was corrected (72/44 → 80/50).
4. Pyraurum Ascended: pipeline warning "little fine detail" (warning only).
5. Market data is off by default (no provider connected, by approval policy); stock panels say so honestly.
