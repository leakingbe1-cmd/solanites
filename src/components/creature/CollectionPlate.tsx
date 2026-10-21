"use client";

import { CreatureScene } from "@/components/creature/CreatureScene";
import { RarityBadge } from "@/components/ui/RarityBadge";
import type { Discovery } from "@/lib/discovery";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { ELEMENT_GLYPH, FEATURED_STAGE, type Species } from "@/lib/species";
import { sfx } from "@/lib/sound";

/**
 * One bestiary plate in the Collection grid (also previewed in Developer Mode).
 * `stage` is the viewer's best form of the species, if any.
 */
export function CollectionPlate({ species: s, discovery: d, stage, bestLabel, demo = false, onOpen }: { species: Species; discovery: Discovery; stage?: number; bestLabel?: string; /** Demo discoveries are simulated: marked "Demo" so they never read as real. */ demo?: boolean; onOpen(): void }) {
  const meta = RARITIES[s.rarity];
  return (
    <button
      onClick={() => {
        sfx.click();
        onOpen();
      }}
      onMouseEnter={() => sfx.hover()}
      className="sl-card-hover sl-plate group relative overflow-hidden rounded-md p-3 text-left sm:p-5"
      style={{ "--card-glow": meta.glow, "--tier": meta.color } as React.CSSProperties}
    >
      <div className="relative flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#f6d488]/70">№ {String(s.dex).padStart(3, "0")}</span>
        {/* rarity tier as pips (one for Common … six for Secret), not colour alone */}
        <span className="flex items-center gap-[3px]" title={`${meta.label} · tier ${RARITY_ORDER.indexOf(s.rarity) + 1} of ${RARITY_ORDER.length}`}>
          {RARITY_ORDER.map((r, i) => (
            <span key={r} className="sl-pip" data-on={i <= RARITY_ORDER.indexOf(s.rarity) ? "" : undefined} aria-hidden />
          ))}
        </span>
      </div>
      {/* the creature in its biome; only the creature lifts on hover */}
      <CreatureScene species={s} stage={stage ?? FEATURED_STAGE} size="card" className="sl-portrait mt-2 aspect-square rounded-[3px]" artClassName="sl-art-host" />
      <div className="relative border-t border-white/[0.06] pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-display text-base text-bone sm:text-xl">{s.name}</p>
          <span className={`shrink-0 font-mono text-[9px] uppercase tracking-wider ${d === "owned" ? (demo ? "text-amber-200" : "text-sol-green") : "text-mist/50"}`} data-demo={d === "owned" && demo ? "" : undefined}>{d === "owned" ? (demo ? "● Demo" : "● Discovered") : "Catalogued"}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <RarityBadge rarity={s.rarity} />
          <span className="text-[11px] text-mist">{ELEMENT_GLYPH[s.element]} {s.element}</span>
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-mist/50">{bestLabel ? `${demo ? "Demo best" : "Your best"}: ${bestLabel}` : "Evolution: —"}</p>
      </div>
    </button>
  );
}
