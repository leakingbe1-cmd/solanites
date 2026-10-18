import "server-only";
import { fail, failFromError, noStore, rateLimit } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/eggs/:id/hatch — reveals a ready egg. The outcome was sealed when
 * the egg was issued, so no signature is needed; hatching twice returns the
 * same creature. Readiness is checked against the server clock.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, "hatch", 30, 60_000);
  if (limited) return limited;
  const id = decodeURIComponent((await params).id);
  if (!/^egg_[1-9A-HJ-NP-Za-km-z]{32,44}_\d{1,6}$/.test(id)) return fail(400, "NOT_FOUND", "Unknown egg.");
  try {
    const r = await (await getRuntime()).tracker.hatch(id);
    if (!r.ok) return r.code === "NOT_FOUND" ? fail(404, "NOT_FOUND", "Unknown egg.") : fail(409, "NOT_READY", "This egg is still incubating.", { readyAt: r.readyAt });
    return Response.json(r.result, { headers: noStore });
  } catch (e) {
    return failFromError(e, "hatch");
  }
}
