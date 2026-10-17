import { Dots, Eye, Gem, MIRROR, polar, rim, round, Spec, Tube, type Renderer } from "../kit";

/* Epic: elaborate silhouettes, each carrying its own light source. */

/** Neonyx — a deep-sea angler-wyrm: glowing maw, frilled fins and a lantern lure. */
export const neonyx: Renderer = {
  floating: true,
  shadow: 110,
  halo: [214, 96, 28],
  render: (c) => {
    const { p, u, g } = c;
    const stalk = 0.7 + 0.3 * g;
    return (
      <g>
        {/* tail fin */}
        <g className="sl-sway" style={{ transformOrigin: "110px 236px" }}>
          <path d="M112,232 C82,204 62,176 74,164 C90,184 104,202 122,216 C104,244 84,272 70,300 C60,290 80,262 112,232 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        </g>
        {/* dorsal frill */}
        <path d="M176,146 C186,110 214,100 236,118 C222,120 214,130 212,144 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        <path d="M150,166 C150,136 168,124 184,132 C172,140 168,152 170,164 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        {/* lure stalk */}
        <g className="sl-sway" style={{ transformOrigin: "248px 146px" }}>
          <path d={`M248,146 C252,${110 - 20 * stalk} ${296},${80 - 18 * stalk} ${324},${104 - 10 * stalk}`} fill="none" stroke={p.bodyDark} strokeWidth="5" strokeLinecap="round" />
          <path d={`M248,146 C252,${110 - 20 * stalk} ${296},${80 - 18 * stalk} ${324},${104 - 10 * stalk}`} fill="none" stroke={p.body} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="326" cy={112 - 10 * stalk} r={18 + 6 * g} fill={u("light")} className="sl-core" />
          <Gem c={c} x={326} y={112 - 10 * stalk} s={0.8} />
        </g>
        {/* round body */}
        <path d="M118,214 C122,164 170,134 230,140 C290,146 318,188 314,230 C308,270 266,292 220,290 C176,288 140,268 118,240 Z" fill={u("body")} {...rim(c)} />
        <path d="M136,250 C170,280 250,290 296,262 C270,288 186,294 140,262 Z" fill={p.belly} opacity="0.35" />
        <Spec x={206} y={160} rx={40} ry={9} rot={-8} o={0.2} />
        {/* gaping glowing maw */}
        <path d="M262,226 C286,216 312,222 318,238 C306,260 278,268 252,258 Z" fill="#07030c" />
        <g fill={p.belly} filter={u("glow")}>
          {[268, 280, 292, 304].map((x, i) => (
            <path key={x} d={`M${x - 4},${222 + i * 0.6} L${x},${236} L${x + 4},${222 + i * 0.6} Z`} />
          ))}
          {[262, 274, 286, 298].map((x) => (
            <path key={x} d={`M${x - 4},260 L${x},247 L${x + 4},260 Z`} />
          ))}
        </g>
        {/* side fins */}
        <path d="M196,240 C190,270 202,296 232,304 C222,284 220,264 226,248 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        <g opacity={c.mark}>
          <Dots c={c} r={2.2} color={p.belly} pts={[[150, 214], [170, 226], [192, 232], [214, 234], [236, 232], [150, 190], [170, 178]]} />
        </g>
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.6" fill="none" className="sl-rune-pulse">
          <path d="M174,196 L184,186 L194,196 M206,176 L216,186 L226,176" />
        </g>
        <Eye c={c} x={262} y={192} r={6} kind="orb" />
      </g>
    );
  },
};

/** Aurorath — a sky whale trailing curtains of aurora beneath its belly. */
export const aurorath: Renderer = {
  floating: true,
  fit: 0.98,
  shadow: 150,
  halo: [120, 96, 34],
  render: (c) => {
    const { p, u, g } = c;
    const curtain = 40 + 70 * g;
    return (
      <g transform="translate(0 -14)">
        {/* aurora curtains */}
        {[96, 140, 184, 228, 272, 312].map((x, i) => {
          const len = curtain * (1 - Math.abs(i - 2.5) * 0.08);
          return (
            <path
              key={x}
              d={`M${x},230 C${x + 10},${250 + len * 0.3} ${x - 12},${250 + len * 0.6} ${x + 6},${246 + len} L${x + 28},${244 + len * 0.95} C${x + 14},${250 + len * 0.55} ${x + 34},${250 + len * 0.3} ${x + 26},230 Z`}
              fill={i % 2 ? u("veil") : u("veil2")}
              opacity={0.75 + 0.25 * c.mark}
              className="sl-sway-slow"
              style={{ transformOrigin: `${x}px 230px`, animationDelay: `${i * 0.5}s` }}
            />
          );
        })}
        {/* flukes */}
        <g className="sl-sway-slow" style={{ transformOrigin: "352px 204px" }}>
          <path d="M350,198 C366,170 388,156 398,158 C392,176 378,192 362,204 C378,214 392,232 396,250 C384,248 364,232 348,214 Z" fill={u("body")} {...rim(c)} />
        </g>
        {/* body */}
        <path d="M40,196 C40,146 110,116 200,122 C290,128 338,164 352,192 C358,204 360,212 352,222 C330,248 270,268 200,266 C110,264 40,246 40,196 Z" fill={u("body")} {...rim(c)} />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${70 + k * 4},${224 + k * 9} C${130},${248 + k * 7} ${230},${252 + k * 5} ${320 - k * 10},${230 + k * 5}`} fill="none" stroke={p.belly} strokeOpacity="0.4" strokeWidth="2" />
        ))}
        <g opacity={c.mark} fill="none" strokeLinecap="round" filter={u("glow")}>
          <path d="M120,138 C180,124 250,132 310,160" stroke={p.accent} strokeWidth="3" opacity="0.6" />
          <path d="M150,150 C200,142 250,148 300,170" stroke={p.wingEdge} strokeWidth="2" opacity="0.6" />
        </g>
        <Spec x={170} y={140} rx={70} ry={10} rot={-4} o={0.2} />
        {/* pectoral fin */}
        <path d="M150,240 C158,280 188,302 220,302 C202,284 192,264 192,246 Z" fill={u("body")} {...rim(c)} />
        <path d="M44,210 C72,220 112,220 142,210" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
        <Eye c={c} x={96} y={194} r={6} kind="lidded" />
        <Gem c={c} x={120} y={150} s={0.65} />
      </g>
    );
  },
};

/** Zephrax — a storm serpent coiled into a ring around its Solgem. */
export const zephrax: Renderer = {
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

/** Prismara — a tall, crowned bird displaying a fan of prism shards. */
export const prismara: Renderer = {
  shadow: 70,
  halo: [200, 48, 26],
  render: (c) => {
    const { p, u, g } = c;
    const shards = Array.from({ length: 13 }).map((_, i) => -168 + i * 13);
    const L = 70 + 70 * g;
    return (
      <g>
        {/* prism fan */}
        <g>
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
        <path d="M192,150 L194,124 L206,124 L208,150 Z" fill={p.body} />
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
