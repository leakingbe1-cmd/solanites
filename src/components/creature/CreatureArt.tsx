"use client";

import { useId, type ReactNode } from "react";
import type { HornStyle, Marking, Palette, Species } from "@/lib/species";
import { RARITIES } from "@/lib/rarity";

/**
 * Procedurally rendered Solanite artwork.
 *
 * Every creature shares a common anatomy (Solgem on the forehead, almond eyes,
 * sculpted head) so the collection reads as one family, while archetype,
 * horns, markings, palette and rarity-specific aura make each one distinct.
 * `stage` (0..3) drives proportions: hatchlings are big-headed with nub horns,
 * Apex forms gain full horns, wingspan and a halo.
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

const MIRROR = "translate(400 0) scale(-1 1)";

export function CreatureArt({
  species,
  stage = 2,
  animated = true,
  showAura = true,
  silhouette = false,
  className = "",
}: CreatureArtProps) {
  const raw = useId();
  const id = "sl" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const evo = Math.max(0, Math.min(3, Math.round(stage)));
  const p = species.palette;
  const rarity = species.rarity;

  const bodyScale = [0.7, 0.82, 0.93, 1][evo];
  const headScale = [1.2, 1.1, 1, 1][evo];
  const hornScale = [0.35, 0.68, 1, 1.15][evo];
  const wingScale = [0.55, 0.78, 1, 1.1][evo];
  const markOpacity = [0.35, 0.65, 0.95, 1][evo];

  const ctx: Ctx = { id, p, species, evo, hornScale, wingScale, markOpacity };

  const body = {
    drake: <DrakeBody {...ctx} />,
    serpent: <SerpentBody {...ctx} />,
    manta: <MantaBody {...ctx} />,
    phoenix: <PhoenixBody {...ctx} />,
  }[species.archetype];

  return (
    <svg
      viewBox="0 0 400 400"
      className={`sl-creature ${animated ? "is-animated" : ""} rar-${rarity} ${silhouette ? "is-silhouette" : ""} ${className}`}
      role="img"
      aria-label={silhouette ? "Undiscovered Solanite" : `${species.name}, ${RARITIES[rarity].label} ${species.element} Solanite`}
    >
      <Defs id={id} p={p} rarity={rarity} />
      {showAura && !silhouette && <Aura id={id} species={species} evo={evo} />}
      <ellipse cx="200" cy="378" rx={95 * bodyScale} ry="11" fill="#000" opacity="0.55" filter={`url(#${id}-blur8)`} />
      <g transform={`translate(200 366) scale(${bodyScale}) translate(-200 -378)`}>
        <g className="sl-bob">
          {body}
          <g transform={`translate(200 150) scale(${headScale}) translate(-200 -150)`}>
            <Head {...ctx} />
          </g>
          {evo === 3 && <Halo id={id} p={p} />}
        </g>
      </g>
      {rarity === "secret" && !silhouette && <SecretOverlay id={id} />}
    </svg>
  );
}

interface Ctx {
  id: string;
  p: Palette;
  species: Species;
  evo: number;
  hornScale: number;
  wingScale: number;
  markOpacity: number;
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

function Halo({ id, p }: { id: string; p: Palette }) {
  return (
    <g className="sl-halo" filter={`url(#${id}-glow)`}>
      <ellipse cx="200" cy="62" rx="44" ry="9" fill="none" stroke={p.accent} strokeWidth="3" />
      <ellipse cx="200" cy="62" rx="44" ry="9" fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />
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

function Head({ id, p, species, evo, hornScale }: Ctx) {
  const a = species.archetype;
  const eyeScale = [1.25, 1.12, 1, 1][evo];
  const glowEyes = ["epic", "legendary", "mythic", "secret"].includes(species.rarity);
  return (
    <g className="sl-head">
      {/* side frills / mane */}
      {(a === "drake" || a === "manta") && (
        <>
          <Frill id={id} p={p} />
          <g transform={MIRROR}>
            <Frill id={id} p={p} />
          </g>
        </>
      )}
      {a === "serpent" && (
        <>
          <Mane id={id} p={p} />
          <g transform={MIRROR}>
            <Mane id={id} p={p} />
          </g>
        </>
      )}
      {a === "phoenix" && <Crest id={id} p={p} evo={evo} />}

      <Horns id={id} style={species.horns} scale={a === "phoenix" ? hornScale * 0.55 : hornScale} p={p} />

      {/* skull */}
      <path
        d="M200,96 C234,96 256,114 261,138 C265,156 257,170 245,178 C237,196 221,208 200,211 C179,208 163,196 155,178 C143,170 135,156 139,138 C144,114 166,96 200,96 Z"
        fill={`url(#${id}-body)`}
        stroke={p.bodyDark}
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      {/* cheek scales */}
      <path d="M146,160 L126,168 L150,172 Z M152,172 L136,186 L158,182 Z" fill={p.horn} stroke={p.bodyDark} strokeOpacity="0.4" />
      <path d="M254,160 L274,168 L250,172 Z M248,172 L264,186 L242,182 Z" fill={p.horn} stroke={p.bodyDark} strokeOpacity="0.4" />
      {/* forehead ridge */}
      <path d="M200,100 C194,112 194,124 200,134 C206,124 206,112 200,100 Z" fill={p.bodyDark} opacity="0.25" />
      {/* specular */}
      <ellipse cx="182" cy="114" rx="30" ry="11" fill="#fff" opacity="0.22" transform="rotate(-12 182 114)" />

      {/* muzzle */}
      <path
        d={
          a === "phoenix"
            ? "M172,170 C178,160 222,160 228,170 C232,182 214,206 200,214 C186,206 168,182 172,170 Z"
            : "M170,170 C177,159 223,159 230,170 C234,190 219,207 200,210 C181,207 166,190 170,170 Z"
        }
        fill={`url(#${id}-belly)`}
        opacity="0.92"
      />
      <path d="M187,180 C190,177 194,178 195,182 C192,183 189,183 187,180 Z" fill={p.bodyDark} opacity="0.85" />
      <path d="M213,180 C210,177 206,178 205,182 C208,183 211,183 213,180 Z" fill={p.bodyDark} opacity="0.85" />
      <path d="M184,197 C192,203 208,203 216,197" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
      {evo === 0 && (
        <>
          <ellipse cx="160" cy="172" rx="10" ry="6" fill={p.accent} opacity="0.28" />
          <ellipse cx="240" cy="172" rx="10" ry="6" fill={p.accent} opacity="0.28" />
        </>
      )}

      {/* eyes */}
      <Eye id={id} p={p} cx={176} cy={148} scale={eyeScale} glow={glowEyes} />
      <g transform={MIRROR}>
        <Eye id={id} p={p} cx={176} cy={148} scale={eyeScale} glow={glowEyes} mirrored />
      </g>

      {/* Solgem — the shared mark of every Solanite */}
      <g filter={`url(#${id}-glow)`} className="sl-gem">
        <path d="M200,108 L209,119 L200,131 L191,119 Z" fill={`url(#${id}-gem)`} />
      </g>
      <path d="M200,110 L204,118 L200,119 Z" fill="#fff" opacity="0.8" />

      {a === "serpent" && <Whiskers p={p} />}
    </g>
  );
}

function Eye({ id, p, cx, cy, scale, glow, mirrored }: { id: string; p: Palette; cx: number; cy: number; scale: number; glow: boolean; mirrored?: boolean }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}>
      <path d="M150,133 C166,129 185,134 198,147" fill="none" stroke={p.bodyDark} strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      <g className={`sl-eye ${mirrored ? "sl-eye-r" : ""}`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <path d="M155,140 C166,134 187,138 197,152 C184,158 164,155 155,140 Z" fill="#07040f" />
        {glow && <ellipse cx={cx + 2} cy={cy - 1} rx="12" ry="8" fill={p.eye} opacity="0.55" filter={`url(#${id}-glow)`} />}
        <ellipse cx={cx + 2} cy={cy - 0.5} rx="8.5" ry="7.5" fill={`url(#${id}-eye)`} />
        <ellipse cx={cx + 2.5} cy={cy - 0.5} rx="2" ry="6.4" fill="#07040f" />
        <circle cx={cx + 5.5} cy={cy - 3.5} r="2.3" fill="#fff" />
        <circle cx={cx - 2} cy={cy + 3} r="1" fill="#fff" opacity="0.7" />
      </g>
    </g>
  );
}

function Frill({ id, p }: { id: string; p: Palette }) {
  return (
    <g>
      <path d="M146,136 C124,118 104,120 86,106 C94,132 110,152 140,162 Z" fill={`url(#${id}-wing)`} />
      <path d="M144,140 C126,130 110,124 92,112 M142,150 C126,146 112,140 100,132" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1.5" fill="none" />
    </g>
  );
}

function Mane({ id, p }: { id: string; p: Palette }) {
  return (
    <g className="sl-sway" style={{ transformOrigin: "146px 140px" }}>
      <path
        d="M148,128 C120,106 94,114 72,94 C80,124 92,146 118,158 C104,166 92,178 82,196 C112,192 132,180 148,166 Z"
        fill={`url(#${id}-wing)`}
      />
      <path d="M146,134 C124,124 104,116 82,104 M144,150 C122,152 104,148 92,140 M146,160 C128,170 110,180 92,190" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="1.3" fill="none" />
    </g>
  );
}

function Whiskers({ p }: { p: Palette }) {
  return (
    <g className="sl-sway" style={{ transformOrigin: "200px 185px" }}>
      <path d="M170,184 C140,190 118,212 112,246 C110,256 104,262 96,264" fill="none" stroke={p.accent} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
      <path d="M230,184 C260,190 282,212 288,246 C290,256 296,262 304,264" fill="none" stroke={p.accent} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}

function Crest({ id, p, evo }: { id: string; p: Palette; evo: number }) {
  const len = [34, 48, 62, 72][evo];
  const plumes = [
    [-128, len * 0.75],
    [-104, len],
    [-90, len * 1.1],
    [-76, len],
    [-52, len * 0.75],
  ];
  return (
    <g className="sl-sway" style={{ transformOrigin: "200px 108px" }}>
      {plumes.map(([ang, l], i) => (
        <path
          key={i}
          d={`M0,0 C${l * 0.3},-9 ${l * 0.75},-8 ${l},0 C${l * 0.75},6 ${l * 0.3},7 0,0 Z`}
          fill={`url(#${id}-feather)`}
          transform={`translate(200 112) rotate(${ang})`}
          stroke={p.wingEdge}
          strokeOpacity="0.4"
        />
      ))}
    </g>
  );
}

function Horns({ id, style, scale, p }: { id: string; style: HornStyle; scale: number; p: Palette }) {
  const left = HORN_PATHS[style];
  const fill = `url(#${id}-horn)`;
  const one = (
    <g transform={`translate(176 116) scale(${scale}) translate(-176 -116)`}>
      {style === "antler" ? (
        <g fill="none" strokeLinecap="round">
          <path d={left} stroke={p.bodyDark} strokeWidth="9" />
          <path d={left} stroke={p.horn} strokeWidth="6" />
        </g>
      ) : (
        <>
          <path d={left} fill={fill} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.2" />
          <path d={left} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" transform="translate(1.5 -1)" />
        </>
      )}
    </g>
  );
  return (
    <g className="sl-horns">
      {one}
      <g transform={MIRROR}>{one}</g>
      {style === "crown" && (
        <g transform={`translate(200 104) scale(${scale}) translate(-200 -104)`}>
          <path d="M192,106 L200,58 L208,106 Z" fill={fill} stroke={p.bodyDark} strokeOpacity="0.5" />
        </g>
      )}
    </g>
  );
}

const HORN_PATHS: Record<HornStyle, string> = {
  swept: "M170,120 C160,94 146,74 116,58 C132,82 142,102 152,128 Z",
  crown: "M168,114 L150,66 L184,106 Z M156,124 L124,94 L164,116 Z",
  antler: "M176,114 C170,92 160,74 148,58 M165,86 C154,82 146,84 134,76 M157,70 C160,60 164,54 172,46",
  crescent: "M172,118 C140,106 130,74 150,46 C150,74 162,94 188,108 Z",
  spire: "M174,116 C168,90 166,62 172,30 C180,60 186,88 192,110 Z",
};

/* ───────────────────────────── markings ───────────────────────────── */

type Pt = [number, number, number];

function Markings({ id, type, pts, p, opacity }: { id: string; type: Marking; pts: Pt[]; p: Palette; opacity: number }) {
  if (type === "none") return null;
  if (type === "constellation") {
    return (
      <g opacity={opacity}>
        <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 2 : 2.8} fill="#fff" filter={`url(#${id}-glow)`} className="sl-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
    );
  }
  const glow = type === "runes" || type === "veins";
  return (
    <g opacity={opacity} filter={glow ? `url(#${id}-glow)` : undefined} className={glow ? "sl-rune-pulse" : ""}>
      {pts.map(([x, y, rot], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          {type === "stripes" && <path d="M-12,-6 L0,2 L12,-6 L12,-1 L0,7 L-12,-1 Z" fill={p.bodyDark} opacity="0.55" />}
          {type === "spots" && (
            <>
              <circle r="5" fill={p.bodyLight} opacity="0.55" />
              <circle cx="8" cy="5" r="2.6" fill={p.bodyLight} opacity="0.45" />
            </>
          )}
          {type === "runes" && <path d={RUNES[i % RUNES.length]} fill="none" stroke={p.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
          {type === "veins" && <path d="M-14,4 C-6,2 -2,-2 0,-8 M0,-8 C2,-2 8,0 14,-2 M0,-8 C0,-2 -2,6 -4,12" fill="none" stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );
}

const RUNES = ["M-6,-7 L0,7 L6,-7 M-4,0 L4,0", "M-6,-6 L6,-6 L-6,6 L6,6", "M0,-8 L0,8 M-6,-3 L0,-8 L6,-3", "M-6,6 L-6,-6 L6,6 L6,-6"];

/* ───────────────────────────── archetypes ───────────────────────────── */

function DrakeBody({ id, p, species, wingScale, markOpacity }: Ctx) {
  const wing = (
    <g transform={`translate(182 216) scale(${wingScale}) translate(-182 -216)`}>
      <g className="sl-flap" style={{ transformOrigin: "182px 216px" }}>
        <path
          d="M184,220 C160,178 128,146 62,112 C54,110 50,118 56,124 C72,148 80,170 78,198 C94,190 110,192 118,208 C128,200 142,202 150,216 C162,210 174,212 184,226 Z"
          fill={`url(#${id}-wing)`}
          stroke={p.bodyDark}
          strokeOpacity="0.5"
        />
        <path d="M184,220 L62,114 M124,166 L78,198 M138,180 L118,208 M158,196 L150,216" stroke={p.bodyDark} strokeWidth="2.4" strokeOpacity="0.55" fill="none" strokeLinecap="round" />
        <path d="M184,220 L62,114" stroke={p.wingEdge} strokeWidth="1" strokeOpacity="0.6" fill="none" />
      </g>
    </g>
  );
  return (
    <g>
      {/* tail */}
      <path
        d="M216,312 C262,342 322,340 338,300 C348,272 324,248 300,258 C318,264 328,282 318,298 C304,320 262,322 230,296 Z"
        fill={`url(#${id}-body)`}
        stroke={p.bodyDark}
        strokeOpacity="0.5"
      />
      <path d="M300,258 L286,242 L306,246 L312,230 L316,252 Z" fill={p.accent} opacity="0.9" />
      {wing}
      <g transform={MIRROR}>{wing}</g>
      {/* hind legs */}
      {[158, 242].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="304" rx="30" ry="27" fill={`url(#${id}-body)`} stroke={p.bodyDark} strokeOpacity="0.5" />
          <ellipse cx={x + (i ? 6 : -6)} cy="334" rx="20" ry="10" fill={p.body} stroke={p.bodyDark} strokeOpacity="0.5" />
          {[-10, 0, 10].map((dx) => (
            <path key={dx} d={`M${x + (i ? 6 : -6) + dx - 3},338 L${x + (i ? 6 : -6) + dx},347 L${x + (i ? 6 : -6) + dx + 3},338 Z`} fill={p.horn} />
          ))}
        </g>
      ))}
      {/* torso */}
      <path
        d="M200,188 C246,188 263,238 259,280 C256,318 233,342 200,342 C167,342 144,318 141,280 C137,238 154,188 200,188 Z"
        fill={`url(#${id}-body)`}
        stroke={p.bodyDark}
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <Belly id={id} p={p} cosmic={species.marking === "constellation"} />
      <Markings
        id={id}
        type={species.marking}
        p={p}
        opacity={markOpacity}
        pts={[
          [158, 246, -24],
          [242, 246, 24],
          [154, 280, -12],
          [246, 280, 12],
          [162, 312, -6],
          [238, 312, 6],
        ]}
      />
      {/* forelegs */}
      {[166, 234].map((x, i) => (
        <g key={x}>
          <path d={i ? "M226,238 C244,250 246,274 238,292 L224,290 C228,274 224,258 216,248 Z" : "M174,238 C156,250 154,274 162,292 L176,290 C172,274 176,258 184,248 Z"} fill={`url(#${id}-body)`} stroke={p.bodyDark} strokeOpacity="0.5" />
          {[-6, 0, 6].map((dx) => (
            <circle key={dx} cx={x + (i ? 2 : -2) + dx} cy="293" r="3" fill={p.horn} />
          ))}
        </g>
      ))}
      {/* neck */}
      <path d="M176,176 C180,200 220,200 224,176 L224,198 C214,210 186,210 176,198 Z" fill={p.body} />
    </g>
  );
}

function Belly({ id, p, cosmic }: { id: string; p: Palette; cosmic: boolean }) {
  const d = "M200,212 C222,212 233,248 231,284 C229,312 216,330 200,330 C184,330 171,312 169,284 C167,248 178,212 200,212 Z";
  return (
    <g>
      <path d={d} fill={`url(#${id}-belly)`} />
      {cosmic ? (
        <path d={d} fill={`url(#${id}-stars)`} className="sl-twinkle" />
      ) : (
        [238, 258, 278, 298, 316].map((y) => <path key={y} d={`M${178 + (y > 300 ? 6 : 0)},${y} C190,${y + 5} 210,${y + 5} ${222 - (y > 300 ? 6 : 0)},${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.22" strokeWidth="1.5" />)
      )}
    </g>
  );
}

function SerpentBody({ id, p, species, markOpacity }: Ctx) {
  const coil = "M96,296 C58,330 110,370 172,354 C242,336 302,352 314,310 C326,268 272,250 232,262 C192,274 164,252 176,224 C184,206 200,202 200,188";
  return (
    <g>
      {/* tail fin */}
      <g className="sl-sway" style={{ transformOrigin: "96px 296px" }}>
        <path d="M100,294 C84,280 72,262 74,236 C82,256 96,274 114,290 Z" fill={`url(#${id}-body)`} />
        <path d="M74,238 C60,224 58,206 66,190 C70,210 80,222 90,230 C86,214 92,200 104,192 C100,212 96,230 78,244 Z" fill={`url(#${id}-wing)`} />
      </g>
      <path d={coil} fill="none" stroke={p.bodyDark} strokeWidth="50" strokeLinecap="round" />
      <path d={coil} fill="none" stroke={`url(#${id}-tube)`} strokeWidth="44" strokeLinecap="round" />
      <path d={coil} fill="none" stroke={p.belly} strokeWidth="13" strokeOpacity="0.55" transform="translate(0 8)" />
      <path d={coil} fill="none" stroke={p.bodyDark} strokeWidth="13" strokeDasharray="1.5 8" strokeOpacity="0.3" transform="translate(0 8)" />
      <path d={coil} fill="none" stroke={p.bodyLight} strokeWidth="9" strokeOpacity="0.4" transform="translate(-2 -11)" strokeLinecap="round" />
      <path d={coil} fill="none" stroke={p.accent} strokeWidth="5" strokeDasharray="3 16" strokeOpacity="0.85" transform="translate(0 -21)" strokeLinecap="round" />
      <Markings
        id={id}
        type={species.marking}
        p={p}
        opacity={markOpacity}
        pts={[
          [120, 352, 10],
          [176, 346, 0],
          [244, 338, 0],
          [300, 322, 60],
          [292, 272, -20],
          [236, 270, 0],
          [186, 248, 30],
        ]}
      />
      {/* small forelimbs */}
      <path d="M176,212 C160,214 150,226 150,240 L160,238 C162,230 168,224 180,222 Z" fill={p.body} stroke={p.bodyDark} strokeOpacity="0.5" />
      <path d="M224,212 C240,214 250,226 250,240 L240,238 C238,230 232,224 220,222 Z" fill={p.body} stroke={p.bodyDark} strokeOpacity="0.5" />
    </g>
  );
}

function MantaBody({ id, p, species, wingScale, markOpacity }: Ctx) {
  const s = 0.7 + wingScale * 0.3;
  return (
    <g>
      {/* tail */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 280px" }}>
        <path d="M200,276 C206,310 236,330 228,362 C224,376 214,384 204,388" fill="none" stroke={p.bodyDark} strokeWidth="7" strokeLinecap="round" />
        <path d="M200,276 C206,310 236,330 228,362 C224,376 214,384 204,388" fill="none" stroke={p.body} strokeWidth="4" strokeLinecap="round" />
        <path d="M204,388 L194,378 L206,374 Z" fill={p.accent} filter={`url(#${id}-glow)`} />
      </g>
      <g transform={`translate(200 215) scale(${s} ${0.85 + wingScale * 0.15}) translate(-200 -215)`}>
      <g className="sl-glide" style={{ transformOrigin: "200px 215px" }}>
        <path
          d="M200,168 C252,158 322,170 376,214 C334,226 300,242 268,272 C248,262 224,262 200,282 C176,262 152,262 132,272 C100,242 66,226 24,214 C78,170 148,158 200,168 Z"
          fill={`url(#${id}-wing)`}
          stroke={p.bodyDark}
          strokeOpacity="0.5"
        />
        <path d="M200,176 C258,170 318,182 362,212" fill="none" stroke={p.wingEdge} strokeOpacity="0.7" strokeWidth="2" />
        <path d="M200,176 C142,170 82,182 38,212" fill="none" stroke={p.wingEdge} strokeOpacity="0.7" strokeWidth="2" />
        <path d="M232,196 C270,200 300,214 330,214 M232,226 C258,234 276,250 290,256 M168,196 C130,200 100,214 70,214 M168,226 C142,234 124,250 110,256" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.6" />
        <Markings
          id={id}
          type={species.marking}
          p={p}
          opacity={markOpacity}
          pts={[
            [86, 210, -10],
            [128, 222, -10],
            [160, 244, -20],
            [240, 244, 20],
            [272, 222, 10],
            [314, 210, 10],
          ]}
        />
      </g>
      </g>
      {/* core body */}
      <ellipse cx="200" cy="226" rx="40" ry="56" fill={`url(#${id}-body)`} stroke={p.bodyDark} strokeOpacity="0.5" />
      <ellipse cx="200" cy="238" rx="24" ry="34" fill={`url(#${id}-belly)`} />
      {species.marking === "constellation" && <ellipse cx="200" cy="238" rx="24" ry="34" fill={`url(#${id}-stars)`} />}
      <circle cx="200" cy="236" r="10" fill={`url(#${id}-gem)`} filter={`url(#${id}-glow)`} className="sl-core" />
    </g>
  );
}

function PhoenixBody({ id, p, species, wingScale, evo, markOpacity }: Ctx) {
  const feathers = (count: number, from: number, to: number, base: number, amp: number, cls: string) =>
    Array.from({ length: count }).map((_, i) => {
      const t = i / (count - 1);
      const ang = from + (to - from) * t;
      const l = base + amp * Math.sin(t * Math.PI);
      return (
        <path
          key={`${cls}${i}`}
          d={`M0,0 C${l * 0.3},-13 ${l * 0.8},-11 ${l},0 C${l * 0.8},8 ${l * 0.3},10 0,0 Z`}
          fill={`url(#${id}-feather)`}
          stroke={p.bodyDark}
          strokeOpacity="0.35"
          transform={`rotate(${ang})`}
        />
      );
    });
  const wing = (
    <g transform={`translate(178 214) scale(${wingScale}) translate(-178 -214)`}>
      <g className="sl-flap" style={{ transformOrigin: "178px 214px" }}>
        <g transform="translate(178 214)">
          {feathers(8, -172, -96, 110, 40, "a")}
          <g transform="scale(0.62)">{feathers(7, -168, -104, 100, 30, "b")}</g>
        </g>
      </g>
    </g>
  );
  const tailLen = [48, 62, 76, 86][evo];
  return (
    <g>
      {/* tail plumes */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 300px" }}>
        {[22, 48, 72, 108, 132, 158].map((ang, i) => {
          const l = tailLen * (i === 0 || i === 5 ? 1.15 : i === 1 || i === 4 ? 1.05 : 0.9);
          const rad = (ang * Math.PI) / 180;
          return (
            <g key={ang}>
              <path d={`M0,0 C${l * 0.3},-10 ${l * 0.8},-14 ${l},0 C${l * 0.8},14 ${l * 0.3},10 0,0 Z`} fill={`url(#${id}-feather)`} transform={`translate(200 300) rotate(${ang})`} />
              <circle cx={200 + Math.cos(rad) * l * 0.82} cy={300 + Math.sin(rad) * l * 0.82} r="5" fill={p.accent} filter={`url(#${id}-glow)`} />
            </g>
          );
        })}
      </g>
      {wing}
      <g transform={MIRROR}>{wing}</g>
      {/* legs */}
      {[178, 222].map((x) => (
        <g key={x}>
          <path d={`M${x - 5},316 L${x - 3},346 L${x + 3},346 L${x + 5},316 Z`} fill={p.horn} opacity="0.9" />
          <path d={`M${x - 12},350 L${x},344 L${x + 12},350`} stroke={p.horn} strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      ))}
      {/* torso */}
      <path
        d="M200,190 C238,190 252,236 248,274 C245,306 226,330 200,330 C174,330 155,306 152,274 C148,236 162,190 200,190 Z"
        fill={`url(#${id}-body)`}
        stroke={p.bodyDark}
        strokeOpacity="0.55"
      />
      <path d="M200,214 C218,214 226,246 224,276 C222,300 212,316 200,316 C188,316 178,300 176,276 C174,246 182,214 200,214 Z" fill={`url(#${id}-belly)`} />
      {species.marking === "constellation" && (
        <path d="M200,214 C218,214 226,246 224,276 C222,300 212,316 200,316 C188,316 178,300 176,276 C174,246 182,214 200,214 Z" fill={`url(#${id}-stars)`} />
      )}
      {/* chest feather scallops */}
      {[232, 252, 272, 292].map((y, row) =>
        [-1, 0, 1].map((c) => (
          <path key={`${y}${c}`} d={`M${200 + c * 12 - 7 + (row % 2) * 6},${y} q7,9 14,0`} fill="none" stroke={p.bodyDark} strokeOpacity="0.2" strokeWidth="1.4" />
        )),
      )}
      <Markings
        id={id}
        type={species.marking}
        p={p}
        opacity={markOpacity}
        pts={[
          [164, 250, -20],
          [236, 250, 20],
          [162, 286, -10],
          [238, 286, 10],
          [200, 322, 0],
        ]}
      />
      <path d="M178,178 C182,200 218,200 222,178 L222,198 C212,210 188,210 178,198 Z" fill={p.body} />
    </g>
  );
}
