import "server-only";
import { ConfigError } from "@/server/config";
import { createLeaderboard, type LeaderboardService } from "@/server/leaderboard/service";
import { log } from "@/server/log";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/leaderboard: the live Hall of Keepers (src/shared/leaderboard.ts has the ranking rules).
 * Public, read-only and ranked on the server; it takes no parameters. Not configured → 503, never
 * placeholder rows.
 */
const holder = globalThis as typeof globalThis & { __solanitesLeaderboard?: Promise<LeaderboardService> | null };

function service(): Promise<LeaderboardService> {
  if (!holder.__solanitesLeaderboard) {
    holder.__solanitesLeaderboard = getRuntime()
      .then((rt) => createLeaderboard({ db: rt.db, tracker: rt.tracker, source: rt.source }))
      .catch((e) => {
        holder.__solanitesLeaderboard = null;
        throw e;
      });
  }
  return holder.__solanitesLeaderboard;
}

export async function GET() {
  try {
    const body = await (await service()).get();
    // Shared CDN cache: one recompute per edge region every 30 s, however many visitors.
    return Response.json(body, { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch (e) {
    if (e instanceof ConfigError) {
      return Response.json({ error: { code: "NOT_CONFIGURED", message: "The leaderboard goes live once holder tracking is switched on." } }, { status: 503, headers: { "cache-control": "no-store" } });
    }
    log.error("leaderboard.failed", { error: (e as Error).message });
    return Response.json({ error: { code: "UPSTREAM_ERROR", message: "The leaderboard is temporarily unavailable." } }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
