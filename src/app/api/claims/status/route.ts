import "server-only";
import { failFromError, noStore } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/claims/status — when launch-fee claims open (server clock) and whether they are configured. */
export async function GET() {
  try {
    return Response.json((await getRuntime()).claims.status(), { headers: noStore });
  } catch (e) {
    return failFromError(e, "claims-status");
  }
}
