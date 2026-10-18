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

/** Ascended: rising with wings arched high, trailing ribbons of light and caustic light on its back. */
function ascended(c: Ctx) {
  const { p, u } = c;
  // A wing arching up and out, drawn for the left side and mirrored.
  const wing = "M196,196 C160,176 110,150 70,118 C52,104 36,98 22,100 C24,140 36,190 70,226 C100,254 140,258 170,250 C182,240 190,226 196,214 Z";
  const ribbons = [
    ["M70,226 C48,246 56,272 34,292 C22,304 22,320 12,330", 0],
    ["M124,254 C108,276 122,300 98,324 C90,332 88,342 80,350", 0.6],
  ] as const;
  const spots: [number, number][] = [[150, 200], [120, 186], [92, 166], [64, 144], [136, 226], [100, 208], [62, 184], [40, 132]];
  return (
    <g>
      {/* long whip tail with a glowing tip */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 262px" }}>
        <path d="M200,258 C210,292 240,312 230,350 C226,366 214,376 202,384" fill="none" stroke={p.bodyDark} strokeWidth="7" strokeLinecap="round" />
        <path d="M200,258 C210,292 240,312 230,350 C226,366 214,376 202,384" fill="none" stroke={p.body} strokeWidth="4" strokeLinecap="round" />
        <circle cx="202" cy="384" r="5" fill={p.accent} filter={u("glow")} className="sl-core" />
      </g>
      {[false, true].map((m) => (
        <g key={String(m)} transform={m ? MIRROR : undefined}>
          {/* translucent light ribbons trailing from the wing edge */}
          <g className="sl-sway" style={{ transformOrigin: "70px 226px" }}>
            {ribbons.map(([d, delay]) => (
              <g key={d}>
                <path d={d} fill="none" stroke={p.wingEdge} strokeOpacity="0.22" strokeWidth="6" strokeLinecap="round" />
                <path d={d} fill="none" stroke={p.accent} strokeWidth="1.6" filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${delay}s` }} />
              </g>
            ))}
          </g>
          <g className="sl-glide" style={{ transformOrigin: "196px 210px" }}>
            <path d={wing} fill={u("body")} {...rim(c)} />
            {/* pale underside visible where the wing arches up */}
            <path d="M22,100 C24,140 36,190 70,226 C100,254 140,258 170,250 C124,240 84,214 58,176 C40,150 30,124 22,100 Z" fill={p.belly} opacity="0.45" />
            <path d="M22,100 C24,140 36,190 70,226 C100,254 140,258 170,250" fill="none" stroke={p.wingEdge} strokeWidth="3" strokeOpacity="0.8" />
            <path d="M190,194 C150,172 104,146 64,120" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
            {/* iridescent spots */}
            <g opacity={c.mark}>
              {spots.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4} fill={i % 3 ? p.belly : p.accent} opacity="0.85" />
              ))}
            </g>
          </g>
        </g>
      ))}
      {/* body with caustic light */}
      <ellipse cx="200" cy="216" rx="34" ry="58" fill={u("body")} {...rim(c, 1)} />
      <ellipse cx="200" cy="216" rx="34" ry="58" fill={u("shade")} />
      <g fill="none" stroke={p.bodyLight} strokeOpacity="0.55" strokeWidth="1.4" className="sl-shimmer-facet">
        <path d="M180,206 C188,200 196,204 200,212 C206,204 214,202 220,208 M186,230 C192,224 200,226 204,234 C208,228 214,228 218,232 M190,250 C196,246 204,248 206,254" />
      </g>
      <Spec x={190} y={186} rx={10} ry={22} rot={0} o={0.32} />
      {/* fully curled lobes */}
      <path d="M184,160 C166,150 160,128 172,110 C182,106 186,116 180,124 C184,138 192,148 198,156 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M184,160 C166,150 160,128 172,110 C182,106 186,116 180,124 C184,138 192,148 198,156 Z" transform={MIRROR} fill={u("body")} {...rim(c, 1)} />
      {/* crown of light between the lobes */}
      <g filter={u("glow")} className="sl-twinkle">
        <path d="M200,148 L196,128 L200,112 L204,128 Z" fill={p.accent} />
        <circle cx="186" cy="118" r="2.4" fill={p.wingEdge} />
        <circle cx="214" cy="118" r="2.4" fill={p.wingEdge} />
      </g>
      <Eye c={c} x={176} y={168} r={6} kind="almond" angle={-8} />
      <Eye c={c} x={224} y={168} r={6} kind="almond" angle={8} flip />
      <Dots c={c} pts={[[200, 262], [194, 276], [206, 290]]} r={1.8} />
      <Gem c={c} x={200} y={212} s={0.8} />
    </g>
  );
}

export const glimmeray: Renderer = {
  ...evolved,
  halo: [200, 92, 26],
  stageFit: [1.35, 1.15, 1, 0.98],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
