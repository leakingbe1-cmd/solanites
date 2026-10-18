import { blade, Eye, Gem, polar, rim, round, Spec, Tube, type Renderer } from "../kit";

/** Solvanth — a leviathan coiled around a captive sun. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 130,
  halo: [288, 46, 28],
  render: (c) => {
    const { p, u, g } = c;
    const tilt = (-14 * Math.PI) / 180;
    const pt = (t: number): [number, number] => {
      const x = 118 * Math.cos(t);
      const y = 42 * Math.sin(t);
      return [round(200 + x * Math.cos(tilt) - y * Math.sin(tilt)), round(236 + x * Math.sin(tilt) + y * Math.cos(tilt))];
    };
    const arc = (t0: number, t1: number) =>
      Array.from({ length: 41 })
        .map((_, i) => pt(t0 + ((t1 - t0) * i) / 40))
        .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
    const [rx, ry] = pt(0);
    const [lx, ly] = pt(Math.PI);
    return (
      <g>
        {/* corona */}
        <g className="sl-spin-slow" style={{ transformOrigin: "200px 214px" }} filter={u("glow")}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = i * 22.5;
            const [x1, y1] = polar(200, 214, 70, a - 4);
            const [x2, y2] = polar(200, 214, 70 + (14 + 16 * g) * (i % 2 ? 0.6 : 1), a);
            const [x3, y3] = polar(200, 214, 70, a + 4);
            return <path key={i} d={`M${x1},${y1} L${x2},${y2} L${x3},${y3} Z`} fill={p.accent} opacity="0.75" />;
          })}
        </g>
        {/* back of the coil */}
        <Tube c={c} w={26} d={arc(Math.PI, 2 * Math.PI)} />
        {/* the sun */}
        <circle cx="200" cy="214" r="66" fill={p.accent} filter={u("glow")} />
        <circle cx="200" cy="214" r="66" fill={u("light")} />
        <circle cx="200" cy="214" r="66" fill={u("shade")} opacity="0.5" />
        <Spec x={180} y={188} rx={22} ry={10} o={0.4} />
        {/* tail */}
        <Tube c={c} w={18} d={`M${lx},${ly} C70,280 60,310 80,336`} />
        <path d="M80,336 C64,344 60,360 70,372 C78,360 88,354 98,352 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        {/* front of the coil */}
        <Tube c={c} w={28} belly d={arc(0, Math.PI)} />
        {[0.35, 0.7, 1.05, 1.4, 1.75, 2.1, 2.45, 2.8].map((t) => {
          const [x, y] = pt(t);
          return <path key={t} d={blade(14, 5)} transform={`translate(${x} ${y - 12}) rotate(-120)`} fill={p.wingEdge} opacity="0.85" />;
        })}
        {/* neck rising from the coil */}
        <Tube c={c} w={24} belly d={`M${rx},${ry} C344,170 336,132 300,108`} />
        {/* mane */}
        <g className="sl-sway" style={{ transformOrigin: "300px 96px" }}>
          {[-60, -30, 0, 30, 60].map((a, i) => (
            <path key={a} d={blade(34 + 16 * g - Math.abs(i - 2) * 6, 9)} transform={`translate(310 96) rotate(${a})`} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
          ))}
        </g>
        {/* head (facing the sun) */}
        <path d="M312,84 L338,58 L322,92 Z M318,94 L350,80 L324,102 Z" fill={u("horn")} {...rim(c, 1)} />
        <path d="M322,98 C316,80 294,72 270,78 C252,82 238,92 230,104 C244,112 264,118 286,120 C308,122 324,114 322,98 Z" fill={u("body")} {...rim(c)} />
        <path d="M232,104 C248,112 268,116 290,118 L288,124 C264,124 244,118 234,110 Z" fill={p.belly} opacity="0.85" />
        <Spec x={284} y={86} rx={18} ry={4} rot={-8} o={0.4} />
        <Eye c={c} x={270} y={96} r={5.4} kind="slit" flip angle={-4} />
        <Gem c={c} x={296} y={88} s={0.45} />
      </g>
    );
  },
};

export const solvanth: Renderer = evolved;
