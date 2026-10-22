# Solanites — STATUS (source of truth)

Owner rules: the manager plans, delegates and monitors only. Ask the owner only before deleting work, spending money, posting publicly or approving art.
Updated: 2026-10-22 12:35 UTC, by SOL · Workstream Manager.

## Live
- Production: https://solanites.vercel.app, built from `main` 68f7624 (22 Oct). That merges PR #1 (buyer upgrade: live-demo hero, proof strip, tokenomics and proportional rewards config, LAUNCH-DAY.md) and PR #2 (3D hatch clips). Deployment dpl_31W2YRqk4vYiTesof6xP9duvYtCX. Before that: main 03084fb (identical to integration 8eb2675), which included:
  - redesign, biomes, home metrics, fast track (with 4 fixes), live leaderboard;
  - Phase 3: odds 40/30/17/8/3.5/1.5, @Solanites_ line, evolution timeline, X/OG card;
  - live TradingView charts on all 28 creatures (`MARKET_WIDGET=tradingview` on Production).
- Holder tracking, metrics and the leaderboard show "not configured" until launch-day settings are added (see Launch checklist).
- Fallbacks:
  - `backup/integration-179015c`;
  - previous production deployment `dpl_DvsnnLSyXfi2yvnH7i7uzt9UHLuE` (main 03084fb; one-step Vercel rollback).

## Model routing and delegation (owner-approved, 22 Oct)
- Manager: Opus 5.5. It plans, delegates, tracks and reports.
- Fable 5.1: architecture, hard bugs, security- or money-sensitive code (for example the holder tracker), and anything Opus has failed at twice. Say in one line when Fable was used.
- Opus 5.5: features, edits, tests, docs and refactors. Haiku 5.5: lookups, summaries, list checks and simple reads.
- Pass `model` on every Agent call. One sub-agent per task, with a short plan first, and at most 3 running in parallel. Do tiny jobs directly.
- Read reports, not whole files. Before anything ships, an independent reviewer sub-agent checks the real result (tests, screenshots, the live page).
- Ask the owner before anything irreversible or money-related: deploys, wallets, payouts, the contract address.

## Lanes (since 21 Oct; 13 old workstreams handed off and archived; handoffs on `handoff/*` branches)
| Lane | Session | Doing now | Report to |
|---|---|---|---|
| Manager | SOL · Workstream Manager | Plan, delegate, STATUS.md | Owner |
| Site (Opus) | SOL · Site | Idle after shipping PRs #1 and #2. Still open: CA switch extras (refused by its safety check) | Manager |
| Creature Art (owner's PC) | Local Claude Code | Redo Aurelion in premium realism, then wait for art approval | Owner (art), Manager |
| Marketing (Sonnet) | SOL · Marketing | Consolidated `marketing/PLAN.md`: inventory, conflicts, one posting order | Manager |

## X schedule (Typefully, set 349175)
- 21 Oct: 9 standalone posts, 20:15–23:35 UTC.
- 22–24 Oct: 10 posts (odds card, hatchery, hatching, Neonyx, intro, catalogue, collection, teaser, leaderboard, CTA).

## Done
- Phase 1, X warm-up: profile kit on `marketing/x-warmup`; 22 Typefully drafts, none scheduled.
- Phase 3, site fixes: live.
- Phase 4 audit: done. Owner chose items 1–3:
  1. Collection shows real creatures.
  2. "Your rank" on the leaderboard (the address is already remembered).
  3. Missed hatch reveals replay; persistent demo badge.

## Blocked on owner
- `robots.txt` blocks X's crawler (Twitterbot), so link cards won't show. Allow Twitterbot while keeping noindex?
- Old campaign posts 04 and 07 show Mythic/Secret designs. Hold or drop?
- The 3D Aurelion redo needs art approval. The first pass (de07a4c) was rejected; don't wire it in.
- The repo is public: the 2D Mythic/Secret art is already in `public/creatures` and on the live Collection. Hide until launch?

## Next (not started, needs the owner's go)
- Retention backlog:
  4. Fresher sync.
  5. Share-to-X creature cards.
  6. Bloodline goals.
  7. Seasons.
  8. "Egg ready" notifications.
- Phase 5: Remotion clips, local only.
- Phase 6: the remaining species in 3D, after Aurelion is approved.

## Launch checklist (production settings)
- Follow `docs/buyer-upgrade/LAUNCH-DAY.md` on main: contract address, wallets, lock proofs, authorities, REWARDS_PAGE_LIVE, SOLANITES_INDEXING=1, redeploy, live check; at +2 h the snapshot hash, then payout signatures.
- Not built (refused by Site's safety check): CA env override, CA bar on every page, Dexscreener/pump.fun links, live market-cap strip, CA on the X card.
- `SOLANITES_MINT` (real mint), `SOLANA_RPC_URL`, `CRON_SECRET`; a fresh database for the real mint.
- Decide on `robots.txt` / noindex and the SSO setting before announcing.
