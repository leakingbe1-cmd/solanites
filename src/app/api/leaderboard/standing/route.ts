import "server-only";
import { ConfigError } from "@/server/config";
import { leaderboardService } from "@/server/leaderboard/instance";
import { log } from "@/server/log";
import { checkSolanaAddress } from "@/server/solana/address";
import { rateLimit } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/leaderboard/standing?address=<public address>: that keeper's place in each category,
 * including below the public top list. Read-only, from the same 30 s ranking as /api/leaderboard;
 * the address only selects which row to return and never changes the ranking.
 */

export async function GET(req: Request) {
  const check = checkSolanaAddress(new URL(req.url).searchParams.get("address") ?? "");
  if (!check.ok) return Response.json({ error: { code: "INVALID_ADDRESS", message: check.reason } }, { status: 400, headers: { "cache-control": "no-store" } });
  const limited = await rateLimit(req, "leaderboard-standing", 60, 60_000);
  if (limited) return limited;
  const address = check.address;
  try {
    const body = await (await leaderboardService()).standing(address);
    return Response.json(body, { headers: { "cache-control": "private, max-age=30" } });
  } catch (e) {
    if (e instanceof ConfigError) {
      return Response.json({ error: { code: "NOT_CONFIGURED", message: "The leaderboard goes live once holder tracking is switched on." } }, { status: 503, headers: { "cache-control": "no-store" } });
    }
    log.error("leaderboard.standing_failed", { error: (e as Error).message });
    return Response.json({ error: { code: "UPSTREAM_ERROR", message: "Your standing is temporarily unavailable." } }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
