import { Eye, Gem, MIRROR, rim, round, Spec, type Renderer } from "../kit";

/** Aurelion — the one true great dragon: rearing, crowned, with a vast wingspan. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  shadow: 110,
  halo: [200, 26, 34],
  render: (c) => {
    const { p, u, g } = c;
    const ws = 0.62 + 0.38 * g;
    // Wing with real structure: shoulder → elbow → wrist, fingers fanning to scalloped membrane.
    const wing = (
      <g transform={`translate(176 200) scale(${ws}) translate(-176 -200)`}>
        <g className="sl-flap" style={{ transformOrigin: "176px 200px" }}>
          <path
            d="M178,202 C162,176 142,156 128,146 C116,132 106,116 98,106 C72,94 48,80 22,70 C34,96 36,124 30,150 C46,146 60,156 66,172 C82,166 100,174 108,190 C124,186 142,194 150,208 C160,208 170,212 178,224 Z"
            fill={u("wing")}
            {...rim(c)}
          />
          <path d="M98,106 C76,130 60,150 44,176 M98,106 C88,140 82,160 72,180" fill="none" stroke={p.wingEdge} strokeOpacity="0.25" strokeWidth="1" />
          <g fill="none" strokeLinecap="round" stroke={p.bodyDark} strokeOpacity="0.7">
            <path d="M178,202 C160,178 140,158 128,146 C118,134 106,118 98,106" strokeWidth="5" />
            <path d="M98,106 C72,94 48,80 22,70 M98,106 C70,124 46,140 30,150 M98,106 C88,132 76,152 66,172 M128,146 C122,162 114,176 108,190" strokeWidth="2.2" />
          </g>
          <path d="M178,202 C160,178 140,158 128,146 C118,134 106,118 98,106" fill="none" stroke={p.bodyLight} strokeOpacity="0.5" strokeWidth="1.4" />
          <path d="M98,106 l-5,-11 l9,5 Z" fill={p.horn} />
        </g>
      </g>
    );
    const seam = (y: number, w: number) => `M${200 - w},${y} C${200 - w * 0.5},${y + 7} ${200 + w * 0.5},${y + 7} ${200 + w},${y}`;
    return (
      <g>
        {/* tail */}
        <g className="sl-sway-slow" style={{ transformOrigin: "226px 318px" }}>
          <path d="M222,322 C268,350 332,350 352,318 C362,298 352,280 336,286 C346,300 336,316 316,320 C282,326 252,320 228,306 Z" fill={u("body")} {...rim(c)} />
          <path d="M240,330 C280,344 324,340 344,316" fill="none" stroke={p.bodyLight} strokeOpacity="0.4" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M336,286 C334,276 334,268 338,262 C342,270 348,272 356,270 C352,278 350,284 352,290 Z" fill={p.horn} />
        </g>
        {wing}
        <g transform={MIRROR}>{wing}</g>
        {/* haunches and forward-set feet */}
        {[0, 1].map((m) => (
          <g key={m} transform={m ? MIRROR : undefined}>
            <path d="M172,276 C146,280 132,302 134,326 C136,342 150,352 170,352 C186,352 196,342 194,326 C192,304 186,288 172,276 Z" fill={u("body")} {...rim(c)} />
            <path d="M146,300 C142,314 144,330 154,340" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
            <path d="M144,346 C144,338 158,334 172,336 C184,338 188,346 184,352 L148,352 C145,351 144,349 144,346 Z" fill={u("body")} {...rim(c, 1)} />
            {[150, 160, 170, 180].map((x) => (
              <path key={x} d={`M${x - 3},351 C${x - 2},356 ${x + 1},358 ${x + 3},352`} fill={p.horn} />
            ))}
          </g>
        ))}
        {/* torso */}
        <path d="M200,166 C232,168 250,198 252,238 C254,272 246,302 230,322 C222,334 212,342 200,344 C188,342 178,334 170,322 C154,302 146,272 148,238 C150,198 168,168 200,166 Z" fill={u("body")} {...rim(c)} />
        {/* armoured chest panel: one tapering plate with curved seams */}
        <path d="M200,194 C222,196 232,226 232,258 C232,290 222,318 200,332 C178,318 168,290 168,258 C168,226 178,196 200,194 Z" fill={p.belly} {...rim(c, 1)} />
        {[214, 234, 254, 274, 294, 312].map((y, i) => {
          const w = 30 - Math.abs(i - 2.2) * 3.2;
          return (
            <g key={y}>
              <path d={seam(y, w)} fill="none" stroke={p.bodyDark} strokeOpacity="0.38" strokeWidth="1.4" />
              <path d={seam(y + 2, w - 2)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
            </g>
          );
        })}
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.3" fill="none" className="sl-rune-pulse">
          <path d="M196,240 L200,232 L204,240 M196,282 L200,290 L204,282" />
        </g>
        <Spec x={186} y={210} rx={10} ry={40} rot={8} o={0.18} />
        {/* forelimbs */}
        {[0, 1].map((m) => (
          <g key={m} transform={m ? MIRROR : undefined}>
            <path d="M176,208 C154,218 146,244 150,266 C152,278 160,286 170,290 C178,292 186,288 186,282 C178,278 172,270 172,260 C172,246 178,232 190,222 Z" fill={u("body")} {...rim(c)} />
            {[166, 174, 182].map((x) => (
              <path key={x} d={`M${x - 2},287 C${x - 1},293 ${x + 2},295 ${x + 3},289`} fill={p.horn} />
            ))}
          </g>
        ))}
        {/* tapered neck */}
        <path d="M184,182 C182,160 186,134 192,112 L208,112 C214,134 218,160 216,182 C210,190 190,190 184,182 Z" fill={u("body")} {...rim(c)} />
        {[124, 140, 156, 170].map((y) => (
          <path key={y} d={`M${192 - (y - 112) * 0.05},${y} C196,${y + 4} 204,${y + 4} ${208 + (y - 112) * 0.05},${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.3" />
        ))}
        {/* crown */}
        <g transform={`translate(200 70) scale(${0.6 + 0.4 * g}) translate(-200 -70)`}>
          {[0, 1].map((m) => (
            <g key={m} transform={m ? MIRROR : undefined}>
              <path d="M180,70 C168,48 152,34 126,24 C142,44 152,62 164,88 Z" fill={u("horn")} {...rim(c, 1)} />
              <path d="M172,64 C162,50 150,40 136,32" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
              <path d="M190,62 C188,50 188,40 192,30 C196,40 198,52 198,60 Z" fill={u("horn")} {...rim(c, 1)} />
            </g>
          ))}
        </g>
        {/* head */}
        <path d="M200,54 C222,54 238,68 240,86 C242,102 234,114 224,124 C216,134 210,144 200,148 C190,144 184,134 176,124 C166,114 158,102 160,86 C162,68 178,54 200,54 Z" fill={u("body")} {...rim(c)} />
        {[0, 1].map((m) => (
          <path key={m} d="M164,96 C154,94 146,98 140,104 C150,104 158,106 166,110 Z" transform={m ? MIRROR : undefined} fill={p.horn} />
        ))}
        <path d="M184,116 C190,108 210,108 216,116 C220,130 210,142 200,148 C190,142 180,130 184,116 Z" fill={p.belly} />
        <path d="M188,134 C194,138 206,138 212,134" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M192,126 l-2,3 M208,126 l2,3" stroke={p.bodyDark} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M170,82 C178,76 190,78 196,86 M230,82 C222,76 210,78 204,86" fill="none" stroke={p.bodyDark} strokeWidth="3.2" strokeLinecap="round" />
        <Spec x={192} y={64} rx={16} ry={5} o={0.38} />
        <Eye c={c} x={184} y={92} r={5.6} kind="almond" angle={12} flip />
        <Eye c={c} x={216} y={92} r={5.6} kind="almond" angle={-12} />
        <Gem c={c} x={200} y={72} s={0.6} />
      </g>
    );
  },
};

export const aurelion: Renderer = evolved;
