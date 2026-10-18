import "server-only";
import { fail, failFromError, noStore, rateLimit } from "@/server/http";
import { getRuntime } from "@/server/runtime";
import { checkSolanaAddress } from "@/server/solana/address";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** How stale a tracked holder may be before a visit triggers a targeted refresh. */
const REFRESH_AFTER_MS = 60_000;

/**
 * GET /api/holders/:address — automatically tracked eggs for a public address.
 * No wallet connection or signature. Tracking runs on a schedule whether or
 * not anyone visits; a visit only speeds up a stale or brand-new address.
 */
export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
  const check = checkSolanaAddress(decodeURIComponent((await params).address));
  if (!check.ok) return fail(400, "INVALID_ADDRESS", check.reason);
  try {
    const rt = await getRuntime();
    let view = await rt.tracker.holderView(check.address);
    const stale = !view.tracked || view.sync.pending || (view.sync.lastSyncedAt ?? 0) < view.serverNow - REFRESH_AFTER_MS;
    if (stale && !view.holdings.excluded && !rateLimit(req, "holder-refresh", 10, 60_000)) {
      try {
        await rt.tracker.syncOwner(check.address);
        view = await rt.tracker.holderView(check.address);
      } catch (e) {
        // Serve what is recorded; the scheduled sync will catch up.
        console.error("[holders] refresh failed:", (e as Error).message);
      }
    }
    return Response.json(view, { headers: noStore });
  } catch (e) {
    return failFromError(e, "holders");
  }
}
