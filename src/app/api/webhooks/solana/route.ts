import "server-only";
import { fail, failFromError, noStore, readJson, secretMatches } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SIGNATURE = /^[1-9A-HJ-NP-Za-km-z]{64,90}$/;

/**
 * Transfer notifications from an indexer (e.g. a Helius webhook on the mint).
 * Only the transaction signatures are used: each transaction is re-read from
 * the RPC at finalized commitment, so a forged or wrong payload can't change
 * balances. Replays are no-ops. Requires the configured secret in the
 * Authorization header.
 */
export async function POST(req: Request) {
  if (!process.env.SOLANITES_WEBHOOK_SECRET) return fail(503, "NOT_CONFIGURED", "SOLANITES_WEBHOOK_SECRET is not set.");
  if (!secretMatches(req.headers.get("authorization"), process.env.SOLANITES_WEBHOOK_SECRET)) return fail(401, "UNAUTHORIZED", "Unauthorized.");
  const parsed = await readJson(req, 1_000_000);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body as { signatures?: unknown[] } | unknown[] | null;
  const items: unknown[] = Array.isArray(body) ? body : Array.isArray(body?.signatures) ? body.signatures : [];
  const signatures = [...new Set(items.map((i) => (typeof i === "string" ? i : (i as { signature?: unknown })?.signature)).filter((s): s is string => typeof s === "string" && SIGNATURE.test(s)))];
  if (!signatures.length) return Response.json({ processed: 0, owners: 0, eggsIssued: 0, errors: [] }, { headers: noStore });
  try {
    return Response.json(await (await getRuntime()).tracker.ingestSignatures(signatures), { headers: noStore });
  } catch (e) {
    // A non-2xx makes the provider retry; replays are safe.
    return failFromError(e, "webhook");
  }
}
