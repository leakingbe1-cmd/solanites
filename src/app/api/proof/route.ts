import "server-only";
import { failFromError, rateLimit } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/proof: public, read-only tracker facts (see src/shared/proof.ts). Not configured → 503. */
export async function GET(req: Request) {
  const limited = await rateLimit(req, "proof", 30, 60_000);
  if (limited) return limited;
  try {
    const body = await (await getRuntime()).tracker.proof();
    return Response.json(body, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch (e) {
    return failFromError(e, "proof");
  }
}
