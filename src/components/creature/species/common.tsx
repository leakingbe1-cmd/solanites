import { blade, Dots, Eye, Gem, MIRROR, polar, rim, round, Spec, type Renderer } from "../kit";

/* Common: one clear idea per species, simple but distinct silhouettes. */

/** Mossling — low, broad, leaf-shingled forest beast with branching antlers. */
export const mossling: Renderer = {
  shadow: 140,
  fit: 1.1,
  halo: [108, 120, 34],
  render: (c) => {
    const { p, u, g } = c;
    // Leaves sit on concentric arcs of the dome and all flow back toward the tail, like shingles.
    const rows = [
      { rx: 106, ry: 74, n: 8, s: 1 },
      { rx: 82, ry: 54, n: 6, s: 0.9 },
      { rx: 54, ry: 34, n: 4, s: 0.8 },
    ];
    const leaves = rows.map((r, k) =>
      Array.from({ length: r.n }, (_, i) => {
        const a = 196 + ((344 - 196) * (i + 0.5)) / r.n;
        const t = (a * Math.PI) / 180;
        return { x: round(226 + r.rx * Math.cos(t)), y: round(302 + r.ry * Math.sin(t)), rot: round(12 + (a - 270) * 0.45), s: r.s, k, i };
      }).reverse(),
    );
    const leg = (x: number, near: boolean) => (
      <g key={x}>
        <path
          d={`M${x - 19},284 C${x - 22},310 ${x - 18},332 ${x - 15},343 C${x - 23},346 ${x - 22},355 ${x - 12},355 L${x + 14},355 C${x + 23},355 ${x + 22},346 ${x + 15},343 C${x + 18},331 ${x + 21},309 ${x + 18},284 Z`}
          fill={near ? u("body") : p.bodyDark}
          {...(near ? rim(c) : {})}
        />
        {near && (
          <>
            <path d={`M${x - 12},300 C${x - 13},314 ${x - 11},326 ${x - 9},336`} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
            {[-9, 0, 9].map((d) => (
              <ellipse key={d} cx={x + d} cy="353" rx="4.2" ry="2.6" fill={p.horn} />
            ))}
          </>
        )}
      </g>
    );
    const antler = (dx: number, dy: number, shade: boolean) => (
      <g transform={`translate(${108 + dx} ${228 + dy}) scale(${g}) translate(-108 -228)`} opacity={shade ? 0.7 : 1}>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {[
            ["M108,228 C103,204 110,180 127,160", 7],
            ["M106,210 C96,203 90,192 89,179", 4.5],
            ["M113,190 C122,184 132,183 141,176", 4.5],
            ["M121,169 C118,159 120,150 127,142", 4],
          ].map(([d, w]) => (
            <g key={d as string}>
              <path d={d as string} stroke={p.bodyDark} strokeOpacity="0.8" strokeWidth={(w as number) + 2.5} />
              <path d={d as string} stroke={shade ? p.bodyDark : p.horn} strokeWidth={w as number} />
            </g>
          ))}
          {!shade && <path d="M110,222 C106,204 112,184 124,166" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.4" />}
        </g>
        {!shade &&
          (
            [
              [89, 179, -112],
              [141, 176, -24],
              [127, 142, -72],
              [127, 160, -38],
            ] as const
          ).map(([x, y, a]) => <path key={`${x}${y}`} d={blade(15, 5.5)} transform={`translate(${x} ${y}) rotate(${a})`} fill={p.accent} opacity="0.92" />)}
      </g>
    );
    return (
      <g>
        {leg(188, false)}
        {leg(302, false)}
        {/* leafy tail */}
        <g className="sl-sway" style={{ transformOrigin: "330px 292px" }}>
          <path d={blade(40 * g + 10, 12)} transform="translate(330 292) rotate(-22)" fill={u("wing")} {...rim(c, 1)} />
        </g>
        {/* domed body */}
        <path d="M114,306 C108,260 152,214 224,210 C294,206 340,246 341,296 C342,316 328,330 304,331 L148,331 C128,331 116,322 114,306 Z" fill={u("body")} {...rim(c)} />
        <path d="M124,314 C170,334 290,336 332,312 C330,326 316,334 300,336 L150,336 C136,334 126,326 124,314 Z" fill={p.belly} opacity="0.5" />
        {/* leaf shingles, outer rows first */}
        {leaves.map((row) =>
          row.map((l) => (
            <g key={`${l.k}-${l.i}`} transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}>
              <path d={blade(44, 17, 0.75)} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.28" />
              <path d={`M4,-2 C14,-12 30,-11 40,-1 C28,-6 14,-6 4,-2 Z`} fill="#fff" opacity={(l.i + l.k) % 2 ? 0.12 : 0.2} />
              <path d="M3,0 C16,1 28,1 40,0" fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.1" />
            </g>
          )),
        )}
        {/* moss tufts */}
        <g opacity={0.5 + c.mark * 0.5} fill={p.bodyLight}>
          {[
            [212, 216],
            [250, 216],
            [182, 226],
            [286, 230],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="5" />
              <circle cx={x + 6} cy={y + 2} r="4" />
              <circle cx={x - 5} cy={y + 3} r="3.5" />
            </g>
          ))}
        </g>
        <Spec x={230} y={224} rx={46} ry={8} rot={-5} o={0.16} />
        {leg(166, true)}
        {leg(292, true)}
        {/* head */}
        <g className="sl-sway-slow" style={{ transformOrigin: "120px 236px" }}>{antler(16, 4, true)}</g>
        <path d={blade(30, 10)} transform="translate(132 240) rotate(-38)" fill={u("wing")} {...rim(c, 1)} />
        <path d="M154,262 C140,258 126,264 118,276 L130,302 C140,292 150,288 160,288 Z" fill={u("body")} />
        <path d="M62,268 C58,246 74,228 98,226 C120,224 140,236 146,256 C150,274 142,292 126,300 C114,306 98,308 84,304 C70,300 64,288 62,268 Z" fill={u("body")} {...rim(c)} />
        <path d="M50,281 C50,267 62,259 76,260 C90,262 96,275 94,289 C91,301 76,307 64,303 C55,299 50,291 50,281 Z" fill={p.belly} />
        <path d="M76,260 C88,263 95,274 94,287" fill="none" stroke={p.bodyDark} strokeOpacity="0.2" strokeWidth="2" />
        <ellipse cx="59" cy="279" rx="2.6" ry="2" fill={p.bodyDark} />
        <ellipse cx="70" cy="283" rx="2.6" ry="2" fill={p.bodyDark} />
        <path d="M58,296 C66,301 79,300 87,295" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="120" cy="282" rx="9" ry="5" fill={p.accent} opacity="0.18" />
        <Spec x={96} y={236} rx={20} ry={6} o={0.24} />
        <path d="M88,248 C96,244 106,244 112,250" fill="none" stroke={p.bodyDark} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <Eye c={c} x={100} y={258} r={7} kind="lidded" />
        <Gem c={c} x={118} y={238} s={0.58} />
        <g className="sl-sway-slow" style={{ transformOrigin: "108px 228px" }}>{antler(0, 0, false)}</g>
      </g>
    );
  },
};

/** Driftfin — long, legless eel with translucent sail fins. */
export const driftfin: Renderer = {
  floating: true,
  fit: 0.94,
  shadow: 120,
  halo: [70, 132, 26],
  render: (c) => {
    const { p, u, g } = c;
    const sail = 0.6 + 0.4 * g;
    return (
      <g transform="translate(0 18)">
        {/* sails & fins behind the body */}
        <g className="sl-sway-slow" style={{ transformOrigin: "150px 170px" }}>
          <g transform={`translate(150 170) scale(1 ${sail}) translate(-150 -170)`}>
            <path d="M104,168 C104,118 140,92 172,112 C184,122 192,146 198,180 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
            <path d="M118,160 L128,112 M140,164 L152,104 M162,170 L170,114 M180,176 L186,128" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.2" />
          </g>
        </g>
        <g transform={`translate(280 190) scale(1 ${sail}) translate(-280 -190)`}>
          <path d="M246,186 C252,148 286,136 306,158 C314,170 318,192 322,222 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
          <path d="M262,186 L272,150 M282,194 L292,148 M300,206 L306,160" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.2" />
        </g>
        <path d="M178,224 C176,252 196,272 220,270 C212,256 212,244 216,232 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
        <g className="sl-sway" style={{ transformOrigin: "374px 224px" }}>
          <path d="M372,224 C380,196 398,186 398,204 C394,214 390,220 388,224 C392,230 398,242 398,252 C394,264 380,254 372,226 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        </g>
        {/* body */}
        <path
          d="M96,168 C138,126 188,206 234,188 C282,170 306,236 352,232 C364,231 372,226 380,220 L382,228 C374,240 364,250 350,252 C300,258 280,212 234,232 C186,252 136,178 98,212 Z"
          fill={u("body")}
          {...rim(c)}
        />
        <path d="M100,206 C140,172 186,244 234,226 C282,208 304,250 350,246" fill="none" stroke={p.belly} strokeWidth="5" strokeOpacity="0.55" strokeLinecap="round" />
        <path d="M100,178 C140,140 186,212 234,196 C282,180 304,240 350,236" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" />
        <g opacity={c.mark}>
          <Dots c={c} r={2.2} pts={[[124, 184], [152, 178], [180, 196], [208, 206], [238, 206], [266, 212], [294, 228], [322, 240], [348, 240]]} />
        </g>
        {/* pectoral fin */}
        <path d="M100,206 C94,232 106,252 132,258 C124,242 124,226 128,212 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        {/* head */}
        <path d="M96,172 C92,146 104,128 118,122 C114,142 114,160 108,178 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        <path d="M92,170 C104,166 116,170 124,180 L122,204 C112,210 100,212 92,210 Z" fill={p.body} />
        <path d="M102,170 C80,158 52,158 34,174 C26,182 28,192 38,196 C56,204 84,210 104,212 Z" fill={u("body")} {...rim(c)} />
        <path d="M96,176 C102,186 102,198 96,208" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M36,194 C54,202 82,208 102,210 L102,200 C80,200 58,196 40,188 Z" fill={p.belly} opacity="0.85" />
        <Spec x={66} y={168} rx={20} ry={5} rot={-8} o={0.3} />
        <path d="M42,196 C40,212 46,224 56,230" fill="none" stroke={p.accent} strokeWidth="2" strokeLinecap="round" className="sl-sway" style={{ transformOrigin: "42px 196px" }} />
        <Eye c={c} x={64} y={180} r={6.5} kind="round" />
        <Gem c={c} x={88} y={172} s={0.5} />
      </g>
    );
  },
};

/** Pallow — a floating pearl orb ringed by layered feathers, one ancient eye. */
export const pallow: Renderer = {
  floating: true,
  shadow: 70,
  halo: [200, 128, 30],
  render: (c) => {
    const { p, u, g } = c;
    // Each frond varies a little in length, width, angle and taper, so the rings read as feathers rather than identical spikes.
    const ring = (n: number, len: number, w: number, start: number, fill: string, from = 40) =>
      Array.from({ length: n }).map((_, i) => {
        const l = round(len * (0.84 + 0.16 * Math.sin(i * 2.4 + start)));
        const ww = round(w * (0.85 + 0.15 * Math.cos(i * 1.7)));
        const a = round(start + (i * 360) / n + 3 * Math.sin(i * 3.1));
        return <path key={i} d={blade(l, ww, i % 2 ? 0.72 : 0.84)} transform={`translate(200 200) rotate(${a}) translate(${from} 0)`} fill={fill} stroke={p.bodyDark} strokeOpacity="0.2" />;
      });
    const tl = 70 + 50 * g;
    return (
      <g>
        {/* hanging tassels */}
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 236px" }}>
          {[
            [76, tl * 0.85],
            [90, tl],
            [104, tl * 0.85],
          ].map(([a, l]) => {
            const [ex, ey] = polar(200, 236, l * 0.86, a);
            return (
              <g key={a}>
                <path d={blade(l, 8, 0.9)} transform={`translate(200 236) rotate(${a})`} fill={u("feather")} />
                <circle cx={ex} cy={ey} r="4.5" fill={p.accent} filter={u("glow")} />
              </g>
            );
          })}
        </g>
        <g className="sl-spin-slow" style={{ transformOrigin: "200px 200px" }} opacity="0.85">
          {ring(14, 60 + 70 * g, 13, -90 + 12.8, u("feather"), 36)}
        </g>
        <g className="sl-spin-rev" style={{ transformOrigin: "200px 200px" }}>
          {ring(10, 44 + 52 * g, 16, -90, u("wing"), 38)}
        </g>
        {ring(8, 30 + 40 * g, 13, -90 + 22.5, u("feather"), 42)}
        {/* orb */}
        <circle cx="200" cy="200" r="50" fill={u("body")} {...rim(c)} />
        <circle cx="200" cy="200" r="50" fill={u("shade")} />
        <path d="M160,222 C176,244 224,244 240,222 C228,236 172,236 160,222 Z" fill={p.belly} opacity="0.7" />
        <Spec x={182} y={176} rx={18} ry={9} o={0.45} />
        <path d="M184,190 C192,184 208,184 216,190" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Eye c={c} x={200} y={206} r={11} kind="round" />
        <path d="M194,224 L192,234 M206,224 L208,234" stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" opacity={c.mark} />
        <Gem c={c} x={200} y={168} s={0.75} />
      </g>
    );
  },
};

/** Glimmeray — very wide, flat manta seen from above, long whip tail. */
export const glimmeray: Renderer = {
  floating: true,
  shadow: 150,
  halo: [200, 112, 30],
  render: (c) => {
    const { p, u, g } = c;
    const spots: [number, number][] = [
      [104, 212], [128, 196], [150, 216], [88, 226], [134, 236], [164, 196], [116, 222], [60, 222],
    ];
    const tail = 0.6 + 0.4 * g;
    return (
      <g>
        <g transform={`translate(200 270) scale(1 ${tail}) translate(-200 -270)`} className="sl-sway-slow" style={{ transformOrigin: "200px 270px" }}>
          <path d="M200,266 C206,306 240,326 228,366 C224,380 214,388 204,394" fill="none" stroke={p.bodyDark} strokeWidth="7" strokeLinecap="round" />
          <path d="M200,266 C206,306 240,326 228,366 C224,380 214,388 204,394" fill="none" stroke={p.body} strokeWidth="4" strokeLinecap="round" />
          <circle cx="204" cy="394" r="4" fill={p.accent} filter={u("glow")} />
        </g>
        <g className="sl-glide" style={{ transformOrigin: "200px 215px" }}>
          <path
            d="M200,150 C260,150 330,180 392,232 C350,240 312,250 272,268 C250,262 225,262 200,272 C175,262 150,262 128,268 C88,250 50,240 8,232 C70,180 140,150 200,150 Z"
            fill={u("body")}
            {...rim(c)}
          />
          <path d="M392,232 C350,240 312,250 272,268 C250,262 225,262 200,272 C175,262 150,262 128,268 C88,250 50,240 8,232" fill="none" stroke={p.wingEdge} strokeWidth="3" strokeOpacity="0.7" />
          <path d="M200,160 C262,160 324,188 370,224 M200,160 C138,160 76,188 30,224" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="3" />
          <g opacity={c.mark} fill={p.belly}>
            {spots.map(([x, y]) => (
              <g key={`${x}${y}`}>
                <circle cx={x} cy={y} r="3.6" opacity="0.8" />
                <circle cx={400 - x} cy={y} r="3.6" opacity="0.8" />
              </g>
            ))}
          </g>
        </g>
        {/* central ridge */}
        <ellipse cx="200" cy="214" rx="34" ry="56" fill={u("body")} {...rim(c, 1)} />
        <ellipse cx="200" cy="214" rx="34" ry="56" fill={u("shade")} />
        <Spec x={192} y={186} rx={10} ry={20} rot={0} o={0.3} />
        <ellipse cx="186" cy="184" rx="3" ry="5" fill={p.bodyDark} opacity="0.7" />
        <ellipse cx="214" cy="184" rx="3" ry="5" fill={p.bodyDark} opacity="0.7" />
        {/* cephalic lobes */}
        <path d="M186,156 C172,146 168,128 178,114 C184,130 192,142 198,154 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M186,156 C172,146 168,128 178,114 C184,130 192,142 198,154 Z" transform={MIRROR} fill={u("body")} {...rim(c, 1)} />
        <Eye c={c} x={174} y={164} r={5} kind="round" />
        <Eye c={c} x={226} y={164} r={5} kind="round" />
        <Gem c={c} x={200} y={216} s={0.75} />
      </g>
    );
  },
};

/** Sproutwyrm — segmented, arching inchworm with root legs and a bud-hood head. */
export const sproutwyrm: Renderer = {
  shadow: 130,
  halo: [318, 200, 30],
  render: (c) => {
    const { p, u, g } = c;
    const segs: [number, number, number][] = [
      [72, 332, 18], [92, 312, 22], [110, 284, 25], [130, 254, 27], [156, 228, 28], [186, 212, 29],
      [218, 210, 29], [246, 224, 28], [266, 252, 27], [280, 284, 26], [292, 314, 25],
    ];
    const grounded = [0, 1, 9, 10];
    return (
      <g>
        {/* root legs */}
        {grounded.map((i) => {
          const [x, y, r] = segs[i];
          return (
            <g key={i} fill="none" stroke={p.horn} strokeWidth="3" strokeLinecap="round">
              <path d={`M${x - 6},${y + r - 4} C${x - 8},${y + r + 6} ${x - 14},350 ${x - 20},354`} />
              <path d={`M${x + 4},${y + r - 3} C${x + 4},${y + r + 8} ${x + 8},350 ${x + 14},354`} />
            </g>
          );
        })}
        {segs.map(([x, y, r], i) => (
          // Lifted segments ripple in sequence; the planted ones stay put.
          <g key={i} className={grounded.includes(i) ? undefined : "sl-undulate"} style={{ animationDelay: `${i * 0.15}s` }}>
            <circle cx={x} cy={y} r={r} fill={u("body")} {...rim(c)} />
            <path d={`M${x - r * 0.55},${y - r * 0.8} C${x - r * 0.2},${y - r * 0.2} ${x - r * 0.2},${y + r * 0.3} ${x - r * 0.5},${y + r * 0.85}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="2" />
            <ellipse cx={x - r * 0.25} cy={y - r * 0.45} rx={r * 0.35} ry={r * 0.18} fill="#fff" opacity="0.25" />
            {i % 3 === 1 && <circle cx={x + r * 0.2} cy={y + r * 0.2} r={r * 0.16} fill={p.bodyLight} opacity={0.5 * c.mark} />}
          </g>
        ))}
        {/* sprouting buds along the arch */}
        {[3, 5, 7].map((i) => {
          const [x, y, r] = segs[i];
          const h = 10 + 18 * g;
          return (
            <g key={i} className="sl-undulate" style={{ animationDelay: `${i * 0.15}s` }}>
              <g transform={`translate(${x} ${y - r + 2})`}>
                <path d={`M0,0 C-2,${-h * 0.5} 2,${-h * 0.8} 0,${-h}`} stroke={p.wing} strokeWidth="2.5" fill="none" />
                <path d={blade(12 * g + 4, 4)} transform={`translate(0 ${-h * 0.55}) rotate(-150)`} fill={p.wing} />
                <path d={blade(12 * g + 4, 4)} transform={`translate(0 ${-h * 0.45}) rotate(-30)`} fill={p.wing} />
                <circle cy={-h} r={3 + 2 * g} fill={p.accent} filter={u("glow")} />
              </g>
            </g>
          );
        })}
        {/* bud-hood head */}
        <g className="sl-sway" style={{ transformOrigin: "300px 300px" }}>
          {[-150, -120, -90, -60, -30].map((a, i) => (
            <path key={a} d={blade(34 + 12 * g + (i === 2 ? 8 : 0), 15)} transform={`translate(318 276) rotate(${a})`} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.35" />
          ))}
          <circle cx="320" cy="282" r="30" fill={u("body")} {...rim(c)} />
          <path d="M300,294 C310,306 334,308 346,298 C340,312 312,314 300,294 Z" fill={p.belly} opacity="0.75" />
          <Spec x={312} y={266} rx={12} ry={6} o={0.3} />
          <Eye c={c} x={332} y={280} r={6} kind="round" />
          <path d="M340,298 C344,300 348,300 350,296" fill="none" stroke={p.bodyDark} strokeWidth="1.6" strokeLinecap="round" />
          <Gem c={c} x={318} y={252} s={0.55} />
        </g>
      </g>
    );
  },
};

/** Frostkit — a sleek crystal fox: soft frosted coat, ice spines and a thick crystal tail. */
export const frostkit: Renderer = {
  shadow: 130,
  fit: 1.08,
  halo: [88, 150, 28],
  render: (c) => {
    const { p, u, g } = c;
    const spines: [number, number, number][] = [
      [178, 236, 22],
      [204, 232, 32],
      [230, 232, 26],
      [256, 236, 34],
      [280, 242, 22],
    ];
    const leg = (x: number, near: boolean, back: boolean) => (
      <g key={`${x}${near}`}>
        {back && <ellipse cx={x + 4} cy="284" rx="26" ry="24" fill={near ? u("body") : p.bodyDark} {...(near ? rim(c) : {})} />}
        <path
          d={`M${x - 8},${back ? 292 : 290} C${x - 10},312 ${x - 11},330 ${x - 11},343 C${x - 15},346 ${x - 14},352 ${x - 7},352 L${x + 7},352 C${x + 12},352 ${x + 12},347 ${x + 7},344 C${x + 7},330 ${x + 9},312 ${x + 10},${back ? 292 : 290} Z`}
          fill={near ? u("body") : p.bodyDark}
          {...(near ? rim(c, 1) : {})}
        />
        {near && <path d={`M${x - 12},346 L${x + 9},346 L${x + 6},352 L${x - 9},352 Z`} fill={p.accent} opacity="0.65" />}
      </g>
    );
    return (
      <g>
        {leg(192, false, false)}
        {leg(292, false, true)}
        {/* crystal tail: soft root turning to faceted ice */}
        <g className="sl-sway-slow" style={{ transformOrigin: "300px 270px" }}>
          <path d="M296,258 C326,250 352,226 364,192 C376,212 374,244 356,266 C342,284 320,294 302,292 Z" fill={u("glass")} {...rim(c)} />
          <path d="M364,192 L344,246 L302,292 M356,266 L344,246 M330,252 L344,246" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.1" fill="none" />
          <path d="M364,192 C370,214 368,236 356,256 L344,246 Z" fill="#fff" opacity="0.18" className="sl-shimmer-facet" />
          <path d="M296,258 C306,256 316,254 326,250 C318,266 310,280 302,292 C298,280 296,270 296,258 Z" fill={u("body")} />
        </g>
        {/* ice spines */}
        {spines.map(([x, y, h], i) => {
          const H = h * (0.55 + 0.45 * g);
          return (
            <g key={x}>
              <path d={`M${x - 9},${y + 4} C${x - 6},${y - H * 0.5} ${x + 2},${y - H * 0.9} ${x + 8},${y - H} C${x + 8},${y - H * 0.6} ${x + 10},${y - H * 0.2} ${x + 11},${y + 4} Z`} fill={u("glass")} stroke={p.bodyDark} strokeOpacity="0.3" />
              <path d={`M${x - 5},${y} C${x - 2},${y - H * 0.5} ${x + 3},${y - H * 0.8} ${x + 7},${y - H * 0.95}`} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.1" className="sl-shimmer-facet" style={{ animationDelay: `${i * 0.25}s` }} />
            </g>
          );
        })}
        {/* sleek body */}
        <path d="M118,272 C120,246 150,232 192,232 C236,232 270,230 296,244 C316,256 318,282 304,298 C292,310 262,314 236,312 C206,310 172,312 150,306 C130,300 116,290 118,272 Z" fill={u("body")} {...rim(c)} />
        <path d="M150,300 C190,308 250,310 296,298 C284,308 262,312 236,312 C206,310 172,312 150,306 Z" fill={p.bodyDark} opacity="0.12" />
        {/* crystal plating over the coat */}
        <g opacity={0.55 + 0.45 * c.mark}>
          <path d="M196,238 L230,236 L216,262 Z" fill={u("glass")} stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
          <path d="M232,238 L266,240 L246,266 Z" fill={u("glass")} stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
          <path d="M216,262 L246,266 L230,286 Z" fill={u("glass")} stroke="#fff" strokeOpacity="0.25" strokeWidth="0.8" opacity="0.8" />
          <path d="M196,238 L230,236 L216,262 Z" fill="#fff" opacity="0.2" className="sl-shimmer-facet" style={{ animationDelay: "0.4s" }} />
        </g>
        <Spec x={214} y={242} rx={50} ry={6} rot={-2} o={0.3} />
        {/* chest ruff */}
        <path d="M122,268 C112,286 118,308 140,318 C142,310 148,302 152,292 C146,286 140,276 138,266 Z" fill={p.belly} />
        <path d="M126,286 L132,292 M128,298 L136,302" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="1.2" />
        {leg(150, true, false)}
        {leg(282, true, true)}
        {/* head */}
        <g transform={`translate(112 262) scale(${0.86 + 0.14 * g}) translate(-112 -262)`}>
          <path d={`M110,232 C106,${212 - 10 * g} 110,${192 - 14 * g} 118,${176 - 16 * g} C126,${194 - 12 * g} 130,214 130,234 Z`} fill={p.bodyDark} opacity="0.85" />
          <path d={`M96,236 C90,${214 - 10 * g} 92,${192 - 14 * g} 100,${174 - 16 * g} C110,${192 - 12 * g} 116,212 118,232 Z`} fill={u("glass")} {...rim(c, 1)} />
          <path d={`M100,${178 - 16 * g} C104,${196 - 12 * g} 108,212 110,228`} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.1" />
          <path d="M138,266 C130,246 112,234 92,232 C72,230 52,238 30,248 C25,251 27,257 33,258 C52,262 72,272 92,282 C110,290 132,286 138,266 Z" fill={u("body")} {...rim(c)} />
          <path d="M30,248 C42,252 56,260 70,268 C60,270 46,264 33,258 C27,257 25,251 30,248 Z" fill={p.belly} />
          <path d="M112,276 C120,284 128,286 136,282 C132,292 120,294 108,290 Z" fill={p.belly} opacity="0.9" />
          <Spec x={92} y={240} rx={20} ry={4} rot={8} o={0.4} />
          <ellipse cx="30" cy="251" rx="4" ry="3" fill={p.bodyDark} />
          <path d="M66,244 C72,238 82,236 90,240" fill="none" stroke={p.bodyDark} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
          <Eye c={c} x={78} y={248} r={6} kind="almond" angle={-10} flip />
        </g>
        <Gem c={c} x={130} y={290} s={0.5} />
      </g>
    );
  },
};
