"use client";

import type { CSSProperties } from "react";
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

/** Fixed ember paths (no randomness, so server and client render identically). */
const EMBERS = [
  { left: 22, size: 3, dur: 7.5, delay: 0, drift: 14 },
  { left: 31, size: 2, dur: 9, delay: 2.4, drift: -10 },
  { left: 38, size: 4, dur: 8, delay: 5.1, drift: 8 },
  { left: 45, size: 2, dur: 10, delay: 1.2, drift: -16 },
  { left: 52, size: 3, dur: 7, delay: 3.8, drift: 12 },
  { left: 58, size: 2, dur: 9.5, delay: 6.3, drift: -6 },
  { left: 64, size: 3, dur: 8.5, delay: 0.7, drift: 18 },
  { left: 71, size: 2, dur: 11, delay: 4.5, drift: -12 },
  { left: 77, size: 3, dur: 9, delay: 7.4, drift: 6 },
];

export function HeroCreature() {
  const species = SPECIES_BY_ID[HERO_SPECIES];
  const rarity = RARITIES[species.rarity];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(92vw,600px)]">
      {/* restrained backlight in the creature's own colours */}
      <div className="absolute inset-[14%] rounded-full blur-[90px]" style={{ background: `${rarity.color2}33` }} />
      <div className="absolute inset-[30%] rounded-full blur-[70px]" style={{ background: `${rarity.color}22` }} />
      {/* warm breathing glow: a plain gradient, so only its opacity and scale animate */}
      <div
        className="sl-hero-glow absolute inset-[12%] rounded-full"
        style={{ background: `radial-gradient(circle, ${rarity.color}38 0%, ${rarity.color2}14 42%, transparent 68%)` }}
        aria-hidden="true"
      />

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

      {/* the creature: vector art, so it stays crisp at any size; gentle float + pointer parallax (--hx/--hy from HeroStage) */}
      <div className="sl-hero-tilt absolute inset-[2%]">
        <div className="sl-hero-float h-full w-full">
          <CreatureArt species={species} stage={HERO_STAGE} />
        </div>
      </div>

      {/* embers drifting up past the phoenix */}
      <div className="pointer-events-none absolute inset-x-[8%] bottom-[18%] top-[6%]" aria-hidden="true">
        {EMBERS.map((e) => (
          <span
            key={e.left}
            className="sl-hero-ember"
            style={{ left: `${e.left}%`, width: e.size, height: e.size, animationDuration: `${e.dur}s`, animationDelay: `${e.delay}s`, "--drift": `${e.drift}px`, "--ember": rarity.color } as CSSProperties}
          />
        ))}
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
