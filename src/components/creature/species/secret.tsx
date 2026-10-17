import { tube, r, type P } from "../geometry";
import { u, type ArtCtx } from "../kit";

/* ── GENESIS · prismform ──────────────────────────────────────────── */

export function Genesis(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const blades = [2, 3, 4, 5][evo];
  // Three slanted bars: the silhouette of the first block.
  const bar = (y: number, dir: 1 | -1) => {
    const w = 128;
    const h = 20;
    const s = 18 * dir;
    return `M${200 - w / 2 + s},${y} L${200 + w / 2 + s},${y} L${200 + w / 2 - s},${y + h} L${200 - w / 2 - s},${y + h} Z`;
  };

  return (
    <g className="sl-hover">
      <defs>
        <linearGradient id={`${id}-prism`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={p.accent} />
          <stop offset="0.5" stopColor={p.body} />
          <stop offset="1" stopColor={p.horn} />
        </linearGradient>
        <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.bodyLight} />
          <stop offset="0.5" stopColor={p.body} />
          <stop offset="1" stopColor={p.wing} />
        </linearGradient>
      </defs>

      {/* wing blades */}
      {[1, -1].map((side) => (
        <g key={side} transform={side === -1 ? "translate(400 0) scale(-1 1)" : undefined}>
          {Array.from({ length: blades }).map((_, i) => {
            const a = -158 + i * 13;
            const len = 92 + i * 16;
            return (
              <g key={i} transform={`translate(146 ${214 + i * 6}) rotate(${a})`}>
                <path d={`M0,-4 L${len},-7 L${len + 10},0 L${len},5 L0,4 Z`} fill={`url(#${id}-silver)`} stroke={p.bodyDark} strokeWidth="0.6" />
                <path d={`M4,-4 L${len},-7`} stroke={`url(#${id}-prism)`} strokeWidth="1" />
              </g>
            );
          })}
        </g>
      ))}

      {/* torso bars */}
      {[
        [182, 1],
        [214, -1],
        [246, 1],
      ].map(([y, dir], i) => (
        <g key={i}>
          <path d={bar(y, dir as 1 | -1)} fill={`url(#${id}-silver)`} stroke={p.bodyDark} strokeWidth="0.8" />
          <path d={bar(y, dir as 1 | -1)} fill="none" stroke={`url(#${id}-prism)`} strokeWidth="1.2" />
        </g>
      ))}

      {/* tail of descending diamonds */}
      {[0, 1, 2, 3].slice(0, evo + 1).map((i) => {
        const y = 290 + i * 22;
        const s = 10 - i * 2;
        return <path key={i} d={`M200,${y - s} L${200 + s},${y} L200,${y + s} L${200 - s},${y} Z`} fill={`url(#${id}-silver)`} stroke={`url(#${id}-prism)`} strokeWidth="0.8" />;
      })}

      {/* head */}
      <path d="M200,98 L226,140 L200,172 Z" fill={p.wing} />
      <path d="M200,98 L174,140 L200,172 Z" fill={p.bodyLight} />
      <path d="M200,98 L226,140 L200,172 L174,140 Z" fill="none" stroke={`url(#${id}-prism)`} strokeWidth="1.2" />
      <path d="M184,140 L216,140" stroke={p.accent} strokeWidth="2.2" filter={u(ctx, "bloom")} className="sl-lantern" />
      {evo === 3 && <path d="M200,72 L240,95 L240,141 L200,164 L160,141 L160,95 Z" fill="none" stroke={p.horn} strokeOpacity="0.45" strokeWidth="0.8" transform="translate(0 -10)" />}
    </g>
  );
}

/* ── NULLBORN · nullmoth ──────────────────────────────────────────── */

export function Nullborn(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const eyes = [
    [104, 126, 9],
    [148, 156, 6],
    [72, 156, 5.5],
    [140, 270, 6],
  ].slice(0, [1, 2, 3, 4][evo]);
  const abdomen: P[] = [
    [200, 214],
    [200, 252],
    [200, 292],
  ];

  const wings = (
    <g>
      <path d="M196,176 C160,112 92,68 36,86 C24,138 64,198 188,208 Z" fill={`url(#${id}-chitin)`} stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="0.8" />
      <path d="M194,214 C150,228 106,278 116,332 C162,322 190,268 198,222 Z" fill={`url(#${id}-chitin)`} stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="0.8" />
      {/* veins */}
      <path d="M192,184 C150,140 100,110 44,92 M190,194 C140,170 90,150 40,140 M188,204 C130,196 80,184 54,176 M196,222 C170,250 140,290 122,326 M196,226 C180,260 160,296 150,318" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="0.7" />
      {eyes.map(([x, y, r], i) => (
        <g key={i} className="sl-eye" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 1.3}s` }}>
          <ellipse cx={x} cy={y} rx={r * 1.6} ry={r * 0.95} fill="none" stroke={p.accent} strokeOpacity="0.55" strokeWidth="0.8" />
          <ellipse cx={x} cy={y} rx={r * 1.15} ry={r * 0.62} fill={p.eye} />
          <circle cx={x + r * 0.35} cy={y - r * 0.18} r={r * 0.16} fill="#fff" />
        </g>
      ))}
    </g>
  );

  return (
    <g className="sl-hover">
      <defs>
        <radialGradient id={`${id}-chitin`} cx="0.6" cy="0.6" r="0.9">
          <stop offset="0" stopColor={p.bodyLight} />
          <stop offset="0.7" stopColor={p.body} />
          <stop offset="1" stopColor={p.bodyDark} />
        </radialGradient>
      </defs>
      <g className="sl-flap-slow" style={{ transformOrigin: "196px 200px" }}>
        {wings}
      </g>
      <g transform="translate(400 0) scale(-1 1)">
        <g className="sl-flap-slow" style={{ transformOrigin: "196px 200px" }}>
          {wings}
        </g>
      </g>

      {/* legs */}
      {[-1, 1].map((s) =>
        [0, 1, 2].map((i) => <path key={`${s}${i}`} d={`M${200 + s * 6},${206 + i * 8} l${s * (14 + i * 6)},${18 + i * 6} l${s * 4},${26 + i * 4}`} fill="none" stroke={p.horn} strokeWidth="1" />),
      )}

      {/* abdomen */}
      <path d={tube(abdomen, (t) => 24 - t * 16)} fill={`url(#${id}-chitin)`} stroke={p.bodyDark} strokeOpacity="0.5" />
      {[226, 240, 254, 268, 280].map((y, i) => (
        <path key={y} d={`M${190 + i * 1.6},${y} L${210 - i * 1.6},${y}`} stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="0.8" />
      ))}
      {/* fur collar & thorax */}
      <ellipse cx="200" cy="198" rx="17" ry="24" fill={`url(#${id}-chitin)`} />
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={186 + i * 3.5} cy={r(180 + Math.sin(i) * 2)} r="5" fill={p.bodyLight} />
      ))}
      {/* head & compound eyes */}
      <circle cx="200" cy="166" r="12" fill={`url(#${id}-chitin)`} />
      <ellipse cx="192" cy="166" rx="5" ry="6" fill={p.eye} />
      <ellipse cx="208" cy="166" rx="5" ry="6" fill={p.eye} />
      {/* feathered antennae */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${200 + s * 4},156 C${200 + s * 14},128 ${200 + s * 30},108 ${200 + s * 46},96`} fill="none" stroke={p.horn} strokeWidth="1" />
          {Array.from({ length: 8 }).map((_, i) => {
            const t = (i + 1) / 9;
            const x = r(200 + s * (4 + 42 * t));
            const y = r(156 - 60 * t + 10 * t * t);
            return <path key={i} d={`M${x},${y} l${s * -6},-6 M${x},${y} l${s * 6},-2`} stroke={p.horn} strokeWidth="0.6" />;
          })}
        </g>
      ))}
    </g>
  );
}
