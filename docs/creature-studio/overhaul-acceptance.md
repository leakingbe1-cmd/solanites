# Creature overhaul: acceptance record

Status 2026-10-20: **acceptance audits in progress; not yet accepted.** Verified on `design/eclipse-vigil-code` @ `4d42aae` (local production build, desktop 1440 and phone 390). `4d42aae` is `ec8a06a` plus the Nyxara Ascended correction: only that stage's two images and its byte count differ, and all 176 public creature files match the tested build byte for byte. No merge to `main`, no production deploy.

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
- The classified art is not on the site yet. The site's server-side classified path (a disclosed bundle after Developer Mode sign-in or a hatched egg) is in place, but since `ec8a06a` it serves vector art until the owner's private Vercel Blob store is created and connected. As relayed by the website session, the owner chose that store over committing classified images to the public repository, in plaintext or as encrypted assets "as the default solution".

**Total finished artworks: 111 of 112.**

Notes on identity:
- Pallow Ascended keeps its original ring (anatomy).
- Cryovant Ascended lost its rainbow rays, per canon W2 (no rays or halos behind artwork).
- Velynx stays charcoal (owner: Shadow creatures are never taupe).

## 2. On the site

- `public/creatures/` and `src/data/creatureAssets.json` at `4d42aae` are byte-identical to `npm run art:build` from these finals. All 88 images and 88 thumbnails re-encode byte for byte, and no superseded final from history matches.
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
- Reconciliation:
  - Merged by balance, the public and private rows form one gapless chain from 1,895 to 1,371.
  - Each row's balance equals the `creditsRemaining` Runway returned for that task (127 of 127).
  - Three further calls were refused by the safety classifier before submission; they were never charged.
- Before this brief, 140 credits were spent on concepts and the Velynx prototype (2,035 → 1,895). Overhaul plus earlier work: **664** (2,035 → 1,371).
- After the overhaul, the biome session generated 22 public background plates: 88 credits, 1,371 → 1,283. These are not overhaul spend; they are recorded in `docs/canon/generation-ledger.md`.
  - Live balance: **1,283** (whoami: plan 983 + purchased 300).
  - Project spend since the ledger's starting balance of 2,035: **752**.
  - Whether 2,035 was the balance before any earlier Solanites Runway use on 19 Oct cannot be checked (`list_recent` shows only the newest 50 assets).

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
  - No classified id, name or inline image in the client bundle (`.next/static`). The word "genesis" appears 3 times as ordinary site copy ("since genesis"), not as a species reference.
  - This branch's references, prompts, task ledger and status file contain no classified species.
- Unit test `classifiedArt.test.ts` fails if any tracked file under `src/` embeds an image or a sealed stage.

## 7. Build, tests, preview, remaining defects

At `ec8a06a` (local; the full suites were not rerun on `4d42aae`, whose only change is the Nyxara Ascended images, re-swept 494/494):

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `vitest` | 379 passed, 3 skipped (Postgres integration, no database here) |
| `next build` | compiled |
| `scripts/qa/phoenix-site.mjs` | 202/202, including intro off: the homepage opens on the Phoenix still with no video request |
| `scripts/qa/button-contrast.mjs` | 16/16 |

Previews (Vercel GitHub status "success"; dashboard links, which need a Vercel sign-in): `ec8a06a` https://vercel.com/niga20/solanites/E712QYJiQmUDPr3JwBwUWKsbPvHg, `4d42aae` https://vercel.com/niga20/solanites/CoQUfjhAAHW4hw7zpWhdKWRBNKky, `ab0de36` (footer-only fix) https://vercel.com/niga20/solanites/8EC8JhNre4Ze5PWXJ4dhd3hDDaVF. The preview hosts are refused by this environment's proxy (CONNECT 403), so **no real-browser check of a deployed preview has happened (BLOCKED)**. The suites ran on a local production build of `ec8a06a`. The Collection sweep (494/494) was re-run with the corrected Nyxara Ascended served from disk, but the full QA suites were not re-run on a fresh `4d42aae` build.

Remaining:
1. One Mythic Hatchling not generated (owner go-ahead needed).
2. Classified painted art not on the site until the private store is connected (owner action). Until then classified species show vector art. **Requirement, not yet enforced:** `registerClassifiedArt` registers any partially painted line (`images?.some(Boolean)`), so a species with a missing stage would mix painted and vector stages. The website session must add a guard before connecting the store.
3. C9 48 px readability is below the threshold (median 70, p25 45) on 17 dark-palette stages: Aurorath 1, Duskwing 2–3, Emberlisk 1, 2, 4, Neonyx 1, 2, 4, Nyxara 1–3, Prismara 1 and Velynx 1–4. Each keeps its species palette, and each reads at least as well as its shipped drawing; the Velynx 4 comparison depends on which shipped render is used as the baseline. Nyxara 4 had regressed (61/39) and was corrected to 80/50 (its shipped drawing measures about 68–72/43–44, depending on the render). **Owner decision needed:** canon C9's exception covers only Shadow creatures, but 8 of the 17 stages are non-Shadow (Aurorath, Emberlisk, Neonyx, Prismara).
4. Pyraurum Ascended: pipeline warning "little fine detail" (warning only).
5. Market data is off by default (no provider connected, by approval policy); stock panels say so honestly.

## 8. Audit log (2026-10-20)

Overall: **NOT ACCEPTED** until the privacy audit, the report-accuracy audit, external stock verification and real-browser preview acceptance are complete.

**Classified-content exposure check: static preview artifact `claude.ai/artifact/1G2KesFuTNtLuG3zFJgmXc`** (owned by the website session, private):
- Version `1792459973-e638` included `img/s5-dev-top.webp`, a Developer Mode species grid showing classified species, under a "keep private" warning.
- The website session removed it in version `1792461132-a57b`, which leaves 15 files. The remaining `img/s5-dev-market.webp` was inspected: no classified names, art or tickers.
- Unauthenticated check (curl, no cookies):
  - the artifact URL returns only the generic "Claude Artifact" shell (0 Solanites or classified strings);
  - the content host `0218f894-7bea-4ea6-a19f-6c7203239647.frame.claudeusercontent.com` returns 404 for `/`, `/index.html` and every `img/` path.
- Result: **public exposure not reproduced.**
- Residual: the earlier version may remain in the owner-only version history.
- No preview screenshot was ever committed to Git (all refs searched).
- Its "Live preview" link pointed at the `ec8a06a` deployment; the new version points at the `4d42aae` deployment.

**Pairings and site (refuted claim):** `vercel.json` (unchanged since before the integration, same on `main`) still schedules `/api/cron/sync` daily at 03:17 UTC.
- It is inert only while `CRON_SECRET` is unset in Vercel; the route returns 401 without it.
- "Production cron disabled" is therefore inaccurate. The cron is configured but unauthenticated.
- Fix owner: the website session, with the owner's approval.

**Blocked:** the Vercel preview and production hosts (`*.vercel.app`) are refused by this environment's network proxy (CONNECT 403). No real-browser check of the deployed preview has been possible. All browser checks ran on local production builds of the same commits.


**Audit results (five independent read-only auditors, plus my own checks):**
- **Art identity: PASS.** Re-encoding the finals reproduces all 88 webps and 88 thumbnails at `4d42aae` byte for byte; none of the 41 superseded versions matches.
- **Credits: PASS** (fixes in `0ab4a0f`).
  - Overhaul: 127 tasks, 524 credits, gapless chain 1,895 → 1,371; every balance equals Runway's `creditsRemaining`; 0 failed.
  - Biome session, separately: 22 plates, 88 credits.
  - Live balance 1,283. Spend since 2,035: 752.
  - The 80-credit website-concept block is inferred, not measured per task.
- **Privacy: PASS with findings.**
  - No classified art, reference or task ID exists in any git object: 143 private files hashed, and 586 image blobs compared perceptually.
  - Earlier pushed commits `684aef0` and `cc3a2b4` named the six classified ids in docs and tools. They are removed at the tip but remain in history, without task IDs. The ids were already public on `main`.
  - The public repo itself holds classified ids, names and designs under `src/server/classified` (owner decision; pre-existing).
  - Gaps in `scripts/qa/classified-privacy.mjs`:
    - it checks text and paths only, so it would not detect a classified image saved under a public name;
    - it skips `/api/market/[speciesId]`, `/api/wallet`, `/api/claims/*`, RSC payloads and non-JS/CSS static files.
  - Static preview artifact: public exposure not reproduced (see above).
- **Pairings and site: PASS except one item.**
  - 28 mappings unchanged and constant across stages.
  - Intro off; no merge to `main`; market data off by default; no secrets.
  - **FAIL:** "production cron disabled" (see above).
  - External source check: 27 MATCH, 1 UNVERIFIED (PLTR exchange), 0 mismatches. These rest on search-engine summaries of SEC, IR and exchange pages; the pages themselves could not be fetched from here.
- **Report accuracy: corrected here.** The errors found were stale `ec8a06a` references, the missing preview links, the unenforced all-vector rule, the C9 baselines, and the non-Shadow C9 exceptions.

**Follow-up (website session, `design/eclipse-vigil-code` @ `f37f25d`):**
- `registerClassifiedArt` now registers painted stages only when all four exist. Verified here: code read, `classifiedArt.test.ts` and `creatureArt.test.ts` 14/14, `tsc` clean.
- `classified-privacy.mjs` now covers `/api/wallet`, `/api/claims/status`, `/api/market` for every classified id, and RSC payloads. The website session reports 51/51; not re-run here.
- Still open: matching served images against classified renders (planned with the Blob store work), and the cron entry (with the owner).

## 9. V1 verdict (2026-10-20)

**Status: NOT ACCEPTED.** All five audits are complete; no art, credit or privacy defect blocks V1.

What blocks ACCEPTED:
1. **Real-browser check of a deployed preview: BLOCKED.** This environment's proxy refuses `*.vercel.app`. Either the owner opens the `f37f25d` preview and walks Collection and Hatchery, or allows the host so it can be tested here.
2. **Owner decision: the production cron** in `vercel.json` (`/api/cron/sync`, daily). Disable it, or confirm it stays unauthenticated.
3. **Owner decision: C9 exceptions** for the 8 non-Shadow sub-threshold stages (see below).

Not blocking (cosmetic or post-V1): Pyraurum Ascended detail warning; PLTR exchange UNVERIFIED (search summaries only); privacy QA image matching (only relevant once classified raster art exists); dead intro-video code in the bundle.

### Remaining art defects (no paid generation proposed)
| Defect | Recommendation | Why |
|---|---|---|
| C9 below threshold: Duskwing 2–3, Velynx 1–4, Nyxara 1–3 (Shadow) | **Post-V1**, under the canon's Shadow exception | Each reads at least as well as its shipped drawing; the palette is intentionally dark. |
| C9 below threshold: Aurorath 1, Emberlisk 1, 2, 4, Neonyx 1, 2, 4, Prismara 1 (non-Shadow) | **Owner decision.** Recommend accepting for V1 as recorded exceptions and correcting post-V1 (8 × 4 credits). | No canon exception covers them, but each is still better than its shipped drawing. |
| Pyraurum Ascended "little fine detail" warning | **Post-V1** | A pipeline warning, not a failure; the art is byte-identical to the approved final. |
| Mythic Hatchling never generated | **Owner decision; not a V1 blocker** | Classified species show vector art in V1 anyway (Blob store not connected). Needs the owner's go-ahead for one reference upload and 4 credits. |

## 10. Canon review: biome plates (`feature/creature-biomes` @ `9f019d2`)

Method: all 22 `public/scenes/<id>/plate.webp` (1024²) inspected, each composited with that species' Ascended final at full canvas. Findings are visual judgement plus one luminance measurement; the site's CSS framing was not reproduced.
- **Pass:** hand-painted 2D throughout; no halos or rays behind the creatures; open, centred focal space; foreground mist instead of hard floors on most plates.
- **C6/W1 (ground or horizon), for review:**
  - Pyraurum: ruins, torches and a mountain horizon. The torches are bright points that compete with the creature.
  - Velynx: an alley in perspective, which implies a street floor.
  - Sproutwyrm: a branch crossing the lower left reads as a perch.
  - Duskwing and Aurelion: architecture standing on a mist floor.
- **W2 (rays, sparkles), borderline:** Aurorath's aurora curtains and Prismara's bright crystal pillars, which compete for focus.
- **Silhouette and focal point (value contrast of the creature against the plate around it, luminance 0–255):**
  - Near zero: Aurorath −3, Prismara −3, Nyxara +7, Emberlisk +8, Stormquill +10, Duskwing +10.
  - Velynx −24 (the creature is darker than its plate).
  - These creatures rely on rim light alone. Recommend darkening or blurring the plate behind the creature (CSS vignette) or lowering the plate's value.
- **Colour consistency:** each plate's palette matches its species' element and hue. No clashes found.
