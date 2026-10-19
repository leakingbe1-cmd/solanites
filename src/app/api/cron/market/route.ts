import "server-only";
import { ConfigError } from "@/server/config";
import { fail, noStore, secretMatches } from "@/server/http";
import { log } from "@/server/log";
import { getMarketRuntime } from "@/server/market/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled market refresh: records each completed session's move for every species (one
 * grouped request covers all 28 stocks), then refreshes history with what's left of the
 * per-minute provider budget. Idempotent: running it again records nothing new.
 * Requires `Authorization: Bearer $CRON_SECRET`.
 */
async function handle(req: Request) {
  if (!process.env.CRON_SECRET) {
    log.warn("cron.not_configured", { missing: "CRON_SECRET" });
    return fail(401, "UNAUTHORIZED", "Unauthorized.");
  }
  if (!secretMatches(req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null, process.env.CRON_SECRET)) return fail(401, "UNAUTHORIZED", "Unauthorized.");
  try {
    const result = await (await getMarketRuntime()).service.runScheduled();
    // Field names avoid the logger's secret-looking words ("session" would be redacted).
    log.info("market.scheduled", { target: result.target, recordedDays: result.sessionsRecorded.join(","), growthRows: result.growthRows, historyRefreshed: result.historyRefreshed.join(","), providerCalls: result.providerCalls, stoppedBy: result.stoppedBy });
    return Response.json(result, { headers: noStore });
  } catch (e) {
    if (e instanceof ConfigError) return fail(503, "NOT_CONFIGURED", "Market data is not switched on yet on this server.");
    log.error("market.scheduled_failed", { error: (e as Error).message });
    return fail(500, "UPSTREAM_ERROR", "Something went wrong on the server. Please try again.");
  }
}

export const GET = handle;
export const POST = handle;
