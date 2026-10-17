"use client";

import { useId } from "react";
import type { Species } from "@/lib/species";
import { CreatureArt } from "@/components/creature/CreatureArt";

export type EggVisualStage = 1 | 2 | 3 | 4;

interface EggArtProps {
  /** 1 dormant · 2 awakening · 3 stirring · 4 ready to hatch */
  stage: EggVisualStage;
  /** 0..1 progress within the stage — fine-tunes fissures and inner light. */
  progress?: number;
  /** Visual variation seed (stone grain + inner light tint). */
  seed?: number;
  /** Species inside, shown as a faint shadow from Stage 3. */
  inside?: Species;
  /** Progress is frozen (e.g. balance below threshold). */
  paused?: boolean;
  /** Violent shake used during the hatch sequence. */
  hatching?: boolean;
  /** Override the number of visible fissures. */
  cracks?: number;
  /** Idle motion (stirring, heartbeat). Off for thumbnails. */
  animated?: boolean;
  className?: string;
}

/** Inner-light tints — kept within the violet / electric-blue / platinum family. */
const LIGHTS = [
  { core: "#b9adff", deep: "#5d4fd1" },
  { core: "#a9c4ff", deep: "#3f63c9" },
  { core: "#dfe2f2", deep: "#7b7f9f" },
];

const EGG = "M150,28 C214,28 262,128 262,214 C262,290 212,338 150,338 C88,338 38,290 38,214 C38,128 86,28 150,28 Z";

/** Fissures, ordered by when they appear. Each is a main crack plus a branch. */
const FISSURES = [
  "M168,44 L162,70 L172,88 L164,112 L170,128 M164,112 L152,120",
  "M252,170 L232,180 L226,198 L208,204 M226,198 L230,214",
  "M50,182 L70,190 L74,208 L94,214 L98,230 M74,208 L62,222",
  "M128,62 L136,90 L126,110 L138,134 M136,90 L148,96",
  "M160,336 L164,312 L154,294 L162,272 M154,294 L142,288",
  "M236,286 L220,272 L222,252 L206,242",
  "M72,288 L90,276 L88,258 L106,248",
];

export function EggArt({ stage, progress = 0, seed = 0, inside, paused, hatching, cracks, animated = true, className = "" }: EggArtProps) {
  const raw = useId();
  const id = "eg" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const light = LIGHTS[Math.abs(seed) % LIGHTS.length];
  const fissures = cracks ?? (stage === 1 ? 0 : stage === 2 ? 1 + Math.round(progress * 2) : stage === 3 ? 3 + Math.round(progress * 2) : FISSURES.length);
  const energy = [0, 0.08, 0.32, 0.6, 0.95][stage];

  return (
    <svg
      viewBox="0 0 300 380"
      className={`sl-egg stage-${stage} ${animated && !paused ? "is-live" : ""} ${paused ? "is-paused" : ""} ${hatching ? "is-hatching" : ""} ${className}`}
      role="img"
      aria-label={`Solanite egg, stage ${stage}`}
    >
      <defs>
        <radialGradient id={`${id}-shade`} cx="0.34" cy="0.26" r="0.92">
          <stop offset="0" stopColor="#4a4a58" />
          <stop offset="0.28" stopColor="#24242e" />
          <stop offset="0.7" stopColor="#0d0d12" />
          <stop offset="1" stopColor="#050507" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0.55" stopColor={light.core} stopOpacity="0" />
          <stop offset="1" stopColor={light.core} stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`${id}-core`} cx="0.5" cy="0.62" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.9 * energy} />
          <stop offset="0.25" stopColor={light.core} stopOpacity={0.75 * energy} />
          <stop offset="0.7" stopColor={light.deep} stopOpacity={0.35 * energy} />
          <stop offset="1" stopColor={light.deep} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-spec`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={EGG} />
        </clipPath>
        {/* real surface relief: noise lit by a distant light */}
        <filter id={`${id}-stone`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.03" numOctaves="5" seed={(Math.abs(seed) % 97) + 1} result="n" />
          <feDiffuseLighting in="n" surfaceScale="2.6" lightingColor="#ffffff" result="lit">
            <feDistantLight azimuth="230" elevation="46" />
          </feDiffuseLighting>
          <feBlend in="SourceGraphic" in2="lit" mode="multiply" result="m" />
          <feComposite in="m" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-fine`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.02  0 0 0 0 0.05  0 0 0 1 0" />
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* light spilling onto the floor */}
      {energy > 0 && <ellipse cx="150" cy="352" rx="110" ry="14" fill={light.deep} opacity={energy * 0.35} filter={`url(#${id}-blur)`} />}
      {/* contact shadow */}
      <ellipse cx="150" cy="346" rx="96" ry="9" fill="#000" opacity="0.85" filter={`url(#${id}-blur)`} />

      <g className="sl-egg-body">
        <path d={EGG} fill={`url(#${id}-shade)`} filter={`url(#${id}-stone)`} />
        <g clipPath={`url(#${id}-clip)`}>
          {/* stone relief, blended into the shading */}


          {/* inner light, seen through the shell */}
          {energy > 0 && <ellipse cx="150" cy="232" rx="118" ry="132" fill={`url(#${id}-core)`} className="sl-egg-core" />}

          {/* the creature's shadow pressing against the shell */}
          {inside && stage >= 3 && (
            <g opacity={stage === 4 ? 0.5 : 0.3} filter={`url(#${id}-shadow)`}>
              <svg x="56" y="102" width="188" height="188" viewBox="0 0 400 400" overflow="visible">
                <CreatureArt species={inside} stage={0} showAura={false} animated={false} />
              </svg>
            </g>
          )}

          {/* platinum inlay: one meridian and one girdle, finely engraved */}
          <g fill="none" stroke="#d9dce8" strokeWidth="0.7">
            <path d="M150,30 C176,96 180,250 150,336" strokeOpacity="0.12" />
            <path d="M40,212 C90,232 210,232 260,212" strokeOpacity="0.28" />
            <path d="M40,216 C90,236 210,236 260,216" strokeOpacity="0.1" />
            {[64, 104, 150, 196, 236].map((x, i) => (
              <path key={x} d={`M${x},${223 + (i === 2 ? 3 : i % 2 ? 2 : 0)} l0,5`} strokeOpacity="0.35" />
            ))}
          </g>

          {/* fissures: dark crevice with a filament of light inside */}
          <g className="sl-egg-cracks">
            {FISSURES.slice(0, fissures).map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke="#000" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
                <path d={d} fill="none" stroke={light.core} strokeWidth={stage === 4 ? 1.4 : 0.9} strokeLinejoin="round" strokeLinecap="round" filter={`url(#${id}-glow)`} opacity={0.55 + energy * 0.45} />
              </g>
            ))}
          </g>

          {/* key light: soft specular */}
          <ellipse cx="104" cy="98" rx="34" ry="58" fill={`url(#${id}-spec)`} transform="rotate(22 104 98)" />
          <path d="M86,92 C92,70 104,54 118,46" fill="none" stroke="#fff" strokeOpacity="0.32" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        {/* rim light from the right */}
        <path d={EGG} fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.6" />
      </g>
    </svg>
  );
}
