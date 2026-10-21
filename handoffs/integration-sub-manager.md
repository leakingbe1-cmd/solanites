# Handoff: Integration Sub Manager (retired 2026-10-21)

## What I managed
- Read-only audit of the three candidates: market 0346811 (`integration/market-candidate`), biomes c359cf5 (`feature/creature-biomes`), integration ae58e74 (their merge base). All three Vercel previews were matched to their commits through GitHub statuses.
- Independent QA of every `design/eclipse-vigil-code` tip from 2beed4f to b2ddffa:
  - tsc, vitest and next build;
  - all `scripts/qa` suites;
  - an extra browser pass at 1440 and 390 px: 28 cards at stage 4, every detail view opening on "Stage 4 of 4", no broken images.
- Live TradingView verified in a browser at 30f8725, with MARKET_WIDGET=tradingview (5 symbols, real TSLA quote).
- Vercel env-var audit (metadata only) and a single Preview redeploy, owner-approved: dpl_AUaJn8Sh3bb87KhnB3GA5sacJzqY, b2ddffa.

## Unfinished or unmerged
- No code of mine on any branch. I never committed code; this file is my only commit.
- NOT verified:
  - 8b5793a and later integration tips;
  - Twelve Data live, which needs an owner sign-in to /studio/dev on Preview, then Market links;
  - TradingView for 23 of the 28 symbols;
  - the real-GPU scene frame rate.
- The 5 named art fixes were not on the integration branch as of b2ddffa. Pixel diffs showed Solvanth 2–3 and all Aurelith stages unchanged. Work is on `art/manager-frostkit-cleanup` and `creature-studio/art-direction`.
- The six Mythic/Secret species have no biome scene. `node scripts/creature-scenes.mjs check` exits 1 (22/28 plates); those cards use SEALED_SCENE.

## Gotchas for the Site lane
- Never export MARKET_WIDGET for vitest. It breaks the "off by default" marketReview test. Set it on the server process only.
- Kill old `next start` servers before a QA run. A stale server on :3100 produced 34 false site-QA failures once.
- `art:check` reporting "112 missing" is normal in a clone, because the masters are not in git.
- The scenes desktop perf check flips pass/fail under software rendering (about 22–27 vs 29–35 fps).
- Commit 599c9eb deleted the classified module under a doc-only message; f9c234a restored it. Check diffs, not commit messages.
- Vercel env:
  - Neon DATABASE_URL and the related PG* variables target Preview AND Production.
  - TWELVE_DATA_API_KEY is also on Production.
  - SOLANITES_EXCLUDED_OWNERS is not set.
  - The STUDIO_BASIC_AUTH password was shared in chat; the owner should rotate it.
- The integration Preview built at 18:36 on 2026-10-20 predates the mint, RPC, cron and Neon vars. Redeploy before testing tracking there.
- Hobby plan: runtime logs are kept for about 1 h only.
