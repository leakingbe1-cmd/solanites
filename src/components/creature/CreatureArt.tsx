"use client";

import { useId, type ReactNode } from "react";
import type { Palette, Species } from "@/lib/species";
import { RARITIES } from "@/lib/rarity";
import { RENDERERS } from "./species";
import type { Ctx } from "./kit";

/**
 * Procedurally rendered Solanite artwork.
 *
 * Every species has its own body plan (see docs/creature-design.md and
 * ./species/*). What they share is the rendering kit in ./kit.tsx: one key
 * light, the same gradient materials, the same eye construction and a single
 * Solgem — so they read as one universe without being one character.
 * `stage` (0..3) grows each species' own anatomy and adds a halo at Apex.
 */

interface CreatureArtProps {
  species: Species;
  /** Evolution stage 0 (Hatchling) … 3 (Apex). */
  stage?: number;
  animated?: boolean;
  showAura?: boolean;
  /** Renders the creature as a dark silhouette (undiscovered / inside egg). */
  silhouette?: boolean;
  className?: string;
}

export function CreatureArt({ species, stage = 2, animated = true, showAura = true, silhouette = false, className = "" }: CreatureArtProps) {
  const raw = useId();
  const id = "sl" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const evo = Math.max(0, Math.min(3, Math.round(stage)));
  const p = species.palette;
  const rarity = species.rarity;
  const r = RENDERERS[species.id];

  const ctx: Ctx = {
    id,
    p,
    species,
    evo,
    g: [0.55, 0.78, 1, 1.12][evo],
    mark: [0.35, 0.65, 0.95, 1][evo],
    u: (name: string) => `url(#${id}-${name})`,
  };

  // Floating species scale around their centre; grounded ones around their feet.
  const scale = [0.74, 0.85, 0.94, 1][evo] * (r.fit ?? 1);
  const anchor = r.floating ? 210 : 360;
  const shadowW = (r.shadow ?? 95) * scale;

  return (
    <svg
      viewBox="0 0 400 400"
      className={`sl-creature ${animated ? "is-animated" : ""} rar-${rarity} ${silhouette ? "is-silhouette" : ""} ${className}`}
      role="img"
      aria-label={silhouette ? "Undiscovered Solanite" : `${species.name}, ${RARITIES[rarity].label} ${species.element} Solanite`}
    >
      <Defs id={id} p={p} rarity={rarity} />
      {showAura && !silhouette && <Aura id={id} species={species} evo={evo} />}
      <ellipse cx="200" cy="376" rx={shadowW} ry={r.floating ? 7 : 11} fill="#000" opacity={r.floating ? 0.35 : 0.55} filter={`url(#${id}-blur8)`} />
      <g transform={`translate(200 ${anchor}) scale(${scale}) translate(-200 -${anchor})`}>
        <g className={r.floating ? "sl-hover" : "sl-bob"}>
          {r.render(ctx)}
          {evo === 3 && <Halo id={id} p={p} at={r.halo} />}
        </g>
      </g>
      {rarity === "secret" && !silhouette && <SecretOverlay id={id} />}
    </svg>
  );
}

/* ───────────────────────────── defs ───────────────────────────── */

function Defs({ id, p, rarity }: { id: string; p: Palette; rarity: Species["rarity"] }) {
  const r = RARITIES[rarity];
  return (
    <defs>
      <radialGradient id={`${id}-body`} cx="0.36" cy="0.28" r="0.85">
        <stop offset="0" stopColor={p.bodyLight} />
        <stop offset="0.45" stopColor={p.body} />
        <stop offset="1" stopColor={p.bodyDark} />
      </radialGradient>
      <linearGradient id={`${id}-tube`} x1="0" y1="180" x2="0" y2="380" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={p.bodyLight} />
        <stop offset="0.4" stopColor={p.body} />
        <stop offset="1" stopColor={p.bodyDark} />
      </linearGradient>
      <linearGradient id={`${id}-belly`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.belly} />
        <stop offset="1" stopColor={p.belly} stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id={`${id}-wing`} x1="1" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={p.bodyDark} stopOpacity="0.95" />
        <stop offset="0.45" stopColor={p.wing} stopOpacity="0.92" />
        <stop offset="1" stopColor={p.wingEdge} stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id={`${id}-feather`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={p.bodyDark} />
        <stop offset="0.5" stopColor={p.wing} />
        <stop offset="1" stopColor={p.wingEdge} />
      </linearGradient>
      <linearGradient id={`${id}-horn`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={p.bodyDark} />
        <stop offset="0.35" stopColor={p.horn} stopOpacity="0.85" />
        <stop offset="1" stopColor={p.horn} />
      </linearGradient>
      <radialGradient id={`${id}-eye`} cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.35" stopColor={p.eye} />
        <stop offset="1" stopColor={p.accent} />
      </radialGradient>
      <radialGradient id={`${id}-gem`} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.4" stopColor={p.accent} />
        <stop offset="1" stopColor={r.color2} />
      </radialGradient>
      <radialGradient id={`${id}-aura`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={r.color} stopOpacity="0.55" />
        <stop offset="0.5" stopColor={r.color2} stopOpacity="0.16" />
        <stop offset="1" stopColor={r.color2} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={r.color} stopOpacity="0" />
        <stop offset="1" stopColor={r.color} stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id={`${id}-fin`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={p.wingEdge} stopOpacity="0.85" />
        <stop offset="0.55" stopColor={p.wing} stopOpacity="0.5" />
        <stop offset="1" stopColor={p.wingEdge} stopOpacity="0.25" />
      </linearGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={p.bodyLight} stopOpacity="0.95" />
        <stop offset="0.5" stopColor={p.body} stopOpacity="0.75" />
        <stop offset="1" stopColor={p.bodyDark} stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id={`${id}-veil`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.accent} stopOpacity="0.7" />
        <stop offset="1" stopColor={p.accent} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-veil2`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.wingEdge} stopOpacity="0.65" />
        <stop offset="1" stopColor={p.wingEdge} stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${id}-shade`} cx="0.4" cy="0.3" r="0.8">
        <stop offset="0.55" stopColor={p.bodyDark} stopOpacity="0" />
        <stop offset="1" stopColor={p.bodyDark} stopOpacity="0.55" />
      </radialGradient>
      <radialGradient id={`${id}-light`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="0.25" stopColor={p.accent} stopOpacity="0.8" />
        <stop offset="1" stopColor={p.accent} stopOpacity="0" />
      </radialGradient>
      <pattern id={`${id}-stars`} width="46" height="46" patternUnits="userSpaceOnUse">
        <circle cx="6" cy="8" r="1.1" fill="#fff" />
        <circle cx="30" cy="4" r="0.7" fill="#fff" opacity="0.8" />
        <circle cx="22" cy="22" r="1.5" fill="#cfd8ff" />
        <circle cx="40" cy="30" r="0.8" fill="#fff" />
        <circle cx="12" cy="38" r="1" fill="#e0d4ff" />
        <circle cx="34" cy="42" r="0.6" fill="#fff" />
      </pattern>
      <filter id={`${id}-blur8`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
      <filter id={`${id}-blur20`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="20" />
      </filter>
      <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/* ───────────────────────────── aura ───────────────────────────── */

function Aura({ id, species, evo }: { id: string; species: Species; evo: number }) {
  const r = RARITIES[species.rarity];
  const rarity = species.rarity;
  const nodes: ReactNode[] = [<circle key="base" cx="200" cy="215" r="175" fill={`url(#${id}-aura)`} className="sl-aura-pulse" />];

  if (rarity === "legendary" || rarity === "secret") {
    const colors = rarity === "secret" ? ["#14f195", "#9945ff", "#ff3df2", "#00c2ff"] : [r.color];
    nodes.push(
      <g key="rays" className="sl-spin-slow" style={{ transformOrigin: "200px 215px" }} opacity={rarity === "secret" ? 0.5 : 0.7}>
        {Array.from({ length: 18 }).map((_, i) => (
          <path
            key={i}
            d="M200,215 L192,20 L208,20 Z"
            fill={rarity === "secret" ? colors[i % colors.length] : `url(#${id}-ray)`}
            opacity={rarity === "secret" ? 0.35 : i % 2 ? 0.5 : 0.9}
            transform={`rotate(${i * 20} 200 215)`}
          />
        ))}
      </g>,
    );
  }

  if (rarity === "mythic") {
    nodes.push(
      <g key="nebula" filter={`url(#${id}-blur20)`} opacity="0.75">
        <circle cx="140" cy="170" r="70" fill="#6c4bff" opacity="0.45" />
        <circle cx="265" cy="240" r="80" fill="#2fa8ff" opacity="0.35" />
        <circle cx="210" cy="140" r="50" fill="#ff7af6" opacity="0.25" />
      </g>,
      <rect key="sf" x="20" y="30" width="360" height="340" fill={`url(#${id}-stars)`} opacity="0.55" className="sl-twinkle" />,
      <g key="orbits" opacity="0.65">
        <ellipse cx="200" cy="225" rx="175" ry="40" fill="none" stroke="#dfe6ff" strokeWidth="1" transform="rotate(-14 200 225)" strokeDasharray="2 6" className="sl-dash" />
        <ellipse cx="200" cy="225" rx="150" ry="28" fill="none" stroke={r.color2} strokeWidth="1.2" transform="rotate(18 200 225)" />
      </g>,
    );
  }

  if (rarity === "epic") {
    nodes.push(
      <g key="ring" className="sl-spin" style={{ transformOrigin: "200px 220px" }}>
        <circle cx="200" cy="220" r="160" fill="none" stroke={r.color} strokeWidth="1.5" strokeDasharray="1 14" strokeLinecap="round" opacity="0.9" />
        <circle cx="200" cy="220" r="146" fill="none" stroke={r.color2} strokeWidth="0.8" strokeDasharray="40 30" opacity="0.5" />
      </g>,
    );
  }

  if (rarity !== "common") {
    const count = rarity === "rare" ? 6 : 10;
    nodes.push(
      <g key="motes" className="sl-spin-rev" style={{ transformOrigin: "200px 215px" }}>
        {Array.from({ length: count }).map((_, i) => {
          const a = (i / count) * Math.PI * 2;
          const rad = 120 + (i % 3) * 22;
          return (
            <circle
              key={i}
              cx={200 + Math.cos(a) * rad}
              cy={215 + Math.sin(a) * rad * 0.8}
              r={i % 3 === 0 ? 3 : 1.8}
              fill={i % 2 ? r.color : r.color2}
              filter={`url(#${id}-glow)`}
              className="sl-twinkle"
              style={{ animationDelay: `${i * 0.37}s` }}
            />
          );
        })}
      </g>,
    );
  }

  if (rarity === "legendary" || rarity === "mythic" || rarity === "secret" || evo === 3) {
    const sparks = [
      [90, 110, 1],
      [320, 95, 0.8],
      [330, 260, 1.1],
      [70, 280, 0.7],
      [250, 60, 0.6],
    ];
    nodes.push(
      <g key="sparks">
        {sparks.map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path
              d="M0,-12 C1,-2 2,-1 12,0 C2,1 1,2 0,12 C-1,2 -2,1 -12,0 C-2,-1 -1,-2 0,-12 Z"
              fill="#fff"
              className="sl-sparkle"
              style={{ animationDelay: `${i * 0.6}s`, transformOrigin: "0px 0px" }}
            />
          </g>
        ))}
      </g>,
    );
  }
  return <g className="sl-aura">{nodes}</g>;
}

function Halo({ id, p, at = [200, 62, 44] }: { id: string; p: Palette; at?: [number, number, number] }) {
  const [x, y, rx] = at;
  return (
    <g className="sl-halo" filter={`url(#${id}-glow)`}>
      <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.2} fill="none" stroke={p.accent} strokeWidth="3" />
      <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.2} fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />
    </g>
  );
}

function SecretOverlay({ id }: { id: string }) {
  return (
    <g className="sl-glitch-lines" pointerEvents="none">
      {[60, 140, 210, 300].map((y, i) => (
        <rect key={i} x="0" y={y} width="400" height={i % 2 ? 2 : 4} fill={i % 2 ? "#ff3df2" : "#14f195"} opacity="0.35" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      <text x="200" y="395" textAnchor="middle" fontSize="9" fill="#14f195" opacity="0.5" fontFamily="monospace" letterSpacing="3" id={`${id}-sig`}>
        0x000000 · UNINDEXED
      </text>
    </g>
  );
}

/* ───────────────────────────── head ───────────────────────────── */
