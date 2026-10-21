# Solanites — STATUS (source of truth)

Owner rules: the manager plans, delegates and monitors only. Ask the owner only before deleting work, spending money, posting publicly or approving art.
Updated: 2026-10-21 21:30 UTC, by SOL · Workstream Manager.

## Live
- Production: https://solanites.vercel.app, built from `main` 03084fb (identical to integration 8eb2675). It includes:
  - redesign, biomes, home metrics, fast track (with 4 fixes), live leaderboard;
  - Phase 3: odds 40/30/17/8/3.5/1.5, @Solanites_ line, evolution timeline, X/OG card;
  - live TradingView charts on all 28 creatures (`MARKET_WIDGET=tradingview` on Production).
- Holder tracking, metrics and the leaderboard show "not configured" until launch-day settings are added (see Launch checklist).
- Fallbacks:
  - `backup/integration-179015c`;
  - previous production deployment `dpl_FAjwhXvNcBLigP2U7EeRYHkD5MdR` (one-step Vercel rollback).

## Lanes (since 21 Oct; 13 old workstreams handed off and archived; handoffs on `handoff/*` branches)
| Lane | Session | Doing now | Report to |
|---|---|---|---|
| Manager | SOL · Workstream Manager | Plan, delegate, STATUS.md | Owner |
| Site (Opus) | SOL · Site | Buyer-review upgrade on `site/buyer-upgrade` (from main): visual QA, then O-004 a–d, j/k/l/n/o, g/i/m, e/f (hidden until configured), h kept as is. PR plus preview, no prod. a–d already built on `feature/o-004-buyer-review` and being moved across | Manager |
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
- `SOLANITES_MINT` (real mint), `SOLANA_RPC_URL`, `CRON_SECRET`; a fresh database for the real mint.
- Decide on `robots.txt` / noindex and the SSO setting before announcing.
