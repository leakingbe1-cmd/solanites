import { blade, byStage, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Mossling — low, broad, leaf-shingled forest beast with branching antlers. */
/** Evolved: the mature form. */
const evolved: Renderer = {
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

/** Eggling: a round moss-ball with nub legs and a single first sprout. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <ellipse cx="236" cy="340" rx="13" ry="11" fill={p.bodyDark} />
      <ellipse cx="282" cy="338" rx="13" ry="11" fill={p.bodyDark} />
      <g className="sl-sway" style={{ transformOrigin: "300px 306px" }}>
        <path d={blade(26, 9)} transform="translate(298 306) rotate(-30)" fill={u("wing")} {...rim(c, 1)} />
      </g>
      <path d="M150,306 C150,262 190,240 236,240 C284,240 312,268 312,304 C312,330 290,346 252,346 L206,346 C172,346 150,330 150,306 Z" fill={u("body")} {...rim(c)} />
      <path d="M172,330 C200,342 270,342 298,326 C290,340 272,348 252,348 L206,348 C190,348 178,342 172,330 Z" fill={p.belly} opacity="0.55" />
      {/* soft moss fuzz — no leaves yet */}
      <g fill={p.bodyLight} opacity="0.7">
        {[
          [204, 246, 7],
          [226, 240, 8],
          [250, 242, 7],
          [272, 250, 6],
          [190, 256, 5],
          [290, 262, 5],
        ].map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} />
        ))}
      </g>
      <Spec x={238} y={258} rx={34} ry={7} rot={-4} o={0.2} />
      {[196, 266].map((x) => (
        <g key={x}>
          <path d={`M${x - 15},322 C${x - 16},334 ${x - 14},344 ${x - 10},350 L${x + 10},350 C${x + 14},344 ${x + 16},334 ${x + 15},322 Z`} fill={u("body")} {...rim(c, 1)} />
          {[-6, 0, 6].map((d) => (
            <ellipse key={d} cx={x + d} cy="349" rx="3" ry="2" fill={p.horn} />
          ))}
        </g>
      ))}
      <circle cx="150" cy="282" r="46" fill={u("body")} {...rim(c)} />
      <ellipse cx="118" cy="300" rx="22" ry="16" fill={p.belly} />
      <ellipse cx="108" cy="298" rx="2.2" ry="1.8" fill={p.bodyDark} />
      <ellipse cx="118" cy="301" rx="2.2" ry="1.8" fill={p.bodyDark} />
      <path d="M108,310 C114,314 122,314 128,310" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="172" cy="300" rx="9" ry="5" fill={p.accent} opacity="0.25" />
      <Spec x={144} y={252} rx={22} ry={8} o={0.25} />
      <Eye c={c} x={146} y={276} r={10} kind="round" />
      <g className="sl-sway" style={{ transformOrigin: "162px 238px" }}>
        <path d="M160,240 C158,226 162,214 168,206" fill="none" stroke={p.wing} strokeWidth="3" strokeLinecap="round" />
        <path d={blade(20, 7)} transform="translate(168 208) rotate(-150)" fill={u("wing")} {...rim(c, 1)} />
        <path d={blade(18, 6)} transform="translate(167 210) rotate(-40)" fill={u("wing")} {...rim(c, 1)} />
      </g>
      <Gem c={c} x={170} y={252} s={0.45} />
    </g>
  );
}

/** Hatchling: a small quadruped with its first leaves and two forked twig-antlers. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const leg = (x: number, near: boolean) => (
    <path
      key={`${x}${near}`}
      d={`M${x - 14},300 C${x - 16},318 ${x - 13},334 ${x - 11},342 C${x - 17},344 ${x - 16},351 ${x - 8},351 L${x + 10},351 C${x + 17},351 ${x + 16},344 ${x + 11},342 C${x + 14},332 ${x + 16},316 ${x + 14},300 Z`}
      fill={near ? u("body") : p.bodyDark}
      {...(near ? rim(c, 1) : {})}
    />
  );
  const leaves: [number, number, number][] = [
    [292, 258, 36],
    [268, 244, 24],
    [242, 238, 12],
    [214, 240, 2],
    [188, 250, -10],
  ];
  return (
    <g>
      {leg(198, false)}
      {leg(282, false)}
      <g className="sl-sway" style={{ transformOrigin: "302px 290px" }}>
        <path d={blade(30, 10)} transform="translate(300 290) rotate(-26)" fill={u("wing")} {...rim(c, 1)} />
      </g>
      <path d="M126,300 C124,262 162,236 214,234 C268,232 304,258 306,296 C307,314 296,326 278,328 L150,328 C136,328 127,318 126,300 Z" fill={u("body")} {...rim(c)} />
      <path d="M136,312 C176,326 262,326 300,310 C296,322 286,330 274,332 L152,332 C142,330 138,322 136,312 Z" fill={p.belly} opacity="0.5" />
      {leaves.map(([x, y, a]) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d={blade(32, 13, 0.75)} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.28" />
          <path d="M3,0 C12,1 22,1 30,0" fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1" />
        </g>
      ))}
      <g fill={p.bodyLight} opacity="0.6">
        <circle cx="230" cy="236" r="4" />
        <circle cx="256" cy="240" r="3.5" />
      </g>
      <Spec x={220} y={250} rx={40} ry={6} rot={-4} o={0.16} />
      {leg(166, true)}
      {leg(268, true)}
      {/* forked twigs: the first antlers */}
      {[
        [138, 230, true],
        [120, 228, false],
      ].map(([x, y, back]) => (
        <g key={String(x)} opacity={back ? 0.7 : 1} fill="none" strokeLinecap="round" className="sl-sway-slow" style={{ transformOrigin: `${x}px ${y}px` }}>
          <path d={`M${x},${y} C${(x as number) - 4},${(y as number) - 12} ${(x as number) - 2},${(y as number) - 22} ${(x as number) + 4},${(y as number) - 30} M${(x as number) - 2},${(y as number) - 16} C${(x as number) - 8},${(y as number) - 20} ${(x as number) - 12},${(y as number) - 24} ${(x as number) - 14},${(y as number) - 30}`} stroke={p.bodyDark} strokeWidth="5" />
          <path d={`M${x},${y} C${(x as number) - 4},${(y as number) - 12} ${(x as number) - 2},${(y as number) - 22} ${(x as number) + 4},${(y as number) - 30} M${(x as number) - 2},${(y as number) - 16} C${(x as number) - 8},${(y as number) - 20} ${(x as number) - 12},${(y as number) - 24} ${(x as number) - 14},${(y as number) - 30}`} stroke={back ? p.bodyDark : p.horn} strokeWidth="2.8" />
          {!back && <path d={blade(11, 4)} transform={`translate(${(x as number) + 4} ${(y as number) - 30}) rotate(-60)`} fill={p.accent} />}
          {!back && <path d={blade(10, 4)} transform={`translate(${(x as number) - 14} ${(y as number) - 30}) rotate(-120)`} fill={p.accent} />}
        </g>
      ))}
      <path d={blade(22, 8)} transform="translate(146 240) rotate(-34)" fill={u("wing")} {...rim(c, 1)} />
      <path d="M78,262 C76,240 92,224 114,224 C136,224 152,238 154,258 C156,278 144,294 124,298 C104,302 82,294 78,262 Z" fill={u("body")} {...rim(c)} />
      <path d="M66,277 C66,265 76,259 88,260 C100,262 104,273 102,285 C100,295 88,299 78,296 C70,293 66,287 66,277 Z" fill={p.belly} />
      <ellipse cx="74" cy="276" rx="2.2" ry="1.8" fill={p.bodyDark} />
      <ellipse cx="84" cy="279" rx="2.2" ry="1.8" fill={p.bodyDark} />
      <path d="M74,290 C80,294 90,293 96,289" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <Spec x={114} y={234} rx={16} ry={5} o={0.24} />
      <Eye c={c} x={116} y={256} r={8.5} kind="round" />
      <Gem c={c} x={130} y={240} s={0.5} />
    </g>
  );
}

/** Ascended: an ancient forest guardian with a sapling growing from its mossy back. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const leg = (x: number, near: boolean) => (
    <g key={`${x}${near}`}>
      <path
        d={`M${x - 22},298 C${x - 25},320 ${x - 22},336 ${x - 20},346 L${x + 20},346 C${x + 22},336 ${x + 25},320 ${x + 22},298 Z`}
        fill={near ? u("body") : p.bodyDark}
        {...(near ? rim(c) : {})}
      />
      {/* root-like toes gripping the ground */}
      <path d={`M${x - 20},344 C${x - 28},348 ${x - 34},352 ${x - 40},356 M${x - 6},346 C${x - 8},350 ${x - 10},354 ${x - 12},357 M${x + 8},346 C${x + 10},350 ${x + 14},354 ${x + 18},357 M${x + 20},344 C${x + 28},348 ${x + 34},352 ${x + 40},355`} fill="none" stroke={near ? p.horn : p.bodyDark} strokeWidth="4" strokeLinecap="round" />
      {near && <path d={`M${x - 14},304 C${x - 15},318 ${x - 13},330 ${x - 12},340`} fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.5" />}
    </g>
  );
  const antler = (dx: number, shade: boolean) => (
    <g transform={`translate(${dx} ${shade ? 4 : 0})`} opacity={shade ? 0.65 : 1} fill="none" strokeLinecap="round">
      {[
        ["M110,222 C104,192 112,162 130,136 C140,122 146,106 146,90", 8],
        ["M108,200 C94,190 84,174 82,156 M84,170 C74,166 66,158 62,148", 5],
        ["M118,170 C130,164 142,162 156,152 M140,162 C146,152 154,146 166,142", 5],
        ["M132,134 C124,124 120,112 122,100", 4],
      ].map(([d, w]) => (
        <g key={d as string}>
          <path d={d as string} stroke={p.bodyDark} strokeOpacity="0.85" strokeWidth={(w as number) + 2.5} />
          <path d={d as string} stroke={shade ? p.bodyDark : p.horn} strokeWidth={w as number} />
        </g>
      ))}
      {!shade && (
        <>
          {/* hanging vines and blossoms */}
          <path d="M82,156 C80,170 84,182 80,196 M156,152 C158,166 154,176 158,190" stroke={p.wing} strokeWidth="2" />
          {[
            [146, 90],
            [62, 148],
            [166, 142],
            [122, 100],
          ].map(([x, y]) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-4" rx="2.6" ry="4" fill={p.eye} transform={`rotate(${a})`} />
              ))}
              <circle r="2" fill={p.accent} />
            </g>
          ))}
        </>
      )}
    </g>
  );
  return (
    <g>
      {leg(206, false)}
      {leg(320, false)}
      {/* leaf-fan tail */}
      <g className="sl-sway" style={{ transformOrigin: "352px 288px" }}>
        {[-40, -14, 12].map((a) => (
          <path key={a} d={blade(42, 13)} transform={`translate(350 290) rotate(${a})`} fill={u("wing")} {...rim(c, 1)} />
        ))}
      </g>
      {/* the sapling on its back */}
      <g className="sl-sway-slow" style={{ transformOrigin: "250px 206px" }}>
        <path d="M250,208 C248,186 252,164 262,146 C266,138 268,128 266,116 M258,160 C246,150 238,140 236,128 M262,146 C276,138 284,128 290,118" fill="none" stroke={p.bodyDark} strokeWidth="9" strokeLinecap="round" />
        <path d="M250,208 C248,186 252,164 262,146 C266,138 268,128 266,116 M258,160 C246,150 238,140 236,128 M262,146 C276,138 284,128 290,118" fill="none" stroke={p.horn} strokeWidth="5.5" strokeLinecap="round" />
        {[
          [236, 122, 22],
          [292, 118, 20],
          [264, 102, 27],
        ].map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} fill={u("wing")} {...rim(c, 1)} />
        ))}
        <Spec x={256} y={88} rx={16} ry={6} o={0.25} />
        {[
          [250, 98],
          [276, 110],
          [232, 124],
          [296, 122],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="3" fill={p.eye} filter={u("glow")} className="sl-twinkle" />
        ))}
      </g>
      {/* great humped body under a moss mantle */}
      <path d="M100,310 C96,250 150,200 230,196 C312,192 358,240 358,304 C358,324 342,336 318,336 L138,336 C116,336 102,326 100,310 Z" fill={u("body")} {...rim(c)} />
      <path d="M118,262 C140,226 186,206 232,204 C282,202 330,224 348,266 C330,252 312,254 300,262 C286,246 266,244 252,256 C236,240 214,242 200,256 C184,244 160,248 150,262 C140,254 128,256 118,262 Z" fill={p.bodyLight} opacity="0.55" />
      {[
        [130, 290, 92],
        [168, 292, 88],
        [208, 292, 86],
        [248, 290, 84],
        [288, 286, 80],
        [324, 280, 76],
      ].map(([x, y, a]) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d={blade(36, 16, 0.75)} fill={u("wing")} stroke={p.bodyDark} strokeOpacity="0.28" />
          <path d="M3,0 C14,1 24,1 34,0" fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.1" />
        </g>
      ))}
      {/* mushrooms */}
      {[
        [176, 262, 1],
        [314, 252, 0.8],
      ].map(([x, y, s]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M-3,0 L-3,12 L3,12 L3,0 Z" fill={p.belly} />
          <path d="M-12,2 C-12,-8 12,-8 12,2 Z" fill={p.accent} opacity="0.85" />
          <circle cx="-4" cy="-2" r="1.6" fill="#fff" opacity="0.7" />
        </g>
      ))}
      <path d="M150,276 C156,268 166,268 168,276 C170,284 160,288 156,282" fill="none" stroke={p.accent} strokeWidth="2" filter={u("glow")} className="sl-rune-pulse" />
      <Spec x={232} y={214} rx={52} ry={8} rot={-4} o={0.16} />
      {leg(178, true)}
      {leg(302, true)}
      {/* head with moss beard */}
      {antler(18, true)}
      <path d="M48,262 C46,236 66,218 96,216 C124,214 146,230 152,254 C158,280 144,300 120,308 C98,314 70,312 56,300 C48,292 48,276 48,262 Z" fill={u("body")} {...rim(c)} />
      <path d="M34,280 C34,264 48,256 64,258 C80,260 86,276 84,292 C80,306 62,312 48,306 C38,300 34,290 34,280 Z" fill={p.belly} />
      <path d="M62,306 C60,320 64,330 60,342 M72,310 C72,322 76,330 74,340 M84,310 C86,320 84,328 86,336 M96,310 C98,318 96,326 98,332" fill="none" stroke={p.bodyLight} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="42" cy="278" rx="2.6" ry="2" fill={p.bodyDark} />
      <ellipse cx="54" cy="282" rx="2.6" ry="2" fill={p.bodyDark} />
      <path d={blade(30, 10)} transform="translate(140 236) rotate(-36)" fill={u("wing")} {...rim(c, 1)} />
      <Spec x={96} y={226} rx={22} ry={6} o={0.22} />
      <path d="M84,240 C94,234 106,234 114,240" fill="none" stroke={p.bodyDark} strokeWidth="3.4" strokeLinecap="round" opacity="0.75" />
      <Eye c={c} x={98} y={250} r={7.5} kind="lidded" />
      <Gem c={c} x={120} y={232} s={0.6} />
      {antler(0, false)}
    </g>
  );
}

export const mossling: Renderer = {
  ...evolved,
  halo: [104, 64, 32],
  stageFit: [1.25, 1.15, 1.1, 0.95],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
