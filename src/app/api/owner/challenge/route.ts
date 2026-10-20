import "server-only";
import { ConfigError } from "@/server/config";
import { fail, noStore, rateLimit, readJson, sameOrigin } from "@/server/http";
import { issueRevealChallenge, readRevealConfig, RevealError } from "@/server/ownership/reveal";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/challenge {address} — the single-use message a wallet signs to prove it
 * controls the address (step 1 of revealing its own hatched Mythic and Secret Solanites).
 * Plain text only: no transaction, no fee, never a key or seed phrase.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "UNAUTHORIZED", "Cross-site request refused.");
  const limited = await rateLimit(req, "reveal-challenge", 10, 60_000);
  if (limited) return limited;
  const parsed = await readJson(req, 4096);
  if (!parsed.ok) return parsed.response;
  try {
    const rt = await getRuntime();
    return Response.json(await issueRevealChallenge(rt.db, readRevealConfig(), (parsed.body as { address?: unknown } | null)?.address, Date.now()), { headers: noStore });
  } catch (e) {
    if (e instanceof RevealError) return fail(e.code === "NOT_CONFIGURED" ? 503 : 400, e.code, e.message);
    if (e instanceof ConfigError) return fail(503, "NOT_CONFIGURED", "Wallet sign-in isn't set up on this server.");
    return fail(500, "INTERNAL", "Something went wrong on the server. Please try again.");
  }
}
