import "server-only";
import { fail, failFromError, noStore, rateLimit, sameOrigin } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/claims/nonce {address} — the message the wallet will be asked to sign. Never asks for keys. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "UNAUTHORIZED", "Cross-site request refused.");
  const limited = rateLimit(req, "claim-nonce", 10, 60_000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  try {
    return Response.json(await (await getRuntime()).claims.issueNonce(body?.address), { headers: noStore });
  } catch (e) {
    return failFromError(e, "claims-nonce");
  }
}
