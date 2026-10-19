// Renders the site's own creature and egg components, one per tile, so the
// campaign uses the genuine Solanites artwork. Driven by ?items=… (see art.mjs).
import { createRoot } from "react-dom/client";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt, type EggVisualStage } from "@/components/egg/EggArt";
import { SPECIES } from "@/lib/species";

const byId = (id: string) => {
  const s = SPECIES.find(x => x.id === id);
  if (!s) throw new Error(`unknown species ${id}`);
  return s;
};

// item syntax: c:<species>:<stage>[:sil]  or  e:<eggStage>:<seed>[:<insideSpecies>]
function Tile({ item }: { item: string }) {
  const [kind, a, b, c] = item.split(":");
  const box = { width: 800, height: kind === "e" ? 1013 : 800 };
  return (
    <div data-item={item} style={{ ...box, position: "relative" }}>
      {kind === "c" ? (
        <CreatureArt species={byId(a)} stage={Number(b)} animated={false} silhouette={c === "sil"} vector className="h-full w-full" />
      ) : (
        <EggArt stage={Number(a) as EggVisualStage} seed={Number(b)} progress={0.5} inside={c ? byId(c) : undefined} className="h-full w-full" />
      )}
    </div>
  );
}

const items = (new URLSearchParams(location.search).get("items") ?? "").split(",").filter(Boolean);
createRoot(document.getElementById("root")!).render(
  <div style={{ display: "flex", flexWrap: "wrap", gap: 20, padding: 20 }}>
    {items.map(i => <Tile key={i} item={i} />)}
  </div>,
);
requestAnimationFrame(() => setTimeout(() => document.body.setAttribute("data-ready", "1"), 400));
