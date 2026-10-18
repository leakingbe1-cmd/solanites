import "server-only";
import { sessionCookie } from "@/server/claimsHttp";
import { fail, failFromError, noStore, rateLimit, sameOrigin } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/claims/session {address, nonce, signature} — verifies wallet ownership and starts a short claim session. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "UNAUTHORIZED", "Cross-site request refused.");
  const limited = rateLimit(req, "claim-session", 10, 60_000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  if (typeof body?.nonce !== "string" || typeof body?.signature !== "string") return fail(400, "INVALID_SIGNATURE", "Missing nonce or signature.");
  try {
    const s = await (await getRuntime()).claims.signIn(body.address, body.nonce, body.signature);
    return Response.json({ address: s.address, expiresAt: s.expiresAt }, { headers: { ...noStore, "set-cookie": sessionCookie(s.token) } });
  } catch (e) {
    return failFromError(e, "claims-session");
  }
}

/** DELETE /api/claims/session — signs out. */
export async function DELETE() {
  return new Response(null, { status: 204, headers: { ...noStore, "set-cookie": sessionCookie(null) } });
}
