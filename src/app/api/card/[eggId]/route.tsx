import "server-only";
import { fail, failFromError, rateLimit } from "@/server/http";
import { getRuntime } from "@/server/runtime";
import { renderCard } from "@/server/share/card";
import { EGG_ID, shareable } from "@/lib/share";
import { SPECIES_BY_ID } from "@/lib/species";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/card/:eggId: the share card for a hatched egg. Species, rarity and form come from the
 * tracker's record; an egg that hasn't hatched has no card (its species stays sealed).
 */
export async function GET(req: Request, { params }: { params: Promise<{ eggId: string }> }) {
  const id = decodeURIComponent((await params).eggId);
  if (!EGG_ID.test(id)) return fail(404, "NOT_FOUND", "Unknown egg.");
  const limited = await rateLimit(req, "card", 60, 60_000);
  if (limited) return limited;
  try {
    const owner = id.slice(4, id.lastIndexOf("_"));
    const view = await (await getRuntime()).tracker.holderView(owner);
    const egg = view.eggs.find((e) => e.id === id);
    if (!egg || egg.hatchedAt === null || !egg.speciesId) return fail(404, "NOT_FOUND", "No card for this egg yet.");
    // Mythic and Secret cards stay off until launch (SHARE_TOP_TIERS).
    if (!shareable(SPECIES_BY_ID[egg.speciesId])) return fail(404, "NOT_FOUND", "No card for this egg yet.");
    const card = await renderCard({ speciesId: egg.speciesId, stage: egg.evolution?.stage ?? 0, keeper: owner, demo: false });
    card.headers.set("cache-control", "public, s-maxage=300, stale-while-revalidate=600");
    return card;
  } catch (e) {
    return failFromError(e, "card");
  }
}
