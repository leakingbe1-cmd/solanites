import { CreatureArt } from "@/components/creature/CreatureArt";
import { gameConfig } from "@/config/gameConfig";
import { rarityChances } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { speciesOfRarity } from "@/lib/species";

/** One specimen per tier, presented as archive plates. */
export function RarityShowcase() {
  const chances = rarityChances(gameConfig);
  return (
    <div className="mt-16 grid grid-cols-1 border-l border-t border-line [&>*]:border-b [&>*]:border-r [&>*]:border-line sm:grid-cols-2 lg:grid-cols-3">
      {RARITY_ORDER.map((r) => {
        const meta = RARITIES[r];
        const s = speciesOfRarity(r)[0];
        const secret = r === "secret";
        const c = chances[r] * 100;
        return (
          <article key={r} className="group relative bg-void p-6 sm:p-8">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.34em]" style={{ color: meta.color }}>
                {meta.label}
              </span>
              <span className="sl-num text-[11px] text-dim">{c < 1 ? c.toFixed(1) : Math.round(c)}%</span>
            </div>
            <div className="relative mx-auto my-4 aspect-square w-full max-w-[300px] transition-transform duration-700 ease-out group-hover:scale-[1.03]">
              <CreatureArt species={s} stage={secret ? 2 : 3} silhouette={secret} showAura={!secret} animated={false} />
            </div>
            <h3 className="font-display text-3xl text-platinum">{secret ? "Classified" : s.name}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-mist">{meta.tagline}</p>
          </article>
        );
      })}
    </div>
  );
}
