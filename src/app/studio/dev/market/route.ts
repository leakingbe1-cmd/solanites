import "server-only";
import { GROWTH_RULES, growthPoints, vigourOf, type GrowthEntry } from "@/lib/market/growth";
import { MARKET_RANGES, type MarketRange } from "@/lib/market/types";
import { ConfigError } from "@/server/config";
import { fail, noStore, rateLimit } from "@/server/http";
import { SPECIES_BY_ID } from "@/lib/species";
import { latestCompletedSession } from "@/lib/market/calendar";
import { MarketDataError } from "@/server/market/provider";
import { getLiveMarket, getMarketRuntime, marketPublicDisplay } from "@/server/market/runtime";
import { STOCK_LINKS } from "@/server/market/stockLinks";
import { studioApiGuard } from "@/server/studioAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Owner diagnostics for the stock links. Read-only: it never writes game state, ownership,
 * odds or rewards, and it can't change what the public endpoint returns.
 *
 * Developer Mode only: the same owner authentication and DEVELOPER_MODE=off switch as the
 * rest of /studio (checked by the middleware and again here).
 *
 *   GET /studio/dev/market                          every species: ticker, data state, vigour breakdown
 *   GET /studio/dev/market?species=id&range=1M      one species' full snapshot
 *   GET /studio/dev/market?simulate=2.5,-1.8        the growth formula applied to hypothetical daily moves
 */
export async function GET(req: Request) {
  const denied = studioApiGuard(req);
  if (denied) return denied;
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

  const species = url.searchParams.get("species");
  const range = (MARKET_RANGES as readonly string[]).includes(url.searchParams.get("range") ?? "") ? (url.searchParams.get("range") as MarketRange) : "1M";
  // Internal testing: genuine Twelve Data numbers are allowed here (owner only), never publicly.
  const live = getLiveMarket();
  if (live) {
    if (species !== null) {
      if (!Object.hasOwn(SPECIES_BY_ID, species)) return fail(404, "NOT_FOUND", "Unknown species.");
      try {
        return Response.json(await live.snapshot(species, range), { headers: noStore });
      } catch (e) {
        const code = e instanceof MarketDataError ? e.code : "UNAVAILABLE";
        return fail(code === "NOT_FOUND" ? 404 : 503, `MARKET_${code}`, e instanceof MarketDataError ? e.message : "The market data provider couldn't be reached.");
      }
    }
    // Rows are fetched only when one is selected (nothing is selected on open), so listing costs
    // no credits. Coverage stays "unverified" until this server instance has seen a live answer;
    // the budget shown is this instance's (Vercel may run several).
    const s = live.stats();
    return Response.json(
      {
        provider: { name: "Twelve Data", plan: `Basic (free), fetched when a row is selected · this instance: ${s.creditsToday}/${s.perDay} credits today, ${s.creditsThisMinute}/${s.perMinute} this minute${s.backoffUntil ? " · provider back-off active" : ""} · public display ${marketPublicDisplay() ? "ON" : "off"}` },
        fetchOnSelect: true,
        rules: GROWTH_RULES,
        links: STOCK_LINKS.map((l) => ({ ...l, name: SPECIES_BY_ID[l.speciesId]?.name ?? l.speciesId, rarity: SPECIES_BY_ID[l.speciesId]?.rarity ?? null, accent: SPECIES_BY_ID[l.speciesId]?.palette.accent ?? "#efe8da", latestSession: null, latestClose: null, expectedSession: latestCompletedSession(Date.now()), upToDate: true, growth: null, coverage: live.coverageOf(l.ticker), state: { lastErrorCode: null, needsHistory: false } })),
      },
      { headers: noStore },
    );
  }

  try {
    const rt = await getMarketRuntime();
    if (species !== null) {
      if (!Object.hasOwn(SPECIES_BY_ID, species)) return fail(404, "NOT_FOUND", "Unknown species.");
      return Response.json(await rt.service.snapshot(species, range), { headers: noStore });
    }
    return Response.json({ provider: rt.provider ? { name: rt.provider.name, plan: rt.provider.plan } : null, rules: GROWTH_RULES, links: (await rt.service.diagnostics()).map((l) => ({ ...l, name: SPECIES_BY_ID[l.speciesId]?.name ?? l.speciesId, rarity: SPECIES_BY_ID[l.speciesId]?.rarity ?? null, accent: SPECIES_BY_ID[l.speciesId]?.palette.accent ?? "#efe8da" })) }, { headers: noStore });
  } catch (e) {
    if (e instanceof ConfigError) return fail(503, "NOT_CONFIGURED", "Market data is not switched on on this server (no TWELVE_DATA_API_KEY, and MARKET_DATA_ENABLED is off).");
    return fail(500, "UPSTREAM_ERROR", "The market service failed; see the server log for the error code.");
  }
}
