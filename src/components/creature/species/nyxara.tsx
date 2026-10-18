import { byStage, Dots, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Nyxara — a slender dusk fox with silk-membrane ears and a flowing ribbon tail. */

type Pt = [number, number];
type Seg = [number, number, number, number, number, number, number, number];
/** Limb joint: x, y, half-width. */
type J = [number, number, number];

/** Smooth Catmull-Rom run through points, as cubic segments (without the initial move). */
function smooth(P: Pt[]) {
  let d = "";
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i];
    const [p1, p2] = [P[i], P[i + 1]];
    const p3 = P[i + 2] ?? P[i + 1];
    d += ` C${round(p1[0] + (p2[0] - p0[0]) / 6)},${round(p1[1] + (p2[1] - p0[1]) / 6)} ${round(p2[0] - (p3[0] - p1[0]) / 6)},${round(p2[1] - (p3[1] - p1[1]) / 6)} ${round(p2[0])},${round(p2[1])}`;
  }
  return d;
}

/** A tapered limb through joints (shoulder/hip mass → elbow/stifle → wrist/hock → paw), rounded at both ends. */
function limb(js: J[]) {
  const n = js.length;
  const dir = js.map((_, i) => {
    const a = js[Math.max(0, i - 1)];
    const b = js[Math.min(n - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  });
  const L: Pt[] = js.map(([x, y, w], i) => [x - dir[i][1] * w, y + dir[i][0] * w]);
  const R: Pt[] = js.map(([x, y, w], i) => [x + dir[i][1] * w, y - dir[i][0] * w]);
  const cap = (a: Pt, b: Pt, d: number[], w: number) => ` C${round(a[0] + d[0] * w)},${round(a[1] + d[1] * w)} ${round(b[0] + d[0] * w)},${round(b[1] + d[1] * w)} ${round(b[0])},${round(b[1])}`;
  const e = n - 1;
  return `M${round(L[0][0])},${round(L[0][1])}${smooth(L)}${cap(L[e], R[e], dir[e], js[e][2] * 1.3)}${smooth([...R].reverse())}${cap(R[0], L[0], [-dir[0][0], -dir[0][1]], js[0][2] * 1.3)} Z`;
}

/** Fox leg with a muscular upper mass, a darker sock below the wrist/hock and a small rounded paw. */
function Leg({ c, js, near }: { c: Ctx; js: J[]; near: boolean }) {
  const { p, u } = c;
  const n = js.length;
  const [a, b, f] = [js[n - 3], js[n - 2], js[n - 1]];
  const sock: J[] = [[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2 + 0.5], [b[0], b[1], b[2] + 0.5], [f[0], f[1], f[2] + 0.5]];
  const [px, py, pw] = f;
  return (
    <g>
      <path d={limb(js)} fill={near ? u("body") : p.bodyDark} {...(near ? rim(c, 1) : {})} />
      {near && <path d={limb(sock)} fill={p.bodyDark} opacity="0.88" />}
      <ellipse cx={round(px - pw * 0.5)} cy={round(py + pw * 0.45)} rx={round(pw * 1.8)} ry={round(pw * 1.05)} fill={p.bodyDark} {...(near ? rim(c, 0.8) : {})} />
      {near && (
        <path
          d={`M${round(px - pw * 1.7)},${round(py + pw * 0.1)} l0,${round(pw * 0.9)} M${round(px - pw * 0.7)},${round(py - pw * 0.2)} l0,${round(pw * 1.1)}`}
          stroke={p.bodyLight}
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** A small clump of fur spikes, pointing along +x before rotation. */
function Tuft({ x, y, a, s = 1, fill }: { x: number; y: number; a: number; s?: number; fill: string }) {
  return <path d="M0,-5 L15,-6 L7,-1 L17,2 L7,4 L13,10 L0,6 Z" transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} fill={fill} />;
}

function bez(segs: Seg[], n = 26): Pt[] {
  const out: Pt[] = [];
  segs.forEach(([x0, y0, x1, y1, x2, y2, x3, y3], si) => {
    for (let i = si === 0 ? 0 : 1; i <= n; i++) {
      const t = i / n;
      const m = 1 - t;
      out.push([m ** 3 * x0 + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t ** 3 * x3, m ** 3 * y0 + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t ** 3 * y3]);
    }
  });
  return out;
}

/** Vertical figure-eight centred at (cx, cy): t in [0, π] is the lower lobe, [π, 2π] the upper. */
function eight(cx: number, cy: number, a: number, b: number, t0: number, t1: number, n = 60): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / n;
    return [cx + (a / 2) * Math.sin(2 * t), cy + b * Math.sin(t)] as Pt;
  });
}

/**
 * A flat silk ribbon along a centreline. Its width pinches to almost nothing
 * where it twists, and the two faces alternate: a light silk face and a darker
 * back. Both edges carry a glowing hem.
 */
function Ribbon({ c, pts, w0, w1, turns = 1.5, origin, slow = false }: { c: Ctx; pts: Pt[]; w0: number; w1: number; turns?: number; origin: string; slow?: boolean }) {
  const n = pts.length;
  const L: Pt[] = [];
  const R: Pt[] = [];
  const face: boolean[] = [];
  pts.forEach(([x, y], i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const g = i / (n - 1);
    const s = Math.cos(g * Math.PI * turns);
    const w = (w0 + (w1 - w0) * g) * (0.1 + 0.9 * Math.abs(s));
    const nx = -(b[1] - a[1]) / l;
    const ny = (b[0] - a[0]) / l;
    L.push([round(x + nx * w), round(y + ny * w)]);
    R.push([round(x - nx * w), round(y - ny * w)]);
    face.push(s >= 0);
  });
  // Split into runs of one face, sharing the boundary sample so the pieces meet.
  const runs: { from: number; to: number; light: boolean }[] = [];
  let start = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || face[i] !== face[start]) {
      runs.push({ from: start, to: Math.min(i, n - 1), light: face[start] });
      start = i;
    }
  }
  const line = (a: Pt[]) => a.map(([x, y]) => `${x},${y}`).join(" L");
  const piece = (f: number, t: number) => `M${line(L.slice(f, t + 1))} L${line(R.slice(f, t + 1).reverse())} Z`;
  const sheen = `${c.id}-nyx-silk`;
  return (
    <g className={slow ? "sl-sway-slow" : "sl-sway"} style={{ transformOrigin: origin }}>
      <defs>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.p.wingEdge} stopOpacity="0.95" />
          <stop offset="0.5" stopColor={c.p.accent} stopOpacity="0.9" />
          <stop offset="1" stopColor={c.p.wing} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path d={piece(0, n - 1)} fill="none" stroke={c.p.bodyDark} strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round" />
      {runs.map((r) => (
        <path key={r.from} d={piece(r.from, r.to)} fill={r.light ? `url(#${sheen})` : c.p.wing} stroke={r.light ? "none" : c.p.bodyDark} strokeOpacity="0.35" strokeWidth="0.8" />
      ))}
      {runs
        .filter((r) => !r.light)
        .map((r) => (
          <path key={`s${r.from}`} d={piece(r.from, r.to)} fill={c.p.bodyDark} opacity="0.35" />
        ))}
      <g filter={c.u("glow")} opacity={0.55 + 0.45 * c.mark}>
        <path d={`M${line(L)}`} fill="none" stroke={c.p.wingEdge} strokeWidth="1.3" strokeLinecap="round" />
        <path d={`M${line(R)}`} fill="none" stroke={c.p.wingEdge} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Long fox ear pointing up from the origin, with a silk membrane inside; rotated into place by the caller. */
function Ear({ c, x, y, len, ang, w = 11, back = false, crescent = false }: { c: Ctx; x: number; y: number; len: number; ang: number; w?: number; back?: boolean; crescent?: boolean }) {
  const { p, u } = c;
  const L = round(len);
  const k = (n: number) => round(n);
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <path d={`M${-w},4 C${-w - 2},${k(-L * 0.45)} ${k(-w * 0.45)},${k(-L * 0.85)} 0,${-L} C${k(w * 0.5)},${k(-L * 0.75)} ${w + 2},${k(-L * 0.4)} ${w},4 Z`} fill={back ? p.bodyDark : u("body")} {...rim(c, 1)} />
      {!back && (
        <>
          <path d={`M${k(-w * 0.55)},0 C${k(-w * 0.65)},${k(-L * 0.4)} ${k(-w * 0.2)},${k(-L * 0.72)} 0,${k(-L * 0.86)} C${k(w * 0.25)},${k(-L * 0.66)} ${k(w * 0.65)},${k(-L * 0.36)} ${k(w * 0.55)},0 Z`} fill={u("fin")} />
          <path d={`M${k(-w * 0.35)},0 C${k(-w * 0.4)},${k(-L * 0.3)} ${k(-w * 0.1)},${k(-L * 0.55)} 0,${k(-L * 0.64)} C${k(w * 0.15)},${k(-L * 0.5)} ${k(w * 0.4)},${k(-L * 0.28)} ${k(w * 0.35)},0 Z`} fill={p.bodyDark} opacity="0.35" />
          {/* pale fur fringing the inner ear */}
          <path d={`M${k(-w * 0.5)},2 l4,-7 l1,6 l4,-6 l1,7 Z`} fill={p.belly} opacity="0.9" />
          <path d={`M${k(-w * 0.2)},-6 C${k(-w * 0.3)},${k(-L * 0.4)} ${k(-w * 0.1)},${k(-L * 0.7)} 0,${k(-L * 0.8)}`} fill="none" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="1" />
        </>
      )}
      {crescent && (
        <g filter={u("glow")} className="sl-rune-pulse">
          <path d={`M-8,${-L + 6} C-7,${-L - 9} 7,${-L - 11} 10,${-L - 2} C3,${-L - 7} -3,${-L - 4} -8,${-L + 6} Z`} fill={p.wingEdge} />
        </g>
      )}
    </g>
  );
}

/** Eggling: a tiny kit curled up, ears folded back, ribbon stub wrapped round. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <Ribbon c={c} pts={bez([[280, 318, 304, 340, 272, 362, 220, 356]])} w0={14} w1={6} turns={0.9} origin="280px 318px" slow />
      {/* curled body */}
      <path d="M150,330 C146,296 178,276 222,276 C264,276 292,294 292,320 C292,342 270,352 236,352 L184,352 C162,352 152,344 150,330 Z" fill={u("body")} {...rim(c)} />
      <path d="M176,344 C210,352 262,350 284,334 C278,346 262,352 236,352 L184,352 C178,352 176,348 176,344 Z" fill={p.bodyDark} opacity="0.25" />
      <Spec x={226} y={288} rx={36} ry={6} rot={-4} o={0.22} />
      {/* rounded haunch and tucked hind paw */}
      <path d="M244,296 C266,292 284,304 284,322 C284,336 270,344 254,342" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="262" cy="346" rx="15" ry="7" fill={p.bodyDark} {...rim(c, 1)} />
      <Ribbon c={c} pts={bez([[220, 356, 196, 356, 176, 352, 160, 342]])} w0={6} w1={3} turns={0.4} origin="220px 356px" />
      {/* front paws the chin rests on, in dark socks */}
      <ellipse cx="150" cy="347" rx="17" ry="7.5" fill={p.bodyDark} {...rim(c, 1)} />
      <ellipse cx="177" cy="349" rx="14" ry="6.5" fill={p.bodyDark} {...rim(c, 1)} />
      <path d="M140,345 l0,5 M148,344 l0,6 M170,347 l0,5" stroke={p.bodyLight} strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />
      {/* oversized ears folded back along the body */}
      <g className="sl-sway-slow" style={{ transformOrigin: "176px 280px" }}>
        <Ear c={c} x={164} y={282} len={88} ang={50} w={20} back />
        <Ear c={c} x={176} y={280} len={96} ang={64} w={21} />
      </g>
      {/* cheek ruff */}
      <Tuft x={190} y={318} a={20} s={1.1} fill={p.belly} />
      <Tuft x={192} y={304} a={-10} s={0.9} fill={u("body")} />
      {/* big head resting low */}
      <path d="M112,314 C108,288 128,268 156,268 C182,268 198,286 198,308 C198,328 182,342 156,342 C140,342 128,338 118,330 C110,326 104,322 98,322 C92,320 92,314 100,312 Z" fill={u("body")} {...rim(c)} />
      {/* pale lower-face mask */}
      <path d="M96,318 C106,322 120,326 138,326 C156,326 172,330 184,326 C176,338 160,342 144,340 C126,338 108,332 98,326 C94,324 93,320 96,318 Z" fill={p.belly} />
      <ellipse cx="95" cy="315" rx="4.4" ry="3.4" fill={p.bodyDark} />
      <circle cx="93.5" cy="313.8" r="1.1" fill="#fff" opacity="0.5" />
      <path d="M104,328 C110,332 118,332 124,328" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="172" cy="318" rx="9" ry="5" fill={p.accent} opacity="0.25" />
      <Spec x={152} y={276} rx={20} ry={6} o={0.26} />
      <Eye c={c} x={148} y={302} r={11} kind="round" />
      <Gem c={c} x={184} y={292} s={0.42} />
    </g>
  );
}

/** Hatchling: a gangly young fox on long legs, ears up, its ribbon tail starting to flow. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <Leg c={c} near={false} js={[[188, 276, 10], [190, 304, 6], [188, 328, 4], [186, 342, 4]]} />
      <Leg c={c} near={false} js={[[244, 268, 13], [232, 294, 7.5], [248, 320, 4], [244, 342, 4]]} />
      <Ribbon c={c} pts={bez([[272, 262, 304, 256, 318, 226, 304, 204], [304, 204, 294, 186, 312, 168, 334, 176]])} w0={15} w1={6} turns={1.6} origin="272px 262px" />
      {/* slim young body: deep chest, tucked waist, round rump */}
      <path d="M156,270 C154,252 170,244 192,244 C214,244 234,250 252,248 C268,248 278,258 278,272 C278,284 268,292 256,292 C244,292 236,284 222,284 C208,284 198,294 182,296 C166,296 158,288 156,270 Z" fill={u("body")} {...rim(c)} />
      <Spec x={214} y={252} rx={32} ry={4.5} rot={-2} o={0.24} />
      <Leg c={c} near js={[[172, 276, 11], [170, 304, 6.5], [168, 328, 4.5], [164, 342, 4.5]]} />
      <Leg c={c} near js={[[258, 266, 17], [246, 294, 9], [262, 320, 4.8], [258, 342, 4.5]]} />
      <Spec x={262} y={262} rx={9} ry={4} rot={-30} o={0.22} />
      <Tuft x={180} y={300} a={30} s={0.6} fill={u("body")} />
      {/* neck and chest fluff */}
      <path d="M156,276 C150,258 152,244 160,234 L186,242 C182,252 180,264 184,278 Z" fill={u("body")} />
      <path d="M152,262 C146,276 150,292 164,298 C166,290 168,284 172,278 C164,274 158,268 156,260 Z" fill={p.belly} />
      <Tuft x={154} y={288} a={110} s={0.8} fill={p.belly} />
      {/* big upright ears */}
      <g className="sl-sway-slow" style={{ transformOrigin: "140px 210px" }}>
        <Ear c={c} x={150} y={210} len={62} ang={14} w={16} back />
        <Ear c={c} x={128} y={210} len={66} ang={-6} w={16} />
      </g>
      <Tuft x={162} y={246} a={20} s={1} fill={p.belly} />
      {/* fox head: short young muzzle, dark nose tip, pale mask */}
      <g transform="rotate(-6 136 232)">
        <path d="M112,232 C110,212 124,202 142,202 C160,202 172,214 172,230 C172,246 162,256 146,258 C136,258 126,254 116,252 C106,250 94,248 86,246 C80,244 80,238 88,236 C96,234 104,234 112,232 Z" fill={u("body")} {...rim(c)} />
        <path d="M86,246 C98,250 114,254 134,256 C146,256 158,256 168,250 C162,262 146,266 130,264 C112,262 96,256 88,250 Z" fill={p.belly} />
        <ellipse cx="84" cy="241" rx="4" ry="3.2" fill={p.bodyDark} />
        <circle cx="82.6" cy="239.8" r="1" fill="#fff" opacity="0.5" />
        <path d="M98,246 C104,248 110,248 116,246" fill="none" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" />
        <Spec x={140} y={210} rx={16} ry={5} o={0.26} />
        <Eye c={c} x={128} y={228} r={9} kind="round" />
      </g>
      <Gem c={c} x={162} y={268} s={0.45} />
    </g>
  );
}

/** Evolved: a sleek dusk fox caught mid-stride, glancing back over its shoulder. */
function evolved(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* far legs */}
      <Leg c={c} near={false} js={[[184, 266, 13], [186, 298, 8], [182, 328, 4.8], [178, 342, 4.6]]} />
      <Leg c={c} near={false} js={[[256, 262, 18], [240, 290, 10], [262, 318, 5.2], [256, 342, 4.6]]} />
      {/* long looping ribbon tail */}
      <Ribbon
        c={c}
        pts={bez([
          [294, 250, 330, 240, 356, 208, 336, 176],
          [336, 176, 318, 146, 278, 156, 292, 188],
          [292, 188, 306, 218, 356, 226, 378, 184],
        ])}
        w0={20}
        w1={7}
        turns={2.6}
        origin="294px 250px"
      />
      {/* fox body: deep chest, tucked waist, rounded rump */}
      <path d="M138,268 C134,246 150,230 176,228 C204,226 236,234 262,232 C284,230 300,242 300,260 C300,276 290,286 274,288 C258,290 248,280 232,280 C214,280 200,290 182,298 C164,304 144,292 138,268 Z" fill={u("body")} {...rim(c)} />
      <path d="M178,234 C208,230 244,236 270,236" fill="none" stroke={p.wingEdge} strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
      <Spec x={220} y={238} rx={44} ry={5} rot={-1} o={0.26} />
      {/* near legs: fore leg lifted at the wrist, hind leg pushing off */}
      <Leg c={c} near js={[[164, 262, 16], [158, 292, 9], [146, 314, 5.4], [128, 320, 5]]} />
      <Tuft x={166} y={292} a={40} s={0.7} fill={u("body")} />
      <Leg c={c} near js={[[270, 258, 23], [250, 290, 12], [290, 318, 6], [300, 342, 5]]} />
      <Spec x={276} y={250} rx={12} ry={5} rot={-30} o={0.22} />
      {/* neck curving back over the shoulders */}
      <path d="M140,264 C132,236 144,206 170,190 C184,182 200,182 212,190 L206,214 C194,214 186,226 184,246 Z" fill={u("body")} {...rim(c)} />
      <path d="M140,254 C130,272 136,294 158,304 C158,294 162,286 168,280 C158,272 150,262 148,248 Z" fill={p.belly} />
      <Tuft x={142} y={286} a={110} s={0.9} fill={p.belly} />
      <Tuft x={150} y={298} a={80} s={0.7} fill={p.belly} />
      {/* long silk ears swept back */}
      <g className="sl-sway-slow" style={{ transformOrigin: "192px 150px" }}>
        <Ear c={c} x={200} y={150} len={70} ang={-14} w={12} back />
        <Ear c={c} x={186} y={154} len={76} ang={-34} w={13} />
      </g>
      {/* cheek ruff at the back of the turned head */}
      <Tuft x={178} y={186} a={160} s={1.1} fill={p.belly} />
      <Tuft x={180} y={172} a={190} s={0.9} fill={u("body")} />
      {/* fox head turned back toward the tail: long fine muzzle, dark nose tip */}
      <path d="M176,176 C174,156 190,144 208,146 C222,148 230,156 236,166 C244,172 256,178 264,184 C268,188 266,194 260,196 C248,198 234,198 220,198 C200,200 178,194 176,176 Z" fill={u("body")} {...rim(c)} />
      <path d="M182,184 C196,194 220,198 260,196 C250,204 228,208 210,206 C194,204 184,196 182,184 Z" fill={p.belly} />
      <ellipse cx="264" cy="188" rx="4.2" ry="3.4" fill={p.bodyDark} />
      <circle cx="265" cy="186.6" r="1" fill="#fff" opacity="0.5" />
      <path d="M236,198 C242,200 248,200 254,198" fill="none" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" />
      <Spec x={204} y={152} rx={16} ry={4} rot={6} o={0.3} />
      <path d="M206,160 C212,156 220,156 226,160" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Eye c={c} x={216} y={168} r={7} kind="almond" angle={10} />
      <Gem c={c} x={150} y={244} s={0.5} />
    </g>
  );
}

/** Ascended: the Ribbon of Dusk — head high, crescent ears, twin ribbon tails in a figure-eight, twilight mane. */
function ascended(c: Ctx) {
  const { p, u } = c;
  // Both tails meet at the crossing of one figure-eight: one traces the upper lobe, the other the lower.
  const [cx, cy, a, b] = [338, 176, 84, 90];
  const upper = [...bez([[290, 250, 304, 236, 322, 206, cx, cy]], 16), ...eight(cx, cy, a, b, Math.PI, 2 * Math.PI + 0.5).slice(1)];
  const lower = [...bez([[290, 244, 296, 210, 320, 160, cx, cy]], 16), ...eight(cx, cy, a, b, 0, Math.PI + 0.45).slice(1)];
  return (
    <g>
      <Dots c={c} pts={[[60, 120], [86, 84], [238, 120], [262, 70], [380, 300], [228, 62], [80, 220], [300, 52]]} r={2} color={p.wingEdge} />
      <Leg c={c} near={false} js={[[188, 262, 14], [190, 296, 8.5], [188, 328, 5.4], [182, 342, 5]]} />
      <Leg c={c} near={false} js={[[262, 256, 19], [244, 288, 11], [272, 318, 5.8], [266, 342, 5]]} />
      {/* twin ribbon tails weaving a figure-eight */}
      <Ribbon c={c} pts={lower} w0={18} w1={7} turns={2.4} origin="290px 244px" slow />
      <Ribbon c={c} pts={upper} w0={18} w1={7} turns={2.2} origin="290px 250px" />
      {/* body, chest held high */}
      <path d="M146,256 C142,232 160,218 186,218 C214,218 244,226 268,224 C290,222 304,236 304,254 C304,272 294,284 278,286 C262,288 252,278 238,278 C220,278 206,290 188,296 C168,300 150,284 146,256 Z" fill={u("body")} {...rim(c)} />
      <path d="M190,226 C220,222 254,226 280,238" fill="none" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" filter={u("glow")} />
      <Spec x={222} y={230} rx={46} ry={5} rot={-1} o={0.26} />
      <Leg c={c} near js={[[170, 262, 16], [168, 296, 9.5], [166, 328, 5.8], [160, 342, 5.4]]} />
      <Tuft x={176} y={294} a={40} s={0.7} fill={u("body")} />
      <Leg c={c} near js={[[278, 254, 24], [258, 288, 13], [292, 318, 6.4], [286, 342, 5.4]]} />
      <Spec x={284} y={246} rx={13} ry={5} rot={-30} o={0.22} />
      {/* glowing anklets */}
      {[
        [166, 326],
        [292, 316],
      ].map(([x, y]) => (
        <path key={x} d={`M${x - 7},${y} C${x - 3},${y + 4} ${x + 3},${y + 4} ${x + 7},${y}`} fill="none" stroke={p.wingEdge} strokeWidth="1.6" filter={u("glow")} className="sl-rune-pulse" />
      ))}
      {/* pale twilight mane cascading down the back of the neck */}
      <g className="sl-sway-slow" style={{ transformOrigin: "176px 182px" }}>
        <path d="M166,170 C192,174 210,194 218,218 C222,232 232,244 246,252 C228,254 216,248 206,240 C210,252 216,262 226,270 C206,268 192,256 184,242 C182,254 184,264 190,274 C174,266 166,248 166,232 Z" fill={p.belly} {...rim(c, 1)} />
        <path d="M176,182 C192,192 202,208 208,226 M184,200 C192,214 196,228 198,240" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      {/* proud neck */}
      <path d="M152,264 C140,236 140,206 148,180 L182,186 C180,212 184,238 196,258 Z" fill={u("body")} {...rim(c)} />
      <path d="M150,250 C138,268 144,294 164,300 C166,290 170,282 176,276 C166,268 158,258 154,246 Z" fill={p.belly} />
      <Tuft x={146} y={282} a={110} s={0.9} fill={p.belly} />
      <Tuft x={154} y={296} a={80} s={0.7} fill={p.belly} />
      <g transform="translate(0 12)">
        {/* crescent-tipped ears */}
        <g className="sl-sway-slow" style={{ transformOrigin: "146px 128px" }}>
          <Ear c={c} x={156} y={126} len={84} ang={14} w={14} back />
          <Ear c={c} x={138} y={128} len={92} ang={-8} w={15} crescent />
        </g>
        <Tuft x={170} y={152} a={20} s={1.1} fill={p.belly} />
        <Tuft x={172} y={138} a={-10} s={0.9} fill={u("body")} />
        {/* fox head raised: long fine muzzle, dark nose tip, pale mask */}
        <path d="M112,138 C114,120 130,110 148,112 C166,114 176,128 174,144 C172,160 160,168 144,168 C132,168 120,162 108,156 C96,152 82,150 72,148 C66,146 68,140 76,138 C88,136 100,136 112,138 Z" fill={u("body")} {...rim(c)} />
        <path d="M72,148 C86,152 104,158 122,162 C134,166 150,166 168,158 C160,172 140,176 120,172 C100,166 82,156 72,148 Z" fill={p.belly} />
        <ellipse cx="70" cy="143" rx="4.2" ry="3.4" fill={p.bodyDark} />
        <circle cx="68.6" cy="141.6" r="1" fill="#fff" opacity="0.5" />
        <path d="M84,152 C90,154 96,154 102,152" fill="none" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" />
        <Spec x={142} y={118} rx={16} ry={5} o={0.3} />
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
  halo: [122, 26, 22],
  stageFit: [1.3, 1.1, 1, 0.95],
  render: byStage(eggling, hatchling, evolved, ascended),
};
