import { tube, type P } from "../geometry";
import { Eye, Lit, Shard, Talon, u, type ArtCtx } from "../kit";

/* ── DUSKWING · cloakwing ─────────────────────────────────────────── */

export function Duskwing(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const crest = [0.45, 0.7, 0.9, 1.1][evo];
  const wingS = [0.62, 0.8, 0.95, 1][evo];
  const open = evo === 3;
  const tail: P[] = [
    [272, 286],
    [300, 318],
    [318, 350],
    [344, 366],
    [362, 356],
  ];

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-obsidian`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={p.bodyLight} />
          <stop offset="0.22" stopColor={p.body} />
          <stop offset="0.55" stopColor={p.bodyDark} />
          <stop offset="0.68" stopColor={p.body} />
          <stop offset="1" stopColor={p.bodyDark} />
        </linearGradient>
        <linearGradient id={`${id}-rock`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a33" />
          <stop offset="1" stopColor="#0b0b0f" />
        </linearGradient>
      </defs>

      {/* spread wings — only at Apex */}
      {open && (
        <g transform="translate(14 44)">
          <g className="sl-flap" style={{ transformOrigin: "205px 150px" }}>
            <path d="M210,150 C250,96 312,58 382,42 C366,70 360,96 362,122 C344,118 330,128 324,146 C306,140 290,150 286,168 C268,162 252,168 244,184 Z" fill={u(ctx, "membrane")} stroke={p.bodyDark} />
            <path d="M210,150 L382,42 M300,98 L324,146 M262,124 L286,168 M232,140 L244,184" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="1.4" fill="none" />
            <path d="M196,150 C160,100 104,70 34,60 C52,86 58,108 58,132 C76,128 90,136 96,152 C114,146 130,154 136,170 C152,164 168,170 176,184 Z" fill={u(ctx, "membrane")} stroke={p.bodyDark} opacity="0.85" />
            <path d="M196,150 L34,60 M104,98 L96,152 M140,120 L136,170" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1.2" fill="none" />
          </g>
        </g>
      )}

      {/* tail hanging behind the ledge */}
      <Lit ctx={ctx} d={tube(tail, (t) => 14 * (1 - t) + 2)} fill={`url(#${id}-obsidian)`} />
      <path d="M362,356 L372,340 L374,362 Z" fill={p.horn} />

      {/* the ledge */}
      <path d="M104,348 L128,320 L170,310 L252,308 L292,318 L318,344 Z" fill={`url(#${id}-rock)`} />
      <path d="M128,320 L170,310 L196,326 L150,334 Z" fill="#33333d" opacity="0.7" />
      <path d="M252,308 L292,318 L270,330 Z" fill="#3a3a46" opacity="0.6" />
      <path d="M128,320 L170,310 L252,308 L292,318" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="0.8" />

      {/* hunched body */}
      <Lit ctx={ctx} d="M152,250 C150,212 180,186 220,186 C258,186 284,212 284,248 C284,278 264,300 232,304 L184,304 C164,296 154,276 152,250 Z" fill={`url(#${id}-obsidian)`} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${166 + i * 4},${236 + i * 16} C${174 + i * 3},${242 + i * 16} ${186},${244 + i * 15} ${196 - i * 2},${242 + i * 14}`} fill="none" stroke={p.wingEdge} strokeOpacity="0.28" strokeWidth="1" />
      ))}

      {/* legs gripping the ledge */}
      {[
        [196, 288],
        [228, 292],
      ].map(([x, y], i) => (
        <g key={i}>
          <path d={tube([[x, y], [x - 6, y + 12], [x - 4, y + 22]], (t) => 14 - t * 8)} fill={i ? `url(#${id}-obsidian)` : p.bodyDark} />
          {[-12, -4, 4].map((dx) => (
            <Talon key={dx} x={x - 4 + dx} y={y + 21} size={0.85} angle={80} fill={p.horn} />
          ))}
        </g>
      ))}

      {/* folded wing along the back */}
      {!open && (
        <g transform={`translate(212 204) scale(${wingS}) translate(-212 -204)`}>
          <Lit ctx={ctx} d="M206,208 C212,182 226,160 242,146 C266,172 302,234 338,304 C306,292 272,278 246,262 C226,248 212,230 206,208 Z" fill={u(ctx, "membrane")} />
          <path d="M242,148 C262,196 290,250 334,300 M242,148 C254,200 270,246 296,286 M242,148 C246,196 252,236 262,270" fill="none" stroke={p.wingEdge} strokeOpacity="0.35" strokeWidth="1.1" />
          <path d="M210,204 C218,182 230,164 242,150" fill="none" stroke={p.accent} strokeOpacity="0.6" strokeWidth="1.2" />
          <path d="M242,148 L248,128 L252,150 Z" fill={p.horn} />
        </g>
      )}

      {/* neck */}
      <Lit ctx={ctx} d={tube([[192, 214], [166, 192], [148, 166], [118, 150]], (t) => 32 - t * 14)} fill={`url(#${id}-obsidian)`} />

      {/* head (long raptor skull with a crest blade) */}
      <g transform="translate(-72 44)">
        <Lit ctx={ctx} d="M206,108 C196,92 168,88 136,94 L84,106 C80,108 80,112 84,113 L132,120 C156,126 182,132 200,128 C210,124 212,116 206,108 Z" fill={`url(#${id}-obsidian)`} />
        <path d="M84,110 L136,114" stroke={p.bodyDark} strokeWidth="1.2" />
        <path d="M140,100 C160,96 180,96 198,102" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" fill="none" />
        <g transform={`translate(196 98) scale(${crest}) translate(-196 -98)`}>
          <path d="M190,104 C210,84 238,66 278,56 C256,72 236,88 212,110 Z" fill={u(ctx, "metal")} stroke={p.bodyDark} strokeWidth="0.8" />
          <path d="M200,98 C222,82 246,68 270,60" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" fill="none" />
        </g>
        <Eye ctx={ctx} x={158} y={104} r={3.2} angle={-8} />
        <path d="M150,99 L170,101" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ── CRYOVANT · crystalstag ───────────────────────────────────────── */

export function Cryovant(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const g = [0.45, 0.68, 0.88, 1.05][evo];
  const crystal = { light: p.horn, mid: p.wingEdge, dark: p.wing, glow: p.accent };
  const spine = [
    [168, 188, -24, 34],
    [196, 182, -14, 46],
    [224, 180, -4, 40],
    [250, 182, 8, 52],
    [276, 188, 18, 36],
    [296, 196, 28, 26],
  ].slice(0, [2, 3, 5, 6][evo]);

  const leg = (pts: P[], far: boolean, k: number) => (
    <g key={k}>
      <path d={tube(pts, (t) => (t < 0.5 ? 20 - t * 18 : 11 - (t - 0.5) * 6))} fill={far ? p.bodyDark : u(ctx, "hideV")} stroke={p.bodyDark} strokeOpacity="0.5" />
      <path d={`M${pts[pts.length - 1][0] - 5},${pts[pts.length - 1][1]} l4,-12 l6,0 l3,12 Z`} fill={far ? "#0a0e18" : p.horn} opacity={far ? 1 : 0.85} />
    </g>
  );

  return (
    <g>
      {/* far legs */}
      {leg([[134, 244], [132, 280], [138, 310], [140, 338]], true, 1)}
      {leg([[274, 236], [288, 270], [276, 302], [282, 338]], true, 2)}

      {/* body */}
      <Lit ctx={ctx} d="M112,202 C120,176 160,170 200,176 C240,180 280,174 302,186 C324,198 326,232 308,246 C292,256 272,254 254,248 C222,256 186,260 152,256 C124,252 108,232 112,202 Z" fill={u(ctx, "hide")} />
      <path d="M128,246 C160,258 220,256 252,246" fill="none" stroke={p.belly} strokeOpacity="0.45" strokeWidth="4" />
      <path d="M112,202 C120,176 160,170 200,176 C240,180 280,174 302,186 C324,198 326,232 308,246 C292,256 272,254 254,248 C222,256 186,260 152,256 C124,252 108,232 112,202 Z" fill={u(ctx, "scales")} opacity="0.35" />
      <path d="M300,196 C314,190 322,198 318,210 C312,206 306,204 300,206 Z" fill={p.belly} />
      {/* musculature: shoulder and haunch catch the key light */}
      <ellipse cx="152" cy="206" rx="30" ry="22" fill={p.bodyLight} opacity="0.22" filter={u(ctx, "soft")} />
      <ellipse cx="282" cy="204" rx="28" ry="24" fill={p.bodyLight} opacity="0.2" filter={u(ctx, "soft")} />
      <path d="M128,232 C150,246 186,248 214,244" fill="none" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="2" />
      <path d="M268,190 C286,206 290,226 284,244" fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1.6" />

      {/* spine crystals */}
      {spine.map(([x, y, a, l], i) => (
        <Shard key={i} x={x} y={y} len={l * g} w={13 * g + 3} angle={a} {...crystal} />
      ))}

      {/* near legs */}
      {leg([[150, 248], [146, 282], [152, 312], [154, 340]], false, 3)}
      {leg([[292, 234], [308, 270], [294, 302], [300, 340]], false, 4)}

      {/* neck */}
      <Lit ctx={ctx} d={tube([[146, 214], [126, 174], [108, 134]], (t) => 54 - t * 30)} fill={u(ctx, "hide")} />
      <path d={tube([[134, 222], [118, 180], [104, 142]], (t) => 14 - t * 6)} fill={p.belly} opacity="0.35" />

      {/* antlers: crystal branches */}
      <g>
        {[
          [100, 106, -32, 54],
          [104, 104, 6, 64],
          [96, 108, -62, 36],
          [108, 104, 34, 40],
          [92, 110, -10, 28],
        ]
          .slice(0, [2, 3, 4, 5][evo])
          .map(([x, y, a, l], i) => (
            <Shard key={i} x={x} y={y} len={l * g} w={9 * g + 2} angle={a} {...crystal} />
          ))}
      </g>

      {/* head */}
      <Lit ctx={ctx} d="M112,110 C104,100 86,100 74,108 L42,134 C36,140 40,148 48,148 L76,144 C92,142 106,134 114,124 C118,118 116,114 112,110 Z" fill={u(ctx, "hide")} />
      <path d="M46,146 L74,142" stroke={p.bodyDark} strokeWidth="1" />
      <ellipse cx="44" cy="138" rx="2" ry="1.4" fill={p.bodyDark} />
      <path d="M110,108 L126,90 L118,112 Z" fill={u(ctx, "hide")} stroke={p.bodyDark} strokeOpacity="0.5" />
      <Eye ctx={ctx} x={84} y={118} r={3} slit={false} angle={-14} />
      <path d="M70,116 C80,112 92,112 100,116" stroke={p.accent} strokeOpacity="0.55" strokeWidth="0.8" fill="none" />
    </g>
  );
}
