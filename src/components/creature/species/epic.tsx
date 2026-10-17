import { tube, line, type P } from "../geometry";
import { Eye, Lit, u, type ArtCtx } from "../kit";

/* ── NEONYX · hoodserpent ─────────────────────────────────────────── */

export function Neonyx(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const hoodW = [0.56, 0.74, 0.9, 1][evo];
  const tail: P[] = [
    [334, 292],
    [304, 312],
    [252, 318],
    [204, 314],
  ];
  const coil: P[] = [
    [204, 314],
    [144, 322],
    [120, 340],
    [168, 356],
    [252, 356],
    [294, 340],
    [282, 318],
    [240, 304],
    [212, 292],
  ];
  const neck: P[] = [
    [212, 296],
    [210, 264],
    [203, 230],
    [200, 196],
  ];
  const hood = "M200,124 C228,124 264,144 278,182 C286,206 270,228 240,238 L160,238 C130,228 114,206 122,182 C136,144 172,124 200,124 Z";
  const lanterns = [
    [168, 172, 8.5],
    [152, 198, 7],
    [180, 220, 6],
  ].slice(0, [1, 2, 3, 3][evo]);

  const Lantern = ({ x, y, r }: { x: number; y: number; r: number }) => (
    <g className="sl-lantern">
      <ellipse cx={x} cy={y} rx={r * 2.6} ry={r * 2} fill={u(ctx, "glow")} opacity="0.35" />
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.72} fill="#0a0612" stroke={p.accent} strokeWidth="1" />
      <ellipse cx={x} cy={y} rx={r * 0.62} ry={r * 0.42} fill={p.accent} filter={u(ctx, "bloom")} />
      <ellipse cx={x - r * 0.15} cy={y - r * 0.1} rx={r * 0.22} ry={r * 0.16} fill="#fff" />
    </g>
  );

  return (
    <g>
      <Lit ctx={ctx} d={tube(tail, (t) => 4 + t * 20)} fill={u(ctx, "hideV")} />
      <circle cx="334" cy="292" r="4" fill={p.accent} filter={u(ctx, "bloom")} className="sl-lantern" />

      {/* rising neck */}
      <Lit ctx={ctx} d={tube(neck, () => 34)} fill={u(ctx, "hideV")} />
      <path d={tube(neck, () => 15)} fill={u(ctx, "belly")} opacity="0.75" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${199 + (6 - i) * 1.4},${206 + i * 14} l14,0`} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1" transform="translate(-7 0)" />
      ))}

      {/* ground coil */}
      <Lit ctx={ctx} d={tube(coil, (t) => 26 + Math.sin(t * Math.PI) * 10)} fill={u(ctx, "hideV")} />
      <path d={tube(coil, (t) => 26 + Math.sin(t * Math.PI) * 10)} fill={u(ctx, "scales")} opacity="0.7" />
      <path d={line(coil)} fill="none" stroke={p.bodyLight} strokeOpacity="0.25" strokeWidth="2" transform="translate(0 -9)" />

      {/* hood */}
      <g transform={`translate(200 0) scale(${hoodW} 1) translate(-200 0)`}>
        <Lit ctx={ctx} d={hood} fill={u(ctx, "hide")} />
        <path d={hood} fill={u(ctx, "scales")} opacity="0.5" />
        {/* hood ribs */}
        {[-62, -40, -20, 20, 40, 62].map((dx) => (
          <path key={dx} d={`M200,226 C${200 + dx * 0.5},190 ${200 + dx * 0.9},150 ${200 + dx},118`} fill="none" stroke={p.bodyLight} strokeOpacity="0.16" strokeWidth="1.2" />
        ))}
        <path d="M190,238 C188,206 190,170 200,146 C210,170 212,206 210,238 Z" fill={u(ctx, "belly")} opacity="0.6" />
        {lanterns.map(([x, y, r]) => (
          <g key={`${x}${y}`}>
            <Lantern x={x} y={y} r={r} />
            <Lantern x={400 - x} y={y} r={r} />
          </g>
        ))}
      </g>

      {/* head */}
      <Lit ctx={ctx} d="M200,96 C218,96 230,108 230,124 C230,140 218,154 206,166 L194,166 C182,154 170,140 170,124 C170,108 182,96 200,96 Z" fill={u(ctx, "hide")} />
      <path d="M184,108 L200,102 L216,108 L200,118 Z" fill={p.bodyLight} opacity="0.3" />
      <Eye ctx={ctx} x={186} y={128} r={3.8} angle={12} />
      <Eye ctx={ctx} x={214} y={128} r={3.8} angle={-12} />
      <circle cx="196" cy="156" r="1.1" fill={p.bodyDark} />
      <circle cx="204" cy="156" r="1.1" fill={p.bodyDark} />
      {evo === 3 && (
        <g>
          {[-24, -12, 0, 12, 24].map((a, i) => (
            <g key={a} transform={`rotate(${a} 200 98)`}>
              <path d="M200,98 L200,70" stroke={p.horn} strokeOpacity="0.7" strokeWidth="1" />
              <circle cx="200" cy={70 - (i % 2) * 6} r="2" fill={p.accent} filter={u(ctx, "bloom")} className="sl-lantern" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

/* ── AURORATH · skyray ────────────────────────────────────────────── */

export function Aurorath(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const span = [0.62, 0.8, 0.94, 1.04][evo];
  const wing = "M200,150 C240,148 304,158 376,196 C334,204 302,218 272,248 C252,244 226,250 200,268 C174,250 148,244 128,248 C98,218 66,204 24,196 C96,158 160,148 200,150 Z";
  const tail: P[] = [
    [200, 262],
    [206, 300],
    [190, 336],
    [204, 372],
  ];

  return (
    <g>
      <defs>
        <clipPath id={`${id}-wingclip`}>
          <path d={wing} />
        </clipPath>
        <linearGradient id={`${id}-aurora`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7fe6dc" stopOpacity="0" />
          <stop offset="0.3" stopColor="#7fe6dc" stopOpacity="0.7" />
          <stop offset="0.55" stopColor="#8f9cff" stopOpacity="0.55" />
          <stop offset="0.8" stopColor="#c48bff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c48bff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={line(tail)} stroke={p.bodyDark} strokeWidth="5" fill="none" strokeLinecap="round" className="sl-sway-slow" style={{ transformOrigin: "200px 262px" }} />
      <path d={line(tail)} stroke={p.bodyLight} strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeLinecap="round" className="sl-sway-slow" style={{ transformOrigin: "200px 262px" }} />

      <g transform={`translate(200 200) scale(${span} ${0.9 + span * 0.1}) translate(-200 -200)`}>
        <g className="sl-glide" style={{ transformOrigin: "200px 200px" }}>
          {/* trailing veils at Apex */}
          {evo === 3 && (
            <g opacity="0.75">
              <path d="M272,248 C300,272 330,300 372,312 C340,290 318,262 306,232 Z" fill={u(ctx, "veil")} />
              <path d="M128,248 C100,272 70,300 28,312 C60,290 82,262 94,232 Z" fill={u(ctx, "veil")} />
            </g>
          )}
          <path d={wing} fill={u(ctx, "membrane")} stroke={p.bodyDark} strokeWidth="1.2" />
          {/* the aurora held inside the membrane */}
          <g clipPath={`url(#${id}-wingclip)`}>
            <g filter={u(ctx, "soft")} className="sl-aurora">
              <path d="M30,198 C100,176 160,182 200,196 C240,182 300,176 370,198 L370,214 C300,196 240,204 200,216 C160,204 100,196 30,214 Z" fill={`url(#${id}-aurora)`} />
              <path d="M60,214 C120,206 170,214 200,230 C230,214 280,206 340,214 L330,228 C280,222 230,228 200,244 C170,228 120,222 70,228 Z" fill={`url(#${id}-aurora)`} opacity="0.6" />
            </g>
            {Array.from({ length: 9 }).map((_, i) => {
              const x = 40 + i * 20;
              return <path key={i} d={`M200,170 C${(200 + x) / 2},${180 + i} ${x},${190 + i * 2} ${x - 10},${205 + i * 3}`} fill="none" stroke={p.wingEdge} strokeOpacity="0.16" strokeWidth="0.8" />;
            })}
            {Array.from({ length: 9 }).map((_, i) => {
              const x = 360 - i * 20;
              return <path key={i} d={`M200,170 C${(200 + x) / 2},${180 + i} ${x},${190 + i * 2} ${x + 10},${205 + i * 3}`} fill="none" stroke={p.wingEdge} strokeOpacity="0.16" strokeWidth="0.8" />;
            })}
          </g>
          <path d="M200,156 C246,154 306,166 362,196" fill="none" stroke={p.wingEdge} strokeOpacity="0.7" strokeWidth="1" />
          <path d="M200,156 C154,154 94,166 38,196" fill="none" stroke={p.wingEdge} strokeOpacity="0.7" strokeWidth="1" />
        </g>
      </g>

      {/* body ridge */}
      <Lit ctx={ctx} d="M200,140 C222,140 234,170 232,210 C230,240 218,262 200,272 C182,262 170,240 168,210 C166,170 178,140 200,140 Z" fill={u(ctx, "hide")} />
      <path d="M200,150 L200,262" stroke={p.bodyLight} strokeOpacity="0.3" strokeWidth="1" />
      {[176, 196, 216, 236].map((y) => (
        <path key={y} d={`M188,${y} L200,${y + 6} L212,${y}`} fill="none" stroke={p.bodyLight} strokeOpacity="0.2" strokeWidth="1" />
      ))}
      {/* cephalic horns */}
      <path d="M190,146 C182,132 178,118 186,104 C188,118 194,128 200,140 Z" fill={u(ctx, "metal")} />
      <path d="M210,146 C218,132 222,118 214,104 C212,118 206,128 200,140 Z" fill={u(ctx, "metal")} />
      <Eye ctx={ctx} x={184} y={160} r={2.6} slit={false} />
      <Eye ctx={ctx} x={216} y={160} r={2.6} slit={false} />
    </g>
  );
}
