import { Eye, Gem, rim, round, type Renderer } from "../kit";

/** Cryovant — a faceted glass jellyfish trailing shard tendrils. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  fit: 1.22,
  shadow: 70,
  halo: [200, 82, 34],
  render: (c) => {
    const { p, u, g } = c;
    const tendrils = [138, 158, 178, 200, 222, 242, 262];
    return (
      <g transform="translate(0 -12)">
        {/* ribbon tendrils */}
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 200px" }}>
          <path d={`M188,200 C176,250 210,290 192,${300 + 60 * g} C206,300 196,250 206,200 Z`} fill={u("fin")} />
          <path d={`M212,200 C226,240 196,284 214,${290 + 50 * g} C222,280 230,240 220,200 Z`} fill={u("fin")} opacity="0.8" />
        </g>
        {/* shard chains */}
        {tendrils.map((x, i) => {
          const n = Math.round((4 + 4 * g) * (1 - Math.abs(i - 3) * 0.12));
          return (
            <g key={x} className="sl-sway" style={{ transformOrigin: `${x}px 200px`, animationDelay: `${i * 0.3}s` }}>
              {Array.from({ length: n }).map((_, k) => {
                const y = 206 + k * 17;
                const s = 6 - k * 0.45;
                return <path key={k} d={`M${x},${y - s * 1.4} L${x + s},${y} L${x},${y + s * 1.4} L${x - s},${y} Z`} fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="0.8" />;
              })}
            </g>
          );
        })}
        {/* faceted bell */}
        <path d="M118,192 L138,140 L176,110 L224,110 L262,140 L282,192 L250,202 L200,208 L150,202 Z" fill={u("glass")} {...rim(c)} />
        <ellipse cx="200" cy="162" rx="50" ry="34" fill={u("light")} opacity="0.55" className="sl-core" />
        <g stroke="#fff" strokeOpacity="0.4" strokeWidth="1" fill="none">
          <path d="M176,110 L170,170 L118,192 M224,110 L230,170 L282,192 M170,170 L200,208 L230,170 L176,110 M138,140 L170,170 M262,140 L230,170" />
        </g>
        <path d="M176,110 L224,110 L200,150 Z" fill="#fff" opacity="0.3" />
        <path d="M118,192 L138,140 L170,170 Z" fill="#fff" opacity="0.16" />
        <path d="M262,140 L282,192 L230,170 Z" fill={p.bodyDark} opacity="0.25" />
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.3" fill="none" className="sl-rune-pulse">
          <path d="M150,176 L160,160 L176,156 M250,176 L240,160 L224,156" />
        </g>
        {/* rim crystals */}
        {[130, 150, 170, 190, 210, 230, 250, 270].map((x, i) => (
          <path key={x} d={`M${x - 7},${196 + (i % 2) * 4} L${x},${212 + (i % 2) * 6} L${x + 7},${198 + (i % 2) * 4} Z`} fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.5" />
        ))}
        <Eye c={c} x={184} y={188} r={6} kind="orb" />
        <Eye c={c} x={216} y={188} r={6} kind="orb" />
        <Gem c={c} x={200} y={126} s={0.7} />
      </g>
    );
  },
};

export const cryovant: Renderer = evolved;
