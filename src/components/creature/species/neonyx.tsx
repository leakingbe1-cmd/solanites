import { Dots, Eye, Gem, rim, round, Spec, type Renderer } from "../kit";

/** Neonyx — a deep-sea angler-wyrm: glowing maw, frilled fins and a lantern lure. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 110,
  halo: [214, 96, 28],
  render: (c) => {
    const { p, u, g } = c;
    const stalk = 0.7 + 0.3 * g;
    return (
      <g>
        {/* tail fin */}
        <g className="sl-sway" style={{ transformOrigin: "110px 236px" }}>
          <path d="M112,232 C82,204 62,176 74,164 C90,184 104,202 122,216 C104,244 84,272 70,300 C60,290 80,262 112,232 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        </g>
        {/* dorsal frill */}
        <path d="M176,146 C186,110 214,100 236,118 C222,120 214,130 212,144 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        <path d="M150,166 C150,136 168,124 184,132 C172,140 168,152 170,164 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        {/* lure stalk */}
        <g className="sl-sway" style={{ transformOrigin: "248px 146px" }}>
          <path d={`M248,146 C252,${110 - 20 * stalk} ${296},${80 - 18 * stalk} ${324},${104 - 10 * stalk}`} fill="none" stroke={p.bodyDark} strokeWidth="5" strokeLinecap="round" />
          <path d={`M248,146 C252,${110 - 20 * stalk} ${296},${80 - 18 * stalk} ${324},${104 - 10 * stalk}`} fill="none" stroke={p.body} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="326" cy={112 - 10 * stalk} r={18 + 6 * g} fill={u("light")} className="sl-core" />
          <Gem c={c} x={326} y={112 - 10 * stalk} s={0.8} />
        </g>
        {/* round body */}
        <path d="M118,214 C122,164 170,134 230,140 C290,146 318,188 314,230 C308,270 266,292 220,290 C176,288 140,268 118,240 Z" fill={u("body")} {...rim(c)} />
        <path d="M136,250 C170,280 250,290 296,262 C270,288 186,294 140,262 Z" fill={p.belly} opacity="0.35" />
        <Spec x={206} y={160} rx={40} ry={9} rot={-8} o={0.2} />
        {/* gaping glowing maw */}
        <path d="M262,226 C286,216 312,222 318,238 C306,260 278,268 252,258 Z" fill="#07030c" />
        <g fill={p.belly} filter={u("glow")}>
          {[268, 280, 292, 304].map((x, i) => (
            <path key={x} d={`M${x - 4},${222 + i * 0.6} L${x},${236} L${x + 4},${222 + i * 0.6} Z`} />
          ))}
          {[262, 274, 286, 298].map((x) => (
            <path key={x} d={`M${x - 4},260 L${x},247 L${x + 4},260 Z`} />
          ))}
        </g>
        {/* side fins */}
        <path d="M196,240 C190,270 202,296 232,304 C222,284 220,264 226,248 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        <g opacity={c.mark}>
          <Dots c={c} r={2.2} color={p.belly} pts={[[150, 214], [170, 226], [192, 232], [214, 234], [236, 232], [150, 190], [170, 178]]} />
        </g>
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.6" fill="none" className="sl-rune-pulse">
          <path d="M174,196 L184,186 L194,196 M206,176 L216,186 L226,176" />
        </g>
        <Eye c={c} x={262} y={192} r={6} kind="orb" />
      </g>
    );
  },
};

export const neonyx: Renderer = evolved;
