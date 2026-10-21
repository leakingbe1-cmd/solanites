import "server-only";
import { fail } from "@/server/http";
import { renderCard } from "@/server/share/card";
import { demoShareable, stageParam, validStage } from "@/lib/share";
import { SPECIES_BY_ID } from "@/lib/species";

export const runtime = "nodejs";

/** GET /api/card/demo?species=…&stage=…: a demo share card, stamped DEMO. Common to Legendary only. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const s = SPECIES_BY_ID[q.get("species") ?? ""];
  const stage = stageParam(q.get("stage"));
  if (!demoShareable(s) || !validStage(stage)) return fail(404, "NOT_FOUND", "No demo card for that.");
  const card = await renderCard({ speciesId: s.id, stage, demo: true });
  card.headers.set("cache-control", "public, s-maxage=86400");
  return card;
}
