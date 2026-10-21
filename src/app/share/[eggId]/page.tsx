import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedCard } from "@/components/share/SharedCard";
import { RARITIES } from "@/lib/rarity";
import { cardPath, EGG_ID, shareable } from "@/lib/share";
import { SPECIES_BY_ID } from "@/lib/species";
import { getRuntime } from "@/server/runtime";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ eggId: string }> };

/** The hatched creature behind a share link, from the tracker; null when unknown, unhatched or not configured. */
async function hatched(id: string) {
  if (!EGG_ID.test(id)) return null;
  try {
    const view = await (await getRuntime()).tracker.holderView(id.slice(4, id.lastIndexOf("_")));
    const egg = view.eggs.find((e) => e.id === id);
    const s = egg?.hatchedAt != null && egg.speciesId ? SPECIES_BY_ID[egg.speciesId] : undefined;
    return shareable(s) ? s : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = decodeURIComponent((await params).eggId);
  const s = await hatched(id);
  if (!s) return { title: "Solanites" };
  const title = `A ${RARITIES[s.rarity].label} ${s.name} hatched in Solanites`;
  const image = { url: cardPath({ kind: "egg", eggId: id }), width: 1200, height: 630 };
  return { title, openGraph: { title, images: [image] }, twitter: { card: "summary_large_image", title, images: [image] } };
}

/** /share/:eggId: where a shared hatch card links to. */
export default async function SharePage({ params }: Props) {
  const id = decodeURIComponent((await params).eggId);
  const s = await hatched(id);
  if (!s) notFound();
  return <SharedCard src={cardPath({ kind: "egg", eggId: id })} alt={`${s.name}, ${RARITIES[s.rarity].label}`} demo={false} />;
}
