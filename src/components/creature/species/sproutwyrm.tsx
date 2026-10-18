import { blade, byStage, Eye, Gem, rim, Spec, type Ctx, type Renderer } from "../kit";

/** Sproutwyrm — segmented, arching inchworm with root legs and a bud-hood head. */
/** Evolved: the mature form. */
const evolved: Renderer = {
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

/** One bark-ringed segment with its groove and highlight. */
function Segment({ c, x, y, r, ring = true }: { c: Ctx; x: number; y: number; r: number; ring?: boolean }) {
  const { p, u } = c;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={u("body")} {...rim(c)} />
      {ring && <path d={`M${x - r * 0.55},${y - r * 0.8} C${x - r * 0.2},${y - r * 0.2} ${x - r * 0.2},${y + r * 0.3} ${x - r * 0.5},${y + r * 0.85}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="2" />}
      <ellipse cx={x - r * 0.25} cy={y - r * 0.45} rx={r * 0.35} ry={r * 0.18} fill="#fff" opacity="0.25" />
    </g>
  );
}

/** Two little root feet under a grounded segment. */
function Roots({ c, x, y, r, w = 3 }: { c: Ctx; x: number; y: number; r: number; w?: number }) {
  return (
    <g fill="none" stroke={c.p.horn} strokeWidth={w} strokeLinecap="round">
      <path d={`M${x - 5},${y + r - 4} C${x - 7},${y + r + 4} ${x - 11},352 ${x - 16},355`} />
      <path d={`M${x + 4},${y + r - 3} C${x + 4},${y + r + 6} ${x + 7},352 ${x + 12},355`} />
    </g>
  );
}

/** Eggling: a short plump grub — four segments, a big head and one green shoot. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const segs: [number, number, number][] = [
    [130, 330, 20],
    [160, 322, 26],
    [194, 316, 30],
    [228, 314, 32],
  ];
  return (
    <g>
      {segs.map(([x, y, r], i) => i % 2 === 0 && <Roots key={i} c={c} x={x} y={y} r={r} w={2.6} />)}
      {segs.map(([x, y, r], i) => (
        <g key={i} className="sl-undulate" style={{ animationDelay: `${i * 0.2}s` }}>
          <Segment c={c} x={x} y={y} r={r} />
        </g>
      ))}
      <Roots c={c} x={262} y={300} r={44} w={3} />
      <circle cx="268" cy="296" r="46" fill={u("body")} {...rim(c)} />
      <path d="M236,318 C250,336 290,340 308,322 C300,342 254,346 236,318 Z" fill={p.belly} opacity="0.75" />
      <Spec x={254} y={268} rx={20} ry={8} o={0.3} />
      <ellipse cx="300" cy="312" rx="8" ry="5" fill={p.accent} opacity="0.3" />
      <Eye c={c} x={286} y={292} r={11} kind="round" />
      <path d="M298,318 C302,321 307,321 310,317" fill="none" stroke={p.bodyDark} strokeWidth="1.8" strokeLinecap="round" />
      {/* its single shoot */}
      <g className="sl-sway" style={{ transformOrigin: "262px 252px" }}>
        <path d="M262,252 C258,236 262,222 270,212" fill="none" stroke={p.wing} strokeWidth="3.2" strokeLinecap="round" />
        <path d={blade(20, 7)} transform="translate(268 216) rotate(-160)" fill={u("wing")} {...rim(c, 1)} />
        <path d={blade(18, 6)} transform="translate(266 220) rotate(-20)" fill={u("wing")} {...rim(c, 1)} />
        <circle cx="270" cy="210" r="3.5" fill={p.accent} filter={u("glow")} />
      </g>
      <Gem c={c} x={244} y={262} s={0.45} />
    </g>
  );
}

/** Hatchling: a longer worm in a low arch, swelling buds and a petal hood just forming. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const segs: [number, number, number][] = [
    [80, 334, 16],
    [104, 322, 20],
    [130, 306, 23],
    [160, 294, 25],
    [192, 290, 26],
    [222, 296, 25],
    [246, 312, 24],
  ];
  const grounded = [0, 1, 6];
  return (
    <g>
      {grounded.map((i) => <Roots key={i} c={c} x={segs[i][0]} y={segs[i][1]} r={segs[i][2]} />)}
      {segs.map(([x, y, r], i) => (
        <g key={i} className={grounded.includes(i) ? undefined : "sl-undulate"} style={{ animationDelay: `${i * 0.15}s` }}>
          <Segment c={c} x={x} y={y} r={r} />
        </g>
      ))}
      {[3, 5].map((i) => {
        const [x, y, r] = segs[i];
        return (
          <g key={i} className="sl-undulate" style={{ animationDelay: `${i * 0.15}s` }}>
            <g transform={`translate(${x} ${y - r + 2})`}>
              <path d="M0,0 C-2,-6 2,-10 0,-14" stroke={p.wing} strokeWidth="2.4" fill="none" />
              <path d={blade(10, 3.5)} transform="translate(0 -7) rotate(-150)" fill={p.wing} />
              <circle cy={-15} r="3.5" fill={p.accent} filter={u("glow")} />
            </g>
          </g>
        );
      })}
      {/* head with three young petals budding behind it */}
      <g className="sl-sway" style={{ transformOrigin: "270px 300px" }}>
        {[-130, -95, -60].map((a, i) => (
          <path key={a} d={blade(26 + (i === 1 ? 6 : 0), 11)} transform={`translate(282 282) rotate(${a})`} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.35" />
        ))}
        <circle cx="286" cy="300" r="34" fill={u("body")} {...rim(c)} />
        <path d="M262,314 C274,328 302,330 316,318 C308,334 276,336 262,314 Z" fill={p.belly} opacity="0.75" />
        <Spec x={276} y={280} rx={14} ry={6} o={0.3} />
        <Eye c={c} x={300} y={296} r={8.5} kind="round" />
        <path d="M310,316 C314,318 318,318 320,314" fill="none" stroke={p.bodyDark} strokeWidth="1.6" strokeLinecap="round" />
        <Gem c={c} x={270} y={276} s={0.48} />
      </g>
    </g>
  );
}

/** Ascended: a great leafy wyrm rearing up, branching antler-growth and an open blossom hood. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const segs: [number, number, number][] = [
    [52, 340, 13],
    [76, 334, 17],
    [104, 326, 21],
    [136, 318, 24],
    [170, 314, 26],
    [204, 310, 27],
    [234, 298, 28],
    [258, 276, 28],
    [274, 248, 27],
    [282, 218, 26],
    [286, 188, 25],
  ];
  const grounded = [1, 3, 5];
  // Paired leaves along the back, each pointing up and back toward the tail.
  const leaves: [number, number, number, number][] = [
    [104, 306, -150, 30],
    [136, 296, -140, 36],
    [170, 290, -130, 40],
    [204, 284, -125, 42],
    [274, 226, -178, 34],
    [282, 196, -182, 30],
  ];
  const branch = "M286,124 C282,104 270,90 254,80 M276,96 C272,80 274,66 282,54 M296,120 C304,100 318,88 336,82 M314,92 C318,78 316,66 308,56";
  return (
    <g>
      {grounded.map((i) => <Roots key={i} c={c} x={segs[i][0]} y={segs[i][1]} r={segs[i][2]} w={3.6} />)}
      {/* great leaf-wings rising from the shoulders */}
      {(
        [
          [-112, 0.62],
          [-138, 1],
        ] as const
      ).map(([a, o], k) => (
        <g key={a} className="sl-sway-slow" style={{ transformOrigin: "244px 262px", animationDelay: `${k * 0.4}s` }}>
          <g transform={`translate(244 262) rotate(${a})`} opacity={o}>
            {[-16, 0, 16].map((d, j) => (
              <path key={d} d={blade(132 - j * 26, 30 - j * 5, 0.7)} transform={`rotate(${d})`} fill={k === 0 ? p.bodyDark : u("wing")} stroke={k === 0 ? p.bodyDark : p.wingEdge} strokeOpacity={k === 0 ? 0.35 : 0.8} strokeWidth="1.3" />
            ))}
            {k === 1 && <path d="M4,0 C44,-2 86,-2 126,0 M40,-1 C54,-12 66,-18 80,-21 M70,-1 C84,10 96,15 110,17" fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.2" />}
          </g>
        </g>
      ))}
      {/* leaves on the far side */}
      {leaves.map(([x, y, a, l], i) => (
        <path key={`f${i}`} d={blade(l, l * 0.36)} transform={`translate(${x + 6} ${y + 2}) rotate(${a + 25})`} fill={p.bodyDark} opacity="0.7" />
      ))}
      {segs.map(([x, y, r], i) => (
        <g key={i} className={grounded.includes(i) || i < 1 ? undefined : "sl-undulate"} style={{ animationDelay: `${i * 0.12}s` }}>
          <Segment c={c} x={x} y={y} r={r} />
          {i % 2 === 0 && i > 1 && <circle cx={x + r * 0.25} cy={y + r * 0.25} r={r * 0.14} fill={p.bodyLight} opacity="0.55" />}
        </g>
      ))}
      {/* near leaves with veins */}
      {leaves.map(([x, y, a, l], i) => (
        <g key={`n${i}`} className="sl-sway" style={{ animationDelay: `${i * 0.2}s`, transformOrigin: `${x}px ${y}px` }}>
          <g transform={`translate(${x} ${y}) rotate(${a})`}>
            <path d={blade(l, l * 0.38, 0.75)} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.3" />
            <path d={`M3,0 C${l * 0.4},1 ${l * 0.7},1 ${l * 0.95},0`} fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1" />
          </g>
        </g>
      ))}
      {/* glowing buds strung along the arch */}
      {[2, 4, 6].map((i) => (
        <circle key={i} cx={segs[i][0] + 4} cy={segs[i][1] - segs[i][2] - 4} r="3.6" fill={p.accent} filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      {/* raised head */}
      <g className="sl-sway-slow" style={{ transformOrigin: "288px 180px" }}>
        {/* branching antler-growth */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={branch} stroke={p.bodyDark} strokeWidth="8" />
          <path d={branch} stroke={p.horn} strokeWidth="5" />
          <path d="M286,124 C282,108 272,94 258,84" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.3" />
        </g>
        {(
          [
            [254, 80, -150],
            [282, 54, -95],
            [336, 82, -20],
            [308, 56, -110],
          ] as const
        ).map(([x, y, a]) => (
          <g key={x}>
            <path d={blade(16, 6)} transform={`translate(${x} ${y}) rotate(${a})`} fill={u("wing")} {...rim(c, 1)} />
            <circle cx={x} cy={y} r="4.2" fill={p.accent} filter={u("glow")} className="sl-twinkle" />
          </g>
        ))}
        {/* open blossom hood */}
        {[-185, -150, -115, -80, -45, -10, 25].map((a, i) => (
          <g key={a} transform={`translate(286 160) rotate(${a})`}>
            <path d={blade(62 + (i % 2) * 10, 24)} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.35" />
            <path d={blade(44, 11)} transform="translate(10 0)" fill={p.wingEdge} opacity="0.5" />
            <circle cx={66 + (i % 2) * 10} cy="0" r="2.6" fill={p.accent} filter={u("glow")} />
          </g>
        ))}
        <circle cx="290" cy="160" r="36" fill={u("body")} {...rim(c)} />
        <path d="M264,176 C278,192 310,194 324,180 C316,198 280,200 264,176 Z" fill={p.belly} opacity="0.75" />
        <Spec x={278} y={140} rx={15} ry={6} o={0.3} />
        <path d="M296,146 C302,142 312,142 318,148" fill="none" stroke={p.bodyDark} strokeWidth="2.6" strokeLinecap="round" opacity="0.65" />
        <Eye c={c} x={306} y={158} r={8} kind="almond" flip angle={-6} />
        <path d="M316,178 C320,180 324,180 326,176" fill="none" stroke={p.bodyDark} strokeWidth="1.6" strokeLinecap="round" />
        <Gem c={c} x={282} y={128} s={0.6} />
      </g>
    </g>
  );
}

export const sproutwyrm: Renderer = {
  ...evolved,
  halo: [300, 22, 22],
  stageFit: [1.2, 1.12, 1, 0.98],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
