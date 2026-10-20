import "server-only";
import { MARKET_RANGES, type MarketRange } from "@/lib/market/types";
import { SPECIES_BY_ID } from "@/lib/species";
import { ConfigError } from "@/server/config";
import { fail, noStore, rateLimit } from "@/server/http";
import { log } from "@/server/log";
import { MarketDataError } from "@/server/market/provider";
import { getLiveMarket, getMarketRuntime, marketPublicDisplay, publicMarketWidget } from "@/server/market/runtime";
import { unavailableSnapshot } from "@/server/market/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notFound = () => fail(404, "NOT_FOUND", "Not found.");

/**
 * GET /api/market/:speciesId?range=1M
 *
 * A species' linked stock: identity, the latest price and daily change, a chart for the range,
 * and its Market Vigour.
 *
 * Genuine provider prices are public only when MARKET_PUBLIC_DISPLAY=1 (set once the plan's
 * display rights are confirmed). Otherwise every public species gets the identity-only
 * unavailable snapshot, whether or not a provider key is configured, so the free Basic plan's
 * internal-use data never reaches a visitor. Local sample mode is exempt (labelled sample data).
 *
 * Every species gets the same answer, Mythic and Secret included (owner decision, 20 Oct:
 * all six are public, with their approved stock pairings).
 */
export async function GET(req: Request, { params }: { params: Promise<{ speciesId: string }> }) {
  // Rate-limited before any lookup.
  const limited = await rateLimit(req, "market-view", 60, 60_000);
  if (limited) return limited;
  // The range is checked before the species, so a bad range answers the same for every id.
  const url = new URL(req.url);
  const rangeParam = url.searchParams.get("range") ?? "1M";
  if (!(MARKET_RANGES as readonly string[]).includes(rangeParam)) return fail(400, "INVALID_REQUEST", `range must be one of ${MARKET_RANGES.join(", ")}.`);
  const range = rangeParam as MarketRange;
  const speciesId = decodeURIComponent((await params).speciesId);
  // Own properties only: "constructor", "__proto__" and the like are unknown ids, not lookups.
  if (!Object.hasOwn(SPECIES_BY_ID, speciesId)) return notFound();

  const sample = process.env.SOLANITES_FIXTURES === "1" && process.env.NODE_ENV !== "production";
  if (!marketPublicDisplay() && !sample) {
    // Public display not enabled: no genuine numbers, whatever is configured.
    const snap = unavailableSnapshot(speciesId, range, Date.now());
    // The only public price display: an embeddable chart the visitor's browser loads from the
    // provider, when this deployment enables it.
    if (publicMarketWidget() === "tradingview") {
      snap.externalChart = "tradingview";
      snap.statusDetail = "Prices and chart by TradingView; timing per TradingView, may be delayed.";
    }
    return Response.json(snap, { headers: noStore });
  }
  try {
    const live = sample ? null : getLiveMarket();
    const snap = live ? await live.snapshot(speciesId, range) : await (await getMarketRuntime()).service.snapshot(speciesId, range);
    // Shared caches may hold public answers briefly: a minute for live quotes, longer for stored closes.
    const headers = { "cache-control": live ? "public, s-maxage=60, stale-while-revalidate=300" : "public, s-maxage=120, stale-while-revalidate=600" };
    return Response.json(snap, { headers });
  } catch (e) {
    if (e instanceof ConfigError) {
      return Response.json(unavailableSnapshot(speciesId, range, Date.now()), { headers: noStore });
    }
    if (e instanceof MarketDataError && e.code === "NOT_FOUND") return notFound();
    if (e instanceof MarketDataError && e.code === "RATE_LIMITED") {
      return Response.json({ error: { code: "MARKET_BUSY", message: "Market data is busy right now. Please try again in a minute." } }, { status: 503, headers: { ...noStore, "retry-after": "60" } });
    }
    // Codes only: provider messages are never logged or returned.
    log.error("market.view_failed", { species: speciesId, code: e instanceof MarketDataError ? e.code : "INTERNAL" });
    return fail(503, "MARKET_UNAVAILABLE", "Market data is temporarily unavailable. Nothing has changed; please try again shortly.");
  }
}
