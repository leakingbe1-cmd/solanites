# Solanites return audit (trial)

**Interim. Last updated 2026-10-20 13:50 UTC.** Maintained on `coordination/workstream-manager`. Public repo: no classified names, tickers, lore or secrets here. Detailed log: `ACTIVITY_LOG.md`.

## 1. Overall status
**AT RISK. Confidence: medium.** Work has resumed and coordination is orderly. Risks: classified content is public in git, classified art has no durable copy, and live market data and the deployed site are unverified.

## 2. Project path, branches, commits
| Branch | Commit | Owner | Role |
|---|---|---|---|
| `design/eclipse-vigil-code` | `ab0de36` | Website & Preview | Integration line (not `main`) |
| `feature/creature-stock-link` | `d84bff6` | Live Market Data | Market feature; fixes pending on local `stock/review-fixes` |
| `feature/creature-biomes` | `87eb9e9` | Biomes & Animations | Biomes/idle animation; base `4d42aae` |
| `creature-studio/art-direction` | `6cdd943` | Creature Artwork | Finals, ledger, acceptance record |
| `main` | `f6d6ed5` | — | Default branch; untouched |

## 3. Verified results
| Item | Status | Evidence |
|---|---|---|
| 88 public creature images match approved finals | VERIFIED | Pixel comparison of all 88 pairs: mean RGB difference ≤ 3.44/255, alpha ≤ 0.04 |
| 28 stock pairings unique and unchanged | VERIFIED | 28 species / 28 tickers; file hash identical on 4 branches |
| Cron fails closed without its secret | VERIFIED | Code: 401 without `CRON_SECRET` |
| Biome branch covers 22 public species; no file overlap with market branch | VERIFIED | `git diff` |
| Market fix review (395/401 tests) | CLAIMED | Website & Preview / Live Market Data reports |
| Twelve Data live responses | BLOCKED | No key; host blocked in containers |
| TradingView widget in a real browser | BLOCKED | Host blocked in containers |
| Deployed preview/production | BLOCKED | `*.vercel.app` blocked by the container proxy |

## 4. Classified exposure assessment (no irreversible action taken)
- **Facts:** the repo is public. All 6 classified species (4 Mythic, 2 Secret) appear in plain text on every branch, including `main`: names, lore, design specs, renderers and their stock mappings. GitHub shows 0 forks and 0 stars, but 583 clones (182 unique) in 14 days, most likely the project's own cloud sessions; that can't be confirmed. Treat the names as already copied.
- **Is it confidential?** By design, yes: the game keeps Mythic/Secret species "classified until the viewer hatches one" (`src/lib/discovery.ts`). The exposure looks **accidental**, a consequence of the repo being public. The deployed site appears protected: classified code is server-only, and the privacy QA suite (35/35) passes. That is CLAIMED, since the live site is unverified.
- **Options (owner decision):** (a) accept as-is; (b) make the repo private: quick and reversible, but doesn't recall existing clones; (c) move classified sources to a private repo or store and remove them from the current branch tips: protects future commits, but history still has them; (d) rewrite history and force-push: most thorough, but disruptive to every session and still doesn't recall clones. **Recommendation:** (b) now, then (c). Reserve (d) for when names must be legally or commercially secret.

## 5. Mythic and Secret showcase
- **Today:** one identical seal-stone for all 6 species. No approved public previews (category A is empty).
- **Plan in progress:** Creature Artwork prepares candidate previews privately for your approval. Website & Preview builds a showcase with a slot for approved previews, falling back to the seal. Nothing goes public before approval.

## 6. Recoverability
- `fd37c13` (promo video work): not on GitHub. Backup push requested.
- `stock/review-fixes` (market fixes): local only. Backup push requested.
- 117 private classified art files: in no git branch, possibly only in one session's container. Owner-private copy requested.

## 7. Decisions needed from the owner
1. Classified exposure option (§4).
2. Approve classified preview candidates when Creature Artwork's private board is ready.
3. Twelve Data key (set it yourself as an environment secret, never in chat) and access to `*.vercel.app` / tradingview.com, to unblock live checks.
4. One Mythic Hatchling image (4 credits) still needs your go-ahead (per the acceptance record).

## 8. Next actions (priority order)
1. Confirm the backups land (stock fixes, `fd37c13`, classified art copy).
2. Independently re-run tsc/vitest/build on the final market fix SHA, then on the integrated commit.
3. Showcase implementation, then owner preview approval.
4. Full biome review after market integration.
