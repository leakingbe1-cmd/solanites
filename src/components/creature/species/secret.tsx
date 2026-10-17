import { blade, Eye, Gem, MIRROR, polar, rim, round, Spec, type Renderer } from "../kit";

/* Secret: forms that break the rules of the rest of the collection. */

/** GENESIS — a floating polyhedron construct with a visor eye and orbiting Solana bars. */
export const genesis: Renderer = {
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

/** Ø NULLBORN — an inverted, glitched nine-tailed fox. */
export const nullborn: Renderer = {
  shadow: 90,
  halo: [200, 92, 30],
  render: (c) => {
    const { p, u, g } = c;
    const tails = Array.from({ length: 9 }).map((_, i) => -168 + i * 19.5);
    const tl = 70 + 70 * g;
    return (
      <g>
        {/* fanned tails */}
        {tails.map((a, i) => {
          const l = round(tl * (0.85 + 0.15 * Math.sin((i / 8) * Math.PI)));
          const [tx, ty] = polar(200, 296, l * 0.92, a);
          return (
            <g key={a} className="sl-sway-slow" style={{ transformOrigin: "200px 296px", animationDelay: `${i * 0.25}s` }}>
              <path d={blade(l, 18, 0.75)} transform={`translate(200 296) rotate(${a})`} fill={u("body")} {...rim(c, 1)} />
              <path d={`M20,0 L${l * 0.8},0`} transform={`translate(200 296) rotate(${a})`} stroke="#000" strokeWidth="2" opacity="0.7" />
              <circle cx={tx} cy={ty} r="5" fill={p.accent} filter={u("glow")} />
            </g>
          );
        })}
        {/* sitting body */}
        <path d="M200,198 C232,198 248,240 250,290 C252,330 236,350 200,350 C164,350 148,330 150,290 C152,240 168,198 200,198 Z" fill={u("body")} {...rim(c)} />
        <path d="M176,210 L188,232 L180,244 L196,256 L200,270 L204,256 L220,244 L212,232 L224,210 C214,220 186,220 176,210 Z" fill={p.belly} />
        {/* front legs */}
        {[184, 216].map((x) => (
          <g key={x}>
            <path d={`M${x - 8},280 L${x - 8},346 L${x + 8},346 L${x + 8},280 Z`} fill={u("body")} {...rim(c, 1)} />
            <ellipse cx={x} cy="348" rx="10" ry="5" fill="#000" />
          </g>
        ))}
        {/* fox mask */}
        <path d="M168,138 L152,82 L190,122 Z" fill={u("body")} {...rim(c)} />
        <path d="M170,128 L160,96 L182,120 Z" fill="#000" />
        <path d="M168,138 L152,82 L190,122 Z" transform={MIRROR} fill={u("body")} {...rim(c)} />
        <path d="M170,128 L160,96 L182,120 Z" transform={MIRROR} fill="#000" />
        <path d="M200,116 C226,116 248,130 252,148 C254,164 240,180 222,190 C214,196 206,204 200,206 C194,204 186,196 178,190 C160,180 146,164 148,148 C152,130 174,116 200,116 Z" fill={u("body")} {...rim(c)} />
        <circle cx="200" cy="200" r="4" fill="#000" />
        <g stroke={p.accent} strokeWidth="2.2" strokeLinecap="round" filter={u("glow")} opacity={c.mark}>
          <path d="M162,160 L178,166 M164,170 L178,172 M238,160 L222,166 M236,170 L222,172 M200,126 L200,138" />
        </g>
        <Spec x={186} y={128} rx={16} ry={5} o={0.6} />
        <Eye c={c} x={180} y={154} r={6.5} kind="slit" angle={14} flip />
        <Eye c={c} x={220} y={154} r={6.5} kind="slit" angle={-14} />
        <Gem c={c} x={200} y={142} s={0.5} />
      </g>
    );
  },
};
