import { CreatureArt } from "@/components/creature/CreatureArt";
import { RARITIES } from "@/lib/rarity";
import { SPECIES } from "@/lib/species";

/** A slow procession of the archive. Mythic and Secret entries stay unrecorded. */
export function CreatureMarquee() {
  const row = [...SPECIES, ...SPECIES];
  return (
    <div className="relative overflow-hidden border-y border-line py-7" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-void to-transparent" />
      <div className="sl-marquee flex w-max gap-14">
        {row.map((s, i) => {
          const hidden = s.rarity === "mythic" || s.rarity === "secret";
          return (
            <div key={`${s.id}-${i}`} className="flex items-center gap-4">
              <div className="h-16 w-16">
                <CreatureArt species={s} stage={2} animated={false} showAura={false} silhouette={hidden} />
              </div>
              <div>
                <p className="font-display text-lg text-silver">{hidden ? "Unrecorded" : s.name}</p>
                <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: hidden ? "#5c5e6c" : RARITIES[s.rarity].color }}>
                  {hidden ? "—" : RARITIES[s.rarity].label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
