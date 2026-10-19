# Decision log

## 2026-10-19 · Milestone A review

Milestone A (audit and art direction) approved in principle, with these decisions:

| # | Decision | How it is applied |
|---|---|---|
| 1 | Keep the shipped body plan as the starting point where references disagree. **Stormquill, Aurelion, Zephrax and Mossling** get an individual review before their final designs lock. | Each of the four gets a short "canon review" step in its batch: one concept that follows the shipped body plan and one that tests the painted-sheet idea, side by side, before stages are produced. Mossling is a prototype, so its review happens in Round 1 (concept M-B tests the painted sheet's lighter, deer-like build). |
| 2 | Remove Solana and other third-party logos from creatures. Develop an original Solanites glyph. | Candidates in [`glyph/`](glyph/). GENESIS's orbiting Solana-style bars and anything derived from `velynx-inspiration.png`'s tail mark are replaced by the chosen glyph. Prompts carry "no logo, no emblem". |
| 3 | Stylised, hand-painted 2D. No 3D renders. | Art bible §2 stands. Every prompt names hand-painted 2D and puts "3D render" in the negatives. `creatureDesigns.json → style.prompt` still says "3D"; the change goes to the website builder in the handoff (shared data, not edited here). |
| 4 | Tone down the website's radial rays and nebula effects behind replacement artwork. | App code, so it is specified for the website builder in [`website-builder-handoff.md`](website-builder-handoff.md). Not changed on this branch. |
| 5 | Preserve all original SVG artwork; generate replacements only in the isolated review folder. | Review folder `art/creature-studio/`. Nothing is written to `art/creatures/`, `public/creatures/` or `src/`. |

Standing constraints from the same review:

- No Runway (or other paid) credits are spent without explicit approval of a stated amount. The full 48-image prototype batch is **not** approved yet.
- Next step is a small Round 1 of concepts ([`prototypes/round-1.md`](prototypes/round-1.md)), shown beside the originals. Four-stage evolution lines follow only after the concept direction is approved, then a 12-stage comparison page.
- The other 25 species do not start until the three prototype evolution lines are approved.
- All work stays on `creature-studio/art-direction`; no app code changes, no overwriting originals, no deploys.
- The goal is still all 28 species and 112 stages.

## 2026-10-19 · Round 1 approval

- Round 1 approved: up to 9 images, nano-banana-pro at 1K, concept exploration only. **Hard cap 180 credits**; stop if the first image costs more than 20 credits or the total could exceed 180. No model switch or extra spend without asking.
- Uploading the three Evolved-stage reference renders to Runway approved (done; the uploads cost 0 credits).
- **Glyph B, Epoch Ring, is the preferred Solanites glyph.** Candidates A and C stay in `glyph/` for reference.
- Generated images stay in the review folder `art/creature-studio/round-1/`. After Round 1, stop and present the comparison; no stages or other species until the direction is explicitly approved.

**Measured cost:** the first generation (V-A) moved the balance from 2,035 to 2,015, so **nano-banana-pro at 1K costs 20 credits per image** in this workspace. Six concepts = 120 credits; all nine permitted images would be exactly 180.

**Status (paused after 1 of ≤ 9 images, 20 of 180 credits spent):** V-A (Velynx Fence-walker) generated successfully, Runway task `d966d96d-da0c-44e3-9bce-f45fb74b1768`. It could not be downloaded: this cloud environment's network policy blocks Runway's output hosts `dnznrvs05pmza.cloudfront.net` and `d2jqrm6oza8nb6.cloudfront.net`. Generation is paused so no credits go on images that cannot be inspected, saved to the review folder or compared against the originals.

## 2026-10-19 · V-A recovered and reviewed

- Network: both Runway hosts now accept HTTPS (TLS verified; HTTP 401 without a token, as expected).
- V-A recovered from the existing task `d966d96d-da0c-44e3-9bce-f45fb74b1768` (no new generation): `art/creature-studio/round-1/velynx-A-fence-walker.png`, PNG, **1024 × 1024**, RGB, 993,290 bytes, sha256 `bdfa9a51933efc02bf29d10f8dc33c19ed12693c6a09fc5ad709fd39e3c1d9da`, saved byte-for-byte as downloaded.
- **Assessment: does not pass as briefed** (see `prototypes/round-1/notes.json` and the comparison board). Strong painted finish, face and silhouette; but quadruped instead of upright, missing glyph tile, weak rim light so the body vanishes in colour at 48 px.
- **Credits:** balance now **1,935**. This work has spent 20 (V-A). The other 80 (2,015 → 1,935) are four image generations in the same Runway workspace at 20:35 UTC that this session did not make (three "Hand-painted 2D creature illustration…", one "Hand-painted 2D fantasy key art…"). Their source is not confirmed. The website builder's `design/creative-direction` branch (commit `83018c0`, 20:46 UTC) records the same 1,935 balance and says it had generated nothing.
- Generation remains paused pending review.

## 2026-10-19 · Canon approved by the owner

`docs/canon/solanites-art-canon.md` is now **APPROVED** and authoritative for all three workstreams:
- **Style:** hand-painted 2D throughout, the phoenix included.
- **Light:** warm gold key `#FFE2A8` from the upper left; restrained violet rim from behind, strong enough to separate dark silhouettes.
- **Identity:** every species keeps its identity and anatomy; Mossling keeps its antlers.
- **No ground:** no ground, contact shadows, floor glints or horizon lines in the artwork **or the website presentation**.
- **No decoration:** no decorative halos, rays or sparkles; Pyraurum's halo is removed.
- **Framing:** stage framing 45 / 60 / 78 / 88%, measured with `docs/canon/measure-framing.py`.
- **Prototypes:** Velynx, Mossling, Cryovant.
- **Credits:** a shared future budget of 180 credits across workstreams; the earlier 80 are historical; **all paid generation paused**; each image needs separate owner approval.

Applied on this branch: art bible §1, §7, §9 and §10; the Velynx brief (§8 table, §9 prompts, canon note); round-1 style block and V-A/V-B prompts (V-B is no longer crouched); the Cryovant lighting line; the evolution stage-row rule; the website handoff (items 1, 2, 5–7). Superseded rules are listed in canon §7.
