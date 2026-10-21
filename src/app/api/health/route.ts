import "server-only";
import { ConfigError } from "@/server/config";
import { failFromError, noStore, secretMatches } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — operational status for monitoring.
 * Public: overall status, the last successful sync time and the holder count (public on-chain data).
 * With `Authorization: Bearer $CRON_SECRET`: also run details and which settings are present
 * (true/false only — never values).
 */
export async function GET(req: Request) {
  const detailed = secretMatches(req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null, process.env.CRON_SECRET);
  const present = {
    database: !!process.env.DATABASE_URL,
    mint: !!process.env.SOLANITES_MINT,
    rpc: !!process.env.SOLANA_RPC_URL,
    cronSecret: !!process.env.CRON_SECRET,
    webhookSecret: !!process.env.SOLANITES_WEBHOOK_SECRET,
    launchTime: !!process.env.SOLANITES_LAUNCH_AT,
  };
  try {
    const rt = await getRuntime();
    const h = await rt.tracker.health();
    const status = h.syncStale || h.lastRun?.failed || h.mintSupplyMatchesConfig === false ? "degraded" : "ok";
    const body = { status, source: rt.source, lastSuccessfulSyncAt: h.lastSuccessfulSyncAt, holders: h.currentHolders, ...(detailed ? { ...h, settingsPresent: present } : {}) };
    return Response.json(body, { status: 200, headers: noStore });
  } catch (e) {
    // Detailed view also names the failing settings (names and reasons only, never values).
    if (e instanceof ConfigError) return Response.json({ status: "not_configured", lastSuccessfulSyncAt: null, ...(detailed ? { settingsPresent: present, notConfigured: e.missing } : {}) }, { headers: noStore });
    return failFromError(e, "health");
  }
}
