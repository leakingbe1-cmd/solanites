import { Gem, polar, Spec, type Renderer } from "../kit";

/** GENESIS — a floating polyhedron construct with a visor eye and orbiting Solana bars. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 90,
  halo: [200, 92, 30],
  render: (c) => {
    const { p, u, g } = c;
    const R = 66 + 14 * g;
    const outer = Array.from({ length: 6 }).map((_, i) => polar(200, 205, R, -90 + i * 60));
    const inner = Array.from({ length: 3 }).map((_, i) => polar(200, 205, R * 0.48, -90 + i * 120));
    const tone = [p.bodyLight, p.body, p.bodyDark];
    const facets: [number, number, number][] = [
      [0, 1, 0], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 5, 2], [5, 0, 0],
    ];
    const pt = ([x, y]: [number, number]) => `${x.toFixed(1)},${y.toFixed(1)}`;
    return (
      <g>
        {/* orbiting Solana bars */}
        <g className="sl-spin" style={{ transformOrigin: "200px 205px" }}>
          {[0, 120, 240].map((a, i) => {
            const [x, y] = polar(200, 205, R + 46, a);
            return (
              <g key={a} transform={`translate(${x} ${y}) rotate(${a + 90}) skewX(-20)`}>
                <rect x="-22" y="-5" width="44" height="10" rx="2" fill={i === 1 ? p.accent : p.belly} filter={u("glow")} />
              </g>
            );
          })}
        </g>
        {/* faceted body */}
        {facets.map(([a, b, t], i) => {
          const tri = inner[Math.floor(((i + 0.5) / 6) * 3) % 3];
          return <path key={i} d={`M${pt(outer[a])} L${pt(outer[b])} L${pt(tri)} Z`} fill={tone[t]} stroke={p.belly} strokeOpacity="0.5" strokeWidth="1" />;
        })}
        <path d={`M${pt(inner[0])} L${pt(inner[1])} L${pt(inner[2])} Z`} fill={p.bodyLight} stroke={p.belly} strokeOpacity="0.6" />
        <path d={`M${outer.map(pt).join(" L")} Z`} fill="none" stroke={p.belly} strokeWidth="1.6" filter={u("glow")} className="sl-rune-pulse" />
        <Spec x={176} y={164} rx={18} ry={6} rot={-30} o={0.2} />
        {/* visor eye */}
        <rect x="160" y="212" width="80" height="12" rx="6" fill="#020205" />
        <rect x="166" y="215" width="68" height="6" rx="3" fill={p.belly} filter={u("glow")} className="sl-twinkle" />
        <Gem c={c} x={200} y={188} s={0.85} />
        {/* energy drip */}
        <path d={`M200,${205 + R} L200,${245 + R}`} stroke={p.belly} strokeWidth="2" strokeDasharray="2 6" filter={u("glow")} />
      </g>
    );
  },
};

export const genesis: Renderer = evolved;
