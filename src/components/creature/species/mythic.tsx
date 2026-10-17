import { polar, r } from "../geometry";
import { Eye, u, type ArtCtx } from "../kit";

/* ── ASTRAVEX · orbitalconstruct ──────────────────────────────────── */

export function Astravex(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const count = [5, 9, 13, 17][evo];
  const plat = u(ctx, "metalV");
  const cx = 200;
  const cy = 222;

  // armour plates follow a tightening spiral: the ghost of a coiled body
  const plates = Array.from({ length: count }).map((_, i) => {
    const k = i / 16;
    const a = 160 + k * 330;
    const r = 132 - k * 52;
    const [x, y] = polar(cx, cy, r, a);
    const w = 44 - k * 26;
    const h = 20 - k * 10;
    return { x, y, a, w, h };
  });

  return (
    <g>
      <defs>
        <radialGradient id={`${id}-void`} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#2a2060" />
          <stop offset="0.6" stopColor={p.belly} />
          <stop offset="1" stopColor={p.belly} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* captive star */}
      <circle cx={cx} cy={cy} r="96" fill={`url(#${id}-void)`} />
      <circle cx={cx} cy={cy} r="88" fill={u(ctx, "stars")} opacity="0.7" />
      <g className="sl-core" style={{ transformOrigin: `${cx}px ${cy + 6}px` }}>
        <circle cx={cx} cy={cy + 6} r="38" fill={u(ctx, "glow")} opacity="0.55" />
        <circle cx={cx} cy={cy + 6} r="7" fill="#fff" filter={u(ctx, "bloom")} />
        <path d={`M${cx - 46},${cy + 6} L${cx + 46},${cy + 6} M${cx},${cy - 40} L${cx},${cy + 52}`} stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" />
      </g>

      {/* orbiting armour */}
      <g className="sl-orbit" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {plates.map(({ x, y, a, w, h }, i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${a + 90})`}>
            <path d={`M${-w / 2},${-h / 2} L${w / 2},${-h / 2} L${w * 0.36},${h / 2} L${-w * 0.36},${h / 2} Z`} fill={plat} stroke={p.bodyDark} strokeWidth="0.8" />
            <path d={`M${-w / 2 + 2},${-h / 2 + 1.2} L${w / 2 - 2},${-h / 2 + 1.2}`} stroke="#fff" strokeOpacity="0.85" strokeWidth="0.8" />
            <path d={`M${-w * 0.12},${-h / 2} L0,${-h / 2 - h * 0.9} L${w * 0.12},${-h / 2} Z`} fill={plat} />
          </g>
        ))}
      </g>

      {/* floating side blades (Ascendant+) */}
      {evo >= 2 && (
        <g>
          <path d="M120,150 L52,92 L70,140 L40,150 L108,170 Z" fill={plat} stroke={p.bodyDark} strokeWidth="0.8" />
          <path d="M280,150 L348,92 L330,140 L360,150 L292,170 Z" fill={plat} stroke={p.bodyDark} strokeWidth="0.8" />
          <path d="M118,152 L56,98 M282,152 L344,98" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" />
        </g>
      )}

      {/* the mask */}
      <g>
        <path d="M184,92 C176,70 178,46 192,26 C190,48 194,68 200,86 Z" fill={plat} stroke={p.bodyDark} strokeWidth="0.8" />
        <path d="M216,92 C224,70 222,46 208,26 C210,48 206,68 200,86 Z" fill={plat} stroke={p.bodyDark} strokeWidth="0.8" />
        <path d="M176,104 C152,90 136,68 134,44 C148,62 164,78 184,92 Z" fill={plat} stroke={p.bodyDark} strokeWidth="0.8" />
        <path d="M224,104 C248,90 264,68 266,44 C252,62 236,78 216,92 Z" fill={plat} stroke={p.bodyDark} strokeWidth="0.8" />
        <path d="M200,84 C226,84 242,100 242,124 C242,146 226,162 200,176 C174,162 158,146 158,124 C158,100 174,84 200,84 Z" fill={plat} stroke={p.bodyDark} strokeWidth="1" />
        <path d="M200,84 C226,84 242,100 242,124 C242,146 226,162 200,176 Z" fill={p.bodyDark} opacity="0.28" />
        <path d="M200,90 L200,170" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="0.8" />
        <path d="M172,122 L192,128 L176,132 Z" fill="#0a0818" />
        <path d="M228,122 L208,128 L224,132 Z" fill="#0a0818" />
        <path d="M176,126 L190,128" stroke={p.eye} strokeWidth="1.6" filter={u(ctx, "bloom")} />
        <path d="M224,126 L210,128" stroke={p.eye} strokeWidth="1.6" filter={u(ctx, "bloom")} />
        <path d="M200,96 L206,106 L200,114 L194,106 Z" fill={p.accent} filter={u(ctx, "bloom")} />
        {/* separated jaw */}
        <path d="M184,184 L216,184 L208,200 L192,200 Z" fill={plat} stroke={p.bodyDark} strokeWidth="0.8" />
      </g>
    </g>
  );
}

/* ── ORBELITH · voidwhale ─────────────────────────────────────────── */

export function Orbelith(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const body = "M36,212 C54,160 136,128 228,138 C298,146 344,170 372,196 C346,214 300,240 228,250 C148,262 66,252 36,212 Z";
  const bright = [0.45, 0.65, 0.85, 1][evo];

  return (
    <g>
      <defs>
        <clipPath id={`${id}-whale`}>
          <path d={body} />
        </clipPath>
        <linearGradient id={`${id}-pleat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.belly} stopOpacity="0" />
          <stop offset="1" stopColor={p.belly} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* trailing pectoral fin */}
      <path d="M150,236 C168,290 212,322 266,336 C234,308 208,280 192,240 Z" fill={u(ctx, "veil")} stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="0.8" />
      {/* tail flukes */}
      <path d="M358,196 C380,168 394,148 398,136 C392,172 388,188 384,204 C392,220 396,240 398,262 C384,244 370,224 358,210 Z" fill={u(ctx, "membrane")} stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="0.8" />

      {/* the body: a window into space */}
      <path d={body} fill={p.body} />
      <g clipPath={`url(#${id}-whale)`}>
        <g filter={u(ctx, "haze")} opacity={bright}>
          <circle cx="140" cy="190" r="48" fill="#5b46c9" opacity="0.55" />
          <circle cx="250" cy="200" r="60" fill="#2c6fd6" opacity="0.4" />
          <circle cx="320" cy="190" r="30" fill="#b06bd6" opacity="0.35" />
        </g>
        <rect x="30" y="120" width="360" height="150" fill={u(ctx, "stars")} opacity={0.5 + bright * 0.5} className="sl-twinkle" />
        {/* platinum ribs */}
        {[110, 150, 190, 230, 270, 310].map((x, i) => (
          <path key={x} d={`M${x},${146 + Math.abs(i - 2.5) * 4} C${x + 12},180 ${x + 10},214 ${x - 4},${250 - Math.abs(i - 2.5) * 4}`} stroke={p.horn} strokeOpacity="0.28" strokeWidth="1.4" fill="none" />
        ))}
        {/* ventral pleats */}
        <path d="M50,224 C120,262 250,256 360,206 L380,260 L40,260 Z" fill={`url(#${id}-pleat)`} />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M${60 + i * 30},${r(236 + Math.sin(i / 3) * 4)} C${120 + i * 26},${r(240 + Math.sin(i / 3) * 4)} ${180 + i * 22},${238} ${240 + i * 14},${232 - i * 2}`} stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="0.8" fill="none" />
        ))}
        {evo === 3 && (
          <g stroke="#dfe6ff" strokeOpacity="0.55" strokeWidth="0.6" fill="#fff">
            <polyline points="120,176 160,164 196,182 236,170 270,186" fill="none" />
            {[
              [120, 176],
              [160, 164],
              [196, 182],
              [236, 170],
              [270, 186],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="1.8" stroke="none" />
            ))}
          </g>
        )}
      </g>
      <path d={body} fill="none" stroke={p.horn} strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M60,176 C100,150 170,136 232,140" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" />
      {/* dorsal ridge spines */}
      {[180, 210, 240, 270].slice(0, evo + 1).map((x, i) => (
        <path key={x} d={`M${x},${140 + i * 2} l10,-${12 - i * 2} l4,${14 - i * 2} Z`} fill={p.horn} opacity="0.8" />
      ))}
      <path d="M44,214 C60,222 80,226 104,224" stroke={p.horn} strokeOpacity="0.6" strokeWidth="1" fill="none" />
      <Eye ctx={ctx} x={84} y={194} r={2.8} slit={false} />
    </g>
  );
}

