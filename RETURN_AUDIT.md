# Solanites return audit (trial)

**Last updated 2026-10-20 14:25 UTC.** Maintained on `coordination/workstream-manager`. Public repo, so this audit contains no classified names, tickers, lore or secrets. Detailed timeline: `ACTIVITY_LOG.md`.

## 1. Overall status
**AT RISK. Confidence: medium-high in what's labelled VERIFIED.** Coordination is orderly and nothing was overwritten or lost. The critical path (market integration) is paused on owner actions in two sessions. Classified content stays public in git until the owner decides.

## 2. Branches and commits (verified with `git ls-remote`)
| Branch | Commit | Owner | State |
|---|---|---|---|
| `design/eclipse-vigil-code` | `ae58e74` | Website & Preview | Integration line. Since `4d42aae`: footer fix, classified all-or-nothing plus wider privacy QA (`f37f25d`), QA flake fix |
| `feature/creature-stock-link` | `d84bff6` | Live Market Data | Unchanged. Fixes `bea4b5a`, `aad1413` are **local only** in that session |
| `feature/creature-biomes` | `9f019d2` | Biomes & Animations | Rebased on `f37f25d`; queued third for integration |
| `creature-studio/art-direction` | `6cdd943` | Creature Artwork | Acceptance record: NOT ACCEPTED (audits continuing) |
| `coordination/workstream-manager` | (this branch) | Workstream Manager | Docs only |
| `main` | `f6d6ed5` | none | Untouched |

## 3. Verification status
| Item | Status | Evidence |
|---|---|---|
| 88 public creature images match approved finals | VERIFIED | Pixel comparison of all 88: mean RGB difference ≤ 3.44/255, alpha ≤ 0.04, sizes equal |
| 28 stock pairings unique and unchanged | VERIFIED | 28 species / 28 tickers; same file hash on 4 branches |
| Biomes `9f019d2` type check, tests, build | VERIFIED (branch only) | tsc clean; vitest 444 passed / 3 skipped; build compiled |
| Biomes: 22 species covered; no overlap with the market branch | VERIFIED | `git diff`. One expected 1-line conflict with `ae58e74` (`scripts/qa/phoenix-site.mjs`) |
| Cron fails closed without its secret | VERIFIED | Code read |
| Biome browser QA, privacy 51/51, scenes 33/33 | CLAIMED | Biomes session; Website & Preview pre-review |
| Market fixes: tsc, vitest 425, build | CLAIMED | Live Market Data; code not pushed, so it can't be verified |
| 28 tickers checked against external sources | CLAIMED | Live Market Data (corporate-action watch items noted) |
| Twelve Data live responses | BLOCKED | No key; provider host blocked |
| TradingView widget in a browser | BLOCKED | `s3.tradingview.com` blocked in containers |
| Deployed preview / production | BLOCKED | `*.vercel.app` blocked; Vercel build reported successful (CLAIMED) |
| Twelve Data / TradingView licensing for public display | NOT TESTED | Public market gate stays OFF |
| Real-GPU frame rate of biomes | NOT TESTED | Software rendering only |

## 4. Classified exposure assessment (no irreversible action taken)
- **Facts (VERIFIED):** public repo; all 6 classified species appear in plain text on every branch, including `main` (names, lore, designs, renderers, stock mappings). 0 forks / 0 stars; 583 clones (182 unique) in 14 days, most likely the project's own sessions, though that can't be confirmed. Treat the names as copied.
- **Confidential by design** (`src/lib/discovery.ts`: classified until hatched). The exposure looks **accidental**. The integration branch keeps classified code server-only; privacy QA passes per sessions (CLAIMED).
- **Options:** (a) accept; (b) make the repo private, quick and reversible, but doesn't recall clones (**recommended now**); (c) move classified sources to private storage, then remove them from branch tips; (d) rewrite history, which is disruptive and still doesn't recall clones.

## 5. Mythic and Secret showcase
- **Today (VERIFIED):** one identical seal-stone for all 6 species; no approved public previews.
- **Plan:** Creature Artwork prepares preview candidates privately; Website & Preview builds the showcase with an approved-preview slot and the seal as fallback. **Both are waiting for the owner's direct go-ahead in their own sessions** (correct behaviour for classified material).

## 6. Recoverability
| Item | Status |
|---|---|
| Market fixes `bea4b5a`, `aad1413` | **Local only.** The push is denied by that session's permission system and needs the owner in that session |
| `fd37c13` promo source | Local only; the finished media is with the owner in that session's chat (CLAIMED). The push needs a name scrub plus the owner's go-ahead in that session |
| 117 private classified art files | Container only; recoverable via Runway task outputs plus a repo script (CLAIMED; Runway retention not verified) |
| Superseded biome commit `87eb9e9` | Kept in the manager's local clone |

## 7. Owner actions to unblock (each one short)
1. **Live Market Data session:** "push stock/review-fixes to backup/stock-review-fixes" (allow `git push`). This unblocks the critical path.
2. **Website & Preview session:** confirm integration after it reports its review.
3. **Repo visibility:** decide on §4.
4. **Creature Artwork and Website & Preview sessions:** go-ahead for the showcase.
5. Optional: the promo source push; a private archive of the classified art; a Twelve Data key as an environment secret; network access to `*.vercel.app` and TradingView.
6. **Later, not yet:** merge to `main` and deploy. The Biomes session already asked; recommended answer: hold.

## 8. Draft trial evaluation (for the owner to judge)
- **Tangible work:** integration fixes (`f37f25d`, `ab0de36`, `ae58e74`); the biome rebase onto current integration (`9f019d2`); market fixes written (local); 28-ticker external check (claimed).
- **Independently verified:** artwork, pairings, biome builds/tests, cron, exposure facts. The manager rejected nothing that could be checked; several claims remain CLAIMED because code wasn't pushed.
- **Coordination:** no overwrites, no conflicts introduced, file overlap mapped in advance, one deadlock found and diagnosed. Approval boundaries held: sessions refused relayed approvals for pushes and classified material.
- **Inefficiencies:** (1) the manager's first 10-agent audit burned shared usage and contributed to an hours-long stall; (2) relayed approvals don't work, so owner actions are needed per session, which limits autonomy while you're away; (3) a lot of status messaging relative to code produced.
- **Suggested changes:** give each session its own standing push permission for new `backup/*` branches; route owner approvals directly to the owning session; keep the manager lean (direct checks, no large agent fan-outs); use fewer, milestone-only reports.
