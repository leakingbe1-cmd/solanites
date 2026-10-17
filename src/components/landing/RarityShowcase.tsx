import { CreatureArt } from "@/components/creature/CreatureArt";
import { gameConfig } from "@/config/gameConfig";
import { rarityChances } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";

const FEATURED: Record<string, string> = {
  common: "mossling",
  rare: "duskwing",
  epic: "neonyx",
  legendary: "aurelion",
  mythic: "astravex",
  secret: "genesis",
};

export function RarityShowcase() {
  const chances = rarityChances(gameConfig);
  return (
    <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
      {RARITY_ORDER.map((r) => {
        const meta = RARITIES[r];
        const s = SPECIES_BY_ID[FEATURED[r]];
        const secret = r === "secret";
        const c = chances[r] * 100;
        return (
          <div
            key={r}
            className="sl-card-hover group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-4"
            style={{ boxShadow: `inset 0 1px 0 ${meta.color}22` }}
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }} />
            <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-80" style={{ background: meta.color }} />
            <div className="relative aspect-square transition-transform duration-500 group-hover:scale-[1.06]">
              <CreatureArt species={s} stage={2} silhouette={secret} showAura={!secret} />
              {secret && <span className="absolute inset-0 grid place-items-center font-display text-4xl text-white/80">?</span>}
            </div>
            <div className="relative mt-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: meta.color }}>
                {meta.label}
              </p>
              <p className="mt-1 font-display text-base text-white">{secret ? "Classified" : s.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-mist/80">{meta.tagline}</p>
              <p className="mt-3 font-mono text-[11px] text-white/50">{c < 1 ? c.toFixed(1) : Math.round(c)}% hatch rate</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
