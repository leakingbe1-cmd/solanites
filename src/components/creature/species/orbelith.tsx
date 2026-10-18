import { Eye, Gem, rim, Spec, type Renderer } from "../kit";

/** Orbelith — a ringed planet-being with small moons and comet tendrils. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 110,
  halo: [200, 104, 30],
  render: (c) => {
    const { p, u, g, id } = c;
    const ring = "rotate(-12 200 210)";
    const eyes: [number, number][] = [
      [92, 236],
      [140, 250],
      [200, 254],
      [260, 250],
      [308, 236],
    ];
    return (
      <g>
        <defs>
          <clipPath id={`${id}-orb`}>
            <circle cx="200" cy="200" r="68" />
          </clipPath>
        </defs>
        {/* comet tendrils */}
        {[0, 1, 2].map((i) => (
          <g key={i} className="sl-sway-slow" style={{ transformOrigin: "180px 250px", animationDelay: `${i * 0.6}s` }}>
            <path d={`M${170 + i * 18},250 C${150 + i * 10},${290 + 30 * g} ${120 + i * 30},${310 + 30 * g} ${100 + i * 40},${330 + 30 * g} C${130 + i * 26},${300 + 20 * g} ${160 + i * 14},${280} ${186 + i * 16},254 Z`} fill={u("fin")} />
            <circle cx={100 + i * 40} cy={330 + 30 * g} r="2.6" fill="#fff" filter={u("glow")} />
          </g>
        ))}
        {/* far half of the ring */}
        <g transform={ring}>
          <path d="M50,210 A150,38 0 0 1 350,210" fill="none" stroke={p.wing} strokeWidth="14" strokeOpacity="0.7" />
          <path d="M66,210 A134,30 0 0 1 334,210" fill="none" stroke={p.wingEdge} strokeWidth="2" strokeOpacity="0.6" />
        </g>
        {/* the orb */}
        <circle cx="200" cy="200" r="68" fill={u("body")} {...rim(c)} />
        <g clipPath={`url(#${id}-orb)`}>
          <path d="M120,176 C170,190 230,166 290,182 L290,196 C230,182 170,206 120,192 Z" fill={p.accent} opacity="0.35" />
          <path d="M120,216 C170,232 230,206 290,222 L290,240 C230,224 170,250 120,234 Z" fill={p.belly} opacity="0.7" />
          <rect x="120" y="120" width="160" height="160" fill={u("stars")} opacity="0.8" className="sl-twinkle" />
        </g>
        <circle cx="200" cy="200" r="68" fill={u("shade")} />
        <Spec x={176} y={164} rx={22} ry={11} o={0.4} />
        <Gem c={c} x={200} y={196} s={0.95} />
        {/* near half of the ring, with its eyes */}
        <g transform={ring}>
          <path d="M50,210 A150,38 0 0 0 350,210" fill="none" stroke={p.bodyDark} strokeWidth="18" />
          <path d="M50,210 A150,38 0 0 0 350,210" fill="none" stroke={p.wing} strokeWidth="14" />
          <path d="M54,212 A146,34 0 0 0 346,212" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.5" />
        </g>
        <g transform={ring}>
          {eyes.map(([x, y]) => (
            <Eye key={x} c={c} x={x} y={y - 6} r={4.5} kind="orb" />
          ))}
        </g>
        {/* moons */}
        <g className="sl-spin" style={{ transformOrigin: "200px 200px" }}>
          {[
            [200, 52, 9],
            [356, 150, 6],
            [70, 300, 7],
          ].slice(0, c.evo + 1).map(([x, y, r]) => (
            <g key={x}>
              <circle cx={x} cy={y} r={r} fill={u("body")} {...rim(c, 1)} />
              <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" opacity="0.5" />
            </g>
          ))}
        </g>
      </g>
    );
  },
};

export const orbelith: Renderer = evolved;
