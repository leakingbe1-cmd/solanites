import { eggProgression } from "@/config/eggProgression";
import type { Leaderboard, LeaderboardStanding } from "@/shared/leaderboard";
import { wholeTokensToBase } from "../amounts";
import { ConfigError, isProductionDeployment } from "../config";
import type { Db } from "../db/types";
import type { Tracker } from "../tracker/service";
import { continuousHoldingMs, rankEvolved, rankHolders, rankRarest, standingsOf, type HoldingChange, type Keeper } from "./rank";

export interface LeaderboardDeps {
  db: Db;
  tracker: Tracker;
  source: "chain" | "fixture";
  now?: () => number;
  /** How long a computed ranking is reused (ms). */
  cacheMs?: number;
  env?: Record<string, string | undefined>;
}

/**
 * The live leaderboard, ranked on the server from the tracker's tables. Creature stages come from
 * tracker.holderView, so they always match what each keeper sees in the Hatchery. Excluded owners
 * (treasury, pools, program-controlled wallets) never appear. Eggs are unique per (owner, sequence)
 * and each keeper's creatures are read once, so nothing is counted twice.
 */
export function createLeaderboard({ db, tracker, source, now = Date.now, cacheMs = 30_000, env = process.env }: LeaderboardDeps) {
  let cached: { at: number; value: Leaderboard; keepers: Keeper[] } | null = null;
  let inflight: Promise<{ value: Leaderboard; keepers: Keeper[] }> | null = null;

  async function compute(): Promise<{ value: Leaderboard; keepers: Keeper[] }> {
    // Fixture holders are test data: never rank them on a production deployment.
    if (source === "fixture" && (isProductionDeployment(env) || env.NODE_ENV === "production")) throw new ConfigError(["SOLANITES_FIXTURES must not be enabled in production"]);
    const t = now();
    const decimals = Number((await db.query<{ value: string }>(`SELECT value FROM tracker_state WHERE key = 'mint_decimals'`)).rows[0]?.value ?? NaN);
    // Without the mint's decimals no egg threshold is known yet, so nobody counts as a verified holder.
    const unitBase = Number.isFinite(decimals) ? wholeTokensToBase(eggProgression.tokensPerEgg, decimals) : null;
    // Candidates: keepers with a hatched creature, and wallets whose recorded balance meets one egg's worth.
    const holders = (
      await db.query<{ owner: string; first_qualified_ms: string | null; balance_base: string }>(
        `SELECT owner, first_qualified_ms, balance_base FROM holders
         WHERE NOT excluded AND (($1::numeric IS NOT NULL AND balance_base >= $1::numeric) OR owner IN (SELECT owner FROM eggs WHERE hatched_ms IS NOT NULL))`,
        [unitBase === null ? null : unitBase.toString()],
      )
    ).rows;
    const owners = holders.map((h) => h.owner);
    const changes = new Map<string, HoldingChange[]>();
    if (owners.length && unitBase !== null) {
      const rows = (
        await db.query<{ owner: string; pre_base: string; post_base: string; block_time_ms: string | null; processed_ms: string }>(
          `SELECT hc.owner, hc.pre_base, hc.post_base, pt.block_time_ms, pt.processed_ms FROM holder_changes hc JOIN processed_transactions pt ON pt.signature = hc.signature WHERE hc.owner = ANY($1)`,
          [owners],
        )
      ).rows;
      for (const r of rows) {
        const list = changes.get(r.owner) ?? [];
        list.push({ at: Number(r.block_time_ms ?? r.processed_ms), preBase: BigInt(r.pre_base), postBase: BigInt(r.post_base) });
        changes.set(r.owner, list);
      }
    }
    const hatchedOwners = new Set((await db.query<{ owner: string }>(`SELECT DISTINCT owner FROM eggs WHERE hatched_ms IS NOT NULL`)).rows.map((r) => r.owner));

    const keepers: Keeper[] = [];
    for (const h of holders) {
      const creatures = [];
      if (hatchedOwners.has(h.owner)) {
        const view = await tracker.holderView(h.owner);
        for (const e of view.eggs) {
          if (e.hatchedAt === null || !e.speciesId || !e.evolution) continue;
          creatures.push({ speciesId: e.speciesId, stage: e.evolution.stage, hatchedAt: e.hatchedAt, readyAt: e.readyAt });
        }
      }
      const heldMs =
        unitBase === null ? null : continuousHoldingMs(h.first_qualified_ms === null ? null : Number(h.first_qualified_ms), BigInt(h.balance_base), unitBase, changes.get(h.owner) ?? [], t);
      keepers.push({ address: h.owner, creatures, heldMs });
    }
    return {
      keepers,
      value: {
        source,
        generatedAt: t,
        lastSyncAt: (await tracker.health()).lastSuccessfulSyncAt,
        categories: { evolved: rankEvolved(keepers), holders: rankHolders(keepers), rarest: rankRarest(keepers) },
      },
    };
  }

  /** The ranking, recomputed at most once per cacheMs; concurrent callers share one computation. */
  async function current(): Promise<{ value: Leaderboard; keepers: Keeper[] }> {
    if (cached && now() - cached.at < cacheMs) return cached;
    if (!inflight) {
      inflight = compute()
        .then((r) => {
          cached = { at: now(), ...r };
          return r;
        })
        .finally(() => {
          inflight = null;
        });
    }
    return inflight;
  }

  const get = async (): Promise<Leaderboard> => (await current()).value;

  /** One address's place in each category, from the same cached ranking. */
  async function standing(address: string): Promise<LeaderboardStanding> {
    const { value, keepers } = await current();
    return { generatedAt: value.generatedAt, categories: standingsOf(keepers, address) };
  }

  return { get, standing, compute: async () => (await compute()).value };
}

export type LeaderboardService = ReturnType<typeof createLeaderboard>;
