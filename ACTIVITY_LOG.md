# Solanites workstream activity log

Owner-authorised **trial** of coordinated workstreams (2026-10-20). Maintained by the Workstream Manager on branch `coordination/workstream-manager` (docs only).
This repository is public, so this log never names classified (Mythic/Secret) species, their tickers or lore, and never contains secrets.
Statuses: VERIFIED · FAILED · BLOCKED · NOT TESTED · CLAIMED.

| Time (UTC) | Event | Status / evidence |
|---|---|---|
| 13:05 | Resumed the four workstreams after the usage-limit stop (≈02:00–02:45 → 13:05) | Messages delivered; all four reported back by 13:21 |
| 13:30 | Branch heads: integration `design/eclipse-vigil-code` `ab0de36`; `feature/creature-stock-link` `d84bff6`; `feature/creature-biomes` `87eb9e9` (base `4d42aae`); `creature-studio/art-direction` `6cdd943`; `main` `f6d6ed5` | VERIFIED (`git ls-remote`) |
| 13:31 | Repo visibility public; 0 forks, 0 stars, 0 watchers; 583 clones from 182 unique sources in the last 14 days; 0 page views | VERIFIED (GitHub API, traffic) |
| 13:32 | Classified identifiers present in plain text on every branch (4–35 files each), including `main`. On the integration branch they live in server-only modules (`src/server/classified/*`, `src/server/market/stockLinks.ts`), plus docs and tests; nothing under `public/` | VERIFIED (`git grep`) |
| 13:33 | `fd37c13` (X Infographics & Video) is not on GitHub | VERIFIED (GitHub API 422). Session asked to push it to `backup/x-infographics-fd37c13` |
| 13:34 | Cron `/api/cron/sync` daily 03:17 UTC; returns 401 when `CRON_SECRET` is unset (fails closed); with the secret it runs holder-tracking sync | VERIFIED (code read). Unchanged |
| 13:35 | Public site draws one identical "sealed" seal-stone for every classified species and stage; no approved public previews exist | VERIFIED (`sealed.tsx`, asset manifest) |
| 13:36 | Live Market Data asked to back up unpushed `stock/review-fixes` to `backup/stock-review-fixes` (no integration) | Requested |
| 13:36 | Website & Preview given the sequence: market integration → classified showcase (code + approved-preview slot, sealed fallback) → biome review | Requested |
| 13:36 | Creature Artwork asked to prepare candidate classified previews privately for owner approval (no commit, no paid generation) | Requested |
| 13:40 | 88 public creature images vs 88 approved finals: same size (1024²), mean RGB difference ≤ 3.44/255 (median 2.64), alpha difference ≤ 0.04; no missing or extra | VERIFIED (independent pixel comparison) |
| 13:42 | 28 stock pairings: 28 unique species, 28 unique tickers; `stockLinks.ts` byte-identical at `75ceb10`, integration, stock-link and biome branches | VERIFIED |
| 13:44 | Biome branch pre-review: 22 species have scene assets; no file overlap with the integration branch's new commit or with the stock-link branch; the one classified-word hit is the ordinary word in public lore (false positive) | VERIFIED (`git diff`) |
| 13:45 | Recovery risk: 117 private classified art files are in no git branch (per the acceptance record). Creature Artwork asked to give the owner a private copy | Requested |
