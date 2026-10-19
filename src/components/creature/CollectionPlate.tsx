"use client";

import { CreatureArt } from "@/components/creature/CreatureArt";
import { RarityBadge } from "@/components/ui/RarityBadge";
import type { Discovery } from "@/lib/discovery";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { ELEMENT_GLYPH, type Species } from "@/lib/species";
import { sfx } from "@/lib/sound";

/**
 * One bestiary plate in the Collection grid (also previewed in Developer Mode).
 * `discovery` decides what it reveals: a classified species shows only its silhouette.
 * `stage` is the viewer's best form of the species, if any.
 */
export function CollectionPlate({ species: s, discovery: d, stage, bestLabel, onOpen }: { species: Species; discovery: Discovery; stage?: number; bestLabel?: string; onOpen(): void }) {
  const meta = RARITIES[s.rarity];
  const hidden = d === "classified";
  return (
    <button
      onClick={() => {
        sfx.click();
        onOpen();
      }}
      onMouseEnter={() => sfx.hover()}
      className="sl-card-hover sl-plate group relative overflow-hidden rounded-md p-3 text-left sm:p-5"
      style={{ "--card-glow": hidden ? "rgba(110,90,255,0.45)" : meta.glow, "--tier": hidden ? "#6b6888" : meta.color } as React.CSSProperties}
    >
      <div className="relative flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#f6d488]/70">№ {String(s.dex).padStart(3, "0")}</span>
        {/* rarity tier as pips (one for Common … six for Secret), not colour alone */}
        <span className="flex items-center gap-[3px]" title={hidden && s.rarity === "secret" ? "Classified tier" : `${meta.label} · tier ${RARITY_ORDER.indexOf(s.rarity) + 1} of ${RARITY_ORDER.length}`}>
          {RARITY_ORDER.map((r, i) => (
            <span key={r} className="sl-pip" data-on={i <= RARITY_ORDER.indexOf(s.rarity) && !(hidden && s.rarity === "secret") ? "" : undefined} aria-hidden />
          ))}
        </span>
      </div>
      {/* interim lighting around the current SVG creature (the creature art itself is being redesigned separately) */}
      <div className="sl-portrait sl-art-host aspect-square" style={{ "--sl-glow": hidden ? "rgba(110,90,255,0.3)" : meta.glow } as React.CSSProperties}>
        <div className="sl-portrait-art relative h-full w-full">
          <CreatureArt species={s} stage={stage ?? 2} silhouette={hidden} showAura={!hidden && ["legendary", "mythic", "secret"].includes(s.rarity)} animated={false} />
        </div>
        <div className="sl-portrait-grade" aria-hidden />
      </div>
      <div className="relative border-t border-white/[0.06] pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-display text-base text-bone sm:text-xl">{hidden ? "???" : s.name}</p>
          <span className={`shrink-0 font-mono text-[9px] uppercase tracking-wider ${d === "owned" ? "text-sol-green" : "text-mist/50"}`}>{d === "owned" ? "● Discovered" : hidden ? "Classified" : "Catalogued"}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <RarityBadge rarity={s.rarity} hidden={hidden && s.rarity === "secret"} />
          {!hidden && <span className="text-[11px] text-mist">{ELEMENT_GLYPH[s.element]} {s.element}</span>}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-mist/50">{bestLabel ? `Your best: ${bestLabel}` : "Evolution: —"}</p>
      </div>
    </button>
  );
}
