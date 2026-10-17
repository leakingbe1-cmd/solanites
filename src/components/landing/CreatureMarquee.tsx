import { CreatureArt } from "@/components/creature/CreatureArt";
import { RARITIES } from "@/lib/rarity";
import { SPECIES } from "@/lib/species";

/** Endless strip of known Solanites. Mythic & Secret entries stay hidden. */
export function CreatureMarquee() {
  const list = SPECIES.filter((s) => s.rarity !== "secret");
  const row = [...list, ...list];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-abyss/40 py-6" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-void to-transparent" />
      <div className="sl-marquee flex w-max gap-10">
        {row.map((s, i) => {
          const hidden = s.rarity === "mythic";
          return (
            <div key={`${s.id}-${i}`} className="flex items-center gap-3">
              <div className="h-14 w-14">
                <CreatureArt species={s} stage={1} animated={false} showAura={false} silhouette={hidden} />
              </div>
              <div>
                <p className="font-display text-sm text-white/90">{hidden ? "???" : s.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: RARITIES[s.rarity].color }}>
                  {RARITIES[s.rarity].label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
