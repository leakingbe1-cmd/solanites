import { eggProgression, eggStatusAt, fastTrackAfterMaturityMs, initialGrowthMsFor, isFastTrack, scheduleEgg, type EggProgressionConfig } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { evolutionOf, rarityChances, rollSpecies } from "@/lib/progression";
import { hashString } from "@/lib/rng";
import { SPECIES, SPECIES_BY_ID } from "@/lib/species";
import type { Proof } from "@/shared/proof";
import type { HatchResult, TrackedEgg, TrackedHolderView } from "@/shared/trackedHolder";
import { formatBaseUnits, wholeTokensToBase } from "../amounts";
import type { Db, Sql } from "../db/types";
import { isOnCurve } from "../solana/curve";
import { fetchMintTokenAccounts, fetchSignaturesSince, fetchTransactionEffect, TransactionNotAvailableError, type SignatureInfo } from "../solana/history";
import { RpcUnavailableError, type Commitment, type RpcClient } from "../solana/rpc";
import { fetchMintInfo, fetchOwnerBalance, type MintInfo } from "../solana/token";
import { log } from "../log";
import { pruneRateLimits } from "../rateLimitShared";
import { continuousHoldingMs } from "../leaderboard/rank";
import { qualifyingMs } from "./growth";
import { applyTransferCredit, eggsToAward } from "./ledger";

/** What the public holder view says about a failed sync; the raw error stays in the database and logs. */
const PUBLIC_SYNC_ERROR = "The last update for this address didn't complete. It will retry automatically.";

/** Safety cap on signatures listed per token account in one pass (listing only; processing has its own budget). */
const HISTORY_LISTING_CAP = 50_000;

/** Eggs and holding history only ever use finalized data, so a rolled-back block can't award an egg. */
const COMMITMENT: Commitment = "finalized";

export interface TrackerConfig {
  mint: string;
  /** Treasury, team, liquidity pools, reward reserve, burn and exchange wallets. */
  excludedOwners: Set<string>;
  /** Also exclude program-controlled owners (off-curve addresses such as pool authorities and vaults). */
  excludeOffCurveOwners: boolean;
  source: "chain" | "fixture";
  /** Transactions processed per wallet per sync; a longer history continues, oldest first, on the next sync. */
  maxSignaturesPerAccount: number;
  /** Signatures listed per token account in one pass (default 50,000); only lowered in tests. */
  historyListingCap?: number;
  progression: EggProgressionConfig;
}

export interface TrackerDeps {
  db: Db;
  rpc: RpcClient;
  config: TrackerConfig;
  now?: () => number;
  randomSeed?: () => number;
}

export interface SyncOwnerResult {
  owner: string;
  complete: boolean;
  eggsIssued: number;
  balanceBase: bigint;
  slot: number;
  note?: string;
}

export interface SyncRunResult {
  /** "partial": the pass completed but some wallets failed and will be retried next run. */
  status: "ok" | "partial" | "failed" | "skipped";
  discovered: boolean;
  ownersSynced: number;
  eggsIssued: number;
  errors: string[];
}

interface HolderRow {
  owner: string;
  source: "chain" | "fixture";
  excluded: boolean;
  balance_base: string;
  frozen_base: string;
  credit_base: string;
  eggs_earned: number;
  first_qualified_ms: string | null;
  balance_slot: string;
  balance_observed_ms: string | null;
  needs_sync: boolean;
  last_sync_ms: string | null;
  last_sync_error: string | null;
}

interface EggRow {
  id: string;
  sequence: number;
  earned_ms: string;
  incubation_started_ms: string;
  incubation_ms: string;
  ready_ms: string;
  species_id: string;
  hatched_ms: string | null;
  maturity_ms: string | null;
  fast_track: boolean;
}

const num = (v: string | number | null): number | null => (v === null ? null : Number(v));

function defaultSeed(): number {
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
}

export function createTracker({ db, rpc, config, now = Date.now, randomSeed = defaultSeed }: TrackerDeps) {
  let mintCache: { info: MintInfo; at: number } | null = null;

  const isExcluded = (owner: string) => config.excludedOwners.has(owner) || (config.excludeOffCurveOwners && !isOnCurve(owner));

  async function mint(): Promise<MintInfo> {
    if (mintCache && now() - mintCache.at < 10 * 60_000) return mintCache.info;
    const info = await fetchMintInfo(rpc, config.mint, COMMITMENT);
    mintCache = { info, at: now() };
    await setState("mint_decimals", String(info.decimals));
    // The configured supply is display-only, but a mismatch usually means the wrong mint or wrong figures.
    const expected = wholeTokensToBase(config.progression.totalSupply, info.decimals);
    await setState("mint_supply_matches_config", String(info.supply === expected));
    if (info.supply !== expected) log.warn("mint.supply_mismatch", { configuredWholeTokens: config.progression.totalSupply, onChainBase: info.supply.toString(), decimals: info.decimals });
    return info;
  }

  async function getState(key: string, sql: Sql = db): Promise<string | null> {
    const r = await sql.query<{ value: string }>(`SELECT value FROM tracker_state WHERE key = $1`, [key]);
    return r.rows[0]?.value ?? null;
  }

  async function setState(key: string, value: string, onlyIfMissing = false, sql: Sql = db) {
    await sql.query(
      `INSERT INTO tracker_state (key, value) VALUES ($1, $2) ON CONFLICT (key) DO ${onlyIfMissing ? "NOTHING" : "UPDATE SET value = EXCLUDED.value"}`,
      [key, value],
    );
  }

  async function ensureHolder(sql: Sql, owner: string) {
    const excluded = isExcluded(owner);
    await sql.query(
      `INSERT INTO holders (owner, source, excluded, first_seen_ms, needs_sync) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (owner) DO NOTHING`,
      [owner, config.source, excluded, now(), !excluded],
    );
  }

  /** Slot from which holding history counts. Earlier history is not replayed. */
  async function trackingStartSlot(fallback: number): Promise<number> {
    await setState("tracking_start_slot", String(fallback), true);
    return Number(await getState("tracking_start_slot"));
  }

  /**
   * Reconciliation snapshot: every token account of the mint. Marks wallets
   * whose accounts changed (or that are new) for a targeted sync.
   */
  async function discover(): Promise<{ slot: number; accounts: number; owners: number; changed: number }> {
    const m = await mint();
    const snap = await fetchMintTokenAccounts(rpc, m, COMMITMENT);
    await trackingStartSlot(snap.slot);
    const changed = new Set<string>();
    // Only wallets holding a positive balance are holders. Pump.fun mints leave many empty
    // accounts behind; tracking them would inflate the holder count and cost a sync round each.
    // Known holders whose accounts drain still get needs_sync below, so credit can move.
    const owners = new Set(snap.accounts.filter((a) => a.amount > 0n).map((a) => a.owner));
    await db.tx(async (sql) => {
      const existing = new Map(
        (await sql.query<{ address: string; owner: string; amount_base: string; state: string; closed: boolean }>(`SELECT address, owner, amount_base, state, closed FROM token_accounts`)).rows.map((r) => [r.address, r]),
      );
      for (const a of snap.accounts) {
        const prev = existing.get(a.address);
        // Never-seen empty accounts (most of a pump.fun mint's) carry nothing to track; skipping them
        // keeps the first discovery within the cron's time limit on networked Postgres.
        if (!prev && a.amount === 0n) continue;
        if (prev && !prev.closed && prev.owner === a.owner && BigInt(prev.amount_base) === a.amount && prev.state === a.state) continue;
        changed.add(a.owner);
        if (prev && prev.owner !== a.owner) changed.add(prev.owner);
        await sql.query(
          `INSERT INTO token_accounts (address, owner, amount_base, state, closed, last_seen_slot) VALUES ($1, $2, $3, $4, false, $5)
           ON CONFLICT (address) DO UPDATE SET owner = EXCLUDED.owner, amount_base = EXCLUDED.amount_base, state = EXCLUDED.state, closed = false, last_seen_slot = EXCLUDED.last_seen_slot`,
          [a.address, a.owner, a.amount.toString(), a.state, snap.slot],
        );
      }
      const present = new Set(snap.accounts.map((a) => a.address));
      for (const [address, prev] of existing) {
        if (prev.closed || present.has(address)) continue;
        changed.add(prev.owner);
        await sql.query(`UPDATE token_accounts SET closed = true, amount_base = 0, last_seen_slot = $2 WHERE address = $1`, [address, snap.slot]);
      }
      for (const o of owners) await ensureHolder(sql, o);
      if (changed.size) await sql.query(`UPDATE holders SET needs_sync = true WHERE owner = ANY($1) AND NOT excluded`, [[...changed]]);
    });
    await setState("last_discovery_ms", String(now()));
    return { slot: snap.slot, accounts: snap.accounts.length, owners: owners.size, changed: changed.size };
  }

  /**
   * Applies one transaction's balance changes to egg credit. Idempotent: a
   * signature is recorded in the same database transaction as its effects,
   * so replays, retries and duplicate webhooks are no-ops.
   */
  async function processTransaction(signature: string): Promise<{ applied: boolean; owners: string[] }> {
    const done = await db.query(`SELECT 1 FROM processed_transactions WHERE signature = $1`, [signature]);
    if (done.rows.length) return { applied: false, owners: [] };
    const m = await mint();
    const effect = await fetchTransactionEffect(rpc, signature, m, COMMITMENT);
    return db.tx(async (sql) => {
      const ins = await sql.query(
        `INSERT INTO processed_transactions (signature, slot, block_time_ms, failed, processed_ms) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (signature) DO NOTHING RETURNING signature`,
        [signature, effect.slot, effect.blockTimeMs, effect.failed, now()],
      );
      if (!ins.rows.length) return { applied: false, owners: [] };
      for (const a of effect.accounts) {
        await sql.query(`INSERT INTO token_accounts (address, owner, last_seen_slot) VALUES ($1, $2, $3) ON CONFLICT (address) DO NOTHING`, [a.address, a.owner, effect.slot]);
      }
      if (effect.failed || !effect.owners.length) return { applied: true, owners: [] };
      const owners = effect.owners.map((o) => o.owner).sort();
      for (const o of owners) await ensureHolder(sql, o);
      // Lock in a fixed order so concurrent workers can't deadlock.
      const rows = await sql.query<{ owner: string; credit_base: string; excluded: boolean }>(
        `SELECT owner, credit_base, excluded FROM holders WHERE owner = ANY($1) ORDER BY owner FOR UPDATE`,
        [owners],
      );
      const holders = new Map(rows.rows.map((r) => [r.owner, { credit: BigInt(r.credit_base), excluded: r.excluded }]));
      const { changes, moved } = applyTransferCredit(effect.owners, holders);
      for (const c of changes) {
        const mv = effect.owners.find((o) => o.owner === c.owner)!;
        await sql.query(`UPDATE holders SET credit_base = $2, needs_sync = NOT excluded WHERE owner = $1`, [c.owner, c.after.toString()]);
        await sql.query(
          `INSERT INTO holder_changes (signature, owner, slot, pre_base, post_base, credit_before, credit_after) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [signature, c.owner, effect.slot, mv.preBase.toString(), mv.postBase.toString(), c.before.toString(), c.after.toString()],
        );
      }
      if (moved > 0n) await sql.query(`UPDATE processed_transactions SET credit_moved_base = $2 WHERE signature = $1`, [signature, moved.toString()]);
      return { applied: true, owners };
    });
  }

  /**
   * Brings one wallet up to date: verified balance (finalized), every
   * transaction up to that slot, then egg awards — all for the same slot.
   * If history can't be read completely, nothing is awarded this round.
   */
  async function syncOwner(owner: string): Promise<SyncOwnerResult> {
    const m = await mint();
    const bal = await fetchOwnerBalance(rpc, owner, m, COMMITMENT);
    const S = bal.slot;
    const startSlot = await trackingStartSlot(S);
    for (const a of bal.accounts) {
      await db.query(
        `INSERT INTO token_accounts (address, owner, amount_base, state, closed, last_seen_slot) VALUES ($1, $2, $3, $4, false, $5)
         ON CONFLICT (address) DO UPDATE SET owner = EXCLUDED.owner, amount_base = EXCLUDED.amount_base, state = EXCLUDED.state, closed = false, last_seen_slot = GREATEST(token_accounts.last_seen_slot, EXCLUDED.last_seen_slot)`,
        [a.address, owner, a.amount.toString(), a.state, S],
      );
    }
    const known = (await db.query<{ address: string; sig_cursor: string | null; sig_cursor_slot: string }>(`SELECT address, sig_cursor, sig_cursor_slot FROM token_accounts WHERE owner = $1`, [owner])).rows;

    let complete = true;
    // Each account's unprocessed history up to S, oldest first. Listing is cheap (one call per
    // 1,000 signatures), so it covers everything; processing is what the per-pass budget limits.
    // minContextSlot: S makes a node that hasn't reached the balance read refuse instead of
    // returning a list missing a transfer the balance already includes (that would double-award).
    const history = new Map<string, SignatureInfo[]>();
    for (const acc of known) {
      const res = await fetchSignaturesSince(rpc, acc.address, {
        until: acc.sig_cursor,
        minSlot: Math.max(startSlot, Number(acc.sig_cursor_slot)),
        commitment: COMMITMENT,
        maxSignatures: config.historyListingCap ?? HISTORY_LISTING_CAP,
        minContextSlot: S,
      });
      if (!res.complete) {
        // Older history can't be reached oldest-first. Hold the whole wallet back: processing its other
        // accounts alone would move credit ahead of this account's older transactions.
        complete = false;
        log.warn("history.too_long", { account: acc.address, listed: res.signatures.length });
        history.clear();
        break;
      }
      history.set(acc.address, res.signatures.filter((s) => s.slot <= S).reverse());
    }
    // Oldest first, so credit moves in the order it happened. The sort is stable, so each account keeps
    // its own order within a slot. A transaction touching two of the owner's accounts is processed once.
    const seen = new Set<string>();
    const ordered = [...history.values()].flat().sort((a, b) => a.slot - b.slot).filter((s) => !seen.has(s.signature) && seen.add(s.signature));
    // Process at most the budget this pass, extended to the end of a slot so a cursor never splits one.
    let end = Math.min(ordered.length, config.maxSignaturesPerAccount);
    while (end > 0 && end < ordered.length && ordered[end].slot === ordered[end - 1].slot) end++;
    if (end < ordered.length) complete = false;
    let done = 0;
    for (; done < end; done++) {
      try {
        await processTransaction(ordered[done].signature);
      } catch (e) {
        if (e instanceof TransactionNotAvailableError) {
          complete = false;
          break;
        }
        throw e;
      }
    }
    // Everything before the first unprocessed slot is done: move each account's cursor there, so the next
    // pass continues from it instead of re-reading the newest page. Re-processing a transaction is a no-op.
    const boundary = done < ordered.length ? ordered[done].slot : Infinity;
    for (const [address, sigs] of history) {
      const last = sigs.filter((s) => s.slot < boundary).at(-1);
      if (last) await db.query(`UPDATE token_accounts SET sig_cursor = $2, sig_cursor_slot = $3 WHERE address = $1 AND sig_cursor_slot <= $3`, [address, last.signature, last.slot]);
    }

    const t = now();
    return db.tx(async (sql) => {
      await ensureHolder(sql, owner);
      const row = (await sql.query<HolderRow>(`SELECT * FROM holders WHERE owner = $1 FOR UPDATE`, [owner])).rows[0];
      const base = { owner, balanceBase: bal.usable, slot: S };
      if (Number(row.balance_slot) > S) return { ...base, complete, eggsIssued: 0, note: "A newer balance was already recorded." };
      // Credit already reflects a later transaction than this balance: wait for a fresher read.
      const ahead = await sql.query(`SELECT 1 FROM holder_changes WHERE owner = $1 AND slot > $2 LIMIT 1`, [owner, S]);
      const canAward = complete && !ahead.rows.length;
      const unitBase = wholeTokensToBase(config.progression.tokensPerEgg, m.decimals);
      const n = canAward
        ? eggsToAward({ balance: bal.usable, credit: BigInt(row.credit_base), eggsEarned: row.eggs_earned, unitBase, cap: config.progression.maxEggsPerWallet, excluded: row.excluded })
        : 0;
      if (n > 0) {
        const last = await sql.query<{ ready_ms: string }>(`SELECT ready_ms FROM eggs WHERE owner = $1 ORDER BY sequence DESC LIMIT 1`, [owner]);
        let prevReady = last.rows.length ? Number(last.rows[0].ready_ms) : null;
        for (let k = 1; k <= n; k++) {
          const sequence = row.eggs_earned + k;
          const sch = scheduleEgg(sequence, t, prevReady, config.progression);
          const seed = randomSeed();
          // Plain INSERT: the UNIQUE(owner, sequence) constraint aborts the whole award if it would duplicate an egg.
          await sql.query(
            `INSERT INTO eggs (id, owner, sequence, source, earned_ms, earned_slot, incubation_started_ms, incubation_ms, ready_ms, seed, species_id, maturity_ms, fast_track) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            // The species (and so rarity) is rolled here, sealed, with the same odds for every egg: the fast track only changes timings.
            [`egg_${owner}_${sequence}`, owner, sequence, row.source, t, S, sch.incubationStartedAt, sch.incubationMs, sch.readyAt, seed, rollSpecies(seed, gameConfig, SPECIES), initialGrowthMsFor(sequence, config.progression), isFastTrack(sequence, config.progression)],
          );
          prevReady = sch.readyAt;
        }
        await sql.query(`INSERT INTO audit_log (at_ms, actor, action, details) VALUES ($1, 'tracker', 'eggs_issued', $2)`, [t, JSON.stringify({ owner, count: n, slot: S })]);
      }
      await sql.query(
        `UPDATE holders SET balance_base = $2, frozen_base = $3, balance_slot = $4, balance_observed_ms = $5, last_sync_ms = $5,
           needs_sync = $6, last_sync_error = $7,
           credit_base = credit_base + $8, eggs_earned = eggs_earned + $9,
           first_qualified_ms = CASE WHEN $9 > 0 AND first_qualified_ms IS NULL THEN $5 ELSE first_qualified_ms END
         WHERE owner = $1`,
        [owner, bal.usable.toString(), bal.frozen.toString(), S, t, !canAward && !row.excluded, complete ? null : "Transaction history is not complete yet; eggs will be checked on the next sync.", (unitBase * BigInt(n)).toString(), n],
      );
      return { ...base, complete, eggsIssued: n };
    });
  }

  /** Lease so overlapping scheduled runs don't do the same work twice. Correctness never depends on it. */
  async function takeLease(ms: number): Promise<boolean> {
    const r = await db.query(
      `INSERT INTO tracker_state (key, value) VALUES ('sync_lease', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE tracker_state.value::bigint < $2 RETURNING key`,
      [String(now() + ms), now()],
    );
    return r.rows.length > 0;
  }

  /** One scheduled pass: reconciliation snapshot when due, then wallets that need a sync, then re-verification of the oldest. */
  async function runSync(opts: { maxOwners?: number; reverify?: number; discoveryEveryMs?: number; force?: boolean } = {}): Promise<SyncRunResult> {
    const maxOwners = opts.maxOwners ?? 50;
    const reverify = opts.reverify ?? 10;
    if (!(await takeLease(5 * 60_000))) return { status: "skipped", discovered: false, ownersSynced: 0, eggsIssued: 0, errors: ["Another sync is running."] };
    const startedMs = now();
    const run = await db.query<{ id: string }>(`INSERT INTO sync_runs (kind, started_ms, status) VALUES ('scheduled', $1, 'running') RETURNING id`, [startedMs]);
    const runId = run.rows[0].id;
    const result: SyncRunResult = { status: "ok", discovered: false, ownersSynced: 0, eggsIssued: 0, errors: [] };
    let slot: number | null = null;
    try {
      const last = Number((await getState("last_discovery_ms")) ?? 0);
      if (opts.force || now() - last >= (opts.discoveryEveryMs ?? 10 * 60_000)) {
        slot = (await discover()).slot;
        result.discovered = true;
      }
      const due = await db.query<{ owner: string }>(`SELECT owner FROM holders WHERE needs_sync AND NOT excluded ORDER BY last_sync_ms ASC NULLS FIRST LIMIT $1`, [maxOwners]);
      const old = await db.query<{ owner: string }>(`SELECT owner FROM holders WHERE NOT needs_sync AND NOT excluded ORDER BY last_sync_ms ASC NULLS FIRST LIMIT $1`, [reverify]);
      for (const { owner } of [...due.rows, ...old.rows]) {
        try {
          const r = await syncOwner(owner);
          result.ownersSynced++;
          result.eggsIssued += r.eggsIssued;
        } catch (e) {
          if (e instanceof RpcUnavailableError) throw e;
          result.errors.push(`${owner}: ${(e as Error).message}`);
          await db.query(`UPDATE holders SET last_sync_error = $2 WHERE owner = $1`, [owner, (e as Error).message.slice(0, 300)]);
        }
      }
      if (result.errors.length) result.status = "partial";
    } catch (e) {
      result.status = "failed";
      result.errors.push((e as Error).message);
    } finally {
      await db.query(`UPDATE sync_runs SET finished_ms = $2, status = $3, slot = $4, owners_synced = $5, eggs_issued = $6, error = $7 WHERE id = $1`, [
        runId,
        now(),
        result.status,
        slot,
        result.ownersSynced,
        result.eggsIssued,
        result.errors.join("; ").slice(0, 1000) || null,
      ]);
      await db.query(`UPDATE tracker_state SET value = '0' WHERE key = 'sync_lease'`);
      await pruneRateLimits(db, now()).catch(() => {});
      const fields = { runId, status: result.status, discovered: result.discovered, ownersSynced: result.ownersSynced, eggsIssued: result.eggsIssued, durationMs: now() - startedMs, errors: result.errors.length, firstError: result.errors[0] };
      if (result.status === "ok") log.info("sync.finished", fields);
      else if (result.status === "partial") log.warn("sync.partial", fields);
      else log.error("sync.failed", fields);
    }
    return result;
  }

  /** Webhook path: apply the reported transactions, then refresh the wallets they touched. */
  async function ingestSignatures(signatures: string[]): Promise<{ processed: number; owners: number; eggsIssued: number; errors: string[] }> {
    const owners = new Set<string>();
    const errors: string[] = [];
    let processed = 0;
    for (const sig of signatures.slice(0, 100)) {
      try {
        const r = await processTransaction(sig);
        if (r.applied) processed++;
        else log.info("webhook.duplicate_ignored", { reason: "already processed" });
        r.owners.forEach((o) => owners.add(o));
      } catch (e) {
        if (e instanceof RpcUnavailableError) throw e;
        errors.push(`${sig}: ${(e as Error).message}`);
      }
    }
    let eggsIssued = 0;
    for (const o of owners) {
      if (isExcluded(o)) continue;
      try {
        eggsIssued += (await syncOwner(o)).eggsIssued;
      } catch (e) {
        if (e instanceof RpcUnavailableError) throw e;
        errors.push(`${o}: ${(e as Error).message}`);
      }
    }
    return { processed, owners: owners.size, eggsIssued, errors };
  }

  function toEgg(r: EggRow, t: number): TrackedEgg {
    const egg = {
      incubationStartedAt: Number(r.incubation_started_ms),
      readyAt: Number(r.ready_ms),
      hatchedAt: num(r.hatched_ms),
    };
    const status = eggStatusAt(egg, t);
    const progress = status === "incubating" ? (t - egg.incubationStartedAt) / Math.max(1, Number(r.incubation_ms)) : status === "queued" ? 0 : 1;
    // The outcome stays sealed until hatch; the silhouette shows from the "stirring" stage, as in the existing egg design.
    const showSpecies = status === "hatched" || progress >= gameConfig.eggs.stirringAt;
    return {
      id: r.id,
      sequence: r.sequence,
      status,
      earnedAt: Number(r.earned_ms),
      incubationStartedAt: egg.incubationStartedAt,
      incubationMs: Number(r.incubation_ms),
      readyAt: egg.readyAt,
      hatchedAt: egg.hatchedAt,
      displaySeed: hashString(r.id),
      speciesId: showSpecies ? r.species_id : null,
      // Fixed when the egg was issued; eggs from before that was stored use the configured value for their sequence.
      maturityMs: r.maturity_ms !== null ? Number(r.maturity_ms) : initialGrowthMsFor(r.sequence, config.progression),
      fastTrack: r.fast_track === true,
      afterMaturityMs: r.fast_track === true ? fastTrackAfterMaturityMs(gameConfig.evolution.afterMaturityMs.length, config.progression) : null,
      growthMs: null,
      growing: false,
      evolution: null,
    };
  }

  /** What the Hatchery shows for an address. Reads only the database. */
  async function holderView(address: string): Promise<TrackedHolderView> {
    const t = now();
    const row = (await db.query<HolderRow>(`SELECT * FROM holders WHERE owner = $1`, [address])).rows[0];
    const eggs = row ? (await db.query<EggRow>(`SELECT * FROM eggs WHERE owner = $1 ORDER BY sequence`, [address])).rows.map((r) => toEgg(r, t)) : [];
    const decimals = Number((await getState("mint_decimals")) ?? (await mint()).decimals);
    const unitBase = wholeTokensToBase(config.progression.tokensPerEgg, decimals);
    const balance = row ? BigInt(row.balance_base) : 0n;
    const credit = row ? BigInt(row.credit_base) : 0n;
    // Growth: qualifying holding since the egg hatched, which is when its incubation completed
    // (readyAt), not when someone pressed the reveal. So a first egg earned at 0:00 hatches at
    // 1:00 and is fully grown at 2:00 however late the reveal is opened. The k-th hatched
    // creature (oldest first) grows while the recorded balance is at least k × tokensPerEgg.
    // Fast-track creatures are the exception: their stages are a minute apart, so they grow from
    // the reveal itself, or a late reveal would skip straight past the evolutions.
    const hatched = eggs.filter((e) => e.hatchedAt !== null);
    const changes = row
      ? (
          await db.query<{ pre_base: string; post_base: string; block_time_ms: string | null; processed_ms: string }>(
            `SELECT hc.pre_base, hc.post_base, pt.block_time_ms, pt.processed_ms FROM holder_changes hc JOIN processed_transactions pt ON pt.signature = hc.signature WHERE hc.owner = $1 ORDER BY hc.slot`,
            [address],
          )
        ).rows.map((c) => ({ at: Number(c.block_time_ms ?? c.processed_ms), preBase: BigInt(c.pre_base), postBase: BigInt(c.post_base) }))
      : [];
    if (hatched.length) {
      hatched.forEach((e, k) => {
        const g = qualifyingMs(e.fastTrack ? Math.max(e.readyAt, e.hatchedAt!) : e.readyAt, t, unitBase * BigInt(k + 1), changes, balance);
        e.growthMs = g.ms;
        e.growing = g.growing;
        const evo = evolutionOf(g.ms, gameConfig, e.maturityMs, e.afterMaturityMs ?? undefined);
        e.evolution = { stage: evo.stage, label: evo.label, phase: evo.phase, matured: evo.matured, nextLabel: evo.nextLabel, toNextMs: evo.toNextMs };
      });
    }
    // Cosmetic streak: the same verified continuous holding the leaderboard ranks by.
    const heldMs = row && !row.excluded ? continuousHoldingMs(num(row.first_qualified_ms), balance, unitBase, changes, t) : null;
    const streak = { heldMs, badges: gameConfig.streakBadges.filter((b) => heldMs !== null && heldMs >= b.ms).map((b) => b.id) };
    const uncredited = balance > credit ? balance - credit : 0n;
    const heldCredit = credit < balance ? credit : balance;
    const ownCredit = unitBase * BigInt(row?.eggs_earned ?? 0);
    const inherited = heldCredit > ownCredit ? heldCredit - ownCredit : 0n;
    const counts = { earned: eggs.length, queued: 0, incubating: 0, ready: 0, hatched: 0 };
    for (const e of eggs) counts[e.status]++;
    return {
      address,
      source: config.source,
      tracked: !!row,
      serverNow: t,
      holdings: {
        amount: formatBaseUnits(balance, decimals),
        frozenAmount: formatBaseUnits(row ? BigInt(row.frozen_base) : 0n, decimals),
        qualifyingUnits: Number(balance / unitBase),
        creditedAmount: formatBaseUnits(credit < balance ? credit : balance, decimals),
        inheritedCreditAmount: formatBaseUnits(inherited, decimals),
        toNextEgg: formatBaseUnits(unitBase - (uncredited % unitBase), decimals),
        slot: row ? Number(row.balance_slot) : 0,
        observedAt: row ? num(row.balance_observed_ms) : null,
        excluded: row ? row.excluded : isExcluded(address),
      },
      counts,
      // Tied to the wallet's egg sequence numbers, which the server assigns and never reuses: nothing in the browser can reset it.
      fastTrack: (() => {
        const ft = config.progression.fastTrack;
        const issued = Math.min(row?.eggs_earned ?? 0, ft.eggs);
        // Progress is hatches, not issues: a wallet that earned ten eggs at once has used none of its fast track until one hatches.
        const used = eggs.filter((e) => e.fastTrack && e.status === "hatched").length;
        return { total: ft.eggs, issued, used, remaining: ft.eggs - used, complete: used >= ft.eggs, hatchMs: ft.hatchMs, stageMs: ft.stageMs };
      })(),
      eggs,
      rules: {
        tokensPerEgg: config.progression.tokensPerEgg,
        incubationScheduleMs: config.progression.incubationScheduleMs,
        incubationMode: config.progression.incubationMode,
        initialGrowthScheduleMs: config.progression.initialGrowthScheduleMs,
      },
      sync: { lastSyncedAt: row ? num(row.last_sync_ms) : null, pending: row ? row.needs_sync : false, error: row?.last_sync_error ? PUBLIC_SYNC_ERROR : null },
      streak,
    };
  }

  /**
   * Reveals a ready egg. Anyone viewing the address can trigger it, but the
   * outcome was sealed when the egg was issued, so who presses the button
   * doesn't matter. Idempotent: hatching twice returns the same creature.
   */
  async function hatch(eggId: string): Promise<{ ok: true; result: HatchResult } | { ok: false; code: "NOT_FOUND" | "NOT_READY"; readyAt?: number }> {
    const t = now();
    return db.tx(async (sql) => {
      const r = (await sql.query<EggRow>(`SELECT * FROM eggs WHERE id = $1 FOR UPDATE`, [eggId])).rows[0];
      if (!r) return { ok: false as const, code: "NOT_FOUND" as const };
      if (r.hatched_ms !== null) return { ok: true as const, result: { egg: toEgg(r, t), speciesId: r.species_id, alreadyHatched: true } };
      if (t < Number(r.ready_ms)) return { ok: false as const, code: "NOT_READY" as const, readyAt: Number(r.ready_ms) };
      await sql.query(`UPDATE eggs SET hatched_ms = $2 WHERE id = $1`, [eggId, t]);
      return { ok: true as const, result: { egg: toEgg({ ...r, hatched_ms: String(t) }, t), speciesId: r.species_id, alreadyHatched: false } };
    });
  }

  /** Operational status for /api/health. No configuration values, addresses or secrets. */
  async function health(staleAfterMs = 30 * 60_000) {
    const last = (await db.query<{ finished_ms: string | null; status: string; owners_synced: number; eggs_issued: number; error: string | null }>(
      `SELECT finished_ms, status, owners_synced, eggs_issued, error FROM sync_runs WHERE finished_ms IS NOT NULL ORDER BY id DESC LIMIT 1`,
    )).rows[0];
    const ok = (await db.query<{ finished_ms: string }>(`SELECT finished_ms FROM sync_runs WHERE status = 'ok' ORDER BY id DESC LIMIT 1`)).rows[0];
    const holders = (await db.query<{ n: number; pending: number }>(`SELECT count(*)::int AS n, count(*) FILTER (WHERE needs_sync)::int AS pending FROM holders WHERE NOT excluded`)).rows[0];
    // Unique non-excluded wallets with a positive balance in open token accounts, as of the last snapshot.
    const current = (await db.query<{ n: number }>(
      `SELECT count(DISTINCT t.owner)::int AS n FROM token_accounts t JOIN holders h ON h.owner = t.owner
       WHERE NOT t.closed AND t.amount_base > 0 AND NOT h.excluded`,
    )).rows[0];
    const supply = await getState("mint_supply_matches_config");
    const lastOkAt = ok ? Number(ok.finished_ms) : null;
    return {
      lastRun: last ? { finishedAt: Number(last.finished_ms), status: last.status, ownersSynced: last.owners_synced, eggsIssued: last.eggs_issued, failed: last.status !== "ok" } : null,
      lastSuccessfulSyncAt: lastOkAt,
      syncStale: lastOkAt === null || now() - lastOkAt > staleAfterMs,
      trackedHolders: holders.n,
      // Explorer-comparable holder count. Frozen balances count here, though they earn no eggs;
      // trackedHolders also includes ex-holders, so never present it as the holder count.
      currentHolders: current.n,
      holdersAwaitingSync: holders.pending,
      mintSupplyMatchesConfig: supply === null ? null : supply === "true",
    };
  }

  /** Public, read-only facts for /proof: sync position, egg and rarity counts, and the excluded wallets. */
  async function proof(): Promise<Proof> {
    const h = await health();
    const slot = (await db.query<{ s: string | null }>(`SELECT max(balance_slot)::text AS s FROM holders`)).rows[0].s;
    const start = await getState("tracking_start_slot");
    const eggs = (await db.query<{ issued: number; hatched: number }>(`SELECT count(*)::int AS issued, count(hatched_ms)::int AS hatched FROM eggs`)).rows[0];
    const chances = rarityChances(gameConfig);
    const rarity = Object.fromEntries(Object.entries(chances).map(([r, c]) => [r, { hatched: 0, configured: c }])) as Proof["rarity"];
    for (const row of (await db.query<{ species_id: string; n: number }>(`SELECT species_id, count(*)::int AS n FROM eggs WHERE hatched_ms IS NOT NULL GROUP BY species_id`)).rows) {
      const s = SPECIES_BY_ID[row.species_id];
      if (s) rarity[s.rarity].hatched += row.n;
    }
    // Configured project wallets first, then program-controlled owners discovery found holding the token
    // (excluded owners are never synced, so their recorded balance isn't meaningful).
    const program = (await db.query<{ owner: string }>(`SELECT owner FROM holders WHERE excluded AND NOT (owner = ANY($1)) ORDER BY owner LIMIT 100`, [[...config.excludedOwners]])).rows.map((r) => r.owner);
    const all = [...[...config.excludedOwners].sort().map((address) => ({ address, reason: "project" as const })), ...program.map((address) => ({ address, reason: "program" as const }))];
    return {
      source: config.source,
      generatedAt: now(),
      lastSyncAt: h.lastSuccessfulSyncAt,
      latestSlot: slot === null ? null : Number(slot) || null,
      trackingStartSlot: start === null ? null : Number(start),
      supplyMatchesConfig: h.mintSupplyMatchesConfig,
      eggs: { issued: eggs.issued, hatched: eggs.hatched },
      rarity,
      excluded: all.slice(0, 100),
      excludedCount: config.excludedOwners.size + (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM holders WHERE excluded AND NOT (owner = ANY($1))`, [[...config.excludedOwners]])).rows[0].n,
    };
  }

  return { discover, processTransaction, syncOwner, runSync, ingestSignatures, holderView, hatch, isExcluded, mint, health, proof };
}

export type Tracker = ReturnType<typeof createTracker>;

export const DEFAULT_TRACKER_SETTINGS = { maxSignaturesPerAccount: 500, progression: eggProgression };
