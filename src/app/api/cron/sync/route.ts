import "server-only";
import { fail, failFromError, noStore, secretMatches } from "@/server/http";
import { log } from "@/server/log";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled tracking pass (Vercel Cron, GitHub Actions or any scheduler):
 * reconciliation snapshot when due, then wallets that changed, then
 * re-verification of the least recently checked holders.
 * Requires `Authorization: Bearer $CRON_SECRET`, except on Vercel Preview deployments (owner
 * decision, 20 Oct): Vercel Cron never fires there and Deployment Protection already limits who
 * can open them, so the owner can run a pass from the browser to test tracking. Production and
 * every non-Vercel environment always need the secret.
 */
async function handle(req: Request) {
  if (process.env.VERCEL_ENV === "preview") return run();
  // Unset secret: refuse like a wrong one, so the public can't tell what is configured. The log says why.
  if (!process.env.CRON_SECRET) {
    log.warn("cron.not_configured", { missing: "CRON_SECRET" });
    return fail(401, "UNAUTHORIZED", "Unauthorized.");
  }
  const auth = req.headers.get("authorization");
  if (!secretMatches(auth?.replace(/^Bearer\s+/i, "") ?? null, process.env.CRON_SECRET)) return fail(401, "UNAUTHORIZED", "Unauthorized.");
  return run();
}

async function run() {
  try {
    const result = await (await getRuntime()).tracker.runSync({ maxOwners: 40, reverify: 20 });
    return Response.json(result, { status: result.status === "failed" ? 503 : 200, headers: noStore });
  } catch (e) {
    return failFromError(e, "cron-sync");
  }
}

export const GET = handle;
export const POST = handle;
