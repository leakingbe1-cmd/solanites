import { Eye, Gem, MIRROR, rim, round, Spec, type Renderer } from "../kit";

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

export const glimmeray: Renderer = evolved;
