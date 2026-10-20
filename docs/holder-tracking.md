# Holder tracking, egg progression and launch fee claims

Status: **implemented and tested against a fixture chain and an embedded Postgres. Not yet run against Solana mainnet**, because the token mint, RPC provider and database are not configured. Nothing here is production-ready until the go-live checklist below is done.

There are two separate workflows, and neither depends on the other:

| | Workflow A: eggs | Workflow B: fee claims |
|---|---|---|
| Who starts it | The server, on a schedule and from webhooks | The holder, voluntarily |
| Wallet connection | **Never** | Required: the wallet signs a message to prove ownership |
| Timing | Continuous, before, during and after launch | Opens 6 hours after launch |
| Path | chain → verified balance → egg entitlement → incubation → existing hatch | launch + 6h → connect → sign → verify → quote → submit → payout (not built) |

## 1. Audit of the existing project

| Area | Found | Files |
|---|---|---|
| Wallet integration | Demo wallet (simulated); browser-extension connect (address only, never verified) | `src/services/wallet/*` |
| Balance sources | Mock slider; Phase 2 read-only server lookup at `confirmed` commitment | `src/server/walletLookup.ts`, `src/app/api/wallet/[address]` |
| Egg data and entitlement | Client-side records in `localStorage`; 10,000 tokens per egg, maximum 6 | `src/lib/progression.ts`, `src/state/HatcheryProvider.tsx` |
| Incubation | Simulated clock in the browser; one fixed 7-day incubation | same |
| Creature collection and rarity | Pure functions (`rollSpecies`, `rarityChances`) with a seeded roll; discovery list in `localStorage` | `src/lib/progression.ts`, `src/lib/rarity.ts` |
| Hatch experience | `HatchReveal` modal, egg cards, inspector, creature detail | `src/components/hatchery/*` |
| Backend and database | Next.js route handlers only; **no database, no scheduler** | — |
| Fee tracking or payouts | **None** | — |
| Token mint | **Not configured anywhere** | — |

The old rules (10,000 per egg, cap of 6, 7-day incubation) are replaced by the new central configuration below. Rarity weights, the species roll, art and the reveal are unchanged.

## 2. What was built

### Configuration (one place)

`src/config/eggProgression.ts`:

- `tokensPerEgg: 1_000_000`, `totalSupply: 1_000_000_000`, `maxEggsPerWallet: null` (no cap).
- `incubationScheduleMs: [1 min, 5 min, 15 min, 1 h, 6 h, 12 h]`: by egg sequence number; the last value repeats for egg 6 onwards.
- `initialGrowthScheduleMs: [1 min, 5 min, 15 min, 1 h, 3 h, 6 h]`: how long each creature (by its egg's sequence number) takes to grow from Eggling to its mature Hatchling form; the last value repeats.
- Both values are fixed on the egg row when it is issued (`incubation_ms`, `maturity_ms`), so changing the config never alters eggs that already exist.
- Growth counts qualifying holding from the moment the egg hatched (`ready_ms`, its incubation end), not from when the reveal was opened. Later evolution (`gameConfig.evolution.afterMaturityMs`: Evolved +30 min, Ascended +2 h) and the Ascension ranks are counted from maturity, so they always come after it.
- `incubationMode: "sequential"`: eggs incubate one at a time. Egg *n* starts when egg *n−1* is ready (or when earned, if later). Switch to `"parallel"` to start every egg as soon as it is earned. **Please confirm which you intend; see §6.**

`src/config/launch.ts`: `CLAIMS_OPEN_AFTER_MS = 6 h`.

### Workflow A: automatic tracking (`src/server/tracker/`)

1. **Discovery and reconciliation.** `getProgramAccounts` on the token program, filtered by the mint, lists every token account and its owner at `finalized` commitment. Accounts that changed, opened, closed or changed owner mark their wallets for a sync.
2. **Per-wallet sync.** The tracker reads the wallet's balance at `finalized`, at slot *S*, summing all its token accounts once and excluding frozen ones. It then reads each token account's signature history since its last cursor, processes every transaction up to *S* in slot order, and only then awards eggs, all for the same slot. If history is incomplete (indexing delay, too many signatures), nothing is awarded that round.
3. **Transaction ingestion.** Each transaction is read with `getTransaction` and its pre/post token balances for the mint. The signature is recorded in the same database transaction as its effects, so replays, retries and duplicate webhooks are no-ops.
4. **Webhooks.** `POST /api/webhooks/solana` accepts signatures from an indexer (e.g. a Helius webhook on the mint). Payload contents are never trusted: every transaction is re-read from the RPC.
5. **Schedule.** `GET|POST /api/cron/sync` (Bearer `CRON_SECRET`) runs one pass: a snapshot when due (every 10 minutes), then wallets marked for sync, then re-verification of the least recently checked holders. A lease stops overlapping runs from doing the same work twice; correctness never depends on it.
6. **Egg issuance.** In one database transaction the tracker locks the holder row, works out new eggs, inserts them with fixed `incubation_started_ms`, `incubation_ms` and `ready_ms`, and updates the holder. Each egg gets a server-generated random seed, and its species is rolled with the existing `rollSpecies`.

### Rules applied to eggs

- **Qualifying units** = verified balance ÷ 1,000,000, rounded down (exact integer base units; no floats).
- **Earned eggs are never removed.** If the balance drops, earned eggs keep incubating and stay in the collection.
- **Future eggs** come only from tokens that have not already earned an egg ("egg credit", below).
- **Statuses:** `queued` (waiting for the previous egg), `incubating`, `ready`, `hatched`. They are derived from stored timestamps and the server clock, so timers keep running offline and survive restarts and device changes. `hatched_ms` is persisted when hatched.
- **Hatching** (`POST /api/eggs/:id/hatch`) checks readiness against the server clock and is idempotent. The outcome was sealed at issuance, so anyone viewing the address can press Hatch and no signature is needed. The existing `HatchReveal` shows the result, and the species is added to the visitor's discovered list.
- **Sealed outcome.** The API never returns the seed (a display seed is derived from the egg id). The species is shown only from the "stirring" stage onward, as a silhouette, matching the existing egg design, and in full after hatch.
- **Excluded wallets** never earn: configured treasury, team, pool, reserve and exchange addresses, and every program-controlled (off-curve) owner such as pool authorities and vaults.

### Anti-duplication ("egg credit", `src/server/tracker/ledger.ts`)

Each wallet carries a credit: the amount of its tokens that has already earned an egg. New eggs are earned only on tokens above that credit.

- Moving tokens to another wallet moves the credit with them. A spends uncredited tokens first, so credit only leaves when the remaining balance can't cover it. A → B → C with the same million gives one egg in total.
- Credit is never sent to an excluded address. It stays with the seller, so selling into a pool and buying back does not earn the same egg again. Buyers from a pool get fresh, uncredited tokens.
- Multi-leg transactions (routers) split moved credit pro rata among recipients, never more than each received.
- Database constraints back all of this up: `eggs UNIQUE(owner, sequence)`, `processed_transactions` keyed by signature, `holders.credit_base >= 0`.

### Workflow B: launch fee claims (`src/server/claims/`, `/claims`)

1. `GET /api/claims/status` reports the opening time from `SOLANITES_LAUNCH_AT` + 6 h, by the server clock. Before that, every claim endpoint refuses (403 `NOT_OPEN`).
2. `POST /api/claims/nonce` returns a Sign-In With Solana message containing the domain, address and a single-use nonce that expires after 5 minutes.
3. The wallet signs it (`signMessage`: free, no transaction). `POST /api/claims/session` verifies the ed25519 signature on the server. The nonce is spent whether or not the signature is valid. A 15-minute HMAC session is set in an httpOnly, SameSite=Strict cookie.
4. `GET /api/claims/quote` builds the claim context on the server: a live `finalized` balance plus the wallet's tracked history. It runs the refund policy. Nothing from the browser (balance, time, amount) is trusted.
5. `POST /api/claims` recalculates the amount and records one claim per wallet per period (`UNIQUE(claimant, period_id)`). Its status starts as `pending_payout`.
6. **No payout is executed.** Payout is a separate, explicitly authorised step that is not built (see §6).

**No refund policy is active.** The project doesn't define the refund percentage, eligible fees, currency, budget, window or formula. So `ACTIVE_FEE_POLICY` is `null`, the page says amounts aren't available, and quotes and submissions answer `NOT_CONFIGURED`.

### Interface

- **Hatchery entry:** "Find my eggs" takes a public address (no connection) and opens the tracked view. The demo is still available. The experimental wallet connect was removed from the Hatchery, and the old lookup panel was replaced.
- **Tracked view** (`TrackedHatchery`): qualifying holdings, eggs earned, incubating/queued/ready, hatched, next-egg progress. It shows a countdown per egg and uses the existing `EggCard`, `EggInspector`, `HatchReveal`, `CreatureCard` and `CreatureDetail`. It polls every 20 s and counts down from the server clock between polls.
- **Claims page** (`/claims`, in the nav and footer): countdown before opening, then connect → sign → quote → submit → status.
- **Nav button:** "Find my eggs" instead of "Connect".

## 3. Configuration needed to go live

| Variable | What |
|---|---|
| `SOLANITES_MINT` | The official $SLNT mint. **Not invented: you must provide it.** |
| `SOLANITES_TEST_MINTS` | Test/staging mints that Production refuses. Set in every scope. See [`launch-readiness.md`](launch-readiness.md). |
| `SOLANA_RPC_URL` | Provider endpoint with key (Helius recommended: `getProgramAccounts`, history, webhooks). Server-only. |
| `DATABASE_URL` | Postgres (Neon via Vercel Marketplace, or Supabase). The schema is created automatically. |
| `SOLANITES_EXCLUDED_OWNERS` | Treasury, team, LP, reserve, burn and exchange wallets (on-curve ones; off-curve pool PDAs are excluded automatically). |
| `CRON_SECRET` | Bearer secret for `/api/cron/sync` and for the detailed `/api/health` view. |
| `SOLANITES_WEBHOOK_SECRET` | For a Helius (or similar) webhook on the mint pointing to `/api/webhooks/solana`. |
| `SOLANITES_LAUNCH_AT`, `SIWS_DOMAIN`, `SOLANITES_SESSION_SECRET` | Claims timing and sign-in. |
| `SOLANITES_EXCLUDE_PROGRAM_OWNERS` | Optional; `false` lets off-curve (program-owned) wallets earn. Default excludes them. |

Set these in Vercel → Project → Settings → Environment Variables, separately for **Preview** (staging database, devnet or staging mint) and **Production**. Never paste them into chat, commit them, or prefix them with `NEXT_PUBLIC_`.

### Scheduler

Two schedulers are in the repo, and both call the same idempotent endpoint (a lease stops overlapping runs):

- **`vercel.json`**: a daily Vercel Cron at 03:17 UTC. This is the most the Hobby plan allows, so it is only a safety net.
- **`.github/workflows/tracker-sync.yml`**: every 10 minutes (plus manual `workflow_dispatch`). It needs the repository **variable** `SOLANITES_SYNC_URL` (e.g. `https://<deployment>/api/cron/sync`) and the repository **secret** `CRON_SECRET`. If either is unset the job skips without failing. GitHub may delay or drop scheduled runs under load; the webhook covers the gaps.

On Vercel Pro you can replace the GitHub schedule with a `*/10 * * * *` Vercel Cron.

### Checking that tracking is alive

- `GET /api/health` (public) returns only `status`, `source` and `lastSuccessfulSyncAt`.
- With `Authorization: Bearer $CRON_SECRET` it also returns the last run (finish time, status `ok`/`partial`/`failed`/`skipped`, owners synced, eggs issued), whether the sync is stale (>30 min), tracked holders, holders awaiting sync, whether the on-chain supply matches the configured 1,000,000,000, and which settings are present (booleans only, never values).
- Server logs are JSON lines (`sync.finished`, `sync.partial`, `sync.failed`, `mint.supply_mismatch`, `webhook.duplicate_ignored`, `rate_limit.store_unavailable`, `route.unexpected_error`). Secrets, signatures and URL credentials are redacted.

### Shared protections

- **Rate limits** are stored in Postgres (`rate_limits`), so they hold across serverless instances. IP addresses are stored only as SHA-256 hashes. If the database is unreachable, each instance falls back to an in-memory limit and logs it.
- **Claim budget**: a claim is recorded only if it fits the period's `budgetBase`, checked atomically in the database (`claim_periods`, with a `CHECK` constraint). Excess claims are rejected with `BUDGET_EXHAUSTED`.
- **Audit records**: sign-ins, quotes, rejections and recorded claims are written to `audit_log`.

**Go-live checklist**

1. Set the variables above.
2. Run the first sync once and review the holders and eggs it creates.
3. Check the excluded list against the top holders (pool, treasury).
4. Point the webhook at the mint.
5. Verify a known wallet's balance against Solscan.

### Staging verification plan (do this on a Preview deployment first)

1. Create a separate staging Postgres and set Preview-only variables, with a devnet or test mint (never the production database). A database is bound to the first mint it tracks and refuses any other, so production must get its own, empty database.
2. Deploy the branch; open `/api/health` and confirm `source` is not `demo`/`fixtures`.
3. Trigger `/api/cron/sync` with the Bearer secret; confirm health shows a recent `ok` run and the supply check matches.
4. From a test wallet, buy or transfer exactly 1,000,000 test tokens; enter the address in the Hatchery and confirm one egg appears with no wallet connection, ready 1 minute later.
5. Transfer tokens to a second wallet; confirm no extra eggs appear (credit moves with the tokens).
6. Hatch; confirm a second hatch request returns the same creature, that it is fully grown (Hatchling) 2 minutes after the egg was earned, Evolved 30 min later and Ascended 2 h after maturity.
7. Sell below the threshold; confirm growth pauses.
8. Send a webhook twice; confirm it is applied once (`webhook.duplicate_ignored`).
9. Check `/claims` before and after `SOLANITES_LAUNCH_AT + 6h`; with no approved policy it must say nothing can be claimed.
10. Check the homepage, collection and creature pages on phone, tablet and desktop widths.

## 4. Testing

`npm test` runs the whole suite (see the README for the current count), including tracker, claims, routes, remediation (Token-2022, wrong mint, egg boundaries, evolution boundaries, concurrent hatch, database failure, RPC 429, shared rate limits, artwork rendering) and progression tests.

`TEST_DATABASE_URL=postgres://… npm test` also runs `postgres.integration.test.ts` against a real PostgreSQL server: clean migration (applied twice), tracking with concurrent syncs and hatches, and concurrent claims within a budget. It is skipped when the variable is unset.

They run against an embedded Postgres (PGlite, the same SQL as production) and a fixture chain that answers the same RPC methods and shapes. Time-based behaviour uses a simulated clock. They cover your list:

1. Reaching 1,000,000 without a connection.
2. Automatic detection.
3. Multiple token accounts.
4. Below and above each million.
5. The 1-minute first egg, fully grown at 2 minutes.
6. The 5-minute second egg and 5-minute second growth.
7. 15 min / 1 h / 6 h / 12 h.
8. Restarts.
9. Duplicate events and concurrent workers.
10. Transfers, splits, sell-and-rebuy and multi-leg transactions.
11. Claims closed for 6 h.
12. Claims opening at 6 h.
13. Ownership verification (wrong wallet, replayed, expired and mismatched nonces, forged sessions).
14. Duplicate claims, including concurrent ones and a constraint check.
15. Existing rarity, roll and hatch rules.

They also cover RPC outages, delayed indexing, missed webhooks, closed accounts, frozen accounts and exclusions.

`npm run dev:fixtures` runs the site locally against fixture holders, with a "Fixture data" banner. It refuses to start in production.

## 5. Limitations (honest)

- **Never run against mainnet.** The fixture chain mirrors the RPC shapes, but real providers differ in pagination limits, rate limits and `getProgramAccounts` support. Do the go-live checklist on a staging deployment first.
- **People are not wallets.** On-chain data can't tell whether two wallets belong to one person. Credit stops the *same tokens* earning twice through transfers. But someone can sell into a pool from one wallet and buy from another, and that looks exactly like a new buyer. Only identity checks (out of scope) could close this.
- **History starts when tracking starts.** Transfers before the first snapshot are not replayed. Holders at that moment start with no credit.
- **Program-controlled wallets are excluded.** This includes multisig vaults (e.g. Squads). Set `SOLANITES_EXCLUDE_PROGRAM_OWNERS=false` if they should earn; pool addresses must then be listed explicitly.
- **Out-of-order processing.** Within one wallet, transactions are applied in slot order. Across wallets, a webhook can occasionally apply a later transaction before an earlier one is seen. Awards then wait for the next sync (they never over-award), and reconciliation catches up.
- **Very active wallets.** If a wallet has more than 500 new signatures per account in one sync, its award is postponed and the sync retries. A provider with enhanced history makes this rarer.
- **Rate limits fall back to per-instance memory** only while the database is unreachable.
- **Rarity is sealed on the server, not provable.** The species is rolled with a server-generated seed when the egg is earned and cannot be rerolled, but holders cannot verify the roll independently. A commit-reveal scheme (publish a hash of the seed when the egg is issued, reveal it at hatch) would make it verifiable; it needs your approval.
- **Creature evolution** counts qualifying holding since hatching from the recorded on-chain balance history: the k-th hatched creature (oldest first) grows only while the balance is at least k × 1,000,000. A sale is applied once its transaction is ingested; until then the creature may briefly show more growth, which is corrected on the next view.
- **Claim payouts are not implemented**, and no refund policy exists. Nothing on the site describes a refund as automatic or guaranteed.

## 6. Decisions needed from you

1. **The official mint address** and the **excluded addresses**.
2. **Incubation mode:** sequential (implemented default) or parallel. In sequential mode, a 10M holder's ten eggs are all hatched after about 2.8 days (1 min + 5 min + 15 min + 1 h + 6 h + 5 × 12 h = 67 h 21 min); in parallel mode, all within 12 hours.
3. **Fee refund policy** (all currently undefined):
   - which fees are refunded and how they are measured;
   - rate or formula and per-wallet cap;
   - payout currency and source wallet;
   - total budget, and what happens if claims exceed it;
   - holding requirement and whether selling forfeits the refund;
   - eligible window and claim deadline;
   - claim once or repeatedly;
   - payout approval process.
4. **Payout execution** (explicit authorisation required): a dedicated, limited-funds wallet with multisig-approved batches. Signing keys stay off Vercel and out of the frontend. Payout signatures are recorded on the claim (`payout_signature`, unique).
5. **Hosting:** keep the GitHub Actions schedule (Hobby), or move to Vercel Pro for a 10-minute Vercel Cron.
6. **Tokenomics confirmation:** 1,000,000 $SLNT per egg and 1,000,000,000 supply, as configured.
7. **Ascension ranks** after Ascended (8 h, 24 h, 3 d, 7 d, 30 d) are a proposal.
8. **Holder rewards**, if any, are a separate programme from fee refunds and need their own rules.
9. **Rarity verifiability:** whether to add the commit-reveal scheme above.
10. **Token ticker:** confirmed as `$SLNT` (`gameConfig.token.symbol`, display only). Tracking never uses the name, only `SOLANITES_MINT`; the mint address itself is still to be provided.
11. **Early progression:** confirm the incubation (1 min → 12 h) and growing-up (1 min → 6 h) schedules, and that Evolved/Ascended and the Ascension ranks should count from maturity.

## 7. Holder distribution (planned, not implemented)

**Rule shown on `/claims`:** two hours after the official launch, the locked developer supply
allocated for redistribution is divided equally among eligible holders
(`src/config/holderDistribution.ts`). Eligibility, the final amount and the process are marked
pending on the page.

**What exists today that it could build on**

- The tracker knows every holder's current verified balance (`holders`, `token_accounts`), with a
  full reconciliation of all token accounts of the mint, and a change log (`holder_changes`).
- Project wallets can be excluded (`SOLANITES_EXCLUDED_OWNERS`, off-curve owners).
- The launch time is server configuration (`SOLANITES_LAUNCH_AT`), hidden from public APIs until
  the launch is public.

**What is missing before it can work**

1. **The locked developer supply.** Nothing in the code identifies it: no lock or vesting
   account, amount or release mechanism. It needs the actual on-chain arrangement (a lock or
   vesting program, or a multisig wallet), and its address configured and excluded from eligibility.
2. **Eligibility rules.** With an equal share per wallet, splitting holdings across many wallets
   multiplies the payout, so the rules need a minimum balance (and possibly a minimum holding time)
   plus a decision on how to treat obvious splits. Pools, exchanges and project wallets must be excluded.
3. **A snapshot at exactly launch + 2 h.** The tracker keeps current balances, not balances at a
   chosen moment, and the scheduler runs every 10 minutes at best (GitHub Actions, not configured
   yet) or once a day (Vercel Hobby cron). It needs a snapshot job pinned to a finalized slot at the
   two-hour mark, stored immutably and published (for example as a list with a hash) so holders
   can check it.
4. **Payout.** Nothing sends tokens. It needs a signing process that keeps keys off the web server
   (a multisig approving a batch, or a distribution or claim program), retry-safe batching,
   transaction fees, and a record per wallet.
5. **Published terms.** The page must keep eligibility, the amount and the process marked pending
   until they are decided and published.

