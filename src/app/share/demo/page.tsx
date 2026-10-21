import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedCard } from "@/components/share/SharedCard";
import { RARITIES } from "@/lib/rarity";
import { cardPath, demoShareable, stageParam, validStage } from "@/lib/share";
import { SPECIES_BY_ID } from "@/lib/species";

type Props = { searchParams: Promise<{ species?: string; stage?: string }> };

async function target(searchParams: Props["searchParams"]) {
  const q = await searchParams;
  const s = SPECIES_BY_ID[q.species ?? ""];
  const stage = stageParam(q.stage);
  return demoShareable(s) && validStage(stage) ? { s, stage } : null;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const t = await target(searchParams);
  if (!t) return { title: "Solanites" };
  const title = `A ${RARITIES[t.s.rarity].label} ${t.s.name} from the Solanites demo`;
  const image = { url: cardPath({ kind: "demo", speciesId: t.s.id, stage: t.stage }), width: 1200, height: 630 };
  return { title, openGraph: { title, images: [image] }, twitter: { card: "summary_large_image", title, images: [image] } };
}

/** /share/demo?species=…&stage=…: where a shared demo card links to. Labelled as simulated. */
export default async function DemoSharePage({ searchParams }: Props) {
  const t = await target(searchParams);
  if (!t) notFound();
  return <SharedCard src={cardPath({ kind: "demo", speciesId: t.s.id, stage: t.stage })} alt={`${t.s.name}, ${RARITIES[t.s.rarity].label} (demo)`} demo />;
}
