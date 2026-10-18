import type { ReactNode } from "react";
import { blade, byStage, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/**
 * Zephrax — a long Eastern storm dragon whose body coils through billowing
 * storm clouds: navy scales with a pearl underside, crystal dorsal spines,
 * a flowing pearl mane and whiskers, and lightning crackling in the clouds.
 */

type P = [number, number];

/* ───────────── serpent body kit (centre line → tapered, shaded ribbon) ───────────── */

/** Samples an SVG-like cubic chain: start point, then [c1x,c1y,c2x,c2y,x,y] per segment. */
function chain(x: number, y: number, cs: number[][], n = 14): P[] {
  const out: P[] = [[x, y]];
  let p0: P = [x, y];
  for (const s of cs) {
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const m = 1 - t;
      const a = m * m * m;
      const b = 3 * m * m * t;
      const d = 3 * m * t * t;
      const e = t * t * t;
      out.push([round(a * p0[0] + b * s[0] + d * s[2] + e * s[4]), round(a * p0[1] + b * s[1] + d * s[3] + e * s[5])]);
    }
    p0 = [s[4], s[5]];
  }
  return out;
}

interface Body {
  pts: P[];
  /** Unit normal pointing to the dorsal side (left of travel, head → tail). */
  nv: P[];
  /** Unit tangent, head → tail. */
  tv: P[];
  w: number[];
}

function body(pts: P[], wf: (t: number) => number): Body {
  const n = pts.length;
  const tv: P[] = [];
  const nv: P[] = [];
  const w: number[] = [];
  pts.forEach((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    tv.push([dx / l, dy / l]);
    nv.push([dy / l, -dx / l]);
    w.push(wf(i / (n - 1)));
  });
  return { pts, nv, tv, w };
}

/** Width profile: slightly slimmer neck, full chest, long taper to the tail. */
const taper = (W: number, tip = 0.14, neck = 0.82) => (t: number) => (t < 0.16 ? W * (neck + ((1 - neck) * t) / 0.16) : W * (tip + (1 - tip) * (1 - Math.pow((t - 0.16) / 0.84, 1.5))));

const off = (B: Body, i: number, k: number): P => [round(B.pts[i][0] + B.nv[i][0] * B.w[i] * k), round(B.pts[i][1] + B.nv[i][1] * B.w[i] * k)];
const line = (ps: P[]) => ps.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
const range = (i0: number, i1: number) => Array.from({ length: i1 - i0 + 1 }, (_, k) => i0 + k);

function band(B: Body, a: number, b: number, i0: number, i1: number) {
  const r = range(i0, i1);
  return `${line(r.map((i) => off(B, i, a)))} ${line(r.reverse().map((i) => off(B, i, b))).replace("M", "L")} Z`;
}

/** Draws samples i0..i1 of a serpent body: shaded tube, pearl belly plates, scale rows, rim. */
function Serpent({ c, B, from = 0, to }: { c: Ctx; B: Body; from?: number; to?: number }) {
  const { p } = c;
  const i1 = Math.min(to ?? B.pts.length - 1, B.pts.length - 1);
  const r = range(from, i1);
  return (
    <g strokeLinejoin="round">
      <path d={band(B, 0.5, -0.5, from, i1)} fill={p.body} />
      <path d={band(B, -0.06, -0.5, from, i1)} fill={p.bodyDark} opacity="0.55" />
      <path d={band(B, -0.2, -0.47, from, i1)} fill={p.horn} opacity="0.82" />
      <g stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1.1">
        {r
          .filter((i) => i % 2 === 0 && i < B.pts.length - 3)
          .map((i) => {
            const [x1, y1] = off(B, i, -0.2);
            const [x2, y2] = off(B, i, -0.47);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
      </g>
      <path d={band(B, 0.44, 0.1, from, i1)} fill={p.bodyLight} opacity="0.5" />
      {/* scale rows */}
      <path d={line(r.map((i) => off(B, i, 0.18)))} fill="none" stroke={p.bodyLight} strokeOpacity="0.45" strokeWidth="2.4" strokeDasharray="2 4" strokeLinecap="round" />
      <path d={line(r.map((i) => off(B, i, -0.02)))} fill="none" stroke={p.bodyLight} strokeOpacity="0.25" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
      <path d={line(r.map((i) => off(B, i, 0.32)))} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.4" strokeLinecap="round" />
      {/* rim on both flanks only, so pieces join without seams */}
      <path d={line(r.map((i) => off(B, i, 0.5)))} fill="none" {...rim(c)} strokeOpacity="0.7" />
      <path d={line(r.map((i) => off(B, i, -0.5)))} fill="none" {...rim(c)} strokeOpacity="0.7" />
    </g>
  );
}

/** Faceted crystal spines along the dorsal edge, leaning toward the tail. */
function Spines({ c, B, at, h, defs, glow = false }: { c: Ctx; B: Body; at: number[]; h: (k: number) => number; defs: string; glow?: boolean }) {
  return (
    <g>
      {at.map((i, k) => {
        const [ex, ey] = off(B, i, 0.36);
        const [nx, ny] = B.nv[i];
        const [tx, ty] = B.tv[i];
        const H = h(k);
        const bw = Math.max(3, H * 0.34);
        const tip: P = [round(ex + nx * H + tx * H * 0.45), round(ey + ny * H + ty * H * 0.45)];
        const b1: P = [round(ex - tx * bw), round(ey - ty * bw)];
        const b2: P = [round(ex + tx * bw), round(ey + ty * bw)];
        const mid: P = [round(ex + nx * H * 0.2), round(ey + ny * H * 0.2)];
        return (
          <g key={i}>
            <path d={`M${b1[0]},${b1[1]} L${tip[0]},${tip[1]} L${b2[0]},${b2[1]} Z`} fill={`url(#${defs}-crys)`} stroke={c.p.bodyDark} strokeOpacity="0.45" strokeWidth="0.9" strokeLinejoin="round" />
            <path d={`M${mid[0]},${mid[1]} L${tip[0]},${tip[1]} L${b2[0]},${b2[1]} Z`} fill={c.p.bodyLight} opacity="0.45" />
            <path d={`M${b1[0]},${b1[1]} L${tip[0]},${tip[1]}`} stroke="#fff" strokeOpacity="0.75" strokeWidth="1" filter={glow ? c.u("glow") : undefined} />
          </g>
        );
      })}
    </g>
  );
}

/** Flowing mane tufts along the back of the neck. */
function Mane({ c, B, at, len, wide = 6 }: { c: Ctx; B: Body; at: number[]; len: (k: number) => number; wide?: number }) {
  return (
    <g>
      {at.map((i, k) => {
        const [ex, ey] = off(B, i, 0.3);
        const [nx, ny] = B.nv[i];
        const [tx, ty] = B.tv[i];
        const ang = round((Math.atan2(ny * 0.7 + ty * 0.9, nx * 0.7 + tx * 0.9) * 180) / Math.PI);
        const L = len(k);
        return (
          <g key={i} transform={`translate(${ex} ${ey}) rotate(${ang})`}>
            <path d={blade(L, wide)} fill={c.u("wing")} transform="rotate(-14)" />
            <path d={blade(round(L * 0.86), round(wide * 0.8))} fill={c.p.horn} opacity="0.92" stroke={c.p.bodyDark} strokeOpacity="0.25" strokeWidth="0.8" />
            <path d={`M2,0 C${round(L * 0.3)},-1 ${round(L * 0.6)},-1 ${round(L * 0.82)},0`} stroke={c.p.wingEdge} strokeOpacity="0.5" strokeWidth="0.8" fill="none" />
          </g>
        );
      })}
    </g>
  );
}

/** A short clawed dragon leg: muscled upper limb, jointed forearm, three-taloned paw. Local: attaches at 0,0, hangs toward +y, paw points −x. */
function Leg({ c, x, y, rot = 0, s = 1, near = true, open = false }: { c: Ctx; x: number; y: number; rot?: number; s?: number; near?: boolean; open?: boolean }) {
  const { p, u } = c;
  const fill = near ? u("body") : p.bodyDark;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M-11,-8 C-16,6 -10,20 0,26 C8,26 13,16 12,2 C11,-8 -4,-13 -11,-8 Z" fill={fill} {...(near ? rim(c, 1) : {})} />
      <path d="M-3,18 C-8,28 -11,36 -13,42 L-2,45 C0,37 5,29 9,21 Z" fill={fill} {...(near ? rim(c, 1) : {})} />
      {near && <ellipse cx="-2" cy="4" rx="5" ry="9" fill={p.bodyLight} opacity="0.35" transform="rotate(-18 -2 4)" />}
      <ellipse cx="-9" cy="44" rx="8" ry="4.6" fill={fill} {...(near ? rim(c, 1) : {})} />
      <path d="M-3,40 C2,38 5,36 6,32" stroke={p.horn} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity={near ? 0.9 : 0.5} />
      <g stroke={p.horn} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={near ? 1 : 0.55}>
        {open ? (
          <path d="M-15,42 C-21,38 -24,34 -24,29 M-16,45 C-23,45 -27,42 -29,38 M-14,48 C-20,51 -24,51 -27,48" />
        ) : (
          <path d="M-15,42 C-19,42 -21,45 -21,48 M-15,45 C-18,46 -19,49 -18,51 M-11,47 C-13,49 -13,51 -11,53" />
        )}
      </g>
    </g>
  );
}

/** A billowing storm cloud: a back row of large puffs, a front row of smaller ones, a shaded base. */
function Cloud({ c, defs, x, y, w, h, seed = 0, o = 1, flat = false }: { c: Ctx; defs: string; x: number; y: number; w: number; h: number; seed?: number; o?: number; flat?: boolean }) {
  const n = Math.max(3, Math.round(w / (h * 0.8)));
  const jit = (i: number) => Math.abs(Math.sin(seed * 1.7 + i * 2.3));
  const back = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const bump = Math.sin(t * Math.PI);
    const r = round(h * (0.3 + 0.42 * bump) * (0.8 + 0.4 * jit(i)));
    return { cx: round(x - w / 2 + t * w + (jit(i + 5) - 0.5) * h * 0.3), cy: round(y - h * (flat ? 0.04 : 0.2) * bump - r * 0.15), r };
  });
  const m = Math.max(2, n - 1);
  const front = Array.from({ length: m }, (_, i) => {
    const t = (i + 0.5) / m;
    const r = round(h * (0.26 + 0.14 * Math.sin(t * Math.PI)) * (0.85 + 0.3 * jit(i + 9)));
    return { cx: round(x - w * 0.42 + t * w * 0.84), cy: round(y + h * 0.16), r };
  });
  const puff = (q: { cx: number; cy: number; r: number }, k: string, base: string, lit: string) => (
    <g key={k}>
      <circle cx={q.cx} cy={q.cy} r={q.r} fill={base} stroke="#6577b8" strokeOpacity="0.3" />
      <circle cx={round(q.cx - q.r * 0.14)} cy={round(q.cy - q.r * 0.18)} r={round(q.r * 0.8)} fill={lit} />
    </g>
  );
  return (
    <g opacity={o}>
      <ellipse cx={x} cy={round(y + h * 0.1)} rx={round(w * 0.56)} ry={round(h * 0.6)} fill="#b9c8f2" opacity="0.16" filter={c.u("blur8")} />
      {back.map((q, i) => puff(q, `b${i}`, "#a9b9e6", `url(#${defs}-cloud)`))}
      {front.map((q, i) => puff(q, `f${i}`, "#bccaf0", "#eef3ff"))}
      <ellipse cx={x} cy={round(y + h * 0.32)} rx={round(w * 0.45)} ry={round(h * 0.12)} fill="#7e8fcc" opacity="0.5" />
    </g>
  );
}

/** A crackling lightning arc. */
function Bolt({ c, d, w = 1.6 }: { c: Ctx; d: string; w?: number }) {
  return (
    <g filter={c.u("glow")} className="sl-twinkle" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={c.p.accent} strokeWidth={w} />
      <path d={d} stroke="#fff" strokeWidth={round(w * 0.45)} />
    </g>
  );
}

/** A sweeping wind streak. */
function Wind({ c, d, o = 0.4, w = 1.6 }: { c: Ctx; d: string; o?: number; w?: number }) {
  return <path d={d} fill="none" stroke={c.p.horn} strokeOpacity={o} strokeWidth={w} strokeLinecap="round" className="sl-rune-pulse" />;
}

function Defs({ c, s }: { c: Ctx; s: string }) {
  const id = `${c.id}${s}`;
  return (
    <defs>
      <radialGradient id={`${id}-cloud`} cx="0.42" cy="0.22" r="0.92">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.6" stopColor="#e8effd" />
        <stop offset="1" stopColor="#cdd8f6" />
      </radialGradient>
      <linearGradient id={`${id}-crys`} x1="0" y1="1" x2="0.4" y2="0">
        <stop offset="0" stopColor={c.p.bodyLight} />
        <stop offset="0.5" stopColor={c.p.accent} />
        <stop offset="1" stopColor="#f2ffff" />
      </linearGradient>
    </defs>
  );
}

/* ───────────── heads ───────────── */

/**
 * The long horned dragon head, facing left. Origin is the back of the skull;
 * stage 1 is a short-snouted juvenile, 2 mature, 3 the crowned apex form.
 */
function DragonHead({ c, x, y, s = 1, rot = 0, stage }: { c: Ctx; x: number; y: number; s?: number; rot?: number; stage: 1 | 2 | 3 }) {
  const { p, u } = c;
  const juv = stage === 1;
  const asc = stage === 3;
  const upper = juv
    ? "M14,-2 C14,-18 4,-28 -12,-28 C-26,-28 -34,-20 -42,-14 C-50,-10 -56,-8 -58,-2 C-60,4 -54,8 -44,8 C-28,10 -8,12 4,12 C10,10 14,6 14,-2 Z"
    : "M16,-2 C16,-16 6,-26 -10,-26 C-24,-26 -32,-20 -42,-16 C-52,-13 -62,-14 -70,-12 C-78,-10 -81,-2 -77,3 C-71,7 -56,6 -40,6 C-22,8 -6,12 6,12 C12,10 16,6 16,-2 Z";
  const jaw = juv
    ? "M4,10 C-10,15 -28,16 -42,12 C-48,12 -48,17 -42,19 C-26,23 -8,22 8,16 Z"
    : asc
      ? "M6,8 C-10,18 -34,26 -60,28 C-66,28 -66,33 -60,34 C-36,34 -10,28 8,16 Z"
      : "M4,10 C-10,16 -34,18 -58,15 C-64,14 -66,19 -60,21 C-38,26 -10,26 8,16 Z";
  const snout = juv ? -58 : -78;
  const hx = (n: number) => round(n * (juv ? 0.5 : asc ? 1.45 : 1));
  const hy = (n: number) => round(n * (juv ? 0.5 : asc ? 1.3 : 1));
  const horn = `M-8,-20 C${hx(4)},${hy(-38) - 4} ${hx(28)},${hy(-54)} ${hx(56)},${hy(-58)} C${hx(36)},${hy(-48)} ${hx(16)},${hy(-34)} 4,-16 Z`;
  const whiskerL = juv ? 0.5 : asc ? 1.35 : 1;
  const wk = (n: number) => round(n * whiskerL);
  const whisker = (dx: number, dy: number) =>
    `M${snout + 4 + dx},${2 + dy} C${snout - 14 + dx},${wk(10) + dy} ${snout - 18 + dx},${wk(34) + dy} ${snout - 2 + dx},${wk(46) + dy} C${snout + 12 + dx},${wk(56) + dy} ${snout + 14 + dx},${wk(72) + dy} ${snout + 2 + dx},${wk(84) + dy}`;
  const maneN = juv ? 4 : asc ? 9 : 7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* mane flowing back from the skull */}
      <g className="sl-sway-slow" style={{ transformOrigin: "10px 0px" }}>
        {Array.from({ length: maneN }, (_, i) => {
          const a = round(-38 + (i * (asc ? 92 : 78)) / (maneN - 1));
          const L = round((juv ? 22 : asc ? 62 : 46) * (0.75 + 0.35 * Math.sin(((i + 1) / (maneN + 1)) * Math.PI)));
          return (
            <g key={i} transform={`translate(${round(6 + i * 0.8)} ${round(-14 + i * 3.4)}) rotate(${a})`}>
              <path d={blade(L, juv ? 5 : 7)} fill={u("wing")} transform="rotate(-10)" />
              <path d={blade(round(L * 0.9), juv ? 4 : 6)} fill={p.horn} opacity="0.94" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="0.8" />
            </g>
          );
        })}
      </g>
      {/* far horn */}
      <g transform="translate(10 2)" opacity="0.75">
        <path d={horn} fill={p.bodyDark} />
      </g>
      {/* lower jaw, mouth and teeth */}
      <path d={jaw} fill={u("body")} {...rim(c, 1)} />
      <path d={juv ? "M-6,12 C-20,14 -34,14 -42,13" : asc ? "M-4,12 C-22,18 -42,24 -58,28" : "M-4,12 C-22,15 -42,16 -58,16"} stroke={p.horn} strokeOpacity="0.6" strokeWidth="2" fill="none" />
      {asc && <path d="M-8,10 C-24,14 -46,18 -62,22 C-48,26 -26,22 -8,16 Z" fill="#200a24" opacity="0.85" />}
      {!juv &&
        [-62, -52, -42].map((tx) => (
          <path key={tx} d={`M${tx},${asc ? 6 : 6} l3,${asc ? 7 : 5} l3,${asc ? -7 : -5} Z`} fill="#fff" opacity="0.9" />
        ))}
      {asc && [-58, -48].map((tx) => <path key={tx} d={`M${tx},${round(26 - (tx + 58) * 0.3)} l3,-6 l3,6 Z`} fill="#fff" opacity="0.85" />)}
      {/* beard */}
      {!juv &&
        Array.from({ length: asc ? 5 : 3 }, (_, i) => (
          <path key={i} d={blade(asc ? 22 : 16, 4)} transform={`translate(${-34 + i * 7} ${asc ? 28 - i * 3 : 20}) rotate(${96 - i * 10})`} fill={p.horn} opacity="0.9" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="0.7" />
        ))}
      {/* upper head */}
      <path d={upper} fill={u("body")} {...rim(c)} />
      <path d={juv ? "M-54,4 C-40,8 -18,10 2,12" : "M-74,4 C-58,7 -30,8 2,12"} stroke={p.horn} strokeOpacity="0.55" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* bridge scales and brow ridge */}
      <path d={juv ? "M-52,-8 C-42,-14 -30,-20 -20,-24" : "M-70,-10 C-58,-14 -44,-16 -32,-22"} stroke={p.bodyLight} strokeOpacity="0.5" strokeWidth="2.4" strokeDasharray="2 4" fill="none" strokeLinecap="round" />
      <path d="M-34,-18 C-28,-26 -14,-28 -2,-22 C-10,-20 -22,-18 -34,-14 Z" fill={p.bodyLight} opacity="0.55" />
      <ellipse cx={snout + 6} cy="-5" rx="3.2" ry="1.7" fill={p.bodyDark} transform={`rotate(-20 ${snout + 6} -5)`} />
      <Spec x={juv ? -34 : -48} y={-17} rx={juv ? 12 : 18} ry={3.4} rot={-8} o={0.32} />
      {/* cheek frill */}
      <g transform="translate(8 6) rotate(28)">
        <path d={blade(juv ? 14 : asc ? 30 : 22, juv ? 5 : 7)} fill={u("wing")} stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="0.8" />
      </g>
      {/* near horn, forked on the apex form */}
      <path d={horn} fill={u("horn")} {...rim(c, 1)} />
      {asc && <path d={blade(20, 4)} transform={`translate(${hx(24)} ${hy(-46)}) rotate(-70)`} fill={u("horn")} {...rim(c, 1)} />}
      <path d={`M-4,-20 C${hx(8)},${hy(-36)} ${hx(28)},${hy(-50)} ${hx(52)},${hy(-56)}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="1" fill="none" />
      <Eye c={c} x={juv ? -20 : -18} y={-12} r={juv ? 6.6 : 5.6} kind="almond" angle={-6} flip />
      <Gem c={c} x={juv ? -30 : -38} y={-24} s={juv ? 0.36 : 0.4} angle={-20} />
      {/* whiskers stream back in the wind */}
      <g className="sl-sway" style={{ transformOrigin: `${snout + 4}px 2px` }}>
        <path d={whisker(0, 0)} stroke={p.horn} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {!juv && <path d={whisker(10, 4)} stroke={p.horn} strokeOpacity="0.7" strokeWidth="1.4" fill="none" strokeLinecap="round" />}
      </g>
    </g>
  );
}

/* ───────────── stages ───────────── */

/** Eggling: a short, chubby cloud serpent curled in a puff of storm vapour, a spark on its tail. */
function eggling(c: Ctx): ReactNode {
  const { p, u } = c;
  const d = `${c.id}eggling`;
  const B = body(
    chain(204, 198, [
      [240, 208, 264, 248, 260, 272],
      [256, 296, 224, 306, 196, 304],
      [164, 302, 140, 286, 140, 262],
      [140, 242, 152, 228, 166, 228],
    ]),
    taper(44, 0.3, 0.9),
  );
  return (
    <g>
      <Defs c={c} s="eggling" />
      <Cloud c={c} defs={d} x={200} y={296} w={210} h={56} seed={1} />
      <Serpent c={c} B={B} />
      <Spines c={c} B={B} at={[16, 22, 28, 34]} h={(k) => [6, 7, 6, 5][k]} defs={d} />
      {/* spark at the tail tip */}
      <g transform="translate(166 228)">
        <circle r="9" fill={p.accent} opacity="0.35" filter={u("blur8")} className="sl-core" />
        <Bolt c={c} d="M-6,-12 L0,-3 L-4,-2 L4,10" w={2} />
      </g>
      {/* tiny tucked forepaw */}
      <Leg c={c} x={242} y={236} rot={-10} s={0.5} />
      {/* the cloud wraps around in front */}
      <Cloud c={c} defs={d} x={204} y={318} w={176} h={30} seed={4} flat />
      <Cloud c={c} defs={d} x={110} y={300} w={50} h={22} seed={2} o={0.9} />
      {/* big round baby head */}
      <g transform="translate(196 180)">
        {/* soft mane fluff */}
        {[-30, -6, 18, 42].map((a, i) => (
          <path key={a} d={blade(16 + (i % 2) * 4, 6)} transform={`translate(24 ${-8 + i * 8}) rotate(${a})`} fill={p.horn} opacity="0.92" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="0.7" />
        ))}
        {/* horn nubs */}
        {[[-2, -34, -18], [14, -30, 10]].map(([x, y, r]) => (
          <path key={x} d="M-5,2 C-4,-6 -1,-11 1,-12 C3,-8 5,-3 5,2 Z" transform={`translate(${x} ${y}) rotate(${r})`} fill={u("horn")} {...rim(c, 0.8)} />
        ))}
        <path d="M32,0 C32,-24 16,-36 -4,-36 C-24,-36 -38,-24 -40,-10 C-48,-8 -54,-2 -52,6 C-50,14 -40,18 -30,18 C-20,28 0,32 14,28 C26,22 32,12 32,0 Z" fill={u("body")} {...rim(c)} />
        <path d="M-50,8 C-40,16 -30,20 -18,24 C-6,28 8,28 18,24 C6,32 -14,32 -26,24 C-38,20 -46,16 -50,8 Z" fill={p.horn} opacity="0.8" />
        <path d="M-42,10 C-36,13 -30,13 -26,10" stroke={p.bodyDark} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <ellipse cx="-47" cy="-2" rx="2.4" ry="1.4" fill={p.bodyDark} />
        <ellipse cx="2" cy="10" rx="7" ry="4" fill={p.accent} opacity="0.25" />
        <Spec x={-8} y={-26} rx={18} ry={6} rot={-12} o={0.3} />
        <Eye c={c} x={-14} y={-6} r={11.5} kind="round" />
        <Gem c={c} x={8} y={-22} s={0.34} />
        {/* stubby whiskers */}
        <path d="M-50,4 C-58,8 -60,16 -54,20" stroke={p.horn} strokeWidth="1.6" fill="none" strokeLinecap="round" className="sl-sway" style={{ transformOrigin: "-50px 4px" }} />
      </g>
    </g>
  );
}

/** Hatchling: a longer S-shaped serpent with a short mane, small blue spines, little legs and cloud trailing from its tail. */
function hatchling(c: Ctx): ReactNode {
  const { p, u } = c;
  const d = `${c.id}hatchling`;
  const B = body(
    chain(136, 160, [
      [152, 186, 156, 214, 176, 234],
      [198, 256, 232, 262, 254, 246],
      [276, 230, 296, 214, 318, 226],
      [338, 238, 344, 260, 362, 266],
    ]),
    taper(40, 0.16),
  );
  return (
    <g>
      <Defs c={c} s="hatchling" />
      <Wind c={c} d="M44,214 C90,196 120,206 150,232" o={0.3} />
      <Wind c={c} d="M210,198 C246,184 280,184 306,196" o={0.25} />
      <Cloud c={c} defs={d} x={336} y={284} w={96} h={34} seed={2} />
      <Cloud c={c} defs={d} x={214} y={302} w={120} h={26} seed={5} o={0.85} flat />
      {/* far legs */}
      <Leg c={c} x={196} y={252} rot={6} s={0.72} near={false} />
      <Leg c={c} x={302} y={234} rot={-6} s={0.68} near={false} />
      <Serpent c={c} B={B} />
      <Spines c={c} B={B} at={[18, 24, 30, 36, 42, 48]} h={(k) => [7, 9, 10, 9, 7, 5][k]} defs={d} />
      <Mane c={c} B={B} at={[2, 5, 8, 11]} len={(k) => [18, 20, 17, 13][k]} wide={5} />
      {/* near legs */}
      <Leg c={c} x={178} y={250} rot={4} s={0.76} />
      <Leg c={c} x={288} y={242} rot={-8} s={0.72} />
      {/* cloud streaming off the tail */}
      <Cloud c={c} defs={d} x={368} y={276} w={44} h={22} seed={3} />
      <DragonHead c={c} x={132} y={156} s={0.86} rot={8} stage={1} />
    </g>
  );
}

/** Evolved: a long storm dragon coiling through billowing clouds, full mane and whiskers, crystal spines, lightning in the clouds. */
function evolvedDraw(c: Ctx): ReactNode {
  const d = `${c.id}evolved`;
  const B = body(
    chain(124, 128, [
      [146, 146, 146, 180, 178, 190],
      [220, 204, 290, 178, 318, 212],
      [344, 244, 312, 292, 262, 294],
      [214, 296, 168, 290, 132, 268],
      [104, 250, 84, 226, 66, 230],
    ]),
    taper(54, 0.12),
  );
  const n = B.pts.length - 1;
  return (
    <g>
      <Defs c={c} s="evolved" />
      {/* clouds behind */}
      <Cloud c={c} defs={d} x={300} y={150} w={120} h={46} seed={1} o={0.9} />
      <Bolt c={c} d="M286,134 L296,148 L290,150 L302,166" />
      <Cloud c={c} defs={d} x={76} y={258} w={100} h={38} seed={6} o={0.9} />
      <Wind c={c} d="M30,150 C70,130 100,140 118,160" o={0.3} />
      <Wind c={c} d="M250,110 C290,96 330,104 360,124" o={0.25} />
      {/* far legs */}
      <Leg c={c} x={196} y={206} rot={0} s={0.72} near={false} />
      <Leg c={c} x={318} y={250} rot={-50} s={0.66} near={false} />
      <Serpent c={c} B={B} />
      <Spines c={c} B={B} at={[18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62]} h={(k) => round(16 - Math.abs(k - 3) * 1.2)} defs={d} />
      <Mane c={c} B={B} at={[2, 5, 8, 11, 14]} len={(k) => [26, 30, 28, 22, 16][k]} />
      {/* near legs */}
      <Leg c={c} x={174} y={206} rot={6} s={0.92} />
      <Leg c={c} x={302} y={270} rot={-40} s={0.86} />
      {/* bolt-tipped tail */}
      <g transform={`translate(${B.pts[n][0]} ${B.pts[n][1]})`}>
        <path d="M2,0 L-10,-10 L-6,-4 L-20,-12 L-10,4 L-14,0 Z" fill={c.p.accent} filter={c.u("glow")} className="sl-rune-pulse" />
      </g>
      {/* the body dives into a cloud bank in front */}
      <Cloud c={c} defs={d} x={226} y={314} w={210} h={48} seed={3} />
      <Bolt c={c} d="M184,302 L194,318 L188,320 L200,336" w={1.4} />
      <Cloud c={c} defs={d} x={316} y={226} w={58} h={26} seed={9} o={0.95} />
      <DragonHead c={c} x={120} y={124} s={0.92} rot={4} stage={2} />
    </g>
  );
}

/** Ascended: an upright storm dragon rising from a cloud bank — tall crystal spines, long forked horns, a streaming double mane and crackling lightning. */
function ascended(c: Ctx): ReactNode {
  const { p, u } = c;
  const d = `${c.id}ascended`;
  const B = body(
    chain(224, 104, [
      [246, 128, 248, 160, 226, 184],
      [200, 210, 152, 212, 148, 250],
      [144, 288, 200, 304, 248, 292],
      [292, 282, 320, 252, 312, 216],
      [306, 184, 326, 150, 356, 150],
    ]),
    taper(60, 0.1),
  );
  const n = B.pts.length - 1;
  return (
    <g>
      <Defs c={c} s="ascended" />
      {/* storm swirling behind */}
      <circle cx="210" cy="190" r="120" fill={p.accent} opacity="0.1" filter={u("blur20")} />
      <Wind c={c} d="M40,120 C80,70 150,52 196,58" o={0.35} w={2} />
      <Wind c={c} d="M372,96 C350,64 316,50 280,52" o={0.3} w={1.6} />
      <Wind c={c} d="M28,214 C40,170 76,150 112,156" o={0.3} />
      <Wind c={c} d="M376,250 C392,214 384,186 362,170" o={0.3} />
      <Cloud c={c} defs={d} x={86} y={196} w={84} h={34} seed={2} o={0.85} />
      <Bolt c={c} d="M70,176 L80,190 L74,192 L86,212 L80,214 L92,232" w={1.8} />
      <Bolt c={c} d="M346,110 L336,126 L342,128 L330,148" w={1.6} />
      {/* far legs */}
      <Leg c={c} x={178} y={206} rot={70} s={0.8} near={false} open />
      <Leg c={c} x={272} y={286} rot={-30} s={0.74} near={false} />
      <Serpent c={c} B={B} />
      <Spines c={c} B={B} at={[14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66]} h={(k) => round(26 - Math.abs(k - 4) * 1.5)} defs={d} glow />
      <Mane c={c} B={B} at={[1, 4, 7, 10, 13, 16]} len={(k) => [44, 48, 44, 38, 30, 22][k]} wide={8} />
      {/* near legs: one forelimb raised, talons spread */}
      <Leg c={c} x={204} y={228} rot={40} s={1.05} open />
      <Leg c={c} x={258} y={300} rot={-34} s={0.8} />
      {/* bolt-tipped tail */}
      <g transform={`translate(${B.pts[n][0]} ${B.pts[n][1]})`}>
        <g className="sl-sway" style={{ transformOrigin: "0px 0px" }}>
          <path d="M-2,0 L14,-14 L10,-4 L28,-16 L14,6 L18,0 Z" fill={p.accent} filter={u("glow")} />
          <path d="M-2,0 L14,-14 L10,-4 L28,-16" stroke="#fff" strokeWidth="1" fill="none" strokeOpacity="0.8" />
        </g>
      </g>
      {/* cloud bank it rises from */}
      <Cloud c={c} defs={d} x={204} y={330} w={300} h={52} seed={4} />
      <Cloud c={c} defs={d} x={110} y={312} w={90} h={34} seed={7} />
      <Bolt c={c} d="M232,318 L244,330 L238,334 L252,350" w={1.6} />
      <DragonHead c={c} x={218} y={100} s={1.04} rot={2} stage={3} />
      <Dots c={c} pts={[[150, 70], [256, 30], [320, 92], [98, 130]]} r={1.6} color={p.horn} />
    </g>
  );
}

function Dots({ c, pts, r, color }: { c: Ctx; pts: P[]; r: number; color: string }) {
  return (
    <g filter={c.u("glow")} className="sl-twinkle">
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={color} style={{ animationDelay: `${i * 0.37}s` }} />
      ))}
    </g>
  );
}

const evolved: Renderer = {
  floating: true,
  shadow: 120,
  halo: [200, 205, 30],
  render: evolvedDraw,
};

export const zephrax: Renderer = {
  ...evolved,
  halo: [196, 34, 26],
  stageFit: [1.3, 1.1, 1, 0.92],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
