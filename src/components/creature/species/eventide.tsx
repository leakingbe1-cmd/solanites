import { blade, Dots, Eye, Gem, MIRROR, rim, round, type Renderer } from "../kit";

/** Eventide — an eclipse-headed dragonfly with four long glass wings. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 100,
  halo: [200, 104, 30],
  render: (c) => {
    const { p, u, g } = c;
    const wl = 90 + 70 * g;
    const pair = (a: number, len: number) => (
      <g transform={`translate(200 184) rotate(${a})`}>
        <path d={blade(len, 20, 0.85)} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.7" />
        <path d={blade(len, 20, 0.85)} fill={u("stars")} opacity="0.7" />
        <path d={`M8,0 L${len - 6},0 M${len * 0.3},-2 L${len * 0.5},-14 M${len * 0.5},2 L${len * 0.7},12`} stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="0.9" fill="none" />
      </g>
    );
    const segs = Array.from({ length: 10 }).map((_, i) => ({ y: 214 + i * (12 + 3 * g), r: 9 - i * 0.55 }));
    return (
      <g>
        <g className="sl-flap" style={{ transformOrigin: "200px 184px" }}>
          {pair(-158, wl)}
          {pair(168, wl * 0.85)}
        </g>
        <g transform={MIRROR}>
          <g className="sl-flap" style={{ transformOrigin: "200px 184px" }}>
            {pair(-158, wl)}
            {pair(168, wl * 0.85)}
          </g>
        </g>
        {/* segmented tail */}
        {segs.map(({ y, r }, i) => (
          <g key={i}>
            <ellipse cx="200" cy={y} rx={r} ry={r * 0.9} fill={u("body")} {...rim(c, 1)} />
            {i % 2 === 0 && <ellipse cx="200" cy={y} rx={r * 0.55} ry={r * 0.18} fill={p.accent} opacity={c.mark} filter={u("glow")} />}
          </g>
        ))}
        {/* thorax */}
        <ellipse cx="200" cy="192" rx="16" ry="22" fill={u("body")} {...rim(c)} />
        <ellipse cx="200" cy="192" rx="12" ry="18" fill={p.belly} opacity="0.85" />
        <ellipse cx="200" cy="192" rx="12" ry="18" fill={u("stars")} />
        <Gem c={c} x={200} y={194} s={0.55} />
        {/* eclipse head */}
        <circle cx="200" cy="150" r="34" fill={p.accent} opacity="0.55" filter={u("blur8")} className="sl-aura-pulse" style={{ transformOrigin: "200px 150px" }} />
        <circle cx="200" cy="150" r="27" fill="none" stroke={p.wingEdge} strokeWidth="3" filter={u("glow")} />
        <circle cx="200" cy="150" r="25" fill="#05030f" />
        <path d="M178,140 A25,25 0 0 1 214,128" fill="none" stroke={p.bodyLight} strokeWidth="2.4" strokeLinecap="round" />
        <Eye c={c} x={191} y={152} r={3.6} kind="orb" />
        <Eye c={c} x={209} y={152} r={3.6} kind="orb" />
        <Dots c={c} r={1.4} color="#fff" pts={[[120, 120], [286, 116], [104, 232], [300, 236]]} />
      </g>
    );
  },
};

export const eventide: Renderer = evolved;
