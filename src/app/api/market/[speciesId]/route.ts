import "server-only";
import { CLASSIFIED_RARITIES } from "@/lib/discovery";
import { MARKET_RANGES, type MarketRange } from "@/lib/market/types";
import { SPECIES_BY_ID } from "@/lib/species";
import { ConfigError } from "@/server/config";
import { fail, noStore, rateLimit } from "@/server/http";
import { log } from "@/server/log";
import { MarketDataError } from "@/server/market/provider";
import { getMarketRuntime } from "@/server/market/runtime";
import { unavailableSnapshot } from "@/server/market/service";
import { ownsHatched } from "@/server/market/store";
import { checkSolanaAddress } from "@/server/solana/address";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notFound = () => fail(404, "NOT_FOUND", "Not found.");

/**
 * GET /api/market/:speciesId?range=1M[&owner=<address>]
 *
 * A species' linked stock: identity, the latest recorded close and daily change, a chart for
 * the range, and its Market Vigour. Reads stored data; it never triggers a provider fetch except
 * the 1D chart, which is cached per session and limited by a shared per-minute budget.
 *
 * Mythic and Secret species are classified: their link is only returned with `owner`, the
 * public address of a wallet that has hatched one (checked against holder tracking). Unknown
 * and unproven classified species get the same 404, so the response reveals nothing.
 */
export async function GET(req: Request, { params }: { params: Promise<{ speciesId: string }> }) {
  const speciesId = decodeURIComponent((await params).speciesId);
  const species = SPECIES_BY_ID[speciesId];
  if (!species) return notFound();
  const url = new URL(req.url);
  const rangeParam = url.searchParams.get("range") ?? "1M";
  if (!(MARKET_RANGES as readonly string[]).includes(rangeParam)) return fail(400, "INVALID_REQUEST", `range must be one of ${MARKET_RANGES.join(", ")}.`);
  const range = rangeParam as MarketRange;

  const limited = await rateLimit(req, "market-view", 60, 60_000);
  if (limited) return limited;

  const classified = CLASSIFIED_RARITIES.includes(species.rarity);
  try {
    const rt = await getMarketRuntime();
    if (classified) {
      const owner = checkSolanaAddress(url.searchParams.get("owner") ?? "");
      if (!owner.ok || !(await ownsHatched(rt.db, owner.address, speciesId))) return notFound();
    }
    const snap = await rt.service.snapshot(speciesId, range);
    // Public links change at most once per session (plus the lazily cached 1D chart), so shared caches may hold them briefly.
    const headers = classified ? noStore : { "cache-control": "public, s-maxage=120, stale-while-revalidate=600" };
    return Response.json(snap, { headers });
  } catch (e) {
    if (e instanceof ConfigError) {
      // Not set up yet: classified links still need proof of ownership, which needs the database.
      if (classified) return notFound();
      return Response.json(unavailableSnapshot(speciesId, range, Date.now()), { headers: noStore });
    }
    if (e instanceof MarketDataError && e.code === "NOT_FOUND") return notFound();
    log.error("market.view_failed", { species: speciesId, error: (e as Error).message });
    return fail(503, "MARKET_UNAVAILABLE", "Market data is temporarily unavailable. Nothing has changed; please try again shortly.");
  }
}
