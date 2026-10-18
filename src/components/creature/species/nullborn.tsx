import { blade, Eye, Gem, MIRROR, polar, rim, round, Spec, type Renderer } from "../kit";

/** Ø NULLBORN — an inverted, glitched nine-tailed fox. */
/** Evolved: the mature form. */
const evolved: Renderer = {
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
            <path d={`M${x - 9},278 C${x - 10},300 ${x - 8},324 ${x - 7},340 C${x - 8},346 ${x - 6},350 ${x},350 C${x + 6},350 ${x + 8},346 ${x + 7},340 C${x + 8},324 ${x + 10},300 ${x + 9},278 Z`} fill={u("body")} {...rim(c, 1)} />
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

export const nullborn: Renderer = evolved;
