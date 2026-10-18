import { byStage, Dots, Eye, Gem, MIRROR, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Glimmeray — very wide, flat manta seen from above, long whip tail. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 150,
  halo: [200, 112, 30],
  render: (c) => {
    const { p, u, g } = c;
    const spots: [number, number][] = [
      [104, 212], [128, 196], [150, 216], [88, 226], [134, 236], [164, 196], [116, 222], [60, 222],
    ];
    const tail = 0.6 + 0.4 * g;
    return (
      <g>
        <g transform={`translate(200 270) scale(1 ${tail}) translate(-200 -270)`} className="sl-sway-slow" style={{ transformOrigin: "200px 270px" }}>
          <path d="M200,266 C206,306 240,326 228,366 C224,380 214,388 204,394" fill="none" stroke={p.bodyDark} strokeWidth="7" strokeLinecap="round" />
          <path d="M200,266 C206,306 240,326 228,366 C224,380 214,388 204,394" fill="none" stroke={p.body} strokeWidth="4" strokeLinecap="round" />
          <circle cx="204" cy="394" r="4" fill={p.accent} filter={u("glow")} />
        </g>
        <g className="sl-glide" style={{ transformOrigin: "200px 215px" }}>
          <path
            d="M200,150 C260,150 330,180 392,232 C350,240 312,250 272,268 C250,262 225,262 200,272 C175,262 150,262 128,268 C88,250 50,240 8,232 C70,180 140,150 200,150 Z"
            fill={u("body")}
            {...rim(c)}
          />
          <path d="M392,232 C350,240 312,250 272,268 C250,262 225,262 200,272 C175,262 150,262 128,268 C88,250 50,240 8,232" fill="none" stroke={p.wingEdge} strokeWidth="3" strokeOpacity="0.7" />
          <path d="M200,160 C262,160 324,188 370,224 M200,160 C138,160 76,188 30,224" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="3" />
          <g opacity={c.mark} fill={p.belly}>
            {spots.map(([x, y]) => (
              <g key={`${x}${y}`}>
                <circle cx={x} cy={y} r="3.6" opacity="0.8" />
                <circle cx={400 - x} cy={y} r="3.6" opacity="0.8" />
              </g>
            ))}
          </g>
        </g>
        {/* central ridge */}
        <ellipse cx="200" cy="214" rx="34" ry="56" fill={u("body")} {...rim(c, 1)} />
        <ellipse cx="200" cy="214" rx="34" ry="56" fill={u("shade")} />
        <Spec x={192} y={186} rx={10} ry={20} rot={0} o={0.3} />
        <ellipse cx="186" cy="184" rx="3" ry="5" fill={p.bodyDark} opacity="0.7" />
        <ellipse cx="214" cy="184" rx="3" ry="5" fill={p.bodyDark} opacity="0.7" />
        {/* cephalic lobes */}
        <path d="M186,156 C172,146 168,128 178,114 C184,130 192,142 198,154 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M186,156 C172,146 168,128 178,114 C184,130 192,142 198,154 Z" transform={MIRROR} fill={u("body")} {...rim(c, 1)} />
        <Eye c={c} x={174} y={164} r={5} kind="round" />
        <Eye c={c} x={226} y={164} r={5} kind="round" />
        <Gem c={c} x={200} y={216} s={0.75} />
      </g>
    );
  },
};

/** Eggling: a plump little diamond with stubby wing flaps, huge eyes and a short tail. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <g className="sl-sway" style={{ transformOrigin: "200px 262px" }}>
        <path d="M200,258 C204,276 214,288 210,302" fill="none" stroke={p.bodyDark} strokeWidth="6" strokeLinecap="round" />
        <path d="M200,258 C204,276 214,288 210,302" fill="none" stroke={p.body} strokeWidth="3.4" strokeLinecap="round" />
      </g>
      {/* stubby flaps, flapping */}
      <g className="sl-flap" style={{ transformOrigin: "176px 214px" }}>
        <path d="M178,196 C150,192 124,204 112,224 C130,230 154,234 176,232 Z" fill={u("body")} {...rim(c)} />
        <path d="M112,224 C130,230 154,234 176,232" fill="none" stroke={p.wingEdge} strokeWidth="2.4" strokeOpacity="0.7" />
      </g>
      <g className="sl-flap" style={{ transformOrigin: "224px 214px" }}>
        <path d="M178,196 C150,192 124,204 112,224 C130,230 154,234 176,232 Z" transform={MIRROR} fill={u("body")} {...rim(c)} />
        <path d="M112,224 C130,230 154,234 176,232" transform={MIRROR} fill="none" stroke={p.wingEdge} strokeWidth="2.4" strokeOpacity="0.7" />
      </g>
      {/* round diamond body */}
      <path d="M200,158 C232,160 252,186 254,212 C256,238 232,262 200,266 C168,262 144,238 146,212 C148,186 168,160 200,158 Z" fill={u("body")} {...rim(c)} />
      <path d="M160,236 C176,254 224,254 240,236 C232,252 216,262 200,264 C184,262 168,252 160,236 Z" fill={p.belly} opacity="0.55" />
      <Spec x={186} y={176} rx={20} ry={8} rot={-20} o={0.35} />
      <g fill={p.belly} opacity="0.7">
        <circle cx="176" cy="236" r="3" />
        <circle cx="224" cy="236" r="3" />
        <circle cx="200" cy="246" r="2.6" />
      </g>
      {/* lobe nubs */}
      <path d="M186,164 C180,156 180,148 186,142 C190,150 194,156 196,162 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M186,164 C180,156 180,148 186,142 C190,150 194,156 196,162 Z" transform={MIRROR} fill={u("body")} {...rim(c, 1)} />
      <Eye c={c} x={180} y={196} r={11} kind="round" />
      <Eye c={c} x={220} y={196} r={11} kind="round" />
      <path d="M190,222 C196,227 204,227 210,222" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="166" cy="216" rx="7" ry="4" fill={p.accent} opacity="0.3" />
      <ellipse cx="234" cy="216" rx="7" ry="4" fill={p.accent} opacity="0.3" />
      <Gem c={c} x={200} y={174} s={0.45} />
    </g>
  );
}

/** Hatchling: banking into a turn — wider rounded wings, curling lobes, a clear spot pattern. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const spots: [number, number][] = [[118, 214], [140, 200], [150, 224], [100, 226], [128, 230]];
  return (
    <g transform="rotate(-10 200 214)">
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 262px" }}>
        <path d="M200,258 C208,284 230,298 224,330 C222,340 216,346 210,350" fill="none" stroke={p.bodyDark} strokeWidth="6" strokeLinecap="round" />
        <path d="M200,258 C208,284 230,298 224,330 C222,340 216,346 210,350" fill="none" stroke={p.body} strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <g className="sl-glide" style={{ transformOrigin: "200px 214px" }}>
        {/* wings: the near (left) wing dips and is larger, the far wing lifts */}
        <path d="M200,166 C246,168 296,186 328,210 C334,216 330,222 322,224 C292,230 266,242 244,258 C228,252 214,254 200,262 C186,254 172,252 156,258 C126,246 96,236 64,232 C54,230 52,222 60,214 C96,186 152,166 200,166 Z" fill={u("body")} {...rim(c)} />
        <path d="M322,224 C292,230 266,242 244,258 C228,252 214,254 200,262 C186,254 172,252 156,258 C126,246 96,236 64,232" fill="none" stroke={p.wingEdge} strokeWidth="2.6" strokeOpacity="0.7" />
        <path d="M200,176 C150,176 104,196 72,218 M200,176 C246,178 286,194 314,212" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="2.6" />
        <g fill={p.belly} opacity={0.8}>
          {spots.map(([x, y]) => (
            <g key={`${x}${y}`}>
              <circle cx={x} cy={y} r="3.4" />
              <circle cx={round(400 - x * 0.9 - 20)} cy={y - 4} r="3" />
            </g>
          ))}
        </g>
      </g>
      <ellipse cx="200" cy="214" rx="28" ry="46" fill={u("body")} {...rim(c, 1)} />
      <ellipse cx="200" cy="214" rx="28" ry="46" fill={u("shade")} />
      <Spec x={192} y={192} rx={8} ry={16} rot={0} o={0.3} />
      {/* lobes half-curled */}
      <path d="M186,172 C174,164 172,148 180,138 C186,150 192,160 198,170 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M186,172 C174,164 172,148 180,138 C186,150 192,160 198,170 Z" transform={MIRROR} fill={u("body")} {...rim(c, 1)} />
      <Eye c={c} x={180} y={182} r={7.5} kind="round" />
      <Eye c={c} x={220} y={182} r={7.5} kind="round" />
      <Gem c={c} x={200} y={220} s={0.55} />
    </g>
  );
}

/** Ascended: a majestic manta in a gliding swoop — one wingtip lifted, one lowered, light streaming behind. */
function ascended(c: Ctx) {
  const { p, u } = c;
  // One continuous S-waved outline: lifted left wing, broad head, lowered right wing.
  const outline =
    "M200,152 C150,150 96,128 40,98 C20,88 2,86 -10,92 C-4,120 20,146 44,166 C70,188 74,214 110,232 C134,244 156,250 174,262 C184,270 192,272 200,274 C210,272 218,268 228,264 C252,272 280,274 306,268 C336,262 362,258 386,256 C400,255 410,252 414,244 C392,224 366,206 336,190 C300,172 252,154 200,152 Z";
  const trailing = "M-10,92 C-4,120 20,146 44,166 C70,188 74,214 110,232 C134,244 156,250 174,262 M228,264 C252,272 280,274 306,268 C336,262 362,258 386,256 C400,255 410,252 414,244";
  const streamers = [
    { d: "M-6,96 C2,140 34,150 46,190 C58,230 96,226 116,262 C134,294 150,300 166,330 C174,346 184,356 188,374", delay: 0 },
    { d: "M410,248 C396,276 366,272 342,292 C318,312 300,300 278,322 C258,342 250,352 238,366 C232,374 228,380 224,388", delay: 0.7 },
  ];
  const stars: [number, number][] = [[60, 134], [96, 150], [132, 178], [96, 196], [150, 214], [252, 206], [292, 222], [336, 214], [306, 246], [372, 238]];
  return (
    <g>
      {/* streamers trail behind from each wingtip, alongside the tail */}
      {streamers.map(({ d, delay }) => (
        <g key={d} className="sl-sway-slow" style={{ transformOrigin: "200px 260px", animationDelay: `${delay}s` }}>
          {/* a silky ribbon: a soft translucent band with fine strands of light */}
          <path d={d} fill="none" stroke={p.wingEdge} strokeOpacity="0.1" strokeWidth="16" strokeLinecap="round" />
          <path d={d} transform="translate(-4 2)" fill="none" stroke={p.accent} strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
          <path d={d} transform="translate(4 -2)" fill="none" stroke={p.accent} strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
          <path d={d} fill="none" stroke={p.accent} strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" filter={u("glow")} className="sl-twinkle" />
        </g>
      ))}
      {/* long whip tail with a glowing tip */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 270px" }}>
        <path d="M200,270 C206,300 230,318 224,350 C220,366 210,378 204,390" fill="none" stroke={p.bodyDark} strokeWidth="7" strokeLinecap="round" />
        <path d="M200,270 C206,300 230,318 224,350 C220,366 210,378 204,390" fill="none" stroke={p.body} strokeWidth="4" strokeLinecap="round" />
        <circle cx="204" cy="390" r="5" fill={p.accent} filter={u("glow")} className="sl-core" />
      </g>
      <g className="sl-glide" style={{ transformOrigin: "200px 210px" }}>
        <path d={outline} fill={u("body")} {...rim(c)} />
        {/* underside of the lifted left wing, turned toward us near the tip */}
        <path d="M-10,92 C-4,120 20,146 44,166 C40,140 30,116 40,98 C20,88 2,86 -10,92 Z" fill={p.belly} opacity="0.55" />
        {/* underside of the lowered right wing along its trailing edge */}
        <path d="M228,264 C252,272 280,274 306,268 C336,262 362,258 386,256 C400,255 410,252 414,244 C380,250 330,252 290,258 C266,262 244,262 228,264 Z" fill={p.belly} opacity="0.5" />
        <path d={trailing} fill="none" stroke={p.wingEdge} strokeWidth="3" strokeOpacity="0.8" />
        <path d="M196,160 C150,158 96,136 34,102 M204,160 C254,162 304,180 352,206" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" />
        {/* caustic light rippling over the wings */}
        <g fill="none" stroke={p.bodyLight} strokeOpacity="0.4" strokeWidth="1.3" className="sl-shimmer-facet">
          <path d="M60,124 C74,118 84,130 98,124 C112,118 120,132 136,128 M70,170 C84,162 96,176 112,170 C124,166 132,178 146,176" />
          <path d="M250,184 C264,178 274,192 290,186 C304,180 314,194 330,190 M256,236 C270,228 282,242 298,236 C312,230 324,242 340,238" />
        </g>
        {/* glowing constellation across the wings */}
        <g opacity={c.mark}>
          <polyline points={stars.slice(0, 5).map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
          <polyline points={stars.slice(5).map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
          <Dots c={c} pts={stars} r={2.6} color={p.accent} />
        </g>
      </g>
      {/* broad head and body ridge */}
      <path d="M148,180 C148,164 170,156 200,156 C230,156 252,164 252,180 C254,216 238,252 200,268 C162,252 146,216 148,180 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M148,180 C148,164 170,156 200,156 C230,156 252,164 252,180 C254,216 238,252 200,268 C162,252 146,216 148,180 Z" fill={u("shade")} />
      <path d="M168,162 C184,158 216,158 232,162" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M166,168 C184,164 216,164 234,168" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      <Spec x={188} y={186} rx={10} ry={22} rot={0} o={0.3} />
      {/* elegant cephalic lobes, spiralling inward */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 156px" }}>
        <path d="M152,170 C142,160 142,142 154,134 C166,128 178,136 176,146 C174,154 164,154 164,146 C158,152 160,164 170,170 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M152,170 C142,160 142,142 154,134 C166,128 178,136 176,146 C174,154 164,154 164,146 C158,152 160,164 170,170 Z" transform={MIRROR} fill={u("body")} {...rim(c, 1)} />
      </g>
      <Eye c={c} x={164} y={178} r={6.5} kind="almond" angle={-10} />
      <Eye c={c} x={236} y={178} r={6.5} kind="almond" angle={10} flip />
      <path d="M182,192 L186,196 M218,192 L214,196" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      <Gem c={c} x={200} y={214} s={0.85} />
    </g>
  );
}

export const glimmeray: Renderer = {
  ...evolved,
  halo: [200, 108, 26],
  stageFit: [1.35, 1.15, 1, 0.88],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
