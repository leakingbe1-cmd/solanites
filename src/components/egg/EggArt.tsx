"use client";

import { useId } from "react";
import type { Species } from "@/lib/species";
import dynamic from "next/dynamic";

// The silhouette inside a stirring egg needs every species renderer; load them only when one is drawn,
// so a plain egg (the homepage demo) stays light.
const CreatureArt = dynamic(() => import("@/components/creature/CreatureArt").then((m) => m.CreatureArt), { ssr: false });

export type EggVisualStage = 1 | 2 | 3 | 4;

interface EggArtProps {
  /** 1 dormant · 2 cracking · 3 stirring · 4 ready to hatch */
  stage: EggVisualStage;
  /** 0..1 incubation progress — fine-tunes crack count and glow. */
  progress?: number;
  /** Visual variation seed (shell pattern + hue). */
  seed?: number;
  /** Species inside, shown as a silhouette from Stage 3. */
  inside?: Species;
  /** Progress is frozen (e.g. balance below threshold). */
  paused?: boolean;
  /** Extra-violent shake used during the hatch sequence. */
  hatching?: boolean;
  /** Override the number of visible cracks. */
  cracks?: number;
  /** "vigil" (default) draws no halo or floor glow (approved art canon W1–W2); "legacy" draws the originals. */
  ornament?: "vigil" | "legacy";
  className?: string;
}

const SHELL_HUES = [
  { a: "#9945ff", b: "#14f195" },
  { a: "#5b6cff", b: "#00d1ff" },
  { a: "#c04bff", b: "#ff6bd5" },
  { a: "#14f1c4", b: "#3d7bff" },
  { a: "#8a5cff", b: "#ffd36b" },
];

const EGG = "M150,28 C216,28 264,130 264,216 C264,292 213,338 150,338 C87,338 36,292 36,216 C36,130 84,28 150,28 Z";

const CRACKS = [
  "M150,30 L142,62 L156,84 L146,110",
  "M262,200 L236,206 L226,226 L204,230",
  "M40,190 L66,198 L74,220 L98,224 L106,244",
  "M200,52 L192,80 L206,96 L198,124 L212,140",
  "M100,64 L112,92 L102,112 L118,136",
  "M150,338 L156,312 L144,292 L154,270",
  "M232,300 L214,284 L218,262 L200,250",
  "M70,290 L92,276 L88,256 L110,246",
];

export function EggArt({ stage, progress = 0, seed = 0, inside, paused, hatching, cracks, ornament = "vigil", className = "" }: EggArtProps) {
  const legacy = ornament === "legacy";
  const raw = useId();
  const id = "eg" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const hue = SHELL_HUES[Math.abs(seed) % SHELL_HUES.length];
  const pattern = Math.abs(seed >> 3) % 3;

  const crackCount = cracks ?? (stage === 1 ? 0 : stage === 2 ? 2 + Math.floor(progress * 3) : stage === 3 ? 5 + Math.floor(progress * 2) : CRACKS.length);
  const glow = [0, 0.25, 0.5, 0.78, 1][stage];

  return (
    <svg
      viewBox="0 0 300 380"
      className={`sl-egg stage-${stage} ${paused ? "is-paused" : ""} ${hatching ? "is-hatching" : ""} ${className}`}
      role="img"
      aria-label={`Solanite egg, stage ${stage}`}
    >
      <defs>
        <radialGradient id={`${id}-shell`} cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#3a3160" />
          <stop offset="0.35" stopColor="#1a1533" />
          <stop offset="1" stopColor="#05040a" />
        </radialGradient>
        <linearGradient id={`${id}-iri`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hue.a} />
          <stop offset="1" stopColor={hue.b} />
        </linearGradient>
        <radialGradient id={`${id}-core`} cx="0.5" cy="0.58" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity={0.9 * glow} />
          <stop offset="0.3" stopColor={hue.b} stopOpacity={0.7 * glow} />
          <stop offset="1" stopColor={hue.a} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={hue.a} stopOpacity={0.25 + glow * 0.4} />
          <stop offset="0.6" stopColor={hue.b} stopOpacity={0.08 + glow * 0.12} />
          <stop offset="1" stopColor={hue.b} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={EGG} />
        </clipPath>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.01  0 0 0 0 0.06  0 0 0 1 0" />
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* halo and floor glow: original ornaments, drawn only for legacy renders (canon W1–W2) */}
      {legacy && <circle cx="150" cy="200" r="150" fill={`url(#${id}-halo)`} className="sl-egg-halo" />}
      {legacy && <ellipse cx="150" cy="364" rx="90" ry="10" fill={hue.a} opacity={0.25 + glow * 0.4} filter={`url(#${id}-blur)`} />}

      <g className="sl-egg-body">
        <path d={EGG} fill={`url(#${id}-shell)`} />
        <g clipPath={`url(#${id}-clip)`}>
          {/* inner energy */}
          <ellipse cx="150" cy="220" rx="120" ry="140" fill={`url(#${id}-core)`} className="sl-egg-core" />

          {/* creature silhouette */}
          {inside && stage >= 3 && (
            <g opacity={stage === 4 ? 0.8 : 0.55} className="sl-egg-inside">
              <g filter={`url(#${id}-shadow)`}>
                <svg x="40" y="92" width="220" height="220" viewBox="0 0 400 400" overflow="visible">
                  <CreatureArt species={inside} stage={0} showAura={false} animated vector />
                </svg>
              </g>
            </g>
          )}

          {/* iridescent sheen */}
          <path d={EGG} fill={`url(#${id}-iri)`} opacity="0.16" style={{ mixBlendMode: "screen" }} />

          {/* shell pattern */}
          {pattern === 0 && (
            <g fill="none" stroke={`url(#${id}-iri)`} strokeOpacity={0.35 + glow * 0.4} strokeWidth="1.4">
              {[110, 150, 190, 230, 270].map((y, i) => (
                <path key={y} d={`M20,${y} C80,${y - 18 + (i % 2) * 36} 220,${y + 18 - (i % 2) * 36} 280,${y}`} />
              ))}
            </g>
          )}
          {pattern === 1 && (
            <g fill="none" stroke={`url(#${id}-iri)`} strokeOpacity={0.3 + glow * 0.4} strokeWidth="1.2">
              {Array.from({ length: 6 }).map((_, row) =>
                Array.from({ length: 6 }).map((__, col) => {
                  const x = 40 + col * 44 + (row % 2) * 22;
                  const y = 70 + row * 48;
                  return <path key={`${row}-${col}`} d={`M${x},${y - 20} L${x + 18},${y - 10} L${x + 18},${y + 10} L${x},${y + 20} L${x - 18},${y + 10} L${x - 18},${y - 10} Z`} />;
                }),
              )}
            </g>
          )}
          {pattern === 2 && (
            <g fill="none" stroke={`url(#${id}-iri)`} strokeOpacity={0.35 + glow * 0.4} strokeWidth="1.4">
              <path d="M150,40 C60,120 240,160 150,220 C60,280 220,300 150,340" />
              <path d="M110,50 C40,140 200,170 110,240 C40,300 160,320 120,340" />
              <path d="M190,50 C260,140 100,170 190,240 C260,300 140,320 180,340" />
            </g>
          )}

          {/* rune band */}
          <g filter={`url(#${id}-glow)`} opacity={0.35 + glow * 0.65} className="sl-egg-runes">
            <path d="M40,226 C90,246 210,246 260,226" fill="none" stroke={`url(#${id}-iri)`} strokeWidth="2.5" />
            {Array.from({ length: 9 }).map((_, i) => {
              const x = 62 + i * 22;
              const y = 236 + Math.sin((i / 8) * Math.PI) * 5;
              return <path key={i} d={RUNE_GLYPHS[(i + seed) % RUNE_GLYPHS.length]} transform={`translate(${x} ${y + 12})`} fill="none" stroke={hue.b} strokeWidth="1.5" strokeLinecap="round" />;
            })}
          </g>

          {/* cracks */}
          <g filter={`url(#${id}-glow)`} className="sl-egg-cracks">
            {CRACKS.slice(0, crackCount).map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke={hue.b} strokeWidth="5" strokeOpacity="0.5" strokeLinejoin="round" />
                <path d={d} fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
              </g>
            ))}
          </g>

          {/* specular */}
          <ellipse cx="108" cy="104" rx="28" ry="52" fill="#fff" opacity="0.13" transform="rotate(20 108 104)" filter={`url(#${id}-soft)`} />
          <ellipse cx="102" cy="96" rx="8" ry="20" fill="#fff" opacity="0.35" transform="rotate(20 102 96)" />
        </g>
        {/* rim light */}
        <path d={EGG} fill="none" stroke={`url(#${id}-iri)`} strokeWidth="2" strokeOpacity={0.4 + glow * 0.5} />
      </g>

      {/* orbiting sparks */}
      {stage >= 2 && (
        <g className="sl-egg-orbit" style={{ transformOrigin: "150px 200px" }}>
          {Array.from({ length: stage === 2 ? 4 : 8 }).map((_, i, arr) => {
            const a = (i / arr.length) * Math.PI * 2;
            return <circle key={i} cx={150 + Math.cos(a) * 140} cy={200 + Math.sin(a) * 46} r={i % 2 ? 2 : 3} fill={i % 2 ? hue.a : hue.b} filter={`url(#${id}-glow)`} />;
          })}
        </g>
      )}
    </svg>
  );
}

const RUNE_GLYPHS = ["M-4,-5 L0,5 L4,-5", "M-4,-4 L4,-4 L-4,4 L4,4", "M0,-5 L0,5 M-4,-2 L0,-5 L4,-2", "M-4,4 L-4,-4 L4,4 L4,-4", "M-4,0 A4,4 0 1 0 4,0", "M-4,-4 L4,4 M4,-4 L-4,4"];
