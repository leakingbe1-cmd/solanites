import "server-only";
import { GROWTH_RULES, growthPoints, vigourOf, type GrowthEntry } from "@/lib/market/growth";
import { MARKET_RANGES, type MarketRange } from "@/lib/market/types";
import { SPECIES_BY_ID } from "@/lib/species";
import { ConfigError } from "@/server/config";
import { fail, noStore, rateLimit, secretMatches } from "@/server/http";
import { getMarketRuntime } from "@/server/market/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Owner diagnostics for the stock links. Read-only: it never writes game state, ownership,
 * odds or rewards, and it can't change what the public endpoint returns.
 *
 * Allowed in local fixture mode, or anywhere with `Authorization: Bearer $SOLANITES_DEV_TOKEN`
 * (server-only; unset means nobody). Everything else gets the same 404 as a missing route.
 *
 *   GET /api/dev/market                          every species: ticker, data state, vigour breakdown
 *   GET /api/dev/market?species=id&range=1M      one species' full snapshot (classified ones too)
 *   GET /api/dev/market?simulate=2.5,-1.8        the growth formula applied to hypothetical daily moves
 */
export async function GET(req: Request) {
  const fixture = process.env.SOLANITES_FIXTURES === "1" && process.env.NODE_ENV !== "production";
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!fixture && !secretMatches(token, process.env.SOLANITES_DEV_TOKEN?.trim() || undefined)) return fail(404, "NOT_FOUND", "Not found.");
  const limited = await rateLimit(req, "market-dev", 30, 60_000);
  if (limited) return limited;

  const url = new URL(req.url);
  const simulate = url.searchParams.get("simulate");
  if (simulate !== null) {
    const moves = simulate.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)).slice(0, 60);
    // Hypothetical sessions only: computed here and returned, never stored.
    const entries: GrowthEntry[] = moves.map((changePct, i) => ({ date: `sim-${String(i + 1).padStart(3, "0")}`, previousDate: "", previousClose: 100, close: 100 * (1 + changePct / 100), changePct, points: growthPoints(changePct) }));
    return Response.json({ rules: GROWTH_RULES, entries, vigour: vigourOf(entries) }, { headers: noStore });
  }

  try {
    const rt = await getMarketRuntime();
    const species = url.searchParams.get("species");
    if (species !== null) {
      if (!SPECIES_BY_ID[species]) return fail(404, "NOT_FOUND", "Unknown species.");
      const range = (MARKET_RANGES as readonly string[]).includes(url.searchParams.get("range") ?? "") ? (url.searchParams.get("range") as MarketRange) : "1M";
      return Response.json(await rt.service.snapshot(species, range), { headers: noStore });
    }
    return Response.json({ provider: rt.provider ? { name: rt.provider.name, plan: rt.provider.plan } : null, rules: GROWTH_RULES, links: await rt.service.diagnostics() }, { headers: noStore });
  } catch (e) {
    if (e instanceof ConfigError) return fail(503, "NOT_CONFIGURED", "Market data is not switched on yet on this server (DATABASE_URL).");
    return fail(500, "UPSTREAM_ERROR", (e as Error).message);
  }
}
