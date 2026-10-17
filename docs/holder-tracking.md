# Holder tracking and rewards: audit, architecture and plan

Status: **Phase 1 (audit) done; Phase 2 (read-only lookup with live balance verification) implemented.** Phases 3–7 are planned below and **not built yet**.

## 1. Audit of the existing project (Phase 1)

| Area | What exists | Real or simulated |
|---|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript, Tailwind 4 | Real |
| Hosting | Vercel (`solanites.vercel.app`) deploys `main`; all pages are static | Real |
| Backend / API routes | None before this change | — |
| Database | None | — |
| Scheduler / worker | None | — |
| Token mint | **Not configured anywhere.** Not in code, env template, or repo history | **Missing — needed from you** |
| Wallet | Demo wallet (fake address, mock 52,000 balance); experimental browser-extension connect | Demo is simulated; extension connect is real but unverified |
| Balances | Mock slider; experimental path read RPC **from the browser** using `NEXT_PUBLIC_SOLANA_RPC_URL` | Simulated / insecure (see below) |
| Eggs, incubation, evolution, rarity | `lib/progression.ts` + `localStorage` + simulated clock | Simulated |
| Leaderboard | Deterministic fake data | Simulated |

**Problems found and fixed in Phase 2**

- The experimental wallet path called Solana RPC from the browser using a `NEXT_PUBLIC_` URL. Any RPC API key put there would have been shipped to every visitor. It also used floating-point `uiAmount`, and showed a balance of 0 when the RPC failed. It now goes through the server endpoint below, and the public RPC/mint variables have been removed.

**What I need from you**

1. **The official token mint address.** I won't guess it from a symbol or name. Until it is set, lookups answer "not configured".
2. **An RPC provider account** (Helius recommended, see §3) and its HTTPS endpoint with key.
3. **Addresses to exclude** from eggs and rewards: treasury, team, liquidity pool(s), the rewards reserve, burn address, known exchange wallets.
4. Later phases: a Postgres database, a scheduler decision (§3), and the policy decisions in §5.

## 2. What Phase 2 does

`GET /api/wallet/:address` reads one wallet's balance from Solana on the server, with no wallet connection. The Hatchery entry screen has a **Check a wallet** panel that uses it.

- **Address validation.** The address must be base58 and decode to exactly 32 bytes. Program-derived addresses are accepted, because they can own tokens too.
- **Mint verification.** The configured mint is read from chain and must be owned by the **SPL Token or Token-2022** program; the program is detected, not assumed. Decimals are read from the mint.
- **Balance.** `getTokenAccountsByOwner`, filtered by the mint's own program, then by mint. Every account returned is re-checked (mint, owner, program, decimals) and de-duplicated, so a faulty provider can't inflate a balance. All of a wallet's token accounts are summed.
- **Precision.** All amounts are `bigint` base units. Decimal strings are produced only for display, and there are no floats in anything authoritative.
- **Frozen accounts** are shown but not counted toward eligibility.
- **Egg eligibility.** `min(6, floor(balance / 10,000 tokens))`, using the existing game config. Addresses on the excluded list get no eggs.
- **Source labelling.** Every response gives the commitment level, the slot it was read at, the time, and whether it came from the 15-second cache. Holding duration and rewards are reported as `not_tracked` / `not_available`, never estimated.
- **Failure handling.** On an RPC outage the client retries with backoff, then returns **503** with no balance at all; it never shows a fabricated zero. An invalid address gives 400, a missing mint 503, and too many requests 429.
- **Secrets.** The RPC URL is never logged and never sent to the browser.

### Known limits of Phase 2

- **Rate limiting is per server instance** (in-memory). It stops casual abuse; use a shared store (Upstash Redis) for a hard limit.
- **Lookups use `confirmed` commitment.** Phase 3 snapshots should use `finalized`.
- **The game is still simulated.** The rest of the Hatchery (eggs, incubation, evolution) still runs on the demo wallet. The lookup shows real eligibility but doesn't drive the simulation.
- **Not tested against real Solana.** It was tested against a scripted fake RPC that returns the same `jsonParsed` shapes. The development sandbox blocks outbound RPC, so it has not yet been run against mainnet. Do that first, once the mint and RPC are configured.

## 3. Target architecture

```
                 ┌───────────────── Vercel (Next.js) ───────────────────┐
 Browser ──────► │ pages (static)                                         │
                 │ GET /api/wallet/:address   read-only lookup (Phase 2)  │
                 │ POST /api/cron/sync        snapshot job  (Phase 3)     │──► Solana RPC / indexer
                 │ POST /api/webhooks/helius  transfer events (Phase 3)   │      (Helius etc.)
                 │ POST /api/auth/siws/*      ownership proof (Phase 6)   │
                 └──────────────┬─────────────────────────────────────────┘
                                │
                         Postgres (Neon / Supabase)
                                │
             Distribution signer (Phase 7) — separate, NOT on Vercel,
             holds no keys in env; Squads multisig approves each batch
```

- **RPC / indexer.** Helius is recommended: `getTokenAccounts` by mint (paginated, works for Token-2022) for holder discovery, and enhanced transaction history plus webhooks for transfers. Holder discovery needs `getProgramAccounts`-class queries, which the public RPC does not serve reliably. The code keeps the provider behind a small interface, so another provider can be swapped in.
- **Database.** Postgres via the Vercel Marketplace (Neon) or Supabase. Phase 3 needs it.
- **Scheduler.** A serverless frontend can't run continuous monitoring. The smallest reliable setup:
  - **Vercel Cron**, calling `/api/cron/sync` every 10–15 minutes (needs the **Pro plan**; Hobby cron runs at most once a day).
  - A **provider webhook** for near-real-time transfers.
  - A **daily `finalized` reconciliation** that re-reads every tracked holder.
  
  If you stay on Hobby, a GitHub Actions schedule calling the same endpoint with `CRON_SECRET` works. Its timing is best-effort.

## 4. Planned data model (Phase 3+)

- `wallets(address PK, first_seen_at, excluded bool)`
- `token_accounts(address PK, owner, mint, program, opened_slot, closed_slot)`: tracks open, close and reopen.
- `sync_runs(id, kind, started_at, finished_at, status, slot, error)`: monitoring and outage detection.
- `balance_snapshots(owner, slot, observed_at, amount_base numeric(40,0), commitment, sync_run_id, UNIQUE(owner, sync_run_id))`
- `transfer_events(signature, ix_index, slot, block_time, from_owner, to_owner, amount_base, UNIQUE(signature, ix_index))`: replays are no-ops.
- `holding_periods(owner, started_at, started_slot, ended_at, ended_slot, min_amount_base, verification enum('tracked','reconstructed','unverified'))`
- `reward_periods(id, starts_at, ends_at, budget_base, rules_json, status enum('draft','calculated','approved','distributed'), UNIQUE(starts_at, ends_at))`
- `reward_allocations(period_id, owner, weight, amount_base, UNIQUE(period_id, owner))`, plus `distribution_records(period_id, owner, tx_signature UNIQUE, status)`
- `siws_nonces(nonce PK, address, domain, issued_at, expires_at, used_at)`: single use.
- `audit_log(id, at, actor, action, details_json)`

Calculations run inside database transactions. A period is claimed with `SELECT … FOR UPDATE` or a status compare-and-swap, so two concurrent runs can't both process it.

## 5. Holding policy: proposed defaults (you decide)

These are configurable. Nothing is final until you approve them.

| Question | Proposed default |
|---|---|
| Start of history | Tracking starts when Phase 3 goes live. Earlier holding counts only if it can be reconstructed from indexed transfer history, and is labelled **reconstructed**. Otherwise the wallet is **unverified before tracking start**. |
| What counts as held | The **minimum** balance seen across consecutive finalized snapshots (and transfers, if indexed). A partial sale lowers only the counted quantity; it does not reset everything. |
| Drop below 10,000 | The qualifying streak ends. A new streak starts at the next qualifying observation. |
| Sell, then buy back | Treated as a new streak, never stitched to the old one. |
| Gaps (provider outage) | A gap longer than 2× the sync interval is marked **unverified** and is not counted as held. Nothing is fabricated to fill it. |
| Several token accounts | Summed per owner, as in Phase 2. |
| Transfers between your own wallets | Treated as separate wallets (they can't be linked without proof). This can be revisited with signed wallet linking in Phase 6. |
| Excluded addresses | Never eligible. |

**Reward weight (Phase 5, dry run only).** `weight = counted_balance × multiplier(qualifying_days)`. The multiplier is a configurable step table. The budget (proposed 500,000 tokens, 5% of supply) is split proportionally in integer base units. Remainders go to the reserve, so the total never exceeds the budget. Every run is recorded for audit, and there are no transfers until Phase 7 is approved.

## 6. Remaining phases

| Phase | Builds | Needs from you |
|---|---|---|
| 3 | DB schema and migrations, cron sync, finalized snapshots, transfer ingestion (idempotent), holding periods, sync monitoring | Mint, RPC/indexer, Postgres, scheduler choice, §5 policy |
| 4 | Hatchery shows verified holding duration and real egg progress for a looked-up address, clearly separated from the demo | Phase 3 |
| 5 | Reward engine (dry run), auditable calculations, concurrency-safe period locking | Multiplier table, period length, budget |
| 6 | Wallet adapter, Sign-In With Solana (nonce, expiry, domain), server-side ed25519 verification, replay protection | Domain |
| 7 | Gated distribution: multisig-approved batches, dedicated reward wallet with limited funding, signature recording | Your explicit approval of funding and rules |

The rewards model is a **possible** allocation from a developer-funded reserve. It is not a promise of returns or value, and it does not change the token's mechanics (no taxes or transfer hooks).
