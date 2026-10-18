"use client";

import { useRef, useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { gameConfig } from "@/config/gameConfig";
import { RARITIES } from "@/lib/rarity";
import { ELEMENT_GLYPH, SPECIES_BY_ID } from "@/lib/species";

/**
 * Hero centrepiece: the strongest finished creature in the catalogue, shown in
 * its final form. Pyraurum's Ascended phoenix has the boldest silhouette, the
 * richest layered detail and reads best at large sizes. It is Legendary, so it
 * is not one of the classified (Mythic/Secret) species that stay hidden until
 * discovered.
 */
const HERO_SPECIES = "pyraurum";
const HERO_STAGE = gameConfig.evolution.names.length - 1;

export function HeroCreature() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const species = SPECIES_BY_ID[HERO_SPECIES];
  const rarity = RARITIES[species.rarity];

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-square w-full max-w-[min(92vw,600px)]"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {/* restrained backlight in the creature's own colours */}
      <div className="absolute inset-[14%] rounded-full blur-[90px]" style={{ background: `${rarity.color2}33` }} />
      <div className="absolute inset-[30%] rounded-full blur-[70px]" style={{ background: `${rarity.color}22` }} />

      {/* orbit rings, as before */}
      <svg viewBox="0 0 500 500" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9945ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#9945ff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#14f195" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: "250px 250px", animation: "sl-spin 40s linear infinite" }}>
          <circle cx="250" cy="250" r="232" fill="none" stroke="url(#hero-ring)" strokeWidth="1" />
          <circle cx="250" cy="18" r="3" fill="#14f195" />
        </g>
        <g style={{ transformOrigin: "250px 250px", animation: "sl-spin 70s linear infinite reverse" }}>
          <circle cx="250" cy="250" r="205" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 10" />
          <circle cx="45" cy="250" r="2" fill="#9945ff" />
        </g>
      </svg>

      {/* the creature: vector art, so it stays crisp at any size; gentle float + pointer parallax */}
      <div
        className="absolute inset-[2%] transition-transform duration-300 ease-out"
        style={{ transform: `perspective(900px) rotateY(${tilt.x * 8}deg) rotateX(${-tilt.y * 6}deg) translate(${tilt.x * 8}px, ${tilt.y * 8}px)` }}
      >
        <div className="sl-hero-float h-full w-full">
          <CreatureArt species={species} stage={HERO_STAGE} />
        </div>
      </div>

      {/* name plates */}
      <div className="sl-glass sl-fade-up absolute left-0 top-[3%] hidden rounded-2xl px-4 py-3 sm:block" style={{ animationDelay: "0.9s" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">{gameConfig.evolution.names[HERO_STAGE]} form</p>
        <p className="mt-1 font-display text-lg text-white">{species.name}</p>
      </div>
      <div className="sl-glass sl-fade-up absolute bottom-[12%] right-0 hidden rounded-2xl px-4 py-3 sm:block" style={{ animationDelay: "1.1s" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">{species.epithet}</p>
        <p className="mt-1 flex items-center gap-2 font-mono text-sm text-white">
          <span className="h-2 w-2 rounded-full" style={{ background: rarity.color, boxShadow: `0 0 10px ${rarity.color}` }} />
          {rarity.label} · {ELEMENT_GLYPH[species.element]} {species.element}
        </p>
      </div>
    </div>
  );
}
