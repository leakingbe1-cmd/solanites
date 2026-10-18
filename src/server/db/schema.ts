import type { Db } from "./types";

/**
 * Database schema. Times are epoch milliseconds from the server clock
 * (bigint); token amounts are exact base units (numeric(40,0)).
 *
 * Duplicate protection lives in constraints, not just application code:
 *   eggs UNIQUE(owner, sequence)        one egg per sequence number per wallet
 *   processed_transactions PK signature  a transaction is applied once
 *   fee_claims UNIQUE(claimant, period)  one claim per wallet per period
 *   fee_claims UNIQUE(payout_signature)  a payout transaction is recorded once
 */
export const SCHEMA_VERSION = 1;

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS schema_migrations (version int PRIMARY KEY, applied_ms bigint NOT NULL)`,

  // Tracker bookkeeping: tracking start slot, cached mint decimals, the sync lease.
  `CREATE TABLE IF NOT EXISTS tracker_state (key text PRIMARY KEY, value text NOT NULL)`,

  // One row per wallet (token-account owner) the tracker has seen.
  `CREATE TABLE IF NOT EXISTS holders (
    owner text PRIMARY KEY,
    source text NOT NULL CHECK (source IN ('chain', 'fixture')),
    excluded boolean NOT NULL DEFAULT false,
    balance_base numeric(40,0) NOT NULL DEFAULT 0,
    frozen_base numeric(40,0) NOT NULL DEFAULT 0,
    -- Tokens in this wallet that have already earned an egg (here or in a wallet they came from).
    credit_base numeric(40,0) NOT NULL DEFAULT 0 CHECK (credit_base >= 0),
    eggs_earned int NOT NULL DEFAULT 0 CHECK (eggs_earned >= 0),
    first_seen_ms bigint NOT NULL,
    first_qualified_ms bigint,
    balance_slot bigint NOT NULL DEFAULT 0,
    balance_observed_ms bigint,
    needs_sync boolean NOT NULL DEFAULT true,
    last_sync_ms bigint,
    last_sync_error text
  )`,
  `CREATE INDEX IF NOT EXISTS holders_needs_sync ON holders (needs_sync) WHERE needs_sync`,

  `CREATE TABLE IF NOT EXISTS token_accounts (
    address text PRIMARY KEY,
    owner text NOT NULL,
    amount_base numeric(40,0) NOT NULL DEFAULT 0,
    state text NOT NULL DEFAULT 'initialized',
    closed boolean NOT NULL DEFAULT false,
    last_seen_slot bigint NOT NULL DEFAULT 0,
    -- Newest signature already ingested for this account, so history is fetched incrementally.
    sig_cursor text,
    sig_cursor_slot bigint NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS token_accounts_owner ON token_accounts (owner)`,

  `CREATE TABLE IF NOT EXISTS processed_transactions (
    signature text PRIMARY KEY,
    slot bigint NOT NULL,
    block_time_ms bigint,
    failed boolean NOT NULL,
    processed_ms bigint NOT NULL,
    credit_moved_base numeric(40,0) NOT NULL DEFAULT 0
  )`,

  // Per-wallet balance change in each processed transaction: the holding history.
  `CREATE TABLE IF NOT EXISTS holder_changes (
    signature text NOT NULL REFERENCES processed_transactions (signature),
    owner text NOT NULL,
    slot bigint NOT NULL,
    pre_base numeric(40,0) NOT NULL,
    post_base numeric(40,0) NOT NULL,
    credit_before numeric(40,0) NOT NULL,
    credit_after numeric(40,0) NOT NULL,
    PRIMARY KEY (signature, owner)
  )`,
  `CREATE INDEX IF NOT EXISTS holder_changes_owner ON holder_changes (owner, slot)`,

  `CREATE TABLE IF NOT EXISTS eggs (
    id text PRIMARY KEY,
    owner text NOT NULL REFERENCES holders (owner),
    sequence int NOT NULL CHECK (sequence >= 1),
    source text NOT NULL CHECK (source IN ('chain', 'fixture')),
    earned_ms bigint NOT NULL,
    earned_slot bigint NOT NULL,
    incubation_started_ms bigint NOT NULL,
    incubation_ms bigint NOT NULL CHECK (incubation_ms >= 0),
    ready_ms bigint NOT NULL,
    seed bigint NOT NULL,
    species_id text NOT NULL,
    hatched_ms bigint,
    UNIQUE (owner, sequence)
  )`,

  `CREATE TABLE IF NOT EXISTS sync_runs (
    id bigserial PRIMARY KEY,
    kind text NOT NULL,
    started_ms bigint NOT NULL,
    finished_ms bigint,
    status text NOT NULL,
    slot bigint,
    holders_seen int NOT NULL DEFAULT 0,
    owners_synced int NOT NULL DEFAULT 0,
    eggs_issued int NOT NULL DEFAULT 0,
    error text
  )`,

  `CREATE TABLE IF NOT EXISTS claim_nonces (
    nonce text PRIMARY KEY,
    address text NOT NULL,
    message text NOT NULL,
    issued_ms bigint NOT NULL,
    expires_ms bigint NOT NULL,
    used_ms bigint
  )`,

  `CREATE TABLE IF NOT EXISTS fee_claims (
    id text PRIMARY KEY,
    claimant text NOT NULL,
    period_id text NOT NULL,
    amount_base numeric(40,0) NOT NULL CHECK (amount_base > 0),
    payout_asset text NOT NULL,
    calculation text NOT NULL,
    status text NOT NULL CHECK (status IN ('pending_payout', 'paid', 'rejected')),
    created_ms bigint NOT NULL,
    updated_ms bigint NOT NULL,
    payout_signature text UNIQUE,
    UNIQUE (claimant, period_id)
  )`,

  // Shared rate-limit counters (fixed windows), so limits hold across serverless instances.
  `CREATE TABLE IF NOT EXISTS rate_limits (
    bucket text NOT NULL,
    key text NOT NULL,
    window_start bigint NOT NULL,
    count int NOT NULL,
    PRIMARY KEY (bucket, key, window_start)
  )`,

  // Budget per claim period: claimed_base can never exceed budget_base.
  `CREATE TABLE IF NOT EXISTS claim_periods (
    period_id text PRIMARY KEY,
    budget_base numeric(40,0) NOT NULL CHECK (budget_base >= 0),
    claimed_base numeric(40,0) NOT NULL DEFAULT 0,
    CHECK (claimed_base <= budget_base)
  )`,

  `CREATE TABLE IF NOT EXISTS audit_log (
    id bigserial PRIMARY KEY,
    at_ms bigint NOT NULL,
    actor text NOT NULL,
    action text NOT NULL,
    details text NOT NULL
  )`,
];

/** Creates or upgrades the schema. Safe to run repeatedly. */
export async function migrate(db: Db, now: () => number = Date.now): Promise<void> {
  await db.tx(async (sql) => {
    for (const s of STATEMENTS) await sql.query(s);
    await sql.query(`INSERT INTO schema_migrations (version, applied_ms) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING`, [SCHEMA_VERSION, now()]);
  });
}
