import { blade, Dots, Eye, Gem, MIRROR, polar, rim, Spec, type Renderer } from "../kit";

/* Common: one clear idea per species, simple but distinct silhouettes. */

/** Mossling — low, broad, leaf-shingled forest beast with branching antlers. */
export const mossling: Renderer = {
  shadow: 140,
  fit: 1.1,
  halo: [112, 128, 34],
  render: (c) => {
    const { p, u, g } = c;
    const leafRows: [number, number, number][][] = [
      [130, 270, 96], [168, 274, 92], [206, 276, 90], [244, 276, 88], [282, 272, 84], [316, 266, 80],
      [150, 242, 100], [190, 238, 94], [230, 236, 90], [270, 238, 86], [306, 244, 80],
      [176, 212, 104], [216, 206, 94], [256, 208, 86], [290, 220, 80],
    ].reduce<[number, number, number][][]>((rows, l, i) => {
      const r = i < 6 ? 0 : i < 11 ? 1 : 2;
      (rows[r] ??= []).push(l as [number, number, number]);
      return rows;
    }, []);
    const antler = (dx: number, dy: number, shade: boolean) => (
      <g transform={`translate(${108 + dx} ${230 + dy}) scale(${g}) translate(${-108} ${-230})`} opacity={shade ? 0.75 : 1}>
        <g fill="none" strokeLinecap="round">
          {["M108,230 C102,202 110,176 128,156", "M106,208 C94,200 88,188 88,174", "M114,186 C124,180 134,180 142,172", "M122,166 C118,156 120,146 128,138"].map((d) => (
            <g key={d}>
              <path d={d} stroke={p.bodyDark} strokeWidth="9" />
              <path d={d} stroke={shade ? p.bodyDark : p.horn} strokeWidth="5.5" />
            </g>
          ))}
        </g>
        {!shade &&
          ([
            [88, 174, -110],
            [142, 172, -20],
            [128, 138, -70],
            [128, 156, -40],
          ] as const).map(([x, y, a]) => <path key={`${x}${y}`} d={blade(14, 5)} transform={`translate(${x} ${y}) rotate(${a})`} fill={p.accent} opacity="0.9" />)}
      </g>
    );
    return (
      <g>
        {/* far legs */}
        {[186, 300].map((x) => (
          <path key={x} d={`M${x - 14},300 L${x - 14},346 C${x - 14},352 ${x + 14},352 ${x + 14},346 L${x + 14},300 Z`} fill={p.bodyDark} />
        ))}
        {/* leafy tail */}
        <path d={blade(40 * g + 10, 11)} transform="translate(330 290) rotate(-24)" fill={u("wing")} {...rim(c, 1)} />
        {/* domed body */}
        <path d="M112,305 C110,236 168,196 236,196 C304,196 340,240 338,302 C336,322 318,332 296,332 L150,332 C126,332 112,322 112,305 Z" fill={u("body")} {...rim(c)} />
        <path d="M126,318 C170,334 290,334 326,316 L322,328 C290,340 170,340 130,330 Z" fill={p.belly} opacity="0.55" />
        {/* leaf shingles — lower rows first so upper rows overlap */}
        {leafRows.map((row, ri) =>
          row.map(([x, y, a]) => (
            <g key={`${ri}-${x}`} transform={`translate(${x} ${y}) rotate(${a})`}>
              <path d={blade(44, 17)} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.35" />
              <path d="M2,0 L40,0" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.2" />
            </g>
          )),
        )}
        {/* moss tufts */}
        <g opacity={0.5 + c.mark * 0.5}>
          {[
            [214, 198],
            [252, 200],
            [184, 208],
            [288, 214],
          ].map(([x, y]) => (
            <g key={x} fill={p.bodyLight}>
              <circle cx={x} cy={y} r="5" />
              <circle cx={x + 6} cy={y + 2} r="4" />
              <circle cx={x - 5} cy={y + 3} r="3.5" />
            </g>
          ))}
        </g>
        <Spec x={226} y={214} rx={44} ry={9} rot={-6} o={0.18} />
        {/* near legs */}
        {[164, 290].map((x) => (
          <g key={x}>
            <path d={`M${x - 16},298 L${x - 16},346 C${x - 16},354 ${x + 16},354 ${x + 16},346 L${x + 16},298 Z`} fill={u("body")} {...rim(c)} />
            {[-9, 0, 9].map((d) => (
              <ellipse key={d} cx={x + d} cy="350" rx="4" ry="3" fill={p.horn} />
            ))}
            <circle cx={x - 4} cy="318" r="4" fill={p.bodyLight} opacity="0.4" />
          </g>
        ))}
        {/* head */}
        {antler(16, 4, true)}
        <path d={blade(30, 10)} transform="translate(130 240) rotate(-35)" fill={u("wing")} {...rim(c, 1)} />
        <path d="M58,262 C56,238 78,224 104,226 C130,228 146,246 146,268 C146,292 128,306 102,306 C76,306 60,290 58,262 Z" fill={u("body")} {...rim(c)} />
        <path d="M50,278 C50,262 64,256 80,258 C94,262 98,278 94,292 C88,304 66,306 58,298 C52,292 50,286 50,278 Z" fill={p.belly} opacity="0.9" />
        <ellipse cx="60" cy="278" rx="2.6" ry="2" fill={p.bodyDark} />
        <ellipse cx="72" cy="282" rx="2.6" ry="2" fill={p.bodyDark} />
        <path d="M60,297 C68,301 80,300 88,295" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
        <Spec x={98} y={236} rx={18} ry={6} o={0.22} />
        <Eye c={c} x={98} y={258} r={7} kind="lidded" />
        <Gem c={c} x={118} y={238} s={0.6} />
        {antler(0, 0, false)}
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
        <path d="M102,170 C80,158 52,158 34,174 C26,182 28,192 38,196 C56,204 84,210 104,212 Z" fill={u("body")} {...rim(c)} />
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
    const ring = (n: number, len: number, w: number, start: number, fill: string, from = 40) =>
      Array.from({ length: n }).map((_, i) => (
        <path key={i} d={blade(len, w)} transform={`translate(200 200) rotate(${start + (i * 360) / n}) translate(${from} 0)`} fill={fill} stroke={p.bodyDark} strokeOpacity="0.25" />
      ));
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
          <g key={i}>
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
            <g key={i} transform={`translate(${x} ${y - r + 2})`}>
              <path d={`M0,0 C-2,${-h * 0.5} 2,${-h * 0.8} 0,${-h}`} stroke={p.wing} strokeWidth="2.5" fill="none" />
              <path d={blade(12 * g + 4, 4)} transform={`translate(0 ${-h * 0.55}) rotate(-150)`} fill={p.wing} />
              <path d={blade(12 * g + 4, 4)} transform={`translate(0 ${-h * 0.45}) rotate(-30)`} fill={p.wing} />
              <circle cy={-h} r={3 + 2 * g} fill={p.accent} filter={u("glow")} />
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

/** Frostkit — compact, faceted crystal fox with ice spines and a thick crystal tail. */
export const frostkit: Renderer = {
  shadow: 130,
  fit: 1.08,
  halo: [86, 150, 30],
  render: (c) => {
    const { p, u, g } = c;
    const spine = (x: number, h: number) => `M${x - 9},238 L${x + 4},${238 - h} L${x + 10},236 Z`;
    return (
      <g>
        {/* far legs */}
        <path d="M182,300 L196,300 L194,350 L180,350 Z M286,296 L300,296 L298,350 L284,350 Z" fill={p.bodyDark} />
        {/* crystal tail */}
        <g className="sl-sway-slow" style={{ transformOrigin: "300px 270px" }}>
          <path d="M298,256 L340,230 L372,190 L384,212 L366,252 L306,294 Z" fill={u("glass")} {...rim(c)} />
          <path d="M340,230 L384,212 M372,190 L352,246 M306,294 L340,230" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
        </g>
        {/* ice spines */}
        {[176, 204, 232, 260].map((x, i) => (
          <path key={x} d={spine(x, (16 + (i % 2) * 10) * g + 6)} fill={u("glass")} stroke={p.bodyDark} strokeOpacity="0.4" />
        ))}
        {/* faceted body */}
        <path d="M118,264 L168,236 L262,234 L306,256 L302,300 L252,314 L160,314 L122,298 Z" fill={u("body")} {...rim(c)} />
        <path d="M168,236 L262,234 L218,272 Z" fill="#fff" opacity="0.28" />
        <path d="M118,264 L168,236 L160,292 Z" fill="#fff" opacity="0.14" />
        <path d="M262,234 L306,256 L268,292 Z" fill={p.bodyDark} opacity="0.18" />
        <path d="M160,314 L218,272 L252,314 Z" fill={p.bodyDark} opacity="0.22" />
        <path d="M218,272 L268,292 L252,314 Z" fill={p.bodyLight} opacity="0.2" />
        <g opacity={c.mark} stroke={p.accent} strokeWidth="1.4" fill="none">
          <path d="M190,250 L204,262 L196,276 M238,248 L246,266" />
        </g>
        {/* near legs */}
        {[
          [148, 294],
          [270, 292],
        ].map(([x, y]) => (
          <g key={x}>
            <path d={`M${x - 10},${y} L${x + 12},${y} L${x + 8},350 L${x - 8},350 Z`} fill={u("body")} {...rim(c)} />
            <path d={`M${x - 10},${y} L${x + 12},${y} L${x},${y + 24} Z`} fill="#fff" opacity="0.2" />
            <path d={`M${x - 10},350 L${x + 10},350 L${x + 6},344 L${x - 6},344 Z`} fill={p.accent} opacity="0.7" />
          </g>
        ))}
        {/* head */}
        <g transform={`translate(110 260) scale(${0.85 + 0.15 * g}) translate(-110 -260)`}>
          <path d={`M98,222 L${90 - 4 * g},${170 - 22 * g} L118,214 Z`} fill={u("glass")} stroke={p.bodyDark} strokeOpacity="0.5" />
          <path d={`M112,222 L${118 + 4 * g},${176 - 22 * g} L130,220 Z`} fill={p.bodyDark} opacity="0.8" />
          <path d="M132,270 L114,222 L84,214 L56,232 L26,252 L58,266 L104,288 Z" fill={u("body")} {...rim(c)} />
          <path d="M114,222 L84,214 L96,244 Z" fill="#fff" opacity="0.3" />
          <path d="M26,252 L58,266 L80,252 L56,232 Z" fill={p.belly} opacity="0.9" />
          <path d="M104,288 L58,266 L96,250 L132,270 Z" fill={p.bodyDark} opacity="0.16" />
          <circle cx="28" cy="251" r="3.4" fill={p.bodyDark} />
          <Eye c={c} x={78} y={238} r={6} kind="almond" angle={-12} flip />
        </g>
        <Gem c={c} x={134} y={286} s={0.55} />
      </g>
    );
  },
};
