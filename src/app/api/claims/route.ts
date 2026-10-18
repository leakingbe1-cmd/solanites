import "server-only";
import { sessionToken } from "@/server/claimsHttp";
import { fail, failFromError, noStore, sameOrigin } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/claims — the signed-in wallet's recorded claims and their status. */
export async function GET(req: Request) {
  try {
    return Response.json({ claims: await (await getRuntime()).claims.myClaims(sessionToken(req)) }, { headers: noStore });
  } catch (e) {
    return failFromError(e, "claims-list");
  }
}

/**
 * POST /api/claims — records a claim. The amount is recalculated on the
 * server (the request body is ignored); one claim per wallet per period.
 * Recording a claim does not send any payout.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "UNAUTHORIZED", "Cross-site request refused.");
  try {
    const r = await (await getRuntime()).claims.submit(sessionToken(req));
    return Response.json(r, { status: r.duplicate ? 200 : 201, headers: noStore });
  } catch (e) {
    return failFromError(e, "claims-submit");
  }
}
