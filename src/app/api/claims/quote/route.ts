import "server-only";
import { sessionToken } from "@/server/claimsHttp";
import { failFromError, noStore } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/claims/quote — the signed-in wallet's claim amount, calculated on the server. */
export async function GET(req: Request) {
  try {
    return Response.json(await (await getRuntime()).claims.quote(sessionToken(req)), { headers: noStore });
  } catch (e) {
    return failFromError(e, "claims-quote");
  }
}
