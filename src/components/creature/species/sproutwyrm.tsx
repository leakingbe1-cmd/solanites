import { blade, Eye, Gem, rim, round, Spec, type Renderer } from "../kit";

/** Sproutwyrm — segmented, arching inchworm with root legs and a bud-hood head. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  shadow: 130,
  halo: [318, 200, 30],
  render: (c) => {
    const { p, u, g } = c;
    const segs: [number, number, number][] = [
      [72, 332, 18], [92, 312, 22], [110, 284, 25], [130, 254, 27], [156, 228, 28], [186, 212, 29],
      [218, 210, 29], [246, 224, 28], [266, 252, 27], [280, 284, 26], [292, 314, 25],
    ];
    const grounded = [0, 1, 9, 10];
    return (
      <g>
        {/* root legs */}
        {grounded.map((i) => {
          const [x, y, r] = segs[i];
          return (
            <g key={i} fill="none" stroke={p.horn} strokeWidth="3" strokeLinecap="round">
              <path d={`M${x - 6},${y + r - 4} C${x - 8},${y + r + 6} ${x - 14},350 ${x - 20},354`} />
              <path d={`M${x + 4},${y + r - 3} C${x + 4},${y + r + 8} ${x + 8},350 ${x + 14},354`} />
            </g>
          );
        })}
        {segs.map(([x, y, r], i) => (
          // Lifted segments ripple in sequence; the planted ones stay put.
          <g key={i} className={grounded.includes(i) ? undefined : "sl-undulate"} style={{ animationDelay: `${i * 0.15}s` }}>
            <circle cx={x} cy={y} r={r} fill={u("body")} {...rim(c)} />
            <path d={`M${x - r * 0.55},${y - r * 0.8} C${x - r * 0.2},${y - r * 0.2} ${x - r * 0.2},${y + r * 0.3} ${x - r * 0.5},${y + r * 0.85}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="2" />
            <ellipse cx={x - r * 0.25} cy={y - r * 0.45} rx={r * 0.35} ry={r * 0.18} fill="#fff" opacity="0.25" />
            {i % 3 === 1 && <circle cx={x + r * 0.2} cy={y + r * 0.2} r={r * 0.16} fill={p.bodyLight} opacity={0.5 * c.mark} />}
          </g>
        ))}
        {/* sprouting buds along the arch */}
        {[3, 5, 7].map((i) => {
          const [x, y, r] = segs[i];
          const h = 10 + 18 * g;
          return (
            <g key={i} className="sl-undulate" style={{ animationDelay: `${i * 0.15}s` }}>
              <g transform={`translate(${x} ${y - r + 2})`}>
                <path d={`M0,0 C-2,${-h * 0.5} 2,${-h * 0.8} 0,${-h}`} stroke={p.wing} strokeWidth="2.5" fill="none" />
                <path d={blade(12 * g + 4, 4)} transform={`translate(0 ${-h * 0.55}) rotate(-150)`} fill={p.wing} />
                <path d={blade(12 * g + 4, 4)} transform={`translate(0 ${-h * 0.45}) rotate(-30)`} fill={p.wing} />
                <circle cy={-h} r={3 + 2 * g} fill={p.accent} filter={u("glow")} />
              </g>
            </g>
          );
        })}
        {/* bud-hood head */}
        <g className="sl-sway" style={{ transformOrigin: "300px 300px" }}>
          {[-150, -120, -90, -60, -30].map((a, i) => (
            <path key={a} d={blade(34 + 12 * g + (i === 2 ? 8 : 0), 15)} transform={`translate(318 276) rotate(${a})`} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.35" />
          ))}
          <circle cx="320" cy="282" r="30" fill={u("body")} {...rim(c)} />
          <path d="M300,294 C310,306 334,308 346,298 C340,312 312,314 300,294 Z" fill={p.belly} opacity="0.75" />
          <Spec x={312} y={266} rx={12} ry={6} o={0.3} />
          <Eye c={c} x={332} y={280} r={6} kind="round" />
          <path d="M340,298 C344,300 348,300 350,296" fill="none" stroke={p.bodyDark} strokeWidth="1.6" strokeLinecap="round" />
          <Gem c={c} x={318} y={252} s={0.55} />
        </g>
      </g>
    );
  },
};

export const sproutwyrm: Renderer = evolved;
