import "server-only";

import type { HomeStats, Metric } from "@/shared/homeStats";
import { fetchMintTokenAccounts } from "../solana/history";
import { isOnCurve } from "../solana/curve";
import type { RpcClient } from "../solana/rpc";
import { fetchMintInfo } from "../solana/token";
import type { TokenMarket } from "../market/tokenMarket";

/**
 * Holder count exclusion rules (documented in docs/home-metrics.md):
 * - owners that are not on the ed25519 curve: program-derived addresses such as AMM pools,
 *   bonding curves and vaults, which no person controls;
 * - SOLANITES_EXCLUDED_OWNERS: project wallets (treasury, team, burn) named by the owner.
 * Ordinary wallets are never excluded, and an owner with several accounts counts once.
 */
export function countHolders(accounts: { owner: string; amount: bigint }[], excludedOwners: ReadonlySet<string>, onCurve: (a: string) => boolean = isOnCurve) {
  const holding = new Set<string>();
  const programOwned = new Set<string>();
  for (const a of accounts) {
    if (a.amount <= 0n) continue;
    if (excludedOwners.has(a.owner)) continue;
    if (!onCurve(a.owner)) {
      programOwned.add(a.owner);
      continue;
    }
    holding.add(a.owner);
  }
  return { holders: holding.size, programOwned: programOwned.size };
}

export interface HomeStatsDeps {
  /** Null when the mint or RPC is not configured. */
  chain: { rpc: RpcClient; mint: string; excludedOwners: ReadonlySet<string> } | null;
  /** Total eggs and whether the tracker has completed a sync; throws when tracking is not configured. */
  eggs: () => Promise<{ total: number; lastSyncAt: number | null }>;
  market: (mint: string) => Promise<TokenMarket>;
  now?: () => number;
}

type Entry<T> = { value: T; asOf: number; extra?: Record<string, unknown> };

/** How long a value is served without refetching, and how long a last good value may be shown as stale. */
const POLICY = {
  holders: { freshMs: 5 * 60_000, staleMaxMs: 60 * 60_000 },
  eggs: { freshMs: 60_000, staleMaxMs: 30 * 60_000 },
  marketCap: { freshMs: 30_000, staleMaxMs: 10 * 60_000 },
} as const;
const RETRY_AFTER_FAILURE_MS = 30_000;
const SYNC_STALE_MS = 30 * 60_000;

/**
 * Builds the live homepage metrics with per-metric caching and single-flight refreshes, so a
 * burst of visitors makes at most one upstream call per metric. A failed refresh keeps the last
 * good value as "stale" for a bounded time, then reports "unavailable". Nothing is invented.
 */
export function createHomeStats(deps: HomeStatsDeps) {
  const now = deps.now ?? Date.now;
  const cache: Partial<Record<keyof typeof POLICY, Entry<number>>> = {};
  const inflight: Partial<Record<keyof typeof POLICY, Promise<void>>> = {};
  const failures: Partial<Record<keyof typeof POLICY, string>> = {};
  const lastAttempt: Partial<Record<keyof typeof POLICY, number>> = {};

  async function refresh(key: keyof typeof POLICY, load: () => Promise<Entry<number>>) {
    const hit = cache[key];
    if (hit && !failures[key] && now() - hit.asOf < POLICY[key].freshMs) return;
    // After a failure, wait before asking the upstream again, so outages aren't amplified by traffic.
    if (failures[key] !== undefined && now() - (lastAttempt[key] ?? 0) < RETRY_AFTER_FAILURE_MS) return;
    inflight[key] ??= (lastAttempt[key] = now(), load())
      .then((e) => {
        cache[key] = e;
        delete failures[key];
      })
      .catch((e: Error) => {
        failures[key] = e.message;
      })
      .finally(() => {
        delete inflight[key];
      });
    await inflight[key];
  }

  function metric(key: keyof typeof POLICY, unavailableNote: string): Metric<number> & Record<string, unknown> {
    const hit = cache[key];
    if (!hit || now() - hit.asOf > POLICY[key].staleMaxMs) return { value: null, status: "unavailable", asOf: null, note: unavailableNote };
    const stale = failures[key] !== undefined || now() - hit.asOf > POLICY[key].freshMs;
    return { value: hit.value, status: stale ? "stale" : "live", asOf: hit.asOf, ...(stale ? { note: "Showing the last good value; refresh failed." } : {}), ...hit.extra };
  }

  /** Eggs are only as fresh as the tracker's last completed sync, which runs every 10 min in production. */
  function eggsMetric(): Metric<number> {
    const m = metric("eggs", failures.eggs?.startsWith("Egg tracking ") ? failures.eggs : "Egg data is temporarily unavailable.");
    const { syncedAt, ...rest } = m as Metric<number> & { syncedAt?: number };
    if (m.value === null || syncedAt === undefined) return rest;
    if (m.status === "live" && now() - syncedAt > SYNC_STALE_MS) return { ...rest, status: "stale", asOf: syncedAt, note: "Egg tracking hasn't synced for over 30 minutes." };
    return { ...rest, asOf: syncedAt };
  }

  async function get(): Promise<HomeStats> {
    const chain = deps.chain;
    await Promise.all([
      chain
        ? refresh("holders", async () => {
            const m = await fetchMintInfo(chain.rpc, chain.mint, "confirmed");
            const snap = await fetchMintTokenAccounts(chain.rpc, m, "confirmed");
            return { value: countHolders(snap.accounts, chain.excludedOwners).holders, asOf: now(), extra: { slot: snap.slot } };
          })
        : Promise.resolve(),
      refresh("eggs", async () => {
        const e = await deps.eggs();
        // Before the first completed sync the egg table is incomplete, so there is no honest total yet.
        if (e.lastSyncAt === null) throw new Error("Egg tracking has not completed a sync yet.");
        // asOf is when the egg table was read, so the cache works; syncedAt is when the tracker last finished a pass.
        return { value: e.total, asOf: now(), extra: { syncedAt: e.lastSyncAt } };
      }),
      chain
        ? refresh("marketCap", async () => {
            const mk = await deps.market(chain.mint);
            if (!(mk.valueUsd > 0) || !(mk.priceUsd > 0)) throw new Error("Market data provider returned no usable value.");
            return { value: mk.valueUsd, asOf: mk.asOf, extra: { kind: mk.kind, priceUsd: mk.priceUsd, source: mk.source } };
          })
        : Promise.resolve(),
    ]);
    const notConfigured = "Token tracking is not configured on this server.";
    return {
      holders: chain ? metric("holders", "Holder data is temporarily unavailable.") : { value: null, status: "unavailable", asOf: null, note: notConfigured },
      // "Egg tracking …" messages are written for visitors (not configured / no sync yet); anything else is generic.
      eggs: eggsMetric(),
      marketCap: chain ? metric("marketCap", "Market data is temporarily unavailable.") : { value: null, status: "unavailable", asOf: null, note: notConfigured },
      generatedAt: now(),
    };
  }

  return { get };
}
