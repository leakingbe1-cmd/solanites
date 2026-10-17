import { tube, r, type P } from "../geometry";
import { Eye, Lit, Talon, u, type ArtCtx } from "../kit";

/* ── AURELION · regaldragon ───────────────────────────────────────── */

export function Aurelion(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const wing = [0.5, 0.72, 0.92, 1.02][evo];
  const horn = [0.35, 0.65, 0.9, 1.1][evo];
  const tail: P[] = [
    [246, 334],
    [298, 352],
    [342, 344],
    [356, 320],
    [336, 306],
  ];
  const neck: P[] = [
    [190, 206],
    [166, 172],
    [160, 146],
    [172, 124],
  ];
  const gold = u(ctx, "metal");

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-obs`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={p.bodyLight} />
          <stop offset="0.3" stopColor={p.body} />
          <stop offset="0.7" stopColor={p.bodyDark} />
          <stop offset="1" stopColor={p.body} />
        </linearGradient>
      </defs>

      {/* wings raised in a heraldic V */}
      <g transform={`translate(200 196) scale(${wing}) translate(-200 -196)`}>
        <g className="sl-flap-slow" style={{ transformOrigin: "180px 190px" }}>
          <path d="M182,192 C150,140 100,84 48,32 C62,72 66,104 62,134 C80,132 94,142 98,160 C116,156 130,166 134,182 C150,180 164,186 170,202 Z" fill={u(ctx, "membrane")} stroke={p.bodyDark} opacity="0.8" />
          <path d="M182,192 L48,32 M98,160 L120,110 M134,182 L148,140" stroke={p.bodyDark} strokeWidth="2.4" fill="none" />
        </g>
        <g className="sl-flap" style={{ transformOrigin: "222px 192px" }}>
          <path d="M222,194 C252,132 306,72 376,22 C364,64 364,98 370,128 C348,126 332,138 328,158 C308,154 292,166 290,186 C272,182 256,192 252,212 Z" fill={u(ctx, "membrane")} stroke={p.bodyDark} />
          <path d="M222,194 L376,22 M370,128 L312,108 M328,158 L280,140 M290,186 L254,170" stroke={p.bodyDark} strokeWidth="2.6" fill="none" />
          <path d="M222,194 L376,22" stroke={p.accent} strokeOpacity="0.45" strokeWidth="0.8" fill="none" transform="translate(1 -1)" />
          <Talon x={304} y={100} size={1.4} angle={-30} fill={gold} />
        </g>
      </g>

      {/* tail curled forward */}
      <Lit ctx={ctx} d={tube(tail, (t) => 30 * (1 - t) + 4)} fill={`url(#${id}-obs)`} />
      <path d={tube(tail, (t) => 30 * (1 - t) + 4)} fill={u(ctx, "scales")} opacity="0.8" />
      <path d="M336,306 L322,290 L346,296 Z" fill={gold} />

      {/* haunch */}
      <Lit ctx={ctx} d="M214,268 C240,252 286,262 290,300 C294,330 276,346 252,346 C226,346 208,328 208,304 C208,288 210,276 214,268 Z" fill={`url(#${id}-obs)`} />
      <path d="M246,344 L286,344 C292,344 292,352 286,352 L246,352 Z" fill={p.body} />
      {[252, 264, 276].map((x) => (
        <Talon key={x} x={x} y={350} size={0.9} angle={80} fill={gold} />
      ))}

      {/* torso */}
      <Lit ctx={ctx} d="M168,182 C204,170 250,186 266,228 C282,270 272,322 240,342 L172,342 C150,322 144,272 150,236 C153,210 158,190 168,182 Z" fill={`url(#${id}-obs)`} />
      <path d="M168,182 C204,170 250,186 266,228 C282,270 272,322 240,342 L172,342 C150,322 144,272 150,236 C153,210 158,190 168,182 Z" fill={u(ctx, "scales")} opacity="0.7" />
      {/* gilded breastplate: grows from collar to full plate */}
      {evo >= 1 && (
        <g>
          <path d={evo === 1 ? "M186,206 C200,198 218,198 230,206 L228,244 C214,252 200,252 188,246 Z" : "M186,206 C200,198 218,198 230,206 L228,288 C216,304 200,306 188,298 Z"} fill={u(ctx, "metalV")} stroke={p.bodyDark} strokeWidth="1" />
          {[222, 242, 262, 282].slice(0, evo === 1 ? 1 : 4).map((y) => (
            <path key={y} d={`M190,${y} C202,${y + 6} 216,${y + 6} 228,${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1" />
          ))}
          <path d="M190,210 C202,204 216,204 226,210" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
        </g>
      )}

      {/* foreleg */}
      <Lit ctx={ctx} d={tube([[178, 248], [160, 296], [168, 338]], (t) => 30 - t * 14)} fill={`url(#${id}-obs)`} />
      <path d="M146,340 L184,340 C190,340 190,350 184,350 L146,350 Z" fill={p.body} />
      {[150, 162, 174].map((x) => (
        <Talon key={x} x={x} y={348} size={0.85} angle={80} fill={gold} />
      ))}

      {/* neck */}
      <Lit ctx={ctx} d={tube(neck, (t) => 42 - t * 14)} fill={`url(#${id}-obs)`} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${184 + i * 2},${150 + i * 16} l8,-6 l-2,10 Z`} fill={p.bodyDark} />
      ))}

      {/* horned crown */}
      <g transform={`translate(184 112) scale(${horn}) translate(-184 -112)`}>
        <path d="M168,100 C176,76 192,58 214,48 C198,66 188,84 180,106 Z" fill={gold} stroke={p.bodyDark} strokeWidth="0.8" />
        <path d="M178,106 C196,84 220,72 250,70 C226,82 208,96 192,116 Z" fill={gold} stroke={p.bodyDark} strokeWidth="0.8" />
        <path d="M186,122 C206,114 226,114 246,120 C226,122 208,126 192,132 Z" fill={gold} stroke={p.bodyDark} strokeWidth="0.8" />
        <path d="M176,90 C186,74 198,64 210,56 M190,100 C206,86 224,78 244,74" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" fill="none" />
      </g>

      {/* head */}
      <Lit ctx={ctx} d="M192,128 C186,104 160,92 134,96 L94,108 C84,112 84,124 94,128 L118,136 C138,146 168,150 188,142 C194,138 196,134 192,128 Z" fill={`url(#${id}-obs)`} />
      <path d="M94,126 L122,132 C140,138 160,140 176,138" stroke={p.bodyDark} strokeWidth="1.4" fill="none" />
      <path d="M100,124 l4,6 l4,-5 l4,6 l4,-5" stroke={p.horn} strokeOpacity="0.8" strokeWidth="0.8" fill="none" />
      <ellipse cx="97" cy="114" rx="2.4" ry="1.4" fill="#000" />
      <path d="M134,104 C146,98 158,98 168,104" stroke={evo >= 1 ? gold : p.bodyDark} strokeWidth="3" fill="none" strokeLinecap="round" />
      <Eye ctx={ctx} x={150} y={112} r={3.2} angle={-6} />
    </g>
  );
}

/* ── PYRAURUM · bladephoenix ──────────────────────────────────────── */

export function Pyraurum(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const count = [7, 11, 15, 19][evo];
  const L = [52, 70, 86, 98][evo];
  const gold = u(ctx, "metal");
  const hx = 190;
  const hy = 118;
  const neck: P[] = [
    [206, 222],
    [190, 186],
    [202, 152],
    [190, 124],
  ];
  const streamers: P[][] = [
    [[228, 268], [266, 300], [300, 334], [348, 352]],
    [[222, 276], [250, 318], [272, 352], [300, 376]],
    [[232, 262], [278, 282], [324, 292], [372, 290]],
  ];

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-ember`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={p.body} />
          <stop offset="1" stopColor={p.wingEdge} />
        </linearGradient>
      </defs>

      {/* sun-crown of blade feathers behind the head */}
      <g className="sl-fan" style={{ transformOrigin: `${hx}px ${hy}px` }}>
        {Array.from({ length: count }).map((_, i) => {
          const a = r(-210 + (240 * i) / (count - 1));
          const len = r(L * (0.78 + 0.22 * Math.sin((i / (count - 1)) * Math.PI)));
          return (
            <g key={i} transform={`translate(${hx} ${hy}) rotate(${a})`}>
              <path d={`M22,-2.5 L${len * 0.84},-5 L${len},0 L${len * 0.84},5 L22,2.5 Z`} fill={i % 2 ? gold : `url(#${id}-ember)`} stroke={p.bodyDark} strokeWidth="0.6" />
              <path d={`M26,0 L${len * 0.97},0`} stroke="#fff" strokeOpacity={i % 2 ? 0.55 : 0.2} strokeWidth="0.6" />
            </g>
          );
        })}
      </g>

      {/* trailing streamers */}
      {streamers.map((pts, i) => (
        <path key={i} d={tube(pts, (t) => 10 * (1 - t) + 1.5)} fill={i === 1 ? gold : `url(#${id}-ember)`} stroke={p.bodyDark} strokeWidth="0.5" className="sl-sway-slow" style={{ transformOrigin: "226px 270px" }} />
      ))}

      {/* long legs */}
      <path d={tube([[204, 284], [200, 320], [202, 350]], () => 4.5)} fill={p.horn} />
      <path d="M188,352 L202,347 L216,352" stroke={p.horn} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M218,282 C228,300 222,312 212,316" stroke={p.horn} strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* body */}
      <Lit ctx={ctx} d="M210,214 C238,216 250,240 246,264 C242,284 224,294 204,290 C184,286 176,266 180,246 C184,228 194,214 210,214 Z" fill={u(ctx, "hide")} />
      <ellipse cx="208" cy="256" rx="18" ry="24" fill={u(ctx, "glow")} opacity="0.25" filter={u(ctx, "soft")} className="sl-lantern" />
      <path d="M208,224 C236,226 248,250 244,270 C240,284 228,290 218,292 C228,272 228,250 208,224 Z" fill={`url(#${id}-ember)`} stroke={p.bodyDark} strokeWidth="0.8" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${218 + i * 4},${244 + i * 12} C${232},${246 + i * 12} ${240},${252 + i * 10} ${241 - i},${262 + i * 8}`} stroke={gold} strokeWidth="1" fill="none" />
      ))}

      {/* neck & head */}
      <Lit ctx={ctx} d={tube(neck, (t) => 20 - t * 9)} fill={u(ctx, "hide")} />
      <Lit ctx={ctx} d="M200,118 C196,106 184,104 174,108 L164,114 L174,126 C186,130 198,126 200,118 Z" fill={u(ctx, "hide")} />
      <path d="M176,110 L136,119 L176,124 Z" fill={gold} stroke={p.bodyDark} strokeWidth="0.6" />
      <path d="M176,117 L142,119" stroke={p.bodyDark} strokeWidth="0.8" />
      <Eye ctx={ctx} x={186} y={114} r={2.4} slit={false} />
    </g>
  );
}
