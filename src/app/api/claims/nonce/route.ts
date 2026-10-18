import "server-only";
import { fail, failFromError, noStore, rateLimit, readJson, sameOrigin } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/claims/nonce {address} — the message the wallet will be asked to sign. Never asks for keys. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "UNAUTHORIZED", "Cross-site request refused.");
  const limited = await rateLimit(req, "claim-nonce", 10, 60_000);
  if (limited) return limited;
  const parsed = await readJson(req, 4096);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body as { address?: unknown; nonce?: unknown; signature?: unknown } | null;
  try {
    return Response.json(await (await getRuntime()).claims.issueNonce(body?.address), { headers: noStore });
  } catch (e) {
    return failFromError(e, "claims-nonce");
  }
}
