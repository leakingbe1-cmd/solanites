import "server-only";
import { fail, failFromError, noStore, secretMatches } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled tracking pass (Vercel Cron, GitHub Actions or any scheduler):
 * reconciliation snapshot when due, then wallets that changed, then
 * re-verification of the least recently checked holders.
 * Requires `Authorization: Bearer $CRON_SECRET`.
 */
async function handle(req: Request) {
  if (!process.env.CRON_SECRET) return fail(503, "NOT_CONFIGURED", "CRON_SECRET is not set.");
  const auth = req.headers.get("authorization");
  if (!secretMatches(auth?.replace(/^Bearer\s+/i, "") ?? null, process.env.CRON_SECRET)) return fail(401, "UNAUTHORIZED", "Unauthorized.");
  try {
    const result = await (await getRuntime()).tracker.runSync({ maxOwners: 40, reverify: 20 });
    return Response.json(result, { status: result.status === "failed" ? 503 : 200, headers: noStore });
  } catch (e) {
    return failFromError(e, "cron-sync");
  }
}

export const GET = handle;
export const POST = handle;
