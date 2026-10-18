import { blade, byStage, Eye, Gem, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Frostkit — a sleek crystal fox: soft frosted coat, ice spines and a thick crystal tail. */
/** Evolved: the mature form. */
const evolved: Renderer = {
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


/** A faceted ice shard pointing along -y from its base, rotated by `rot`. */
function Shard({ c, x, y, l, w, rot = 0, o = 1 }: { c: Ctx; x: number; y: number; l: number; w: number; rot?: number; o?: number }) {
  const L = round(l);
  const W = round(w);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
      <path d={`M${-W},0 L${round(-W * 0.8)},${round(-L * 0.55)} L0,${-L} L${round(W * 0.8)},${round(-L * 0.55)} L${W},0 Z`} fill={c.u("glass")} stroke={c.p.bodyDark} strokeOpacity="0.35" strokeWidth="0.9" />
      <path d={`M0,${-L} L0,0 M${round(-W * 0.8)},${round(-L * 0.55)} L0,${round(-L * 0.3)}`} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.9" />
      <path d={`M0,${-L} L${round(-W * 0.8)},${round(-L * 0.55)} L0,${round(-L * 0.3)} Z`} fill="#fff" opacity="0.22" className="sl-shimmer-facet" />
    </g>
  );
}

/** Eggling: a fluffy round kit sitting up, tail wrapped round its paws, crystal nubs on its ears. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* round sitting body */}
      <path d="M168,352 C148,330 150,282 180,262 C206,246 254,248 278,266 C304,286 306,330 290,352 Z" fill={u("body")} {...rim(c)} />
      <ellipse cx="210" cy="312" rx="30" ry="34" fill={p.belly} />
      <Spec x={262} y={276} rx={16} ry={6} rot={40} o={0.3} />
      {/* front paws */}
      {[196, 230].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="346" rx="15" ry="9" fill={u("body")} {...rim(c, 1)} />
          <path d={`M${x - 4},343 L${x - 4},350 M${x + 4},343 L${x + 4},350`} stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.2" />
        </g>
      ))}
      {/* fluffy tail curled round the front */}
      <g className="sl-sway-slow" style={{ transformOrigin: "290px 330px" }}>
        <path d="M282,318 C320,296 352,312 348,336 C344,358 298,364 236,362 C198,360 166,358 152,350 C174,346 214,350 246,348 C290,346 318,340 314,326 C308,314 294,318 284,330 Z" fill={u("body")} {...rim(c)} />
        <path d="M300,312 C322,306 340,318 340,332" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
        {[
          [330, 344],
          [296, 354],
          [262, 356],
        ].map(([x, y]) => (
          <path key={x} d={`M${x},${y} l-6,4 l-2,-6`} fill="none" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="1.2" />
        ))}
        <Shard c={c} x={156} y={350} l={18} w={6} rot={-100} />
      </g>
      {/* ears with crystal nubs */}
      {[
        ["M150,192 C142,170 136,142 136,120 C156,134 176,152 186,168 Z", "M152,184 C147,168 144,150 144,136 C156,146 168,158 174,168 Z", 136, 120, -40],
        ["M214,164 C226,146 244,126 254,112 C258,136 258,160 252,184 Z", "M222,164 C232,150 242,138 248,130 C250,146 250,162 246,176 Z", 254, 112, 20],
      ].map(([d, inner, x, y, a]) => (
        <g key={x as number}>
          <path d={d as string} fill={u("body")} {...rim(c)} />
          <path d={inner as string} fill={u("glass")} opacity="0.85" />
          <Shard c={c} x={x as number} y={(y as number) + 8} l={16} w={6} rot={a as number} />
        </g>
      ))}
      {/* big round head with a fluffy ruff */}
      <circle cx="200" cy="214" r="60" fill={u("body")} {...rim(c)} />
      <path d="M150,248 C158,268 176,278 200,280 C226,280 244,268 252,248 C246,262 236,268 228,264 C222,274 210,276 200,270 C190,276 176,274 170,264 C162,268 154,260 150,248 Z" fill={p.belly} />
      <Spec x={186} y={170} rx={26} ry={8} rot={-12} o={0.4} />
      <ellipse cx="190" cy="240" rx="24" ry="15" fill={p.belly} />
      <path d="M182,232 C186,229 194,229 196,232 C194,236 186,237 182,232 Z" fill={p.bodyDark} />
      <path d="M189,236 L189,242 M181,246 C185,250 193,250 197,246" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="156" cy="236" rx="9" ry="5" fill={p.accent} opacity="0.3" />
      <ellipse cx="236" cy="232" rx="8" ry="5" fill={p.accent} opacity="0.3" />
      <Eye c={c} x={166} y={214} r={11} kind="round" />
      <Eye c={c} x={222} y={210} r={10} kind="round" />
      <Gem c={c} x={196} y={180} s={0.42} />
    </g>
  );
}

/** Hatchling: a lean, long-legged kit standing alert, big ears up, first spines and a crystal-tipped tail. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const leg = (x: number, near: boolean) => (
    <path
      key={`${x}${near}`}
      d={`M${x - 8},290 C${x - 9},310 ${x - 8},330 ${x - 8},344 C${x - 12},347 ${x - 11},352 ${x - 5},352 L${x + 6},352 C${x + 11},352 ${x + 10},347 ${x + 6},344 C${x + 6},330 ${x + 8},310 ${x + 9},290 Z`}
      fill={near ? u("body") : p.bodyDark}
      {...(near ? rim(c, 1) : {})}
    />
  );
  return (
    <g>
      {leg(176, false)}
      {leg(284, false)}
      {/* upswept tail with a crystal tip */}
      <g className="sl-sway" style={{ transformOrigin: "290px 266px" }}>
        <path d="M284,258 C310,250 326,230 332,202 C346,210 352,236 342,256 C332,276 310,286 290,284 Z" fill={u("body")} {...rim(c)} />
        <path d="M296,262 C314,254 326,238 332,218" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
        <Shard c={c} x={336} y={210} l={26} w={8} rot={24} />
      </g>
      {/* three short first spines */}
      {[
        [204, 244, 14],
        [226, 242, 18],
        [248, 244, 13],
      ].map(([x, y, l]) => (
        <Shard key={x} c={c} x={x} y={y} l={l} w={6} rot={14} />
      ))}
      <path d="M130,268 C134,248 162,240 198,240 C238,240 268,240 286,254 C302,268 300,290 288,300 C272,312 236,312 206,310 C176,308 150,306 138,298 C128,290 128,280 130,268 Z" fill={u("body")} {...rim(c)} />
      <path d="M150,300 C190,308 250,310 290,296 C278,308 256,312 230,312 C200,310 168,308 150,300 Z" fill={p.bodyDark} opacity="0.12" />
      <Spec x={214} y={248} rx={46} ry={5} rot={-2} o={0.32} />
      <path d="M132,262 C124,280 130,300 148,308 C150,298 154,290 158,282 C150,278 142,270 140,260 Z" fill={p.belly} />
      {leg(160, true)}
      {leg(272, true)}
      {/* big upright ears */}
      <path d="M112,232 C110,208 114,186 122,168 C130,186 134,208 134,230 Z" fill={p.bodyDark} opacity="0.85" />
      <path d="M92,234 C88,210 92,186 100,164 C112,184 118,208 118,232 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M98,226 C96,208 98,190 102,176 C108,190 112,208 112,226 Z" fill={u("glass")} opacity="0.9" />
      {/* head: rounder, shorter muzzle than the adult */}
      <path d="M140,262 C134,240 116,226 94,226 C76,226 60,234 46,244 C40,248 42,254 48,257 C62,262 78,270 94,276 C116,282 138,280 140,262 Z" fill={u("body")} {...rim(c)} />
      <path d="M46,244 C56,248 66,254 76,262 C66,264 56,260 48,257 C42,254 40,248 46,244 Z" fill={p.belly} />
      <path d="M104,270 C114,278 126,280 136,274 C132,284 118,286 104,282 Z" fill={p.belly} opacity="0.9" />
      <Spec x={96} y={234} rx={18} ry={4} rot={6} o={0.42} />
      <ellipse cx="45" cy="247" rx="3.6" ry="2.8" fill={p.bodyDark} />
      <ellipse cx="74" cy="258" rx="7" ry="4" fill={p.accent} opacity="0.3" />
      <Eye c={c} x={84} y={244} r={6.8} kind="almond" angle={-8} flip />
      <Gem c={c} x={136} y={290} s={0.45} />
    </g>
  );
}

/** Ascended: a tall regal ice fox, neck raised under a branching crystal crown, three crystal tails fanned behind. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const leg = (x: number, near: boolean, back: boolean) => (
    <g key={`${x}${near}`}>
      {back && <ellipse cx={x + 4} cy="270" rx="28" ry="30" fill={near ? u("body") : p.bodyDark} {...(near ? rim(c) : {})} />}
      <path
        d={`M${x - 9},${back ? 286 : 276} C${x - 11},306 ${x - 12},328 ${x - 11},344 C${x - 15},347 ${x - 14},353 ${x - 7},353 L${x + 7},353 C${x + 12},353 ${x + 12},348 ${x + 7},345 C${x + 7},328 ${x + 9},306 ${x + 11},${back ? 286 : 276} Z`}
        fill={near ? u("body") : p.bodyDark}
        {...(near ? rim(c, 1) : {})}
      />
      {near && (
        <>
          {/* crystal greave */}
          <path d={`M${x - 10},300 L${x + 10},298 L${x + 8},326 L${x},334 L${x - 9},326 Z`} fill={u("glass")} stroke="#fff" strokeOpacity="0.45" strokeWidth="0.9" />
          <path d={`M${x - 10},300 L${x + 10},298 L${x},312 Z`} fill="#fff" opacity="0.25" className="sl-shimmer-facet" />
          <path d={`M${x - 12},347 L${x + 9},347 L${x + 6},353 L${x - 9},353 Z`} fill={p.accent} opacity="0.7" />
        </>
      )}
    </g>
  );
  // Crown: branching ice that rises from behind the ears.
  const crown: [number, number, number, number][] = [
    [150, 118, 4, 58],
    [142, 120, -22, 44],
    [158, 118, 28, 50],
    [164, 124, 52, 34],
  ];
  return (
    <g>
      {leg(196, false, false)}
      {leg(300, false, true)}
      {/* three crystal tails fanned upward */}
      <g className="sl-sway-slow" style={{ transformOrigin: "318px 252px" }}>
        {[-80, -55, -30].map((a, i) => (
          <g key={a} transform={`translate(318 252) rotate(${a})`}>
            <path d={blade([90, 98, 84][i], 20, 0.7)} fill={u("glass")} {...rim(c, 1)} />
            <path d={`M6,0 L${[90, 98, 84][i]},0`} stroke="#fff" strokeOpacity="0.45" strokeWidth="1" />
            <path d={blade([90, 98, 84][i] * 0.45, 13, 0.7)} fill={u("body")} />
            <path d={`M${[90, 98, 84][i] * 0.5},-9 L${[90, 98, 84][i]},0 L${[90, 98, 84][i] * 0.6},2 Z`} fill="#fff" opacity="0.2" className="sl-shimmer-facet" style={{ animationDelay: `${i * 0.4}s` }} />
          </g>
        ))}
      </g>
      {/* body */}
      <path d="M176,250 C180,226 210,216 250,216 C290,216 318,222 326,242 C334,262 324,286 304,294 C280,302 246,302 220,300 C196,298 178,290 174,274 C172,266 174,258 176,250 Z" fill={u("body")} {...rim(c)} />
      <g opacity={0.6 + 0.4 * c.mark}>
        <path d="M236,222 L270,220 L254,246 Z" fill={u("glass")} stroke="#fff" strokeOpacity="0.4" strokeWidth="0.8" />
        <path d="M272,222 L304,228 L284,250 Z" fill={u("glass")} stroke="#fff" strokeOpacity="0.4" strokeWidth="0.8" />
        <path d="M254,246 L284,250 L268,270 Z" fill={u("glass")} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" opacity="0.8" />
      </g>
      <Spec x={262} y={224} rx={44} ry={5} rot={-2} o={0.32} />
      {leg(182, true, false)}
      {leg(292, true, true)}
      {/* crystal mane along the back of the raised neck */}
      {[
        [210, 226, 30, 38],
        [196, 204, 36, 30],
        [184, 182, 34, 22],
        [172, 162, 30, 14],
        [162, 144, 24, 6],
      ].map(([x, y, l, a], i) => (
        <Shard key={x} c={c} x={x} y={y} l={l} w={8} rot={a} o={0.95 - i * 0.04} />
      ))}
      {/* raised neck flowing into the chest; rim only on the open edges so it joins the body cleanly */}
      <path d="M176,282 C164,246 148,204 126,166 L168,146 C180,176 200,206 232,228 C246,250 236,284 210,296 C196,298 184,292 176,282 Z" fill={u("body")} />
      <path d="M176,282 C164,246 148,204 126,166 M168,146 C180,176 200,206 228,226" fill="none" {...rim(c)} />
      {/* fluffy chest ruff */}
      <path d="M176,282 C166,262 156,236 148,208 C156,214 160,222 160,230 C168,234 170,244 168,252 C176,256 180,266 178,274 C184,276 186,280 184,286 Z" fill={p.belly} />
      <path d="M154,220 L160,226 M160,240 L166,244 M168,258 L174,262" stroke={p.bodyDark} strokeOpacity="0.22" strokeWidth="1.2" />
      <path d="M152,190 C162,208 176,224 192,236" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2.4" strokeLinecap="round" />
      {/* crown: branching ice rising behind the head like antlers */}
      <g className="sl-sway-slow" style={{ transformOrigin: "146px 118px" }}>
        {crown.map(([x, y, a, l], i) => {
          const [bx, by] = polar(x, y, l * 0.55, a - 90);
          return (
            <g key={a}>
              <Shard c={c} x={x} y={y} l={l} w={7} rot={a} />
              {i < 2 && <Shard c={c} x={bx} y={by} l={l * 0.4} w={4.5} rot={a - 38} />}
              {i === 0 && <Shard c={c} x={bx} y={by} l={l * 0.36} w={4.5} rot={a + 34} />}
            </g>
          );
        })}
      </g>
      {/* tall ears */}
      <path d="M126,124 C128,104 134,86 144,70 C150,90 150,110 146,126 Z" fill={p.bodyDark} opacity="0.9" />
      <path d="M104,128 C102,106 106,86 114,68 C124,86 130,106 130,128 Z" fill={u("body")} stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.4" />
      <path d="M110,122 C109,106 111,92 115,82 C121,94 124,108 124,122 Z" fill={u("glass")} stroke={p.accent} strokeOpacity="0.5" strokeWidth="0.8" />
      {/* long elegant head held high */}
      <path d="M162,148 C156,126 138,114 116,114 C96,114 76,122 52,134 C46,137 48,144 54,146 C74,150 94,160 114,168 C138,174 160,168 162,148 Z" fill={u("body")} {...rim(c)} />
      <path d="M52,134 C64,138 76,144 90,152 C78,154 64,150 54,146 C48,144 46,137 52,134 Z" fill={p.belly} />
      <path d="M126,162 C136,170 148,170 158,164 C152,176 138,178 124,172 Z" fill={p.belly} opacity="0.9" />
      <Spec x={112} y={122} rx={22} ry={4} rot={8} o={0.42} />
      <ellipse cx="51" cy="137" rx="3.8" ry="2.8" fill={p.bodyDark} />
      <path d="M86,128 C92,122 104,120 112,124" fill="none" stroke={p.bodyDark} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
      <path d="M118,138 L132,134 L126,148 Z" fill={u("glass")} opacity="0.7" />
      <Eye c={c} x={100} y={134} r={6.4} kind="almond" angle={-12} flip />
      {/* frost breath */}
      <g fill="none" stroke={p.accent} strokeLinecap="round" filter={u("glow")} className="sl-twinkle">
        <path d="M42,144 C34,140 28,148 20,144 C14,141 14,134 20,132" strokeWidth="2" opacity="0.6" />
        <path d="M44,152 C36,156 30,164 22,162" strokeWidth="1.4" opacity="0.45" />
        <circle cx="16" cy="152" r="1.6" fill={p.horn} stroke="none" />
        <circle cx="28" cy="170" r="1.2" fill={p.horn} stroke="none" />
      </g>
      <Gem c={c} x={164} y={252} s={0.58} />
    </g>
  );
}

export const frostkit: Renderer = {
  ...evolved,
  halo: [154, 34, 24],
  stageFit: [1.25, 1.12, 1.08, 0.94],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
