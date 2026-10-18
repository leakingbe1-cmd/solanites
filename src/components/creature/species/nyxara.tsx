import { byStage, Dots, Eye, Gem, rim, round, Spec, Tube, type Ctx, type Renderer } from "../kit";

/** Nyxara — a slender dusk fox with silk-membrane ears and a flowing ribbon tail. */

type Seg = [number, number, number, number, number, number, number, number];

/**
 * A flat ribbon along a chain of cubic segments, tapering from w0 to w1. The
 * width pinches periodically so it reads as silk turning in the air. Returns
 * the filled outline and the upper edge (for the glowing hem).
 */
function ribbon(segs: Seg[], w0: number, w1: number, turns = 1.5) {
  const n = 22;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  const total = segs.length * n;
  segs.forEach(([x0, y0, x1, y1, x2, y2, x3, y3], si) => {
    for (let i = si === 0 ? 0 : 1; i <= n; i++) {
      const t = i / n;
      const mt = 1 - t;
      const x = mt ** 3 * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t ** 3 * x3;
      const y = mt ** 3 * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t ** 3 * y3;
      const dx = 3 * mt * mt * (x1 - x0) + 6 * mt * t * (x2 - x1) + 3 * t * t * (x3 - x2);
      const dy = 3 * mt * mt * (y1 - y0) + 6 * mt * t * (y2 - y1) + 3 * t * t * (y3 - y2);
      const len = Math.hypot(dx, dy) || 1;
      const g = (si * n + i) / total;
      const w = (w0 + (w1 - w0) * g) * (0.5 + 0.5 * Math.abs(Math.cos(g * Math.PI * turns)));
      left.push([round(x - (dy / len) * w), round(y + (dx / len) * w)]);
      right.push([round(x + (dy / len) * w), round(y - (dx / len) * w)]);
    }
  });
  const pts = (a: [number, number][]) => a.map(([x, y]) => `${x},${y}`).join(" L");
  return { d: `M${pts(left)} L${pts([...right].reverse())} Z`, edge: `M${pts(right)}` };
}

function Ribbon({ c, segs, w0, w1, turns, origin, slow = false }: { c: Ctx; segs: Seg[]; w0: number; w1: number; turns?: number; origin: string; slow?: boolean }) {
  const r = ribbon(segs, w0, w1, turns);
  return (
    <g className={slow ? "sl-sway-slow" : "sl-sway"} style={{ transformOrigin: origin }}>
      <path d={r.d} fill={c.p.wing} stroke={c.p.bodyDark} strokeOpacity="0.5" strokeWidth="1.2" strokeLinejoin="round" />
      <path d={r.d} fill={c.u("fin")} />
      <path d={r.edge} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="3" transform="translate(1 2)" />
      <path d={r.edge} fill="none" stroke={c.p.wingEdge} strokeWidth="1.6" strokeLinecap="round" opacity={0.5 + 0.5 * c.mark} filter={c.u("glow")} />
    </g>
  );
}

/** Long fox ear pointing up from the origin; rotated into place by the caller. */
function Ear({ c, x, y, len, ang, w = 11, back = false, crescent = false }: { c: Ctx; x: number; y: number; len: number; ang: number; w?: number; back?: boolean; crescent?: boolean }) {
  const { p, u } = c;
  const L = round(len);
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <path d={`M${-w},4 C${-w - 2},${round(-L * 0.45)} ${round(-w * 0.45)},${round(-L * 0.85)} 0,${-L} C${round(w * 0.5)},${round(-L * 0.75)} ${w + 2},${round(-L * 0.4)} ${w},4 Z`} fill={back ? p.bodyDark : u("body")} {...rim(c, 1)} />
      {!back && <path d={`M${round(-w * 0.5)},0 C${round(-w * 0.6)},${round(-L * 0.4)} ${round(-w * 0.2)},${round(-L * 0.72)} 0,${round(-L * 0.86)} C${round(w * 0.25)},${round(-L * 0.66)} ${round(w * 0.6)},${round(-L * 0.36)} ${round(w * 0.5)},0 Z`} fill={p.wing} opacity="0.85" />}
      {!back && <path d={`M${round(-w * 0.2)},-6 C${round(-w * 0.3)},${round(-L * 0.4)} ${round(-w * 0.1)},${round(-L * 0.7)} 0,${round(-L * 0.8)}`} fill="none" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="1" />}
      {crescent && (
        <g filter={u("glow")} className="sl-rune-pulse">
          <path d={`M-7,${-L + 4} C-6,${-L - 8} 6,${-L - 10} 9,${-L - 2} C3,${-L - 6} -3,${-L - 4} -7,${-L + 4} Z`} fill={p.wingEdge} />
        </g>
      )}
    </g>
  );
}

/** Eggling: a tiny kit curled up asleep-ish, ears folded back, ribbon stub wrapped round. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* ribbon-stub tail wrapping round the front of the body */}
      <Ribbon c={c} segs={[[278, 318, 300, 340, 270, 360, 220, 356]]} w0={14} w1={4} turns={0.8} origin="278px 318px" slow />
      {/* curled body */}
      <path d="M150,330 C146,296 178,276 222,276 C264,276 292,294 292,320 C292,342 270,352 236,352 L184,352 C162,352 152,344 150,330 Z" fill={u("body")} {...rim(c)} />
      <path d="M176,344 C210,352 262,350 284,334 C278,346 262,352 236,352 L184,352 C178,352 176,348 176,344 Z" fill={p.bodyDark} opacity="0.25" />
      <Spec x={226} y={288} rx={36} ry={6} rot={-4} o={0.22} />
      {/* hind paw tucked in */}
      <ellipse cx="262" cy="344" rx="16" ry="8" fill={p.bodyLight} {...rim(c, 1)} />
      {/* the tail tip curls over the hind paw */}
      <Ribbon c={c} segs={[[220, 356, 196, 354, 176, 352, 162, 342]]} w0={4} w1={2} turns={0.4} origin="220px 356px" />
      {/* front paws the chin rests on */}
      <ellipse cx="150" cy="346" rx="18" ry="8" fill={p.bodyLight} {...rim(c, 1)} />
      <ellipse cx="176" cy="348" rx="15" ry="7" fill={p.bodyLight} {...rim(c, 1)} />
      {/* oversized ears folded back along the body */}
      <g className="sl-sway-slow" style={{ transformOrigin: "176px 280px" }}>
        <Ear c={c} x={164} y={282} len={88} ang={50} w={20} back />
        <Ear c={c} x={176} y={280} len={96} ang={64} w={21} />
      </g>
      {/* big head resting low */}
      <path d="M112,316 C108,288 128,268 156,268 C182,268 198,286 198,308 C198,328 182,342 156,342 C140,342 128,338 118,330 C110,326 108,322 112,316 Z" fill={u("body")} {...rim(c)} />
      <path d="M100,320 C106,310 120,308 134,312 C142,316 144,328 138,334 C128,342 112,340 104,334 C98,330 97,324 100,320 Z" fill={p.belly} />
      <ellipse cx="100" cy="321" rx="3.6" ry="2.8" fill={p.bodyDark} />
      <path d="M108,332 C114,336 122,336 128,332" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="170" cy="322" rx="9" ry="5" fill={p.accent} opacity="0.25" />
      <Spec x={152} y={276} rx={20} ry={6} o={0.26} />
      <Eye c={c} x={150} y={302} r={11} kind="round" />
      <Gem c={c} x={184} y={292} s={0.42} />
    </g>
  );
}

/** Hatchling: a gangly young fox on long legs, ears up, its ribbon tail starting to flow. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const leg = (d: string, near: boolean) => <Tube c={c} d={d} w={near ? 10 : 9} fill={near ? p.body : p.bodyDark} />;
  return (
    <g>
      {leg("M178,286 C178,310 176,330 178,346", false)}
      {leg("M246,284 C252,304 244,326 250,346", false)}
      <Ribbon c={c} segs={[[252, 270, 290, 268, 316, 240, 304, 210], [304, 210, 296, 190, 312, 172, 332, 178]]} w0={17} w1={5} turns={1.2} origin="252px 270px" />
      {/* slim young body */}
      <path d="M156,276 C156,256 180,248 208,250 C236,252 258,254 264,270 C268,284 258,296 238,298 C214,300 188,300 172,296 C160,292 156,286 156,276 Z" fill={u("body")} {...rim(c)} />
      <path d="M172,294 C196,300 230,300 254,292 C246,298 238,298 214,300 C196,300 180,300 172,294 Z" fill={p.bodyDark} opacity="0.2" />
      <Spec x={210} y={258} rx={32} ry={5} rot={-2} o={0.24} />
      {leg("M166,284 C164,306 162,328 162,346", true)}
      {leg("M236,286 C240,306 234,328 238,346", true)}
      {[162, 178, 238, 250].map((x, i) => (
        <ellipse key={x} cx={x + (i % 2 ? 1 : -1)} cy="349" rx="8" ry="4" fill={i % 2 ? p.bodyDark : p.bodyLight} />
      ))}
      {/* neck and chest fluff */}
      <path d="M150,280 C146,262 148,248 156,238 L182,246 C178,258 176,270 180,284 Z" fill={u("body")} />
      <path d="M152,262 C146,276 150,292 164,298 C166,290 168,284 172,278 C164,274 158,268 156,260 Z" fill={p.belly} />
      {/* big upright ears */}
      <g className="sl-sway-slow" style={{ transformOrigin: "140px 218px" }}>
        <Ear c={c} x={150} y={214} len={60} ang={14} w={15} back />
        <Ear c={c} x={130} y={214} len={64} ang={-6} w={15} />
      </g>
      {/* head, looking forward with a curious tilt */}
      <g transform="rotate(-6 138 236)">
        <path d="M108,234 C110,214 126,204 144,206 C162,208 172,222 170,238 C168,254 156,262 140,262 C130,262 120,258 110,256 C100,254 90,252 84,248 C80,244 84,240 92,238 Z" fill={u("body")} {...rim(c)} />
        <path d="M84,248 C92,252 104,256 118,256 C112,262 98,260 88,254 C84,252 82,250 84,248 Z" fill={p.belly} />
        <path d="M150,252 C156,262 166,264 172,256 C170,266 160,270 150,266 Z" fill={p.belly} opacity="0.9" />
        <ellipse cx="85" cy="244" rx="3.4" ry="2.6" fill={p.bodyDark} />
        <Spec x={138} y={212} rx={16} ry={5} o={0.26} />
        <Eye c={c} x={128} y={230} r={8.5} kind="round" />
      </g>
      <Gem c={c} x={162} y={268} s={0.45} />
    </g>
  );
}

/** Evolved: a sleek dusk fox caught mid-stride, glancing back over its shoulder. */
function evolved(c: Ctx) {
  const { p, u } = c;
  const leg = (d: string, near: boolean) => <Tube c={c} d={d} w={near ? 11 : 10} fill={near ? p.body : p.bodyDark} />;
  return (
    <g>
      {/* far legs */}
      {leg("M172,282 C174,306 170,328 172,346", false)}
      {leg("M250,282 C246,306 236,326 230,346", false)}
      {/* long looping ribbon tail */}
      <Ribbon
        c={c}
        segs={[
          [278, 254, 318, 242, 352, 210, 334, 176],
          [334, 176, 318, 146, 278, 156, 292, 188],
          [292, 188, 306, 218, 356, 226, 378, 186],
        ]}
        w0={22}
        w1={4}
        turns={2.2}
        origin="278px 254px"
      />
      {/* sleek body */}
      <path d="M140,262 C142,238 170,228 206,230 C240,232 266,236 280,250 C292,264 286,284 268,290 C244,298 200,296 172,292 C152,288 138,280 140,262 Z" fill={u("body")} {...rim(c)} />
      <path d="M160,288 C200,296 250,296 278,282 C270,292 244,298 200,296 C180,294 166,292 160,288 Z" fill={p.bodyDark} opacity="0.22" />
      <path d="M176,236 C206,232 244,236 266,246" fill="none" stroke={p.wingEdge} strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
      <Spec x={212} y={238} rx={44} ry={5} rot={-1} o={0.26} />
      {/* near legs: fore leg lifted, hind leg pushing off */}
      {leg("M156,280 C152,298 150,310 146,318 C140,324 132,326 126,328", true)}
      {leg("M262,280 C276,296 284,312 282,326 C282,336 284,342 288,346", true)}
      <ellipse cx="122" cy="329" rx="8" ry="4.5" fill={p.bodyDark} transform="rotate(-18 122 329)" />
      <ellipse cx="290" cy="349" rx="9" ry="4" fill={p.bodyDark} />
      <ellipse cx="172" cy="349" rx="8" ry="4" fill={p.bodyDark} opacity="0.85" />
      <ellipse cx="228" cy="349" rx="8" ry="4" fill={p.bodyDark} opacity="0.85" />
      {/* neck rising from a pale chest ruff */}
      <path d="M140,264 C132,238 134,216 146,198 L176,206 C172,224 172,242 180,258 Z" fill={u("body")} {...rim(c)} />
      <path d="M140,252 C130,270 136,294 154,300 C156,290 160,282 166,276 C156,268 148,260 146,248 Z" fill={p.belly} />
      <path d="M144,268 L150,274 M146,282 L154,286" stroke={p.bodyDark} strokeOpacity="0.2" strokeWidth="1.2" />
      {/* long silk ears swept back */}
      <g className="sl-sway-slow" style={{ transformOrigin: "156px 170px" }}>
        <Ear c={c} x={164} y={170} len={72} ang={-16} w={12} back />
        <Ear c={c} x={150} y={172} len={78} ang={-30} w={13} />
      </g>
      {/* head turned back over the shoulder (muzzle points toward the tail) */}
      <path d="M136,190 C136,170 152,160 170,162 C186,164 196,174 206,186 C212,192 214,198 208,202 C198,206 182,208 168,210 C150,212 136,204 136,190 Z" fill={u("body")} {...rim(c)} />
      <path d="M176,204 C188,204 200,202 208,202 C202,208 190,212 178,212 Z" fill={p.belly} />
      <path d="M140,198 C132,206 128,214 130,222 C138,214 146,210 152,208 Z" fill={p.belly} />
      <ellipse cx="208" cy="196" rx="3.2" ry="2.6" fill={p.bodyDark} />
      <Spec x={164} y={168} rx={16} ry={4} rot={6} o={0.3} />
      <path d="M164,176 C170,172 178,172 184,176" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Eye c={c} x={176} y={184} r={7} kind="almond" angle={8} />
      <Gem c={c} x={150} y={240} s={0.5} />
    </g>
  );
}

/** Ascended: the Ribbon of Dusk — head high, crescent ears, twin ribbon tails and a twilight mane. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const leg = (d: string, near: boolean) => <Tube c={c} d={d} w={near ? 12 : 11} fill={near ? p.body : p.bodyDark} />;
  return (
    <g>
      {/* drifting twilight motes */}
      <Dots c={c} pts={[[60, 120], [86, 84], [238, 120], [262, 90], [372, 248], [356, 290], [80, 220], [300, 64]]} r={2} color={p.wingEdge} />
      {leg("M184,282 C186,306 184,328 186,348", false)}
      {leg("M258,282 C262,306 258,328 262,348", false)}
      {/* twin ribbon tails weaving a figure-eight */}
      <Ribbon c={c} segs={[[282, 254, 342, 262, 372, 214, 340, 186], [340, 186, 310, 160, 300, 118, 342, 96]]} w0={20} w1={4} turns={1.8} origin="282px 254px" slow />
      <Ribbon c={c} segs={[[284, 262, 330, 292, 378, 270, 362, 226], [362, 226, 348, 190, 300, 196, 316, 150]]} w0={18} w1={4} turns={1.6} origin="282px 262px" />
      {/* body, chest held high */}
      <path d="M150,256 C150,230 178,220 214,222 C248,224 276,230 288,248 C298,264 290,284 272,290 C248,298 206,296 180,292 C160,288 150,276 150,256 Z" fill={u("body")} {...rim(c)} />
      <path d="M170,288 C206,296 254,296 282,280 C274,292 248,298 206,296 C190,294 178,292 170,288 Z" fill={p.bodyDark} opacity="0.22" />
      <path d="M190,230 C220,226 254,230 278,244" fill="none" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" filter={u("glow")} />
      <Spec x={220} y={232} rx={46} ry={5} rot={-1} o={0.26} />
      {leg("M170,282 C168,306 164,328 164,348", true)}
      {leg("M270,282 C278,304 270,326 276,348", true)}
      {[164, 186, 262, 276].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="350" rx="9" ry="4" fill={p.bodyDark} />
          {i % 2 === 0 && <path d={`M${x - 7},336 C${x - 3},332 ${x + 3},332 ${x + 7},336`} fill="none" stroke={p.wingEdge} strokeWidth="1.4" opacity="0.7" filter={u("glow")} />}
        </g>
      ))}
      {/* pale twilight mane cascading down the back of the neck */}
      <g className="sl-sway-slow" style={{ transformOrigin: "176px 182px" }}>
        <path d="M166,170 C192,174 210,194 218,218 C222,232 232,244 246,252 C228,254 216,248 206,240 C210,252 216,262 226,270 C206,268 192,256 184,242 C182,254 184,264 190,274 C174,266 166,248 166,232 Z" fill={p.belly} {...rim(c, 1)} />
        <path d="M176,182 C192,192 202,208 208,226 M184,200 C192,214 196,228 198,240" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      {/* proud neck */}
      <path d="M152,264 C140,236 140,206 148,180 L182,186 C180,212 184,238 196,258 Z" fill={u("body")} {...rim(c)} />
      <path d="M150,250 C138,268 144,294 164,300 C166,290 170,282 176,276 C166,268 158,258 154,246 Z" fill={p.belly} />
      <g transform="translate(0 12)">
      {/* crescent-tipped ears */}
      <g className="sl-sway-slow" style={{ transformOrigin: "146px 128px" }}>
        <Ear c={c} x={154} y={126} len={84} ang={12} w={13} back />
        <Ear c={c} x={136} y={128} len={92} ang={-8} w={14} crescent />
      </g>
      {/* head raised, looking ahead */}
      <path d="M110,140 C112,120 128,110 146,112 C164,114 174,128 172,144 C170,160 158,168 142,168 C132,168 122,164 112,160 C100,156 86,152 78,148 C74,144 78,140 86,138 Z" fill={u("body")} {...rim(c)} />
      <path d="M78,148 C88,152 102,158 116,160 C108,166 94,164 84,156 C78,152 76,150 78,148 Z" fill={p.belly} />
      <path d="M150,158 C156,168 168,170 174,162 C172,174 160,178 150,172 Z" fill={p.belly} opacity="0.9" />
      <ellipse cx="79" cy="144" rx="3.4" ry="2.6" fill={p.bodyDark} />
      <Spec x={140} y={118} rx={16} ry={5} o={0.3} />
      {/* crescent brow mark */}
      <g filter={u("glow")} className="sl-rune-pulse">
        <path d="M132,122 C136,114 146,114 150,120 C144,118 138,118 132,122 Z" fill={p.wingEdge} />
      </g>
      <path d="M112,132 C118,128 126,128 132,132" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Eye c={c} x={122} y={138} r={7} kind="almond" angle={-6} flip />
      </g>
      <Gem c={c} x={160} y={232} s={0.55} />
    </g>
  );
}

export const nyxara: Renderer = {
  shadow: 120,
  halo: [124, 28, 22],
  stageFit: [1.3, 1.1, 1, 0.95],
  render: byStage(eggling, hatchling, evolved, ascended),
};
