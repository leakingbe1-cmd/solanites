import "server-only";
import { ConfigError } from "@/server/config";
import { fail, noStore, rateLimit, readJson, sameOrigin } from "@/server/http";
import { openRevealSession, readRevealConfig, revealCookie, RevealError } from "@/server/ownership/reveal";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const secure = () => process.env.NODE_ENV === "production";

/**
 * POST /api/owner/session {address, nonce, signature} — step 2: verifies the wallet's ed25519
 * signature over the challenge (spending the nonce either way) and sets a short-lived httpOnly
 * session scoped to revealing that wallet's own hatched classified creatures.
 * DELETE /api/owner/session — signs out.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "UNAUTHORIZED", "Cross-site request refused.");
  const limited = await rateLimit(req, "reveal-session", 10, 60_000);
  if (limited) return limited;
  const parsed = await readJson(req, 4096);
  if (!parsed.ok) return parsed.response;
  const b = (parsed.body ?? {}) as { address?: unknown; nonce?: unknown; signature?: unknown };
  try {
    const rt = await getRuntime();
    const s = await openRevealSession(rt.db, readRevealConfig(), b.address, b.nonce, b.signature, Date.now());
    return Response.json({ address: s.address, expiresAt: s.expiresAt }, { headers: { ...noStore, "set-cookie": revealCookie(s.token, secure()) } });
  } catch (e) {
    if (e instanceof RevealError) return fail(e.code === "NOT_CONFIGURED" ? 503 : 401, e.code, e.message);
    if (e instanceof ConfigError) return fail(503, "NOT_CONFIGURED", "Wallet sign-in isn't set up on this server.");
    return fail(500, "INTERNAL", "Something went wrong on the server. Please try again.");
  }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return fail(403, "UNAUTHORIZED", "Cross-site request refused.");
  return new Response(null, { status: 204, headers: { ...noStore, "set-cookie": revealCookie(null, secure()) } });
}
