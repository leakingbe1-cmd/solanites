import { blade, Constellation, Dots, Eye, Gem, MIRROR, rim, Spec, type Renderer } from "../kit";

/* Mythic: cosmic anatomy — star-fields inside the body, celestial structures. */

/** Astravex — a platinum stag whose antlers are constellations. */
export const astravex: Renderer = {
  shadow: 110,
  halo: [314, 40, 28],
  render: (c) => {
    const { p, u, g } = c;
    const body = "M126,236 C128,206 168,194 220,196 C262,198 286,214 288,240 C288,262 268,276 220,278 C168,278 128,268 126,236 Z";
    const s = 0.55 + 0.45 * g;
    return (
      <g>
        {/* far legs */}
        <path d="M150,262 L156,262 L158,346 L150,346 Z M266,258 L274,258 L280,346 L272,346 Z" fill={p.bodyDark} />
        {/* wispy tail */}
        <path d="M132,228 C108,220 96,236 92,254 C104,246 118,244 130,246 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" className="sl-sway" style={{ transformOrigin: "132px 236px" }} />
        {/* body with star-field flank */}
        <path d={body} fill={u("body")} {...rim(c)} />
        <path d={body} fill={p.belly} opacity="0.55" transform="translate(200 238) scale(0.8 0.62) translate(-196 -230)" />
        <path d={body} fill={u("stars")} transform="translate(200 238) scale(0.8 0.62) translate(-196 -230)" className="sl-twinkle" />
        <Spec x={200} y={206} rx={50} ry={6} rot={-2} o={0.35} />
        {/* near legs */}
        {[138, 258].map((x, i) => (
          <g key={x}>
            <path d={`M${x - 6},258 C${x - 8},290 ${x - 4},320 ${x - 4},346 L${x + 6},346 C${x + 6},320 ${x + 10},290 ${x + 12},258 Z`} fill={u("body")} {...rim(c, 1)} />
            <path d={`M${x - 6},344 L${x + 8},344 L${x + 9},352 L${x - 7},352 Z`} fill={p.accent} opacity={i ? 0.9 : 0.8} />
          </g>
        ))}
        {/* flowing mane */}
        <g className="sl-sway-slow" style={{ transformOrigin: "280px 170px" }}>
          <path d="M296,146 C274,160 262,190 240,204 C268,204 284,184 300,164 Z" fill={u("fin")} stroke={p.accent} strokeOpacity="0.6" />
          <path d="M290,170 C268,186 258,214 236,226 C264,224 280,204 296,186 Z" fill={u("fin")} stroke={p.accent} strokeOpacity="0.4" />
        </g>
        {/* neck & head */}
        <path d="M258,216 C268,184 280,160 290,144 L312,150 C306,176 298,204 292,232 Z" fill={u("body")} {...rim(c)} />
        <path d={blade(28, 8)} transform="translate(300 132) rotate(-150)" fill={u("body")} {...rim(c, 1)} />
        <path d="M288,138 C298,124 318,122 330,130 C344,140 354,154 352,164 C346,170 332,166 318,160 C304,158 290,150 288,138 Z" fill={u("body")} {...rim(c)} />
        <Spec x={312} y={128} rx={14} ry={4} rot={10} o={0.4} />
        <circle cx="350" cy="162" r="2.4" fill={p.bodyDark} />
        <Eye c={c} x={316} y={140} r={5} kind="orb" />
        {/* constellation antlers */}
        <g transform={`translate(306 126) scale(${s}) translate(-306 -126)`}>
          <Constellation c={c} pts={[[306, 126], [298, 96], [282, 72], [270, 48]]} />
          <Constellation c={c} pts={[[298, 96], [314, 74], [322, 50]]} />
          <Constellation c={c} pts={[[282, 72], [262, 66], [248, 74]]} />
          <Constellation c={c} pts={[[318, 124], [334, 100], [350, 86], [366, 82]]} />
          <Constellation c={c} pts={[[334, 100], [340, 76]]} />
        </g>
        <Gem c={c} x={276} y={222} s={0.55} />
      </g>
    );
  },
};

/** Orbelith — a ringed planet-being with small moons and comet tendrils. */
export const orbelith: Renderer = {
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

/** Eventide — an eclipse-headed dragonfly with four long glass wings. */
export const eventide: Renderer = {
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
