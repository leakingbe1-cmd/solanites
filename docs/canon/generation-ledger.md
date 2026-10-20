# Runway generation ledger (shared workspace)

Status 2026-10-20: **creature overhaul generation done except one classified stage (acceptance audits in progress); balance 1,283 (Runway `whoami`, 01:44 UTC: plan 983 + purchased 300).** History: on 2026-10-19 the canon §6 policy (shared 180-credit budget, per-image owner approval) was in force for the Velynx prototype rows below. On 2026-10-19 at 23:49 UTC the owner lifted the overhaul's 400-credit cap for the full catalogue (no purchases, existing balance only). One ledger for all workstreams (canon G1). Workstreams: creature-studio (this branch), design (`design/creative-direction`), website (session "Solanites interactive website", branch `design/eclipse-vigil-code`), creature-biomes (session "Solanites creature biomes and animations", branch `feature/creature-biomes`).

| Created (UTC) | Task ID | Workstream | What | Model / size | Credits | Balance after |
|---|---|---|---|---|---|---|
| — | — | — | starting balance (checked 2026-10-19 before Round 1) | — | — | 2,035 |
| 2026-10-19 20:34:35 | `d966d96d-da0c-44e3-9bce-f45fb74b1768` | creature-studio | Round 1 V-A, Velynx Fence-walker | nano-banana-pro, 1K, 1:1 | 20 (measured) | 2,015 |
| 2026-10-19 20:35:23 | `a0a5fc33-c8a2-4106-8240-028d6fdd6cdc` | website | "Eclipse Phoenix" key art | nano-banana-pro (gemini-3-pro-image), 2K, 16:9 | 20 (inferred) | — |
| 2026-10-19 20:35:49 | `ce879099-1938-4539-98f9-166b7401c495` | website | Mossling grazer | same, 2K, 1:1 | 20 (inferred) | — |
| 2026-10-19 20:35:50 | `fb118638-b10e-4989-a6ab-1a307f34143a` | website | Velynx (came out on all fours) | same, 2K, 1:1 | 20 (inferred) | — |
| 2026-10-19 20:35:50 | `6144d91e-a725-4214-83ba-2e0eb610bebb` | website | Cryovant gem-cut bell | same, 2K, 1:1 | 20 (inferred) | 1,935 (checked) |

"Inferred": the four together account for the measured 80-credit drop (2,015 → 1,935); per-task charges were not observed individually.

**Attribution (verified 2026-10-19 ~20:57 UTC):** the website session's own transcript (session `session_01Qca9PBkzcSh9jGSXfnMYCN`, read-only via the session-events API) lists all four task IDs as its "Concept Round One" concepts and states "Actual cost: 80 of 180", starting from balance 2,015. The generation calls themselves were not among the 100 transcript events read. The design session reported the same attribution by message; this entry rests on the transcript, not that message.

## Future budget (canon G1–G4)

| Approved by owner | Task ID | Workstream | Image | Credits | Budget used | Budget left |
|---|---|---|---|---|---|---|
| 2026-10-19 (Velynx Evolved only, cap 20) | `40f476c8-d9e3-48d0-ade0-b447de791f0a` | creature-studio | Velynx Evolved prototype v1, nano-banana-pro 1K | 20 (measured: 1,935 → 1,915) | 20 | 160 |
| 2026-10-19 ("approve", the single charcoal edit) | `21e98b40-15bc-4718-a727-31b47d35af64` | creature-studio | Velynx Evolved v2 (edit of v1), nano-banana-pro 1K | 20 (measured: 1,915 → 1,895) | 40 | 140 |

## Creature overhaul (owner brief; the original ~400-credit cap was lifted by the owner on 2026-10-19 23:49 UTC)

The owner chose the model in chat: "do banana 2.1". **Measured price: nano-banana-2.1, 1K, one reference image = 4 credits per image** (first task: 1,895 → 1,891).

| Time (UTC) | Task ID | Image | Credits | Balance after | Overhaul spent |
|---|---|---|---|---|---|
| 23:33 | `3677eca7-1659-45db-8854-ae188829174c` | Mossling 3 Evolved (pilot) | 4 | 1,891 | 4 |
| 23:36 | `3e30749c-d589-4e58-8739-9d7421b84734` | Mossling 1 Eggling (pilot) | 4 | 1,887 | 8 |
| 23:36 | `2e9ecd39-dedc-4660-a6ea-856fb440cda4` | Mossling 2 Hatchling (pilot) | 4 | 1,883 | 12 |
| 23:36 | `0583e354-1ae3-4fc6-a5db-d3a404266d74` | Mossling 4 Ascended (pilot) | 4 | 1,879 | 16 |
| 23:36 | `3cef7f5c-3322-49f7-a73f-8fed26b60bae` | Aurelion 1 Eggling (pilot) | 4 | 1,875 | 20 |
| 23:36 | `b3d2b04f-6598-497b-abac-33b5984ad3b4` | Aurelion 3 Evolved (pilot) | 4 | 1,871 | 24 |
| 23:36 | `70795a73-caa0-45c9-ac89-5003b3f2da5e` | Frostkit 3 Evolved (pilot) | 4 | 1,867 | 28 |
| 00:10–00:13 | (private ledger, held outside the public repo) | Classified stages: 23 images (one stage never generated) | 92 | 1,407 | — |

| 00:15 | (private ledger) | Classified stages: 5 colour corrections | 20 | 1,387 | — |
| 00:29 | (private ledger) | Classified stages: 3 more colour corrections (Secret lines matched to their corrected stages) | 12 | 1,375 | — |

The classified task list stays out of this public repository: species names and task IDs together would identify the art. The per-stage list goes to the website session by direct message only.

Per-image ledger for all non-classified overhaul work (including corrections and the owner's Solvanth 4 Nano Banana Pro edit, 20 credits): `art/creature-studio/overhaul/tasks.tsv`.

**Overhaul totals (reconciled 2026-10-20):**
- 127 images, 524 credits, 1,895 → 1,371.
- Public: 96 images, 400 credits (88 first passes, 8 corrections including the 20-credit pro edit).
- Classified: 31 images, 124 credits (23 first passes, 8 corrections).
- Failed generations charged: 0.
- Merged by balance, the public and private rows form one gapless chain. Every row's balance equals the `creditsRemaining` that Runway returned for that task.

## Creature biomes (session "Solanites creature biomes and animations", branch `feature/creature-biomes`)

Recorded here from that session's own transcript (read-only) and Runway `list_recent`. Per-task rows (22, final, no corrections or failures): `docs/creature-scenes/generation-ledger.md` on `feature/creature-biomes` @ `9f019d2` (checked: 22 rows, 1,371 → 1,283).

| Time (UTC) | Tasks | What | Model / size | Credits | Balance after |
|---|---|---|---|---|---|
| 01:23–01:32 (created, per `list_recent`) | 22 tasks (e.g. `074e0157`, last at 1,283; `eaa701ce` at 1,307) | Public biome background plates, one per public species | nano-banana-2.1, 1K | 88 (22 × 4) | 1,283 |

**Project spend since the ledger's starting balance (2,035):** 752 credits. That is 140 before the overhaul, 524 for the overhaul and 88 for biomes.


**2026-10-20: Mythic and Secret art published.** The owner decided, typed in the Creature Studio session, to show Mythic and Secret creatures fully. The 31 classified task rows (23 first passes, 8 corrections, 124 credits) are now listed per image in `art/creature-studio/overhaul/tasks.tsv`, alongside the public rows. The totals are unchanged.
