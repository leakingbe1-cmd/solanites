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
- `incubationScheduleMs: [5 min, 6 h, 24 h, 48 h, 72 h]`: the last value repeats for egg 5 onwards.
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
| `SOLANITES_MINT` | The official SOLITE mint. **Not invented: you must provide it.** |
| `SOLANA_RPC_URL` | Provider endpoint with key (Helius recommended: `getProgramAccounts`, history, webhooks). Server-only. |
| `DATABASE_URL` | Postgres (Neon via Vercel Marketplace, or Supabase). The schema is created automatically. |
| `SOLANITES_EXCLUDED_OWNERS` | Treasury, team, LP, reserve, burn and exchange wallets (on-curve ones; off-curve pool PDAs are excluded automatically). |
| `CRON_SECRET` + a scheduler | Vercel Cron on the **Pro** plan (Hobby runs at most daily), or a GitHub Actions schedule calling `/api/cron/sync` every 5–10 minutes. |
| `SOLANITES_WEBHOOK_SECRET` | For a Helius (or similar) webhook on the mint pointing to `/api/webhooks/solana`. |
| `SOLANITES_LAUNCH_AT`, `SIWS_DOMAIN`, `SOLANITES_SESSION_SECRET` | Claims timing and sign-in. |

No `vercel.json` cron was added: on the Hobby plan a sub-daily cron fails the deploy. Example GitHub Actions schedule:

```yaml
on: { schedule: [{ cron: "*/10 * * * *" }] }
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" https://solanites.vercel.app/api/cron/sync
```

**Go-live checklist**

1. Set the variables above.
2. Run the first sync once and review the holders and eggs it creates.
3. Check the excluded list against the top holders (pool, treasury).
4. Point the webhook at the mint.
5. Verify a known wallet's balance against Solscan.

## 4. Testing

`npm test` runs 103 tests:
- Phase 2: 40.
- Tracker: 37.
- Claims: 12.
- Routes: 9.
- Progression: 5.

They run against an embedded Postgres (PGlite, the same SQL as production) and a fixture chain that answers the same RPC methods and shapes. Time-based behaviour uses a simulated clock. They cover your list:

1. Reaching 1,000,000 without a connection.
2. Automatic detection.
3. Multiple token accounts.
4. Below and above each million.
5. The 5-minute first egg.
6. The 6-hour second egg.
7. 24 h / 48 h / 72 h.
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
- **Rate limits are per server instance** (in-memory). Use a shared store for hard limits.
- **Creature evolution** counts qualifying holding since hatching from the recorded on-chain balance history: the k-th hatched creature (oldest first) grows only while the balance is at least k × 1,000,000. A sale is applied once its transaction is ingested; until then the creature may briefly show more growth, which is corrected on the next view.
- **Claim payouts are not implemented**, and no refund policy exists. Nothing on the site describes a refund as automatic or guaranteed.

## 6. Decisions needed from you

1. **The official mint address** and the **excluded addresses**.
2. **Incubation mode:** sequential (implemented default) or parallel. In sequential mode, a 10M holder's eggs arrive over about 21 days; in parallel mode, all within 72 hours.
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
5. **Hosting:** Vercel Pro for frequent cron, or an external scheduler.
