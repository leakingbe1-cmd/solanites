# Handoff: Launch Readiness → Site lane (2026-10-21)

## Scope
Dev tooling/CI, dependency security, mint/DB launch safety, holder-tracker sync fixes and the live
leaderboard. Rule kept throughout: pushes only on owner approval typed in this session; integration
merges go through Website & Preview; never production changes.

## Done (all merged and released to production in main 03084fb)
- Tooling/CI: CLAUDE.md, .claude/settings.json read-deny, .github/workflows/ci.yml (f057ae6, landed as e83b185)
- npm audit 5 → 0: vitest 4, overrides next.postcss + vite 7 (606aa3d, landed as ece6f3a)
- Mint safety (40f65e2): SOLANITES_TEST_MINTS refused on VERCEL_ENV=production; DB bound to its
  first mint (tracker_state.bound_mint); authenticated /api/health lists notConfigured; docs/launch-readiness.md
- Tracker (b4e2a7b): >500-signature wallets finish oldest-first across passes; minContextSlot = balance slot
- Tracker (2c08121): a capped account holds the whole wallet back
- Live leaderboard (a2d81f8): GET /api/leaderboard + /leaderboard page; mock data removed

## In progress
None. Unmerged and superseded: claude/tooling-setup (a163394, old main), claude/intro-animation
(d6a1a88, hero animation on old `showcase`; the real intro lives in src/components/intro/).

## Open bugs / risks
- Production holder tracking is NOT configured (env names checked 21 Oct): SOLANITES_MINT,
  SOLANA_RPC_URL and CRON_SECRET exist only in Preview, so prod tracking/leaderboard answer
  NOT_CONFIGURED (503).
- DATABASE_URL is the SAME Neon store for Preview and Production, and Preview tracks the test mint.
  With the real mint, production will (correctly) refuse that DB: production needs its own empty DB.
- SOLANITES_TEST_MINTS is unset everywhere, so the test-mint guard is inactive until it's set.
- Leaderboard calls holderView once per keeper with hatched creatures every 30 s: fine now,
  needs a batch query at thousands of keepers. Not yet checked against the real Preview DB.
- GitHub 10-min sync (tracker-sync.yml) needs secrets SOLANITES_SYNC_URL and CRON_SECRET; it only runs from main.
- Vercel Hobby: ~daily build limit hit once (every branch push builds); daily cron only.

## Pending owner decisions
Official production mint; separate production Postgres (cost); production RPC provider/key;
production CRON_SECRET and webhook secret; Vercel Pro (limits, 10-min cron) vs GitHub schedule.

## Key files / branches / URLs
src/server/config.ts, src/server/runtime.ts (bindDatabaseToMint), src/server/tracker/service.ts
(syncOwner), src/server/solana/history.ts, src/server/leaderboard/*, src/shared/leaderboard.ts,
src/app/api/{leaderboard,health}/route.ts, docs/launch-readiness.md, docs/holder-tracking.md.
Vercel project niga20/solanites (prj_IrNa6cAPGVre99OIpudhAZIwHelU); production branch = main.

## Gotchas
- VERCEL_ENV, not NODE_ENV, tells Production apart (NODE_ENV is "production" on Preview too).
- Fixture test chain: openAccount(owner) returns ONE extra account, and transfers without toAccount
  reuse an owner's existing account. Start tracking (runSync) before seeding history in tests.
- next dev keeps leaderboard/runtime services on globalThis: restart after server-code changes.
- Shallow clones need fetch refspecs for other branches; npm 10 crashes on Vite 8 peer resolution.

## Launch-day checklist
1. Create a NEW empty production Postgres; set DATABASE_URL for Production only (not shared).
2. Set SOLANITES_MINT (Production) by copying the official mint from the deploy tx, never typed.
3. Set SOLANITES_TEST_MINTS (all scopes) to the test mint(s).
4. Set SOLANA_RPC_URL, SOLANITES_EXCLUDED_OWNERS, CRON_SECRET, webhook secret, launch time, DEVELOPER_MODE=off.
5. Redeploy Production; GET /api/health with Bearer CRON_SECRET → source "chain", no notConfigured.
6. Trigger /api/cron/sync once; check holders, eggs, supply match and /leaderboard before announcing.

## Next steps
Do the launch-day checklist with the owner; verify /leaderboard on Preview with real data; batch the
leaderboard query if keepers grow; consider Vercel Pro or the GitHub schedule for 10-min syncs.
