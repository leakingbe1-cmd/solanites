import "server-only";
import { ConfigError, readServerConfig } from "@/server/config";
import { log } from "@/server/log";
import { fetchTokenMarket } from "@/server/market/tokenMarket";
import { getRuntime } from "@/server/runtime";
import { createRpcClient } from "@/server/solana/rpc";
import { createHomeStats, type HomeStatsDeps } from "@/server/stats/homeStats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/home-stats: live homepage metrics (holders, eggs collected, market cap).
 * Public data only. Holders and market cap need SOLANITES_MINT and SOLANA_RPC_URL; eggs need
 * the tracker's database and a completed sync. Missing pieces report "unavailable", never a value.
 */
const holder = globalThis as typeof globalThis & { __solanitesHomeStats?: ReturnType<typeof createHomeStats> };

async function chainDeps(): Promise<HomeStatsDeps["chain"]> {
  if (process.env.SOLANITES_FIXTURES === "1") {
    const rt = await getRuntime();
    return rt.fixtureChain ? { rpc: rt.rpc, mint: rt.fixtureChain.mint, excludedOwners: new Set() } : null;
  }
  try {
    const c = readServerConfig();
    return { rpc: createRpcClient({ url: c.rpcUrl }), mint: c.mint, excludedOwners: c.excludedOwners };
  } catch {
    return null;
  }
}

async function stats() {
  if (!holder.__solanitesHomeStats) {
    holder.__solanitesHomeStats = createHomeStats({
      chain: await chainDeps(),
      eggs: async () => {
        const rt = await getRuntime().catch((e) => {
          throw e instanceof ConfigError ? new Error("Egg tracking is not configured on this server.") : e;
        });
        const n = (await rt.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM eggs`)).rows[0].n;
        return { total: n, lastSyncAt: (await rt.tracker.health()).lastSuccessfulSyncAt };
      },
      market: fetchTokenMarket,
    });
  }
  return holder.__solanitesHomeStats;
}

export async function GET() {
  try {
    const body = await (await stats()).get();
    // Shared CDN cache: one upstream refresh per edge region every 30 s, however many visitors.
    return Response.json(body, { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=120" } });
  } catch (e) {
    log.error("home_stats.failed", { error: (e as Error).message });
    return Response.json({ error: { code: "UPSTREAM_ERROR", message: "Live metrics are temporarily unavailable." } }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
