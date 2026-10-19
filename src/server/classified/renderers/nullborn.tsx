import "server-only";
import type { ReactNode } from "react";
import { byStage, Gem, MIRROR, rim, round, Spec, type Ctx, type Renderer } from "@/components/creature/kit";

/**
 * Ø NULLBORN, The Unindexed: an inverted, glitched kitsune.
 *
 * White fur where a fox is dark, void-black where it is pale (inner ears,
 * socks, bib, tail tips). It sits facing the viewer and never quite stays in
 * one place: horizontal slices of it are displaced, and a pink/green ghost of
 * its silhouette lingers where it was. Tails multiply 1 → 3 → 7 → 9.
 */

type Pt = [number, number];
/** Cubic segment without its start point: c1x, c1y, c2x, c2y, x, y. */
type C3 = [number, number, number, number, number, number];
/** Glitch band: top y, height, horizontal displacement. */
type Band = [number, number, number];

const VOID = "#05030b";
const GREEN = "#14f195";

/* ───────────────────────────── geometry ───────────────────────────── */

/** Catmull-Rom run through points, as cubic segments (without the initial move). */
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

const curve = (P: Pt[], close = true) => `M${round(P[0][0])},${round(P[0][1])}${smooth(close ? [...P, P[0]] : P)}${close ? " Z" : ""}`;

/** A left-right symmetric outline: the right half is given from the top centre down to the bottom centre. */
function sym(top: Pt, segs: C3[]) {
  const ends: Pt[] = [top];
  let d = `M${top[0]},${top[1]}`;
  segs.forEach((s) => {
    d += ` C${s[0]},${s[1]} ${s[2]},${s[3]} ${s[4]},${s[5]}`;
    ends.push([s[4], s[5]]);
  });
  const m = (x: number) => round(400 - x);
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    d += ` C${m(s[2])},${s[3]} ${m(s[0])},${s[1]} ${m(ends[i][0])},${ends[i][1]}`;
  }
  return `${d} Z`;
}

/* ───────────────────────────── tails ───────────────────────────── */

/** Width profile of a bushy fox tail: narrow root, full belly, pointed tip. */
const tw = (W: number, t: number) => W * Math.pow(Math.sin(Math.PI * Math.pow(0.1 + 0.9 * t, 0.72)), 0.8);

/** Point and normal on the tail spine, which runs along +x and curls by `bend`. */
function spine(L: number, bend: number, t: number): [Pt, Pt] {
  const dx = L;
  const dy = -2 * bend * L * t;
  const l = Math.hypot(dx, dy);
  return [
    [L * t, -bend * L * t * t],
    [-dy / l, dx / l],
  ];
}

function plume(L: number, W: number, bend: number, t0: number, t1: number, n = 18): Pt[] {
  const A: Pt[] = [];
  const B: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const [[x, y], [nx, ny]] = spine(L, bend, t);
    // a slight ripple along the edge reads as fur
    const w = tw(W, t) * (t > 0.18 && t < 0.9 && i % 2 ? 1.07 : 1);
    A.push([x + nx * w, y + ny * w]);
    B.push([x - nx * w, y - ny * w]);
  }
  const back = B.reverse();
  return [...A, ...(t1 >= 1 ? back.slice(1) : back)];
}

/** The void tip, with a flame-like fur edge where it meets the white. */
function tipPts(L: number, W: number, bend: number, tb: number): Pt[] {
  const P = plume(L, W, bend, tb, 1, 10);
  const zz: Pt[] = [];
  for (let k = 1; k < 6; k++) {
    const s = -1 + (2 * k) / 6;
    const t = tb - (k % 2 ? 0.08 : 0);
    const [[x, y], [nx, ny]] = spine(L, bend, t);
    const w = tw(W, t) * 0.9;
    zz.push([x + nx * w * s, y + ny * w * s]);
  }
  return [...P, ...zz];
}

function spineLine(L: number, bend: number, t0: number, t1: number, off: number, W: number) {
  const P: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = t0 + ((t1 - t0) * i) / 8;
    const [[x, y], [nx, ny]] = spine(L, bend, t);
    const w = tw(W, t) * off;
    P.push([x + nx * w, y + ny * w]);
  }
  return curve(P, false);
}

/**
 * One tail rooted at (x, y), pointing at angle `a` (degrees, -90 = straight up),
 * curling upward. `tip`: "dark" void tip, "edge" void tip with a pink seam,
 * "glow" void tip burning with a pink ember.
 */
function Tail({ c, x, y, a, L, W, bend, tip, delay = 0, slow = false }: { c: Ctx; x: number; y: number; a: number; L: number; W: number; bend: number; tip: "dark" | "edge" | "glow"; delay?: number; slow?: boolean }) {
  const { p, u } = c;
  const side = a < -90 ? -1 : 1;
  const b = bend * side;
  const tb = 0.76;
  const outline = curve(plume(L, W, b, 0, 1, 22));
  const [[sx, sy], [snx, sny]] = spine(L, b, 0.42);
  const sw = tw(W, 0.42) * 0.5 * -side;
  const sAng = round((Math.atan2(-2 * b * L * 0.42, L) * 180) / Math.PI);
  const [[ex, ey]] = spine(L, b, 0.97);
  return (
    <g className={slow ? "sl-sway-slow" : "sl-sway"} style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${delay}s` }}>
      <g transform={`translate(${x} ${y}) rotate(${a})`}>
        <path d={outline} fill={u("body")} {...rim(c, 1.2)} />
        <path d={outline} fill={u("shade")} />
        {/* fur grooves */}
        <g fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round">
          <path d={spineLine(L, b, 0.12, tb - 0.06, 0.38, W)} />
          <path d={spineLine(L, b, 0.2, tb - 0.1, -0.42, W)} />
          <path d={spineLine(L, b, 0.3, tb - 0.04, 0.02, W)} strokeOpacity="0.18" />
        </g>
        <Spec x={round(sx + snx * sw)} y={round(sy + sny * sw)} rx={round(L * 0.17)} ry={round(W * 0.16)} rot={sAng} o={0.45} />
        <path d={curve(tipPts(L, W, b, tb))} fill={VOID} />
        {tip !== "dark" && (
          <path d={spineLine(L, b, tb + 0.02, 0.98, side * 0.55, W)} fill="none" stroke={p.accent} strokeWidth="1.1" strokeOpacity="0.8" filter={u("glow")} />
        )}
        {tip === "glow" && (
          <g filter={u("glow")} className="sl-rune-pulse">
            <path d={spineLine(L, b, 0.3, tb - 0.04, 0, W)} fill="none" stroke={p.accent} strokeWidth="1" strokeOpacity="0.35" />
            <path d={curve(plume(L, W * 0.7, b, 0.88, 1, 8))} fill={p.accent} />
            <circle cx={round(ex)} cy={round(ey)} r="2.2" fill="#fff" />
          </g>
        )}
      </g>
    </g>
  );
}

/* ───────────────────────────── face parts ───────────────────────────── */

/** Void eye: black almond (or round, for the kit) with a glowing pink slit pupil. */
function VoidEye({ c, x, y, r, ang = 0, flip = false, round: isRound = false }: { c: Ctx; x: number; y: number; r: number; ang?: number; flip?: boolean; round?: boolean }) {
  const k = round(r / 8);
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${flip ? -k : k} ${k})`}>
      <g className="sl-eye">
        {isRound ? (
          <>
            <circle r="10" fill={VOID} stroke={c.p.accent} strokeOpacity="0.45" strokeWidth="0.8" />
            <ellipse cy="0.5" rx="3" ry="7.4" fill={c.p.accent} filter={c.u("glow")} />
            <ellipse cy="0.5" rx="1.1" ry="5.6" fill="#fff" opacity="0.85" />
            <circle cx="4.2" cy="-4.4" r="2.6" fill="#fff" />
            <circle cx="-3.6" cy="4.6" r="1.1" fill="#fff" opacity="0.7" />
          </>
        ) : (
          <>
            <path d="M-12,1.5 C-6,-7.5 7,-8.5 12,-2.5 C7,5.5 -5,7 -12,1.5 Z" fill={VOID} stroke={c.p.accent} strokeOpacity="0.5" strokeWidth="0.8" />
            <ellipse cx="1" cy="-0.6" rx="2.2" ry="5.6" fill={c.p.accent} filter={c.u("glow")} />
            <ellipse cx="1" cy="-0.6" rx="0.8" ry="4.2" fill="#fff" opacity="0.85" />
            <circle cx="5.4" cy="-3.4" r="1.4" fill="#fff" />
            <path d="M-10,-1.5 C-4,-6.5 5,-7.2 10,-3.6" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
          </>
        )}
      </g>
    </g>
  );
}

/** Upright fox ear on the origin, with a void-black inner ear and pale fringe. */
function Ear({ c, x, y, len, w, ang, edge = false }: { c: Ctx; x: number; y: number; len: number; w: number; ang: number; edge?: boolean }) {
  const { p, u } = c;
  const L = round(len);
  const k = (n: number) => round(n);
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <path d={`M${-w},6 C${k(-w * 1.02)},${k(-L * 0.42)} ${k(-w * 0.4)},${k(-L * 0.82)} 0,${-L} C${k(w * 0.4)},${k(-L * 0.82)} ${k(w * 1.02)},${k(-L * 0.42)} ${w},6 Z`} fill={u("body")} {...rim(c, 1.2)} />
      <path d={`M${k(-w * 0.62)},2 C${k(-w * 0.62)},${k(-L * 0.36)} ${k(-w * 0.26)},${k(-L * 0.7)} 0,${k(-L * 0.84)} C${k(w * 0.26)},${k(-L * 0.7)} ${k(w * 0.62)},${k(-L * 0.36)} ${k(w * 0.62)},2 Z`} fill={VOID} />
      {edge && <path d={`M${k(-w * 0.5)},-4 C${k(-w * 0.5)},${k(-L * 0.36)} ${k(-w * 0.2)},${k(-L * 0.64)} 0,${k(-L * 0.78)}`} fill="none" stroke={p.accent} strokeWidth="1.1" strokeOpacity="0.75" filter={u("glow")} />}
      {/* pale fur fringing the inner ear */}
      <path d={`M${k(-w * 0.62)},4 l${k(w * 0.18)},${k(-w * 0.7)} l${k(w * 0.12)},${k(w * 0.5)} l${k(w * 0.2)},${k(-w * 0.75)} l${k(w * 0.14)},${k(w * 0.6)} l${k(w * 0.2)},${k(-w * 0.55)} l${k(w * 0.14)},${k(w * 0.6)} l${k(w * 0.2)},${k(-w * 0.62)} l${k(w * 0.18)},${k(w * 0.82)} Z`} fill={p.body} opacity="0.95" />
      <Spec x={k(-w * 0.72)} y={k(-L * 0.4)} rx={2} ry={k(L * 0.16)} rot={12} o={0.4} />
    </g>
  );
}

/** The forehead null sign; `eye` opens a third void eye inside it. */
function NullMark({ c, x, y, r, o = 1, eye = false }: { c: Ctx; x: number; y: number; r: number; o?: number; eye?: boolean }) {
  const d = round(r * 1.25);
  return (
    <g opacity={o}>
      {eye && <VoidEye c={c} x={x} y={y} r={round(r * 0.82)} ang={90} />}
      <g filter={c.u("glow")} className="sl-rune-pulse" fill="none" stroke={c.p.accent} strokeWidth="1.6" strokeLinecap="round">
        <circle cx={x} cy={y} r={r} />
        <path d={`M${round(x - d * 0.6)},${round(y + d)} L${round(x + d * 0.6)},${round(y - d)}`} />
      </g>
    </g>
  );
}

/** Glitch-pixel cheek slashes (left cheek given; mirrored). */
function CheekMarks({ c, rows, o = 1 }: { c: Ctx; rows: [number, number, number][]; o?: number }) {
  const bars = rows.map(([x, y, l], i) => <rect key={i} x={x} y={y} width={l} height="2.6" rx="0.6" fill={c.p.accent} />);
  return (
    <g filter={c.u("glow")} opacity={o}>
      {bars}
      <g transform={MIRROR}>{bars}</g>
    </g>
  );
}

/** Dead pixels drifting off the body: x, y, size, colour (0 pink, 1 green, 2 void, 3 white). */
function Pixels({ c, pts }: { c: Ctx; pts: [number, number, number, number][] }) {
  const col = [c.p.accent, GREEN, VOID, "#fff"];
  return (
    <g className="sl-twinkle">
      {pts.map(([x, y, s, k], i) => (
        <rect key={i} x={x} y={y} width={s} height={s} fill={col[k]} opacity={k === 2 ? 0.9 : 0.85} style={{ animationDelay: `${i * 0.27}s` }} />
      ))}
    </g>
  );
}

/* ───────────────────────────── glitch ───────────────────────────── */

/**
 * Draws `fig` with a pink/green chromatic ghost of its silhouette left behind,
 * then cuts horizontal bands out of it and redraws them displaced sideways.
 */
function Glitched({ c, k, dx, bands, fig }: { c: Ctx; k: string; dx: number; bands: Band[]; fig: ReactNode }) {
  const id = `${c.id}-${k}`;
  const big = { x: -100, width: 600 };
  return (
    <g>
      <defs>
        <filter id={`${id}-rgb`} x="-15%" y="-15%" width="130%" height="130%">
          <feOffset in="SourceAlpha" dx={-dx} dy="0" result="a" />
          <feFlood floodColor={c.p.accent} result="pc" />
          <feComposite in="pc" in2="a" operator="in" result="pa" />
          <feOffset in="SourceAlpha" dx={dx} dy="0" result="b" />
          <feFlood floodColor={GREEN} result="gc" />
          <feComposite in="gc" in2="b" operator="in" result="gb" />
          <feMerge>
            <feMergeNode in="pa" />
            <feMergeNode in="gb" />
          </feMerge>
        </filter>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="600">
          <rect x="-100" y="-100" width="600" height="600" fill="#fff" />
          {bands.map(([y, h], i) => (
            <rect key={i} {...big} y={y} height={h} fill="#000" />
          ))}
        </mask>
        {bands.map(([y, h], i) => (
          <clipPath key={i} id={`${id}-c${i}`}>
            <rect {...big} y={y} height={h} />
          </clipPath>
        ))}
      </defs>
      <g filter={`url(#${id}-rgb)`} opacity="0.7">
        {fig}
      </g>
      <g mask={`url(#${id}-m)`}>{fig}</g>
      {bands.map(([y, , d], i) => (
        <g key={i} clipPath={`url(#${id}-c${i})`}>
          <g transform={`translate(${d} 0)`}>{fig}</g>
        </g>
      ))}
    </g>
  );
}

/* ───────────────────────────── stages ───────────────────────────── */

/** Eggling: a tiny round white kit with one stubby glitched tail and huge void eyes. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const head = sym(
    [200, 176],
    [
      [230, 176, 252, 196, 254, 222],
      [255, 234, 258, 240, 266, 246],
      [258, 250, 254, 258, 244, 264],
      [232, 272, 216, 276, 200, 276],
    ],
  );
  const body = sym(
    [200, 262],
    [
      [226, 262, 246, 286, 246, 312],
      [246, 338, 228, 352, 200, 352],
    ],
  );
  const fig = (
    <g>
      <Tail c={c} x={226} y={332} a={-30} L={90} W={24} bend={0.48} tip="dark" />
      {/* haunches */}
      {[164, 236].map((x) => (
        <ellipse key={x} cx={x} cy="336" rx="17" ry="15" fill={u("body")} {...rim(c)} />
      ))}
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d={body} fill={u("shade")} />
      <Spec x={184} y={284} rx={10} ry={16} rot={20} o={0.35} />
      {/* the first hint of the void bib */}
      <path d="M200,284 C212,284 220,294 218,306 L210,303 L205,312 L200,305 L195,312 L190,303 L182,306 C180,294 188,284 200,284 Z" fill={VOID} />
      <Gem c={c} x={200} y={296} s={0.4} />
      {/* hind feet and stubby front paws with void toes */}
      {[152, 248].map((x) => (
        <ellipse key={x} cx={x} cy="348" rx="12" ry="5.5" fill={VOID} />
      ))}
      {[184, 216].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="340" rx="11" ry="12" fill={u("body")} {...rim(c, 1)} />
          <ellipse cx={x} cy="348" rx="10" ry="5" fill={VOID} />
          <path d={`M${x - 3},345 l0,4 M${x + 3},345 l0,4`} stroke="#fff" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
        </g>
      ))}
      {/* short rounded ears */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 196px" }}>
        <Ear c={c} x={170} y={194} len={40} w={17} ang={-26} />
        <Ear c={c} x={230} y={194} len={40} w={17} ang={26} />
      </g>
      {/* big round head */}
      <path d={head} fill={u("body")} {...rim(c)} />
      <path d={head} fill={u("shade")} />
      <Spec x={180} y={192} rx={20} ry={7} o={0.5} />
      <NullMark c={c} x={200} y={200} r={3.4} o={0.35} />
      {/* button muzzle */}
      <path d="M200,244 C208,244 212,252 211,258 C210,264 205,267 200,267 C195,267 190,264 189,258 C188,252 192,244 200,244 Z" fill={p.bodyLight} opacity="0.85" />
      <path d="M195,253 C195,250 205,250 205,253 C205,257 202,259 200,259 C198,259 195,257 195,253 Z" fill={VOID} />
      <circle cx="198" cy="252" r="1" fill="#fff" opacity="0.6" />
      <path d="M200,259 L200,262 M195,263 C197,265 199,265 200,262 C201,265 203,265 205,263" fill="none" stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
      <CheekMarks c={c} rows={[[150, 252, 9]]} o={0.55} />
      <VoidEye c={c} x={179} y={228} r={14} round />
      <VoidEye c={c} x={221} y={228} r={14} round flip />
      <Pixels c={c} pts={[[270, 276, 3, 0], [278, 266, 2, 1], [262, 262, 2, 2]]} />
    </g>
  );
  return <Glitched c={c} k="nb-egg" dx={1.5} bands={[[310, 5, 6]]} fig={fig} />;
}

/** Hatchling: a lanky juvenile with three tails, longer ears and its first pink cheek marks. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const body = sym(
    [200, 234],
    [
      [216, 234, 228, 246, 230, 264],
      [232, 280, 240, 292, 248, 308],
      [256, 326, 252, 344, 236, 350],
      [226, 354, 212, 353, 200, 352],
    ],
  );
  const head = sym(
    [200, 152],
    [
      [222, 152, 238, 164, 240, 184],
      [242, 193, 246, 198, 256, 202],
      [248, 208, 248, 212, 256, 220],
      [244, 224, 232, 230, 218, 236],
      [210, 240, 206, 242, 200, 242],
    ],
  );
  const muzzle = sym(
    [200, 190],
    [
      [207, 190, 212, 200, 213, 212],
      [213, 223, 209, 231, 204, 235],
      [202, 237, 201, 237, 200, 237],
    ],
  );
  const leg = (
    <g>
      <path d="M205,272 C204,298 206,324 207,344 L221,344 C222,324 224,300 224,274 Z" fill={u("body")} {...rim(c)} />
      <path d="M206,322 C206,330 207,338 207,344 L221,344 C221,338 222,330 222,322 C216,326 211,326 206,322 Z" fill={VOID} />
      <ellipse cx="214" cy="347" rx="9.5" ry="5" fill={VOID} />
      <path d="M211,344 l0,4 M217,344 l0,4" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
  const fig = (
    <g>
      {/* three tails */}
      <Tail c={c} x={212} y={318} a={-46} L={134} W={24} bend={0.24} tip="edge" delay={0.6} slow />
      <Tail c={c} x={192} y={322} a={-160} L={126} W={24} bend={0.32} tip="edge" delay={1.2} />
      <Tail c={c} x={208} y={322} a={-12} L={126} W={24} bend={0.32} tip="edge" />
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d={body} fill={u("shade")} />
      {/* haunch contours */}
      {[0, 1].map((m) => (
        <path key={m} transform={m ? MIRROR : undefined} d="M242,300 C230,312 228,334 238,346" fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1.3" strokeLinecap="round" />
      ))}
      <Spec x={238} y={312} rx={4} ry={12} rot={-10} o={0.3} />
      {[164, 236].map((x) => (
        <ellipse key={x} cx={x} cy="348" rx="12" ry="5" fill={VOID} />
      ))}
      {leg}
      <g transform={MIRROR}>{leg}</g>
      {/* void bib with fur fringe */}
      <path d="M200,236 C212,236 222,246 222,260 C222,272 216,280 212,288 L207,283 L204,294 L200,287 L196,294 L193,283 L188,288 C184,280 178,272 178,260 C178,246 188,236 200,236 Z" fill={VOID} />
      <path d="M182,250 C186,242 194,238 200,238" fill="none" stroke={p.accent} strokeOpacity="0.35" strokeWidth="1" />
      <Gem c={c} x={200} y={260} s={0.45} />
      {/* head tilted with curiosity */}
      <g transform="rotate(7 200 240)">
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 166px" }}>
          <Ear c={c} x={176} y={168} len={56} w={18} ang={-22} />
          <Ear c={c} x={224} y={168} len={56} w={18} ang={22} />
        </g>
        <path d={head} fill={u("body")} {...rim(c)} />
        <path d={head} fill={u("shade")} />
        <path d={muzzle} fill={p.bodyLight} opacity="0.9" />
        <Spec x={182} y={164} rx={16} ry={6} o={0.5} />
        <Spec x={200} y={208} rx={3} ry={9} rot={0} o={0.35} />
        <NullMark c={c} x={200} y={170} r={4} o={0.6} />
        {/* faint void tear lines */}
        {[0, 1].map((m) => (
          <path key={m} transform={m ? MIRROR : undefined} d="M188,206 C187,211 188,215 190,219" fill="none" stroke={VOID} strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" />
        ))}
        <path d="M194,227 C194,223 206,223 206,227 C206,231 203,233 200,233 C197,233 194,231 194,227 Z" fill={VOID} />
        <circle cx="198" cy="226" r="1" fill="#fff" opacity="0.6" />
        <path d="M200,233 L200,236 M196,238 C198,239 202,239 204,238" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
        <CheekMarks c={c} rows={[[150, 206, 12], [153, 212, 8]]} o={0.9} />
        <VoidEye c={c} x={182} y={196} r={11} ang={10} flip />
        <VoidEye c={c} x={218} y={196} r={11} ang={-10} />
      </g>
      <Pixels c={c} pts={[[110, 214, 3, 0], [118, 222, 2, 2], [292, 222, 3, 1], [300, 230, 2, 0], [286, 214, 2, 2]]} />
    </g>
  );
  return (
    <Glitched
      c={c}
      k="nb-hatch"
      dx={2}
      bands={[
        [214, 5, 7],
        [300, 4, -6],
      ]}
      fig={fig}
    />
  );
}

/** Evolved: a poised inverted fox, seven tails fanned behind, full mask markings, head cocked. */
function evolved(c: Ctx) {
  const { p, u } = c;
  const body = sym(
    [200, 186],
    [
      [218, 186, 232, 200, 236, 222],
      [240, 242, 246, 258, 256, 276],
      [268, 298, 270, 332, 254, 346],
      [244, 354, 222, 354, 200, 352],
    ],
  );
  const head = sym(
    [200, 106],
    [
      [220, 106, 236, 116, 240, 134],
      [242, 144, 248, 148, 260, 150],
      [252, 158, 254, 164, 264, 172],
      [252, 174, 248, 178, 252, 188],
      [238, 188, 224, 192, 214, 200],
      [208, 206, 204, 208, 200, 208],
    ],
  );
  const muzzle = sym(
    [200, 146],
    [
      [208, 146, 214, 156, 215, 170],
      [216, 182, 212, 194, 206, 199],
      [204, 202, 202, 203, 200, 203],
    ],
  );
  const tails: [number, number, number, number][] = [
    // angle, length, width, bend
    [-76, 176, 28, 0.14],
    [-126, 178, 29, 0.18],
    [-54, 184, 30, 0.18],
    [-150, 180, 30, 0.22],
    [-30, 184, 30, 0.22],
    [-172, 170, 29, 0.26],
    [-8, 172, 29, 0.26],
  ];
  const leg = (
    <g>
      <path d="M207,244 C205,278 208,314 210,342 L226,342 C228,314 230,280 230,246 Z" fill={u("body")} {...rim(c)} />
      <path d="M209,314 C209,326 210,334 210,342 L226,342 C227,334 228,326 228,314 C222,319 214,319 209,314 Z" fill={VOID} />
      <ellipse cx="218" cy="346" rx="11" ry="5.5" fill={VOID} />
      <path d="M214,343 l0,5 M222,343 l0,5" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
      <Spec x={213} y={272} rx={2.5} ry={16} rot={2} o={0.35} />
    </g>
  );
  const fig = (
    <g>
      {tails.map(([a, L, W, bend], i) => (
        <Tail key={a} c={c} x={a < -90 ? 192 : 208} y={300} a={a} L={L} W={W} bend={bend} tip="edge" delay={i * 0.4} slow={i % 2 === 0} />
      ))}
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d={body} fill={u("shade")} />
      {[0, 1].map((m) => (
        <path key={m} transform={m ? MIRROR : undefined} d="M250,276 C236,292 232,324 246,344" fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      <Spec x={250} y={300} rx={4} ry={16} rot={-10} o={0.3} />
      {[154, 246].map((x) => (
        <ellipse key={x} cx={x} cy="348" rx="15" ry="6" fill={VOID} />
      ))}
      {leg}
      <g transform={MIRROR}>{leg}</g>
      {/* void bib */}
      <path d="M200,194 C215,194 228,206 228,224 C228,240 222,252 216,262 L210,257 L206,272 L200,263 L194,272 L190,257 L184,262 C178,252 172,240 172,224 C172,206 185,194 200,194 Z" fill={VOID} />
      <path d="M176,214 C182,202 192,196 200,196" fill="none" stroke={p.accent} strokeOpacity="0.4" strokeWidth="1.1" />
      <Gem c={c} x={200} y={226} s={0.52} />
      {/* head cocked: eerily curious */}
      <g transform="rotate(-7 200 196)">
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 124px" }}>
          <Ear c={c} x={176} y={124} len={68} w={20} ang={-22} edge />
          <Ear c={c} x={224} y={124} len={68} w={20} ang={22} edge />
        </g>
        <path d={head} fill={u("body")} {...rim(c)} />
        <path d={head} fill={u("shade")} />
        {/* cheek ruff fur */}
        {[0, 1].map((m) => (
          <path key={m} transform={m ? MIRROR : undefined} d="M242,152 C246,158 248,164 254,170 M240,170 C242,176 244,180 246,186" fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
        ))}
        <path d={muzzle} fill={p.bodyLight} opacity="0.9" />
        <Spec x={184} y={116} rx={16} ry={5} o={0.55} />
        <Spec x={200} y={170} rx={3} ry={12} rot={0} o={0.35} />
        <NullMark c={c} x={200} y={126} r={5.4} />
        {/* mask: void tear lines and brows */}
        {[0, 1].map((m) => (
          <g key={m} transform={m ? MIRROR : undefined} fill="none" stroke={VOID} strokeLinecap="round">
            <path d="M187,158 C185,165 186,171 189,177" strokeWidth="2.2" />
            <path d="M170,138 C176,137 184,139 190,143" strokeWidth="2.4" />
          </g>
        ))}
        <path d="M193,192 C193,188 207,188 207,192 C207,197 203,199 200,199 C197,199 193,197 193,192 Z" fill={VOID} />
        <circle cx="197" cy="191" r="1.1" fill="#fff" opacity="0.6" />
        <path d="M200,199 L200,202 M195,205 C197,206 203,206 205,205" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
        <CheekMarks c={c} rows={[[148, 158, 14], [151, 164, 9], [147, 170, 12]]} />
        <VoidEye c={c} x={182} y={150} r={9} ang={14} flip />
        <VoidEye c={c} x={218} y={150} r={9} ang={-14} />
      </g>
      <Pixels c={c} pts={[[46, 236, 3, 0], [56, 226, 2, 2], [352, 214, 3, 1], [342, 204, 2, 0], [300, 118, 3, 2], [94, 132, 2, 1]]} />
    </g>
  );
  return (
    <Glitched
      c={c}
      k="nb-evo"
      dx={2.5}
      bands={[
        [180, 4, 9],
        [242, 4, -7],
        [318, 3, 6],
      ]}
      fig={fig}
    />
  );
}

/** Ascended: The Unindexed. Nine ember-tipped tails, a void mane, a third eye and an inverted halo, coming apart at the seams. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const body = sym(
    [200, 178],
    [
      [222, 178, 238, 196, 240, 218],
      [242, 238, 250, 254, 262, 272],
      [276, 296, 278, 332, 260, 348],
      [248, 355, 222, 355, 200, 353],
    ],
  );
  const mane = sym(
    [200, 180],
    [
      [222, 180, 238, 190, 242, 208],
      [244, 218, 250, 224, 258, 228],
      [246, 232, 246, 240, 250, 250],
      [240, 250, 234, 256, 232, 268],
      [224, 266, 218, 272, 212, 282],
      [206, 276, 204, 284, 200, 290],
    ],
  );
  const head = sym(
    [200, 96],
    [
      [222, 96, 240, 108, 244, 128],
      [246, 138, 252, 142, 266, 144],
      [258, 152, 260, 158, 272, 166],
      [260, 170, 256, 174, 262, 184],
      [246, 186, 232, 188, 220, 196],
      [212, 202, 206, 206, 200, 206],
    ],
  );
  const muzzle = sym(
    [200, 140],
    [
      [209, 140, 215, 152, 216, 166],
      [217, 180, 212, 192, 206, 198],
      [203, 201, 201, 202, 200, 202],
    ],
  );
  const tails: [number, number, number, number][] = [
    [-90, 236, 30, 0.04],
    [-114, 200, 30, 0.14],
    [-66, 200, 30, 0.14],
    [-136, 206, 31, 0.18],
    [-44, 206, 31, 0.18],
    [-157, 204, 31, 0.22],
    [-23, 204, 31, 0.22],
    [-176, 190, 30, 0.26],
    [-4, 190, 30, 0.26],
  ];
  const leg = (
    <g>
      <path d="M208,250 C206,286 209,318 210,342 L228,342 C230,318 232,288 232,252 Z" fill={u("body")} {...rim(c)} />
      <path d="M209,312 C209,324 210,334 210,342 L228,342 C229,334 230,324 230,312 C223,317 215,317 209,312 Z" fill={VOID} />
      <path d="M209,312 C215,317 223,317 230,312" fill="none" stroke={p.accent} strokeWidth="1.6" filter={u("glow")} className="sl-rune-pulse" />
      <ellipse cx="219" cy="346" rx="12" ry="6" fill={VOID} />
      <path d="M215,343 l0,5 M223,343 l0,5" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
      <Spec x={214} y={280} rx={2.5} ry={18} rot={2} o={0.35} />
    </g>
  );
  const fig = (
    <g>
      {tails.map(([a, L, W, bend], i) => (
        <Tail key={a} c={c} x={a < -90 ? 192 : a > -90 ? 208 : 200} y={296} a={a} L={L} W={W} bend={bend} tip="glow" delay={i * 0.35} slow={i % 2 === 0} />
      ))}
      {/* inverted halo: a void ring standing behind the head */}
      <g className="sl-spin-slow" style={{ transformOrigin: "200px 140px" }}>
        <circle cx="200" cy="140" r="84" fill="none" stroke={VOID} strokeWidth="9" />
        <circle cx="200" cy="140" r="89" fill="none" stroke={p.accent} strokeWidth="1.2" strokeDasharray="22 6 4 6" filter={u("glow")} />
        <circle cx="200" cy="140" r="79" fill="none" stroke={GREEN} strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="2 7" />
      </g>
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d={body} fill={u("shade")} />
      {[0, 1].map((m) => (
        <path key={m} transform={m ? MIRROR : undefined} d="M256,276 C240,294 236,326 250,346" fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      <Spec x={256} y={302} rx={4} ry={17} rot={-10} o={0.3} />
      {[150, 250].map((x) => (
        <ellipse key={x} cx={x} cy="349" rx="17" ry="6" fill={VOID} />
      ))}
      {leg}
      <g transform={MIRROR}>{leg}</g>
      {/* void mane with burning pink edge */}
      <path d={mane} fill={VOID} stroke={p.accent} strokeWidth="1.3" strokeOpacity="0.8" filter={u("glow")} />
      <path d={mane} fill={VOID} />
      <path d="M176,204 C184,192 192,186 200,186" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.4" strokeLinecap="round" />
      <Gem c={c} x={200} y={236} s={0.6} />
      <g transform="rotate(3 200 190)">
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 112px" }}>
          <Ear c={c} x={174} y={114} len={82} w={22} ang={-22} edge />
          <Ear c={c} x={226} y={114} len={82} w={22} ang={22} edge />
        </g>
        <path d={head} fill={u("body")} {...rim(c)} />
        <path d={head} fill={u("shade")} />
        {[0, 1].map((m) => (
          <path key={m} transform={m ? MIRROR : undefined} d="M246,146 C250,152 252,158 260,164 M244,166 C246,172 248,178 252,184" fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
        ))}
        <path d={muzzle} fill={p.bodyLight} opacity="0.9" />
        <Spec x={182} y={106} rx={16} ry={5} o={0.55} />
        <Spec x={200} y={166} rx={3} ry={12} rot={0} o={0.35} />
        {/* mask: void tear lines that drip pink, sharp brows */}
        {[0, 1].map((m) => (
          <g key={m} transform={m ? MIRROR : undefined} strokeLinecap="round" fill="none">
            <path d="M186,152 C184,160 185,167 188,174" stroke={VOID} strokeWidth="2.4" />
            <path d="M188,174 C189,180 189,186 188,192" stroke={p.accent} strokeWidth="1.1" filter={u("glow")} />
            <path d="M166,128 C174,127 184,130 190,136" stroke={VOID} strokeWidth="2.6" />
          </g>
        ))}
        <NullMark c={c} x={200} y={116} r={8} eye />
        <path d="M193,188 C193,184 207,184 207,188 C207,193 203,195 200,195 C197,195 193,193 193,188 Z" fill={VOID} />
        <circle cx="197" cy="187" r="1.1" fill="#fff" opacity="0.6" />
        <path d="M200,195 L200,198 M195,201 C197,202 203,202 205,201" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
        <CheekMarks c={c} rows={[[140, 152, 16], [144, 158, 10], [138, 164, 14], [145, 170, 7]]} />
        <VoidEye c={c} x={181} y={144} r={9.5} ang={16} flip />
        <VoidEye c={c} x={219} y={144} r={9.5} ang={-16} />
      </g>
      {/* ear tips dissolving into dead pixels */}
      <Pixels
        c={c}
        pts={[
          [138, 30, 4, 0],
          [146, 22, 3, 2],
          [132, 18, 2, 1],
          [258, 28, 4, 1],
          [250, 18, 3, 0],
          [266, 14, 2, 2],
          [34, 250, 4, 0],
          [24, 238, 3, 2],
          [362, 246, 4, 1],
          [372, 232, 3, 0],
          [96, 300, 3, 3],
          [306, 300, 3, 2],
        ]}
      />
    </g>
  );
  return (
    <Glitched
      c={c}
      k="nb-asc"
      dx={4}
      bands={[
        [124, 6, 11],
        [206, 5, -12],
        [266, 7, 14],
        [324, 4, -8],
      ]}
      fig={fig}
    />
  );
}

export const nullborn: Renderer = {
  shadow: 90,
  halo: [200, 30, 30],
  stageFit: [1.2, 1.02, 0.9, 0.8],
  render: byStage(eggling, hatchling, evolved, ascended),
};
