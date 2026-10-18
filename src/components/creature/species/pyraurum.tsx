import { blade, Eye, Gem, rim, Spec, type Renderer } from "../kit";

/** Pyraurum — a golden phoenix in full flight, trailing flame streamers. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 120,
  halo: [300, 150, 24],
  render: (c) => {
    const { p, u, g } = c;
    const wing = (from: number, to: number, n: number, base: number, amp: number, dark = false) =>
      Array.from({ length: n }).map((_, i) => {
        const t = i / (n - 1);
        const a = from + (to - from) * t;
        const l = base + amp * Math.sin(t * Math.PI * 0.8 + 0.3);
        return <path key={i} d={blade(l, 11)} transform={`rotate(${a})`} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.3" opacity={dark ? 0.7 : 1} />;
      });
    return (
      <g transform="translate(0 10)">
        {/* flame streamers */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 230 + i * 20;
          const len = 80 + 40 * g;
          return (
            <g key={i} className="sl-sway-slow" style={{ transformOrigin: "128px 216px", animationDelay: `${i * 0.4}s` }}>
              <path d={`M128,${214 + i * 3} C${128 - len * 0.4},${y - 10} ${128 - len * 0.7},${y + 26} ${128 - len},${y + 14 + i * 6} C${128 - len * 0.6},${y + 8} ${128 - len * 0.3},${y - 2} 132,${220 + i * 3} Z`} fill={u("feather")} opacity="0.9" />
              <circle cx={128 - len} cy={y + 14 + i * 6} r="4" fill={p.accent} filter={u("glow")} />
            </g>
          );
        })}
        {/* far wing */}
        <g transform={`translate(214 196) scale(${0.6 + 0.4 * g})`}>
          <g className="sl-flap">{wing(-120, -50, 8, 70, 50, true)}</g>
        </g>
        {/* body */}
        <path d="M120,214 C150,194 210,184 252,190 C278,194 292,208 292,220 C288,234 262,240 236,240 C196,240 150,236 120,214 Z" fill={u("body")} {...rim(c)} />
        <path d="M150,226 C190,238 240,238 284,226 C266,240 196,244 150,226 Z" fill={p.belly} opacity="0.7" />
        <Spec x={220} y={196} rx={30} ry={5} rot={-4} o={0.35} />
        {/* near wing */}
        <g transform={`translate(200 202) scale(${0.6 + 0.4 * g})`}>
          <g className="sl-flap">{wing(-160, -70, 9, 80, 70)}</g>
        </g>
        {/* head */}
        <g className="sl-sway" style={{ transformOrigin: "296px 200px" }}>
          {[-150, -125, -100].map((a, i) => (
            <path key={a} d={blade(26 + 16 * g - i * 4, 6)} transform={`translate(292 194) rotate(${a + 40})`} fill={u("feather")} />
          ))}
        </g>
        <path d="M276,204 C278,188 300,182 312,194 C320,204 314,218 300,220 C286,222 274,216 276,204 Z" fill={u("body")} {...rim(c)} />
        <path d="M310,200 L340,208 L310,214 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" />
        <Eye c={c} x={298} y={202} r={4.8} kind="almond" angle={-6} />
        <Gem c={c} x={252} y={214} s={0.55} />
      </g>
    );
  },
};

export const pyraurum: Renderer = evolved;
