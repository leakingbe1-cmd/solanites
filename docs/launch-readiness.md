# Launch readiness: mint, RPC, database and scheduler

Checked against `design/eclipse-vigil-code` at `6539f9b` (2026-10-20). Background and the full go-live
plan are in [`holder-tracking.md`](holder-tracking.md). This page covers keeping the **production mint**
separate from the **test mint** and what must be set, per Vercel scope, before launch.

## How the mint is configured (verified)

- **Only from the environment.** `SOLANITES_MINT` is read in one place, `readServerConfig`
  (`src/server/config.ts`). Every tracking, lookup and claim path goes through it (`src/server/runtime.ts`,
  `src/app/api/wallet/[address]/route.ts`). No mint is hard-coded: the only base58 constants in `src` are
  the SPL Token program IDs (`src/server/solana/token.ts:4-5`). The browser never sees it (no `NEXT_PUBLIC_`).
- **Validated.** Must be base58 that decodes to exactly 32 bytes (`src/server/solana/address.ts`).
- **Fails closed.** Missing or invalid → `ConfigError` → every holder endpoint answers
  `503 NOT_CONFIGURED` (`src/server/http.ts:20`). No guessed or fallback mint.
- **Per Vercel scope without code changes.** Variables are read at runtime per deployment, so Preview can
  use the test mint and Production the real one.

## Guards added on this branch

1. **Test mints are refused on Production.** List every test or staging mint in `SOLANITES_TEST_MINTS`
   (comma-separated). On a Production deployment (`VERCEL_ENV=production`; `NODE_ENV` is `production` on
   Preview too, so it isn't used), a listed `SOLANITES_MINT` is rejected and tracking reports
   "not configured". Set this variable in **all** scopes: it is public data, not a secret.
2. **One database per mint.** Holders, eggs and sync cursors are not stored per mint, so a database
   that tracked the test mint would carry its holders and eggs into production. A database is now bound to
   the first mint that uses it (`tracker_state.bound_mint`), and any other mint is refused. Production also
   refuses an unbound database that already holds holders. **Production needs a fresh, empty database.**
3. **Health says why.** The authenticated `/api/health` view (Bearer `CRON_SECRET`) now lists
   `notConfigured`: the failing setting names and reasons, never values.

Off Vercel (no `VERCEL_ENV`), guard 1 does not apply. Guard 2 still blocks mint changes on a bound database.

## Environment variables by Vercel scope

"Owner" means only you can supply the value. Never commit values or paste secrets into chat.

| Variable | Production | Preview | Owner? | Notes |
|---|---|---|---|---|
| `SOLANITES_MINT` | **official mint** | test mint | Yes | Production value not yet known; never invent it |
| `SOLANITES_TEST_MINTS` | test mint(s) | test mint(s) | Yes | Same list everywhere |
| `SOLANA_RPC_URL` | dedicated provider (https) | its own key if possible | Yes | Public endpoint is rate-limited |
| `SOLANA_COMMITMENT` | `confirmed` | `confirmed` | No | Eggs always use finalized data regardless |
| `SOLANITES_EXCLUDED_OWNERS` | treasury, team, LP, reserve, burn, exchanges | test equivalents | Yes | Off-curve pool PDAs are excluded automatically |
| `SOLANITES_EXCLUDE_PROGRAM_OWNERS` | unset (= true) | unset | No | |
| `DATABASE_URL` | **new, empty** Postgres | separate staging Postgres | Yes | Never share between scopes (guard 2) |
| `CRON_SECRET` | random 32+ chars | different value | Yes | Also unlocks detailed `/api/health` |
| `SOLANITES_WEBHOOK_SECRET` | random | different value | Yes | Recommended; one webhook per mint |
| `SOLANITES_LAUNCH_AT` | ISO 8601 UTC | test time | Yes | |
| `SOLANITES_LAUNCH_PUBLIC` | `1` once announced | optional | Yes | |
| `SOLANITES_INDEXING` | `1` at launch | unset | Yes | Preview stays unindexed |
| `SIWS_DOMAIN`, `SOLANITES_SESSION_SECRET` | site host, random 32+ | preview values | Yes | Claims sign-in; no payout policy is active |
| `DEVELOPER_MODE` | `off` | as needed | Yes | Hard off switch for `/studio` |
| `STUDIO_BASIC_AUTH` | unset | `user:password` (24+) | Yes | |
| `SOLANITES_FIXTURES` | **never** | unset | No | Refused in production |
| `MARKET_WIDGET`, `MARKET_DATA_ENABLED`, `TWELVE_DATA_API_KEY`, `MASSIVE_API_KEY` | unset | optional | Yes | Market data is Preview/Developer Mode only |
| `NEXT_PUBLIC_INTRO_VIDEO_BASE` | unset (serves `/intro`) | unset | No | Only to move intro videos to a CDN |

Not in `.env.example` yet (read by code): `SOLANITES_STUDIO`, `MARKET_DATA_ENABLED`, `MARKET_DATA_PLAN`,
`MARKET_CALLS_PER_MINUTE`, `MASSIVE_API_KEY`, `MASSIVE_API_BASE`, `TWELVE_DATA_API_BASE`,
`TWELVE_DATA_PLAN_LABEL`, `TWELVE_DATA_CREDITS_PER_MINUTE`, `TWELVE_DATA_CREDITS_PER_DAY`,
`NEXT_PUBLIC_INTRO_VIDEO_BASE`.

## Scheduler and database readiness

- **Vercel Cron** (`vercel.json`): `/api/cron/sync` daily at 03:17 UTC. Vercel runs crons only for
  Production deployments, so Preview syncs must be triggered by hand (Bearer `CRON_SECRET`).
- **GitHub Actions** (`.github/workflows/tracker-sync.yml`): every 10 minutes, but GitHub only runs
  scheduled workflows from the default branch. `main` is still the original prototype, so **this
  schedule does not run** until the launch code is on `main`. It needs the secrets `SOLANITES_SYNC_URL`
  and `CRON_SECRET`.
- **Webhook**: point one Helius (or similar) webhook per mint at that deployment's
  `/api/webhooks/solana`, with its own `SOLANITES_WEBHOOK_SECRET`.
- **Database**: tables are created on first request (`migrate`, `src/server/runtime.ts`). Production
  must start empty; the first sync then sets the tracking start slot.

## Blockers before launch

1. Official production mint not supplied (owner).
2. Production `DATABASE_URL`, RPC provider and secrets not created (owner; may cost money: approve first).
3. 10-minute sync schedule can't run until the code is on `main` (owner decision on branching).
4. Staging run with the test mint not yet done end to end: see "Staging verification plan" in
   `holder-tracking.md`.
5. Open tracker findings from the earlier audit: wallets with more than 500 signatures never finish
   syncing (`tracker/service.ts`, `solana/history.ts`), and the balance and history reads aren't pinned
   to the same slot (`minContextSlot`). Fix both before real holders arrive.

## Owner checklist on launch day

1. Create a **new** production Postgres; set `DATABASE_URL` (Production only).
2. Set `SOLANITES_MINT` (Production) to the official mint, copied from the deploy transaction, not typed.
3. Set `SOLANITES_TEST_MINTS` (all scopes) to the test mint(s).
4. Set RPC, excluded owners, `CRON_SECRET`, webhook secret, launch time, `DEVELOPER_MODE=off`.
5. Redeploy Production; `GET /api/health` with the Bearer secret must show `source: "chain"` and no
   `notConfigured`.
6. Trigger `/api/cron/sync` once; check holders, eggs and the supply check before announcing.
