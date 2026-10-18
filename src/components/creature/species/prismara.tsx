import { Eye, Gem, MIRROR, polar, rim, round, Spec, type Renderer } from "../kit";

/** Prismara — a tall, crowned bird displaying a fan of prism shards. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  shadow: 70,
  halo: [200, 48, 26],
  render: (c) => {
    const { p, u, g } = c;
    const shards = Array.from({ length: 13 }).map((_, i) => -168 + i * 13);
    const L = 70 + 70 * g;
    return (
      <g>
        {/* prism fan: a slow display sway */}
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 250px" }}>
          {shards.map((a, i) => {
            const l = round(L * (0.82 + 0.18 * Math.sin((i / 12) * Math.PI)));
            const [tx, ty] = polar(200, 250, l * 0.9, a);
            return (
              <g key={a}>
                <path d={`M0,0 L${l * 0.55},-14 L${l},0 L${l * 0.55},14 Z`} transform={`translate(200 250) rotate(${a})`} fill={u("glass")} stroke={i % 2 ? p.accent : p.wingEdge} strokeOpacity="0.8" />
                <path d={`M0,0 L${l * 0.55},-14 L${l},0 Z`} transform={`translate(200 250) rotate(${a})`} fill="#fff" opacity="0.15" />
                <circle cx={tx} cy={ty} r="3.4" fill={i % 2 ? p.accent : p.wingEdge} filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${i * 0.2}s` }} />
              </g>
            );
          })}
        </g>
        {/* legs */}
        <path d="M190,330 L186,354 M210,330 L214,354 M178,356 L194,354 M206,354 L222,356" stroke={p.horn} strokeWidth="4" strokeLinecap="round" />
        {/* slender body */}
        <path d="M200,148 C228,150 240,192 238,240 C236,290 222,330 200,334 C178,330 164,290 162,240 C160,192 172,150 200,148 Z" fill={u("body")} {...rim(c)} />
        <path d="M200,176 C214,178 220,214 218,250 C216,290 208,314 200,316 C192,314 184,290 182,250 C180,214 186,178 200,176 Z" fill={p.belly} opacity="0.5" />
        <g opacity={c.mark} stroke={p.accent} strokeWidth="1.3" fill="none" filter={u("glow")}>
          <path d="M200,200 L190,230 L200,262 L210,230 Z M200,262 L192,290 M200,262 L208,290" />
        </g>
        <path d="M168,200 C150,240 150,290 172,322 C176,290 182,250 188,214 Z" fill={u("wing")} {...rim(c, 1)} />
        <path d="M168,200 C150,240 150,290 172,322 C176,290 182,250 188,214 Z" transform={MIRROR} fill={u("wing")} {...rim(c, 1)} />
        <Spec x={188} y={176} rx={8} ry={20} rot={10} o={0.25} />
        {/* neck & head */}
        <path d="M190,152 C192,140 192,130 194,124 L206,124 C208,130 208,140 210,152 C206,157 194,157 190,152 Z" fill={u("body")} />
        <circle cx="200" cy="112" r="20" fill={u("body")} {...rim(c)} />
        <path d="M195,120 L200,140 L205,120 Z" fill={u("horn")} />
        <Eye c={c} x={191} y={110} r={4.6} kind="almond" flip />
        <Eye c={c} x={209} y={110} r={4.6} kind="almond" />
        {/* crown */}
        <g transform={`translate(200 96) scale(${0.7 + 0.3 * g}) translate(-200 -96)`}>
          <path d="M188,96 L180,70 L194,92 Z M212,96 L220,70 L206,92 Z M194,94 L200,58 L206,94 Z" fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.8" />
        </g>
        <Gem c={c} x={200} y={84} s={0.5} />
      </g>
    );
  },
};

export const prismara: Renderer = evolved;
