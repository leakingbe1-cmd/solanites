import { randomInt } from "node:crypto";
import { gameConfig } from "@/config/gameConfig";
import { baseWeights, chancesOf, effectiveWeights, parseDevOdds, simulateHatch } from "@/lib/devOdds";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, SPECIES_BY_ID } from "@/lib/species";
import { fail, noStore } from "@/server/http";
import { studioApiGuard } from "@/server/studioAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Simulated hatches per request; enough for a stable distribution check. */
const MAX_SIMULATIONS = 10_000;

/**
 * POST /studio/dev/simulate — Developer Mode only (owner authentication, checked
 * here as well as in the middleware). Rolls simulated hatches with the developer odds:
 * the production `rollSpecies` fed a copy of the rarity weights. Nothing is stored and
 * nothing is read from or written to the database, the tracker, eggs, creatures,
 * rewards or any wallet. The public hatch endpoint (/api/eggs/:id/hatch) takes no
 * odds at all: its species was sealed on the server when the egg was issued.
 *
 * Body: { settings: DevOddsSettings, count?: 1–10000, seed?: integer (for a reproducible run) }
 */
export async function POST(req: Request) {
  const denied = studioApiGuard(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "INVALID", "Send a JSON body.");
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const parsed = parseDevOdds(b.settings ?? {});
  if (!parsed.ok) return fail(400, "INVALID", parsed.error);
  const count = b.count ?? 1;
  if (typeof count !== "number" || !Number.isInteger(count) || count < 1 || count > MAX_SIMULATIONS) return fail(400, "INVALID", `count must be a whole number from 1 to ${MAX_SIMULATIONS}.`);
  const firstSeed = b.seed ?? randomInt(0, 2 ** 32 - count);
  if (typeof firstSeed !== "number" || !Number.isInteger(firstSeed) || firstSeed < 0 || firstSeed > 2 ** 32 - 1 - count) return fail(400, "INVALID", "seed must be a non-negative 32-bit integer.");

  const settings = parsed.settings;
  const tally = Object.fromEntries(RARITY_ORDER.map((r) => [r, 0])) as Record<string, number>;
  const results: { seed: number; speciesId: string; rarity: string }[] = [];
  for (let i = 0; i < count; i++) {
    const seed = firstSeed + i;
    const speciesId = simulateHatch(seed, gameConfig, settings, SPECIES);
    const rarity = SPECIES_BY_ID[speciesId].rarity;
    tally[rarity] += 1;
    if (results.length < 20) results.push({ seed, speciesId, rarity });
  }

  return Response.json(
    {
      simulated: true,
      settings,
      count,
      firstSeed,
      base: chancesOf(baseWeights(gameConfig)),
      effective: chancesOf(effectiveWeights(gameConfig, settings)),
      tally,
      results,
    },
    { headers: { ...noStore, "x-robots-tag": "noindex, nofollow" } },
  );
}
