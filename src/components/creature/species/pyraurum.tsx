import type { ReactNode } from "react";
import { blade, byStage, Dots, Eye, Gem, MIRROR, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/**
 * Pyraurum — the phoenix of the roster. Gold body plumage that burns crimson at
 * the edges, flame-tipped flight feathers, a flame crest and long fire streamers.
 * Not Helivane (a gold falcon with a sun disc, no flames) and not Aurelion (a dragon).
 */

type Pt = [number, number];

const CRIM = "#d8321e";
const EMBER = "#9a1a12";
const DEEP = "#5a0a0c";

/** Phoenix materials, one set per stage so every <defs> id is unique to its stage. */
function Materials({ c, s }: { c: Ctx; s: string }) {
  const { p, id } = c;
  const k = `${id}-${s}`;
  return (
    <defs>
      {/* a flame drawn along +x: crimson root, gold body, white-hot tip */}
      <linearGradient id={`${k}-fire`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={EMBER} />
        <stop offset="0.25" stopColor={CRIM} />
        <stop offset="0.55" stopColor={p.wing} />
        <stop offset="0.82" stopColor={p.accent} />
        <stop offset="1" stopColor={p.wingEdge} />
      </linearGradient>
      {/* an upright flame */}
      <linearGradient id={`${k}-fireUp`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={EMBER} />
        <stop offset="0.3" stopColor={CRIM} />
        <stop offset="0.6" stopColor={p.wing} />
        <stop offset="0.85" stopColor={p.accent} />
        <stop offset="1" stopColor={p.wingEdge} />
      </linearGradient>
      {/* a flight feather along +x: gold root burning to crimson at the tip */}
      <linearGradient id={`${k}-quill`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={p.accent} />
        <stop offset="0.45" stopColor={p.wing} />
        <stop offset="0.78" stopColor={CRIM} />
        <stop offset="1" stopColor={EMBER} />
      </linearGradient>
      {/* body plumage: gold, lit at the top, crimson at the shadow edge */}
      <radialGradient id={`${k}-plume`} cx="0.38" cy="0.3" r="0.85">
        <stop offset="0" stopColor={p.bodyLight} />
        <stop offset="0.35" stopColor={p.accent} />
        <stop offset="0.68" stopColor={p.wing} />
        <stop offset="0.9" stopColor={CRIM} />
        <stop offset="1" stopColor={p.wing} />
      </radialGradient>
      {/* chick down */}
      <radialGradient id={`${k}-down`} cx="0.4" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#fff9de" />
        <stop offset="0.4" stopColor={p.bodyLight} />
        <stop offset="0.82" stopColor={p.accent} />
        <stop offset="1" stopColor={p.wing} />
      </radialGradient>
      <radialGradient id={`${k}-heat`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={p.wingEdge} stopOpacity="0.9" />
        <stop offset="0.4" stopColor={p.wing} stopOpacity="0.45" />
        <stop offset="0.75" stopColor={CRIM} stopOpacity="0.18" />
        <stop offset="1" stopColor={CRIM} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const m = (c: Ctx, s: string, n: string) => `url(#${c.id}-${s}-${n})`;

/** Scalloped outline for down and fluff. */
function fluff(cx: number, cy: number, rx: number, ry: number, n: number, b: number) {
  const pt = (deg: number, k: number) => [round(cx + Math.cos((deg * Math.PI) / 180) * rx * k), round(cy + Math.sin((deg * Math.PI) / 180) * ry * k)];
  const [x0, y0] = pt(0, 1);
  let d = `M${x0},${y0}`;
  for (let i = 0; i < n; i++) {
    const a = (360 * i) / n;
    const [qx, qy] = pt(a + 180 / n, 1 + b);
    const [x, y] = pt(a + 360 / n, 1);
    d += ` Q${qx},${qy} ${x},${y}`;
  }
  return d + " Z";
}

/** A flame tongue along +x: round base of half-width w, flickering S-tip at length l. */
function flame(l: number, w: number, flick = 1) {
  const L = (k: number) => round(l * k);
  const W = (k: number) => round(w * k);
  return `M0,${W(-1)} C${L(0.35)},${W(-1.25)} ${L(0.5)},${W(-0.3)} ${L(0.7)},${W(-0.5)} C${L(0.84)},${W(-0.62)} ${L(0.92)},${W(-0.4 * flick)} ${round(l)},${W(-0.62 * flick)} C${L(0.9)},${W(0.12)} ${L(0.8)},${W(0.38)} ${L(0.64)},${W(0.46)} C${L(0.48)},${W(0.56)} ${L(0.4)},${W(1.25)} ${L(0.1)},${W(1.05)} C${L(-0.1)},${W(0.92)} ${L(-0.1)},${W(-0.92)} 0,${W(-1)} Z`;
}

/** A layered flame (outer fire, hot core) at a point and angle. */
function Flame({ c, s, at, a, l, w, flick = 1, core = true }: { c: Ctx; s: string; at: Pt; a: number; l: number; w: number; flick?: number; core?: boolean }) {
  return (
    <g transform={`translate(${round(at[0])} ${round(at[1])}) rotate(${round(a)})`}>
      <path d={flame(l, w, flick)} fill={m(c, s, "fire")} stroke={DEEP} strokeOpacity="0.35" strokeWidth="0.8" />
      {core && <path d={flame(l * 0.62, w * 0.46, flick)} transform={`translate(${round(l * 0.12)} 0)`} fill={c.p.wingEdge} opacity="0.6" />}
    </g>
  );
}

/** A flight feather (gold → crimson) finished with a flame tongue at its tip. */
function FlameQuill({ c, s, at, a, l, w, tongue = 0.42 }: { c: Ctx; s: string; at: Pt; a: number; l: number; w: number; tongue?: number }) {
  return (
    <g transform={`translate(${round(at[0])} ${round(at[1])}) rotate(${round(a)})`}>
      {tongue > 0 && (
        <g transform={`translate(${round(l * 0.8)} 0)`}>
          <path d={flame(l * tongue, w * 0.62)} fill={m(c, s, "fire")} />
          <path d={flame(l * tongue * 0.6, w * 0.26)} transform={`translate(${round(l * tongue * 0.18)} 0)`} fill={c.p.wingEdge} opacity="0.7" />
        </g>
      )}
      <path d={blade(l, w, 0.7)} fill={m(c, s, "quill")} stroke={DEEP} strokeOpacity="0.45" strokeWidth="0.9" />
      <path d={`M2,0 L${round(l * 0.86)},0`} stroke={c.p.wingEdge} strokeOpacity="0.55" strokeWidth="0.9" />
    </g>
  );
}

/**
 * A layered phoenix wing. The arm runs shoulder → wrist; secondaries hang from the arm (sa0 → sa1),
 * flame-tipped primaries fan from the wrist (pa0 → pa1), then coverts and a covert mass over the roots.
 */
function Wing({ c, s, sh, wr, sa, pa, L, ns = 6, np = 6, dim = false, tongue = 0.42 }: { c: Ctx; s: string; sh: Pt; wr: Pt; sa: [number, number]; pa: [number, number]; L: number; ns?: number; np?: number; dim?: boolean; tongue?: number }) {
  const { p } = c;
  const lerp = (t: number): Pt => [sh[0] + (wr[0] - sh[0]) * t, sh[1] + (wr[1] - sh[1]) * t];
  const secs = Array.from({ length: ns }, (_, i) => {
    const t = i / (ns - 1);
    return { at: lerp(t * 0.9), a: sa[0] + (sa[1] - sa[0]) * t, l: L * (0.48 + 0.08 * t), t };
  });
  const lens = [0.78, 0.88, 0.96, 1, 0.96, 0.88, 0.8, 0.72];
  const pris = Array.from({ length: np }, (_, i) => {
    const t = i / (np - 1);
    return { at: lerp(0.82 + 0.18 * t), a: pa[0] + (pa[1] - pa[0]) * t, l: L * lens[i % lens.length], t };
  });
  const roots = [...secs, ...pris];
  const off = (f: { at: Pt; a: number; l: number }, k: number): Pt => polar(f.at[0], f.at[1], f.l * k, f.a);
  const mass = [...roots.map((f) => f.at), ...roots.map((f) => off(f, 0.4)).reverse()];
  const massD = `M${mass.map(([x, y]) => `${round(x)},${round(y)}`).join(" L")} Z`;
  const w = L * 0.12;
  return (
    <g opacity={dim ? 0.85 : 1}>
      {[...pris].reverse().map((f) => (
        <FlameQuill key={`p${f.t}`} c={c} s={s} at={f.at} a={f.a} l={f.l} w={w} tongue={tongue} />
      ))}
      {[...secs].reverse().map((f) => (
        <FlameQuill key={`s${f.t}`} c={c} s={s} at={f.at} a={f.a} l={f.l} w={w * 1.1} tongue={tongue * 0.6} />
      ))}
      {roots.map((f, i) => (
        <path key={`g${i}`} d={blade(f.l * 0.46, w * 0.95, 0.62)} transform={`translate(${round(f.at[0])} ${round(f.at[1])}) rotate(${round(f.a)})`} fill={p.wing} stroke={EMBER} strokeOpacity="0.55" strokeWidth="0.8" />
      ))}
      <path d={massD} fill={m(c, s, "plume")} stroke={EMBER} strokeOpacity="0.5" strokeWidth="1" strokeLinejoin="round" />
      {/* median coverts: a row of crimson-edged feathers across the mass */}
      {roots.map((f, i) => {
        const [x, y] = off(f, 0.16);
        return <path key={`m${i}`} d={blade(f.l * 0.26, w * 0.85, 0.6)} transform={`translate(${round(x)} ${round(y)}) rotate(${round(f.a)})`} fill={p.wing} stroke={CRIM} strokeOpacity="0.7" strokeWidth="0.9" />;
      })}
      {roots
        .filter((_, i) => i % 2 === 0)
        .map((f, i) => {
          const [x, y] = off(f, 0.05);
          return <path key={`l${i}`} d={blade(f.l * 0.16, w * 0.7, 0.6)} transform={`translate(${round(x)} ${round(y)}) rotate(${round(f.a)})`} fill={p.bodyLight} opacity="0.6" />;
        })}
      {/* shoulder mass where the wing meets the body */}
      <ellipse cx={round(sh[0])} cy={round(sh[1])} rx={round(L * 0.15)} ry={round(L * 0.12)} fill={p.wing} />
      <path d={`M${round(sh[0])},${round(sh[1])} L${round(wr[0])},${round(wr[1])}`} stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/* ── fire streamers: a tapering ribbon along a cubic, with a flickering edge ── */

function bez(P: Pt[], t: number): Pt {
  const u = 1 - t;
  return [u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0], u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1]];
}

function smooth(pts: Pt[]) {
  const f = ([x, y]: Pt) => `${round(x)},${round(y)}`;
  let d = `M${f(pts[0])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mid: Pt = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    d += ` Q${f(pts[i])} ${f(mid)}`;
  }
  return `${d} L${f(pts[pts.length - 1])} Z`;
}

function ribbon(P: Pt[], w: number, wave: number, phase: number, n = 26) {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const [x, y] = bez(P, t);
    const [x2, y2] = bez(P, Math.min(1, t + 0.01));
    const [x1, y1] = bez(P, Math.max(0, t - 0.01));
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const ww = w * Math.pow(1 - t, 0.8) * (1 + wave * Math.sin(t * Math.PI * 5 + phase));
    left.push([x + nx * ww, y + ny * ww]);
    right.push([x - nx * ww * 0.85, y - ny * ww * 0.85]);
  }
  return smooth([...left, ...right.reverse()]);
}

/** A long fire streamer: crimson outer flame, orange and gold layers, a white-hot core and an ember at the tip. */
function Streamer({ c, P, w, i = 0 }: { c: Ctx; P: Pt[]; w: number; i?: number }) {
  const { p, u } = c;
  return (
    <g>
      <path d={ribbon(P, w, 0.26, i)} fill={CRIM} stroke={DEEP} strokeOpacity="0.45" strokeWidth="1" />
      <path d={ribbon(P, w * 0.66, 0.32, i + 1.2)} fill={p.wing} />
      <path d={ribbon(P, w * 0.36, 0.3, i + 2.1)} fill={p.accent} />
      <path d={ribbon(P, w * 0.13, 0, 0)} fill={p.wingEdge} opacity="0.85" />
      <circle cx={round(P[3][0])} cy={round(P[3][1])} r="3.2" fill={p.accent} filter={u("glow")} className="sl-twinkle" />
    </g>
  );
}

/** Breast plumage: rows of small scalloped feathers with crimson-burnt edges. */
function Scales({ c, rows }: { c: Ctx; rows: [number, number, number][] }) {
  return (
    <g fill={c.p.bodyLight} fillOpacity="0.35" stroke={CRIM} strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round">
      {rows.flatMap(([y, x0, x1], r) =>
        Array.from({ length: Math.max(1, Math.round((x1 - x0) / 11)) }, (_, i) => {
          const x = round(x0 + i * 11 + (r % 2 ? 5.5 : 0));
          return <path key={`${y}-${x}`} d={`M${x - 5},${y} C${x - 5},${y + 7} ${x + 5},${y + 7} ${x + 5},${y}`} />;
        }),
      )}
    </g>
  );
}

/** Scaled gold leg (shank under a feathered thigh) ending in three forward talons and a hind toe. */
function Talons({ c, x, top, foot, dir = 1 }: { c: Ctx; x: number; top: number; foot: number; dir?: number }) {
  const { p } = c;
  const d = dir;
  return (
    <g>
      <path d={`M${x - 4},${top} C${x - 5},${top + 8} ${x - 5},${foot - 10} ${x - 4},${foot - 3} L${x + 4},${foot - 3} C${x + 4},${foot - 10} ${x + 5},${top + 8} ${x + 4},${top} Z`} fill={p.accent} stroke={EMBER} strokeOpacity="0.7" strokeWidth="0.9" />
      {Array.from({ length: Math.max(1, Math.floor((foot - top - 6) / 5)) }, (_, i) => (
        <path key={i} d={`M${x - 4},${top + 5 + i * 5} L${x + 4},${top + 5 + i * 5}`} stroke={EMBER} strokeOpacity="0.4" strokeWidth="0.9" />
      ))}
      <path d={`M${x},${foot - 3} C${x + 8 * d},${foot - 2} ${x + 14 * d},${foot} ${x + 17 * d},${foot + 3} M${x},${foot - 3} C${x + 4 * d},${foot} ${x + 6 * d},${foot + 2} ${x + 7 * d},${foot + 4} M${x},${foot - 3} C${x - 6 * d},${foot - 1} ${x - 10 * d},${foot + 1} ${x - 11 * d},${foot + 4}`} fill="none" stroke={p.accent} strokeWidth="3.6" strokeLinecap="round" />
      <path d={`M${x + 17 * d},${foot + 3} l${2 * d},3 M${x + 7 * d},${foot + 4} l${1 * d},3 M${x - 11 * d},${foot + 4} l${-2 * d},3`} stroke={DEEP} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

/**
 * Phoenix head in profile facing right, centred on the skull. `crest` 1..3 grows the flame crest;
 * `young` gives a big round eye and a short beak; `cry` opens the beak.
 */
function Head({ c, s, x, y, k = 1, rot = 0, crest = 2, young = false, cry = false }: { c: Ctx; s: string; x: number; y: number; k?: number; rot?: number; crest?: 1 | 2 | 3; young?: boolean; cry?: boolean }) {
  const { p, u } = c;
  const plumes: [number, number, number, number, number][] = (
    {
      1: [
        [-10, -16, 234, 22, 6],
        [-16, -10, 212, 26, 6],
        [-4, -20, 256, 16, 5],
      ],
      2: [
        [-2, -20, 268, 24, 6],
        [-8, -18, 246, 36, 7],
        [-14, -14, 226, 46, 8],
        [-18, -8, 206, 50, 8],
        [-20, -2, 188, 38, 7],
      ],
      3: [
        [2, -22, 282, 30, 6],
        [-4, -21, 262, 44, 7],
        [-10, -18, 242, 58, 8],
        [-15, -14, 224, 70, 9],
        [-19, -8, 206, 74, 9],
        [-21, -2, 190, 60, 8],
        [-20, 4, 174, 42, 7],
      ],
    } as const
  )[crest].map((r) => [...r] as [number, number, number, number, number]);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
      <g className="sl-sway-slow" style={{ transformOrigin: "-12px -12px" }}>
        {plumes.map(([bx, by, a, l, w], i) => (
          <g key={a}>
            <Flame c={c} s={s} at={[bx, by]} a={a} l={l} w={w} flick={i % 2 ? -1 : 1} />
          </g>
        ))}
        {crest === 3 && (
          <g fill={p.wingEdge} filter={u("glow")}>
            {plumes.slice(1, 5).map(([bx, by, a, l]) => {
              const [tx, ty] = polar(bx, by, l * 0.98, a);
              return <circle key={a} cx={tx} cy={ty} r="2.2" />;
            })}
          </g>
        )}
      </g>
      {/* skull */}
      <path d="M-22,4 C-24,-14 -8,-25 8,-23 C22,-21 29,-9 27,4 C25,16 12,23 -1,23 C-14,23 -21,15 -22,4 Z" fill={m(c, s, "plume")} {...rim(c)} />
      {/* crimson flame mask sweeping back from the eye */}
      <path d={young ? "M18,-4 C10,-12 -2,-11 -12,-4 C-4,-3 6,1 14,3 Z" : "M22,-5 C12,-13 -4,-12 -22,-2 C-8,-2 6,2 16,4 Z"} fill={CRIM} opacity={young ? 0.55 : 0.85} />
      <path d="M-6,6 C0,16 12,20 22,12 C14,12 4,10 -6,6 Z" fill={p.belly} opacity="0.85" />
      <Spec x={4} y={-17} rx={12} ry={4.5} rot={-6} o={0.38} />
      <path d="M-4,-23 C10,-24 24,-14 27,0" fill="none" stroke={p.wingEdge} strokeWidth="2.2" strokeLinecap="round" filter={u("glow")} opacity="0.85" />
      {/* beak: straight and keen, a small hook — not a falcon's */}
      <g transform={young ? "translate(21 0) scale(0.72) translate(-21 0)" : undefined}>
        <path d="M21,-8 C31,-9 42,-5 49,2 C46,4 42,4 40,4 C33,3 27,3 22,4 Z" fill={p.horn} stroke={EMBER} strokeOpacity="0.75" strokeWidth="1" />
        <path d="M23,-6 C31,-7 40,-4 45,0" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
        <g transform={cry ? "rotate(16 22 5)" : undefined}>
          <path d="M22,5 C29,5 36,5 42,5 C36,10 28,11 21,9 Z" fill={p.accent} stroke={EMBER} strokeOpacity="0.7" strokeWidth="0.9" />
        </g>
        <circle cx="28" cy="-3" r="1" fill={DEEP} opacity="0.6" />
      </g>
      {young ? <Eye c={c} x={9} y={-4} r={8.6} kind="round" /> : <Eye c={c} x={10} y={-4} r={6} kind="almond" angle={-8} />}
      {!young && <path d="M1,-12 C6,-15 14,-15 19,-11" fill="none" stroke={DEEP} strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />}
    </g>
  );
}

/** Rising embers. */
function Embers({ c, pts, r = 2.2 }: { c: Ctx; pts: Pt[]; r?: number }) {
  return <Dots c={c} pts={pts} r={r} color={c.p.accent} />;
}

/* ───────────────────────────── stages ───────────────────────────── */

/** Eggling: a round ball of golden down sitting on its toes, one flame feather flickering on its crown. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const s = "eggling";
  return (
    <g>
      <Materials c={c} s={s} />
      <circle cx="200" cy="270" r="96" fill={m(c, s, "heat")} opacity="0.55" />
      {/* tail stub: a tiny flame flick */}
      <g className="sl-sway" style={{ transformOrigin: "240px 330px" }}>
        <Flame c={c} s={s} at={[236, 332]} a={-24} l={40} w={10} />
      </g>
      {/* feet */}
      <Talons c={c} x={184} top={338} foot={350} />
      <Talons c={c} x={218} top={338} foot={350} />
      {/* round downy body */}
      <path d={fluff(200, 300, 58, 50, 22, 0.06)} fill={m(c, s, "down")} {...rim(c)} />
      <path d={fluff(200, 316, 34, 28, 14, 0.08)} fill={p.belly} opacity="0.9" />
      <path d="M186,316 L189,322 M200,312 L201,318 M212,320 L214,326 M194,330 L196,336" stroke={p.wing} strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
      {/* stubby wings tipped in red */}
      {[0, 1].map((side) => (
        <g key={side} transform={side ? MIRROR : undefined}>
          <g className="sl-flap" style={{ transformOrigin: "152px 286px" }}>
            <path d="M156,280 C138,282 130,300 134,318 C138,326 146,326 152,320 C158,306 160,292 156,280 Z" fill={m(c, s, "down")} {...rim(c, 1)} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={blade(11, 3.5)} transform={`translate(${140 + i * 4} ${318 + i * 2}) rotate(${110 - i * 16})`} fill={CRIM} opacity="0.9" />
            ))}
          </g>
        </g>
      ))}
      <Gem c={c} x={200} y={318} s={0.46} />
      {/* the single flame feather on its crown */}
      <g className="sl-sway" style={{ transformOrigin: "200px 192px" }}>
        <Flame c={c} s={s} at={[200, 194]} a={-96} l={44} w={11} />
      </g>
      {/* big round head */}
      <path d={fluff(200, 232, 50, 45, 20, 0.05)} fill={m(c, s, "down")} {...rim(c)} />
      <Spec x={188} y={202} rx={24} ry={8} rot={-10} o={0.3} />
      {/* faint crimson flame marks behind the eyes, the hint of a mask */}
      <path d="M156,222 C162,216 168,214 172,216 C168,220 162,224 156,222 Z" fill={CRIM} opacity="0.5" />
      <path d="M244,222 C238,216 232,214 228,216 C232,220 238,224 244,222 Z" fill={CRIM} opacity="0.5" />
      <ellipse cx="166" cy="248" rx="9" ry="5" fill={CRIM} opacity="0.3" />
      <ellipse cx="234" cy="248" rx="9" ry="5" fill={CRIM} opacity="0.3" />
      <Eye c={c} x={180} y={232} r={12} kind="round" flip />
      <Eye c={c} x={220} y={232} r={12} kind="round" />
      {/* small pointed beak */}
      <path d="M192,244 C196,240 204,240 208,244 C206,250 202,255 200,258 C198,255 194,250 192,244 Z" fill={p.horn} stroke={EMBER} strokeOpacity="0.7" strokeWidth="1" />
      <path d="M193,246 C197,249 203,249 207,246" fill="none" stroke={EMBER} strokeOpacity="0.5" strokeWidth="0.9" />
      <Embers c={c} pts={[[150, 196], [252, 186], [138, 250], [262, 260], [226, 168]]} r={1.8} />
    </g>
  );
}

/** Hatchling: a gangly fledgling on long legs, wings half-raised, a three-flame crest and its first two flame plumes. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const s = "hatchling";
  return (
    <g>
      <Materials c={c} s={s} />
      <circle cx="196" cy="240" r="120" fill={m(c, s, "heat")} opacity="0.45" />
      {/* two flame plumes */}
      <g className="sl-sway-slow" style={{ transformOrigin: "164px 288px" }}>
        <Streamer c={c} P={[[166, 284], [126, 290], [96, 256], [72, 216]]} w={13} i={0} />
        <Streamer c={c} P={[[166, 292], [122, 318], [86, 320], [56, 300]]} w={12} i={2} />
      </g>
      {/* far wing, raised behind */}
      <g className="sl-flap" style={{ transformOrigin: "222px 234px" }}>
        <Wing c={c} s={s} sh={[222, 234]} wr={[204, 188]} sa={[186, 214]} pa={[226, 268]} L={46} ns={4} np={5} dim tongue={0.3} />
      </g>
      {/* far leg */}
      <ellipse cx="214" cy="304" rx="15" ry="14" fill={p.wing} {...rim(c, 1)} />
      <Talons c={c} x={214} top={314} foot={348} />
      {/* body */}
      <path d="M160,270 C156,236 178,214 206,214 C234,214 252,236 248,266 C246,298 228,318 204,320 C180,320 162,302 160,270 Z" fill={m(c, s, "plume")} {...rim(c)} />
      <path d="M212,232 C236,236 248,258 244,282 C238,304 222,316 206,318 C214,296 216,262 212,232 Z" fill={p.belly} opacity="0.92" />
      <Scales
        c={c}
        rows={[
          [256, 218, 238],
          [268, 216, 240],
          [280, 214, 238],
          [292, 214, 232],
        ]}
      />
      {/* leftover down tufts */}
      <g fill={p.bodyLight} opacity="0.8">
        {[
          [176, 232, 7],
          [166, 252, 6],
          [190, 222, 5],
          [236, 300, 5],
        ].map(([x, y, r]) => (
          <path key={`${x}${y}`} d={fluff(x, y, r, r, 7, 0.25)} />
        ))}
      </g>
      <Spec x={196} y={226} rx={20} ry={6} rot={-14} o={0.28} />
      {/* near thigh and leg */}
      <path d="M180,288 C196,280 212,290 212,306 C210,318 198,322 188,318 C178,312 174,298 180,288 Z" fill={m(c, s, "plume")} {...rim(c, 1)} />
      <path d="M184,312 C190,318 200,318 206,312" fill="none" stroke={CRIM} strokeOpacity="0.6" strokeWidth="1.4" />
      <Talons c={c} x={194} top={316} foot={350} />
      {/* near wing, half-spread like a first try at flight */}
      <g className="sl-flap" style={{ transformOrigin: "204px 246px" }}>
        <Wing c={c} s={s} sh={[204, 246]} wr={[162, 236]} sa={[116, 148]} pa={[156, 200]} L={62} ns={5} np={5} tongue={0.34} />
      </g>
      <Gem c={c} x={232} y={270} s={0.5} />
      {/* slender neck */}
      <path d="M196,224 C206,202 220,184 232,172 L258,176 C264,196 260,224 248,250 C234,252 212,242 196,224 Z" fill={m(c, s, "plume")} />
      <path d="M252,184 C258,204 256,228 246,248 C240,232 240,208 244,190 Z" fill={p.belly} opacity="0.9" />
      <path d="M204,220 C214,202 226,186 236,176" fill="none" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      <Head c={c} s={s} x={246} y={168} k={1.08} rot={-6} crest={1} young />
      <Embers c={c} pts={[[118, 216], [290, 150], [96, 290], [290, 240], [150, 178]]} r={1.9} />
    </g>
  );
}

/** Evolved: a full phoenix climbing into the sky, wings raised, crest blazing, fire streamers trailing behind. */
function evolved(c: Ctx) {
  const { p, u } = c;
  const s = "evolved";
  return (
    <g>
      <Materials c={c} s={s} />
      <circle cx="200" cy="200" r="150" fill={m(c, s, "heat")} opacity="0.4" />
      {/* fire streamers */}
      <g className="sl-sway-slow" style={{ transformOrigin: "160px 252px" }}>
        <Streamer c={c} P={[[160, 250], [120, 250], [80, 230], [34, 250]]} w={12} i={0} />
        <Streamer c={c} P={[[162, 256], [124, 290], [70, 284], [40, 320]]} w={14} i={1.5} />
        <Streamer c={c} P={[[166, 260], [150, 310], [100, 330], [76, 372]]} w={13} i={3} />
        <Streamer c={c} P={[[170, 262], [178, 310], [142, 344], [138, 384]]} w={10} i={4.2} />
      </g>
      {/* far wing, raised high */}
      <g className="sl-flap" style={{ transformOrigin: "222px 186px" }}>
        <Wing c={c} s={s} sh={[222, 186]} wr={[244, 102]} sa={[164, 196]} pa={[218, 286]} L={84} ns={6} np={6} dim />
      </g>
      {/* body, tilted into the climb */}
      <g transform="translate(200 214) rotate(-38) scale(1.14)">
        {/* tail coverts */}
        {[164, 176, 188, 200].map((a, i) => (
          <FlameQuill key={a} c={c} s={s} at={[-48, 4 + i * 3]} a={a} l={38 - i * 2} w={9} tongue={0.3} />
        ))}
        <path d="M-58,6 C-52,-20 -12,-30 22,-27 C50,-24 64,-8 62,8 C58,24 32,32 2,31 C-28,30 -54,22 -58,6 Z" fill={m(c, s, "plume")} {...rim(c)} />
        <path d="M-40,18 C-16,30 24,32 52,16 C42,28 20,32 -2,31 C-20,30 -32,26 -40,18 Z" fill={p.belly} opacity="0.9" />
        <Scales
          c={c}
          rows={[
            [8, 18, 50],
            [16, 4, 46],
          ]}
        />
        <Spec x={8} y={-20} rx={30} ry={5} rot={-2} o={0.32} />
        {/* tucked legs: thigh mass, shank and closed talons */}
        <path d="M-14,20 C-2,14 12,20 12,32 C10,42 -2,46 -12,42 C-20,36 -22,26 -14,20 Z" fill={m(c, s, "plume")} {...rim(c, 1)} />
        <path d="M-8,38 C-16,44 -24,46 -30,46" fill="none" stroke={EMBER} strokeOpacity="0.6" strokeWidth="9" strokeLinecap="round" />
        <path d="M-8,38 C-16,44 -24,46 -30,46" fill="none" stroke={p.accent} strokeWidth="7" strokeLinecap="round" />
        <path d="M-30,46 C-36,44 -40,48 -40,52 M-30,46 C-36,48 -36,54 -34,56 M-30,46 C-32,52 -28,56 -26,58" fill="none" stroke={p.accent} strokeWidth="3" strokeLinecap="round" />
        <path d="M-40,52 l0,3 M-34,56 l2,2 M-26,58 l2,1" stroke={DEEP} strokeWidth="2" strokeLinecap="round" />
        <Gem c={c} x={30} y={10} s={0.55} angle={38} />
      </g>
      {/* near wing, raised and sweeping back */}
      <g className="sl-flap" style={{ transformOrigin: "200px 200px" }}>
        <Wing c={c} s={s} sh={[200, 202]} wr={[138, 108]} sa={[150, 186]} pa={[196, 262]} L={96} ns={7} np={7} />
      </g>
      {/* neck */}
      <path d="M212,198 C220,176 236,156 252,144 L286,156 C292,178 282,200 264,214 C248,218 228,212 212,198 Z" fill={m(c, s, "plume")} />
      <path d="M266,212 C280,200 288,182 286,164 C278,178 268,194 254,208 Z" fill={p.belly} opacity="0.9" />
      <path d="M220,192 C228,174 240,160 252,150" fill="none" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      <Head c={c} s={s} x={274} y={138} k={1.1} rot={-28} crest={2} />
      <Embers c={c} pts={[[60, 200], [330, 230], [96, 150], [300, 290], [40, 290], [250, 320], [330, 90]]} />
    </g>
  );
}

/** Ascended: the Pyre-Risen — rising from its own pyre, wings of flame raised wide, crest like a crown, an ember storm around it. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const s = "ascended";
  const storm: Pt[] = Array.from({ length: 12 }, (_, i) => polar(200, 200, 140 + (i % 3) * 18, i * 30 + 8));
  const side = (key: string): ReactNode => (
    <g key={key}>
      {/* outer tail streamers curling up at the sides */}
      <g className="sl-sway-slow" style={{ transformOrigin: "196px 300px" }}>
        <Streamer c={c} P={[[194, 298], [150, 344], [76, 344], [52, 292]]} w={14} i={0.6} />
        <Streamer c={c} P={[[196, 304], [176, 352], [126, 372], [96, 382]]} w={12} i={2.4} />
      </g>
      {/* great flaming wing raised wide */}
      <g className="sl-flap" style={{ transformOrigin: "176px 208px" }}>
        <Wing c={c} s={s} sh={[178, 208]} wr={[100, 150]} sa={[118, 160]} pa={[196, 264]} L={112} ns={7} np={8} tongue={0.55} />
      </g>
    </g>
  );
  return (
    <g>
      <Materials c={c} s={s} />
      <circle cx="200" cy="210" r="175" fill={m(c, s, "heat")} opacity="0.55" />
      {/* the heat of the pyre it rose from */}
      <ellipse cx="200" cy="366" rx="96" ry="22" fill={p.wing} opacity="0.4" filter={u("blur20")} />
      <g className="sl-spin-slow" style={{ transformOrigin: "200px 200px" }}>
        <Embers c={c} pts={storm} r={2.4} />
      </g>
      {side("l")}
      <g transform={MIRROR}>{side("r")}</g>
      {/* central fire tail */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 300px" }}>
        <Streamer c={c} P={[[200, 300], [190, 336], [214, 356], [200, 390]]} w={13} i={1} />
      </g>
      {[80, 90, 100].map((a, i) => (
        <FlameQuill key={a} c={c} s={s} at={[200, 296]} a={a} l={i === 1 ? 46 : 40} w={11} tongue={0.4} />
      ))}
      {/* tucked talons under the body */}
      <Talons c={c} x={186} top={300} foot={322} dir={-1} />
      <Talons c={c} x={214} top={300} foot={322} />
      <ellipse cx="185" cy="294" rx="16" ry="14" fill={m(c, s, "plume")} {...rim(c, 1)} />
      <ellipse cx="215" cy="294" rx="16" ry="14" fill={m(c, s, "plume")} {...rim(c, 1)} />
      {/* body, facing out */}
      <ellipse cx="200" cy="238" rx="46" ry="74" fill={DEEP} opacity="0.35" filter={u("blur8")} />
      <path d="M164,224 C160,192 178,172 200,172 C222,172 240,192 236,224 C234,262 224,292 200,306 C176,292 166,262 164,224 Z" fill={m(c, s, "plume")} {...rim(c)} />
      <path d="M180,206 C190,200 210,200 220,206 C226,240 220,278 200,300 C180,278 174,240 180,206 Z" fill={p.belly} />
      <Scales
        c={c}
        rows={[
          [226, 184, 216],
          [238, 182, 218],
          [250, 184, 216],
          [262, 186, 214],
          [274, 190, 210],
        ]}
      />
      <path d="M165,226 C162,196 178,176 200,174 C222,176 238,196 235,226" fill="none" stroke={p.wingEdge} strokeWidth="2.6" strokeLinecap="round" filter={u("glow")} />
      <Gem c={c} x={200} y={214} s={0.66} />
      {/* neck turning to the right */}
      {/* flame ruff where neck meets breast */}
      {[18, 40, 62, 90, 118, 140, 162].map((a, i) => (
        <FlameQuill key={a} c={c} s={s} at={polar(202, 180, 18, a)} a={a} l={30 - Math.abs(i - 3) * 2} w={8} tongue={0.5} />
      ))}
      <path d="M178,194 C174,168 188,146 208,134 L240,146 C238,164 232,180 226,196 C210,202 190,202 178,194 Z" fill={m(c, s, "plume")} />
      <path d="M226,194 C234,178 240,162 238,148 C230,160 220,176 214,196 Z" fill={p.belly} opacity="0.9" />
      <path d="M184,188 C182,168 192,152 206,142" fill="none" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      <Head c={c} s={s} x={222} y={122} k={1.16} rot={-14} crest={3} cry />
      {/* gold crown-band at the crest root */}
      <g transform="translate(222 122) rotate(-14) scale(1.16)">
        <path d="M-14,-22 C-6,-26 4,-26 10,-23" fill="none" stroke={p.wingEdge} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="-2" cy="-25" r="2" fill="#fff" filter={u("glow")} />
      </g>
    </g>
  );
}

export const pyraurum: Renderer = {
  shadow: 110,
  halo: [214, 44, 24],
  stageFit: [1.2, 1.1, 0.9, 0.88],
  render: byStage(eggling, hatchling, evolved, ascended),
};
