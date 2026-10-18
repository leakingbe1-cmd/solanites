import "server-only";
import { fail, noStore } from "@/server/http";
import { getRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Local fixture mode only: the fixture wallet addresses to try. 404 everywhere else. */
export async function GET() {
  if (process.env.SOLANITES_FIXTURES !== "1" || process.env.NODE_ENV === "production") return fail(404, "NOT_FOUND", "Not found.");
  const rt = await getRuntime();
  return Response.json({ source: "fixture", wallets: rt.fixtureWallets ?? [] }, { headers: noStore });
}
