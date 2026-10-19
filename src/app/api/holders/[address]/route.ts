import "server-only";
import { fail, failFromError, noStore, rateLimit } from "@/server/http";
import { discloseEggs } from "@/server/classified";
import { log } from "@/server/log";
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
  const limited = await rateLimit(req, "holder-view", 60, 60_000);
  if (limited) return limited;
  try {
    const rt = await getRuntime();
    let view = await rt.tracker.holderView(check.address);
    const stale = !view.tracked || view.sync.pending || (view.sync.lastSyncedAt ?? 0) < view.serverNow - REFRESH_AFTER_MS;
    // A refresh costs RPC calls: at most 10 per client and 1 per address per minute, shared across instances.
    const mayRefresh = stale && !view.holdings.excluded && !(await rateLimit(req, "holder-refresh-ip", 10, 60_000)) && !(await rateLimit(req, "holder-refresh-addr", 1, 60_000, check.address));
    if (mayRefresh) {
      try {
        await rt.tracker.syncOwner(check.address);
        view = await rt.tracker.holderView(check.address);
      } catch (e) {
        // Serve what is recorded; the scheduled sync will catch up.
        log.warn("holders.refresh_failed", { error: (e as Error).message });
      }
    }
    // Classified species are named only for hatched eggs (src/server/classified).
    const { eggs, classified } = discloseEggs(view.eggs);
    return Response.json({ ...view, eggs, ...(classified.length ? { classified } : {}) }, { headers: noStore });
  } catch (e) {
    return failFromError(e, "holders");
  }
}
