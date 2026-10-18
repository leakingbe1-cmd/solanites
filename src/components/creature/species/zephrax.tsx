import { Eye, Gem, polar, rim, round, Spec, Tube, type Renderer } from "../kit";

/** Zephrax — a storm serpent coiled into a ring around its Solgem. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 110,
  halo: [200, 205, 30],
  render: (c) => {
    const { p, u, g } = c;
    const R = 110;
    const spikes = Array.from({ length: 13 }).map((_, i) => -44 + i * 21);
    return (
      <g>
        {/* lightning mane */}
        <g filter={u("glow")} className="sl-rune-pulse">
          {spikes.map((a) => {
            const L = (10 + 18 * g) * (a > 60 && a < 120 ? 0.7 : 1);
            const [x1, y1] = polar(200, 205, R + 14, a - 5);
            const [x2, y2] = polar(200, 205, R + 14 + L * 0.6, a + 3);
            const [x3, y3] = polar(200, 205, R + 14 + L, a - 2);
            const [x4, y4] = polar(200, 205, R + 14, a + 5);
            return <path key={a} d={`M${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4} Z`} fill={p.accent} opacity="0.85" />;
          })}
        </g>
        <circle cx="200" cy="205" r="46" fill={u("light")} opacity="0.5" className="sl-core" />
        <Tube c={c} w={30} d="M248,106 A110,110 0 1 1 152,106" />
        <path d="M248,106 A110,110 0 1 1 152,106" fill="none" stroke={p.belly} strokeOpacity="0.5" strokeWidth="8" strokeDasharray="3 7" transform="translate(200 205) scale(0.9) translate(-200 -205)" />
        <g opacity={c.mark} filter={u("glow")} stroke={p.belly} strokeWidth="1.8" fill="none" strokeLinecap="round" className="sl-rune-pulse">
          {[20, 80, 140, 200].map((a) => {
            const [x, y] = polar(200, 205, R, a);
            return <path key={a} d={`M${x - 5},${y - 4} L${x},${y + 4} L${x + 5},${y - 4}`} />;
          })}
        </g>
        {/* bolt tail */}
        <path d="M242,100 L262,84 L258,98 L278,90 L262,114 L266,103 L246,112 Z" fill={p.accent} filter={u("glow")} />
        {/* spark between jaws and tail */}
        <path d="M214,102 L222,96 L228,106 L236,98 L244,104" fill="none" stroke={p.belly} strokeWidth="2" filter={u("glow")} className="sl-twinkle" />
        {/* head */}
        <path d="M136,92 L102,56 L128,96 Z M150,86 L128,48 L144,90 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" />
        <path d="M116,108 C120,86 148,76 174,80 C194,84 210,92 216,104 C204,114 180,118 158,120 C138,122 118,120 116,108 Z" fill={u("body")} {...rim(c)} />
        <path d="M150,114 C170,116 196,112 214,106 L210,112 C190,120 168,122 152,120 Z" fill={p.belly} opacity="0.7" />
        <Spec x={160} y={88} rx={18} ry={4} rot={-6} o={0.35} />
        <Eye c={c} x={170} y={96} r={5.5} kind="slit" angle={4} />
        <Gem c={c} x={200} y={205} s={1.15} />
      </g>
    );
  },
};

export const zephrax: Renderer = evolved;
