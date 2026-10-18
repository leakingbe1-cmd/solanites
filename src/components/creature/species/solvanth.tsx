import type { ReactNode } from "react";
import { blade, byStage, Eye, Gem, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Solvanth — a leviathan coiled around a captive sun. */

/* ------------------------------------------------------------------ */
/* Shared serpent construction                                         */
/* ------------------------------------------------------------------ */

/** One sample of the serpent's centreline: position, half-width and whether it passes in front of the sun. */
type P = { x: number; y: number; w: number; f: boolean; b: boolean };

/** Samples a tilted, drifting loop around the sun. `t` runs in radians; sin(t) < 0 is the far (back) side. */
function coil(o: { cx: number; cy: number; rx: number; ry: number; tilt: number; t0: number; t1: number; drift?: number; grow?: number; w: (u: number) => number; n?: number }): P[] {
  const n = o.n ?? 60;
  const tl = (o.tilt * Math.PI) / 180;
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const t = o.t0 + (o.t1 - o.t0) * u;
    const k = 1 + (o.grow ?? 0) * u;
    const x = o.rx * k * Math.cos(t);
    const y = o.ry * k * Math.sin(t);
    const cy = o.cy + (o.drift ?? 0) * u;
    return { x: round(o.cx + x * Math.cos(tl) - y * Math.sin(tl)), y: round(cy + x * Math.sin(tl) + y * Math.cos(tl)), w: round(o.w(u)), f: Math.sin(t) >= 0, b: Math.sin(t) < 0.25 };
  });
}

/** Samples a cubic Bézier (necks and free tails) with a linear taper. */
function bez(a: [number, number], b: [number, number], c: [number, number], d: [number, number], w0: number, w1: number, f = true, n = 18): P[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const m = 1 - t;
    const x = m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0];
    const y = m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1];
    return { x: round(x), y: round(y), w: round(w0 + (w1 - w0) * t), f, b: true };
  });
}

const line = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${round(x)},${round(y)}`).join(" ");

/** Unit normal at sample i, flipped to point away from the sun (the dorsal side). */
function normal(pts: P[], i: number, sun: [number, number]): [number, number] {
  const a = pts[Math.max(0, i - 1)];
  const b = pts[Math.min(pts.length - 1, i + 1)];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l = Math.hypot(dx, dy) || 1;
  let nx = -dy / l;
  let ny = dx / l;
  if (nx * (pts[i].x - sun[0]) + ny * (pts[i].y - sun[1]) < 0) {
    nx = -nx;
    ny = -ny;
  }
  return [nx, ny];
}

/** Offset of the centreline by s (−1 inner/belly … +1 outer/back) of the half-width. */
const side = (pts: P[], s: number, sun: [number, number], from = 0, to = pts.length - 1) =>
  pts.slice(from, to + 1).map((p, j) => {
    const [nx, ny] = normal(pts, from + j, sun);
    return [round(p.x + nx * p.w * s), round(p.y + ny * p.w * s)] as [number, number];
  });

interface Fin {
  /** Every n-th sample carries a fin. */
  every: number;
  len: number;
  wid: number;
  /** Skip fins before / after these sample indices. */
  from?: number;
  to?: number;
}

/**
 * A tapering scaled serpent body drawn as runs that pass behind or in front
 * of the sun. Returns the back half and the front half separately so the sun
 * can be sandwiched between them. Shading is screen-space (lit from above),
 * clipped to each run so it follows the taper.
 */
function serpent(c: Ctx, k: string, pts: P[], sun: [number, number], fin?: Fin): { back: ReactNode; front: ReactNode } {
  const { p, u } = c;
  // Split into consecutive runs by depth; each run reaches two samples past its ends so seams are covered.
  const runs: { f: boolean; a: number; b: number }[] = [];
  pts.forEach((pt, i) => {
    const last = runs[runs.length - 1];
    if (last && last.f === pt.f) last.b = i;
    else runs.push({ f: pt.f, a: i, b: i });
  });
  const draw = (r: { f: boolean; a: number; b: number }, key: string) => {
    const a = Math.max(0, r.a - (r.f ? 2 : 1));
    const b = Math.min(pts.length - 1, r.b + (r.f ? 2 : 1));
    const outer = side(pts, 1, sun, a, b);
    const inner = side(pts, -1, sun, a, b);
    const body = `${line(outer)} ${line([...inner].reverse()).replace("M", "L")} Z`;
    const mid = pts.slice(a, b + 1).reduce((m, q) => Math.max(m, q.w), 0);
    const centre = line(pts.slice(a, b + 1).map((q) => [q.x, q.y]));
    const cid = `${c.id}-${k}-${key}`;
    // Belly plates show only where the underside faces the viewer.
    const bellies: ReactNode[] = [];
    let i0 = -1;
    for (let i = a; i <= b + 1; i++) {
      const on = i <= b && pts[i].b;
      if (on && i0 < 0) i0 = i;
      if (!on && i0 >= 0) {
        const i1 = Math.min(b, i);
        const bi = side(pts, -0.98, sun, i0, i1);
        const bo = side(pts, -0.3, sun, i0, i1);
        const plates: string[] = [];
        for (let j = i0 + 1; j < i1; j += 2) {
          const q = pts[j];
          const [nx, ny] = normal(pts, j, sun);
          plates.push(`M${round(q.x - nx * q.w * 0.95)},${round(q.y - ny * q.w * 0.95)} L${round(q.x - nx * q.w * 0.32)},${round(q.y - ny * q.w * 0.32)}`);
        }
        bellies.push(
          <g key={i0}>
            <path d={`${line(bo)} ${line([...bi].reverse()).replace("M", "L")} Z`} fill={p.belly} opacity="0.92" />
            <path d={plates.join(" ")} stroke={p.bodyDark} strokeOpacity="0.32" strokeWidth="1" fill="none" />
          </g>,
        );
        i0 = -1;
      }
    }
    // Overlapping scales: two staggered rows of small arcs opening toward the tail.
    const scales: string[] = [];
    for (let i = a + 1; i < b; i++) {
      const q = pts[i];
      if (q.w < 6) continue;
      const [nx, ny] = normal(pts, i, sun);
      const nq = pts[i + 1];
      const tx = nq.x - q.x;
      const ty = nq.y - q.y;
      for (const s of i % 2 ? [0.62] : [0.2]) {
        const cx = q.x + nx * q.w * s;
        const cy = q.y + ny * q.w * s;
        const h = q.w * 0.22;
        scales.push(`M${round(cx - nx * h)},${round(cy - ny * h)} Q${round(cx + tx * 0.9)},${round(cy + ty * 0.9)} ${round(cx + nx * h)},${round(cy + ny * h)}`);
      }
    }
    const fins: ReactNode[] = [];
    if (fin) {
      for (let i = r.a; i <= r.b; i++) {
        if (i % fin.every !== 0 || i < (fin.from ?? 0) || i > (fin.to ?? pts.length)) continue;
        const pt = pts[i];
        const [nx, ny] = normal(pts, i, sun);
        // Fins lean back along the body toward the tail.
        const prev = pts[Math.max(0, i - 2)];
        const back = Math.atan2(prev.y - pt.y, prev.x - pt.x);
        const out = Math.atan2(ny, nx);
        let d = back - out;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        const ang = round(((out + d * 0.5) * 180) / Math.PI);
        const sc = pt.w / 14;
        const bx = round(pt.x + nx * pt.w * 0.55);
        const by = round(pt.y + ny * pt.w * 0.55);
        fins.push(
          <g key={i} transform={`translate(${bx} ${by}) rotate(${ang})`}>
            <path d={flame(fin.len * sc, fin.wid * sc)} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" strokeWidth="1" />
            <path d={`M2,0 L${round(fin.len * sc * 0.7)},0`} stroke={p.eye} strokeOpacity="0.45" strokeWidth="1" />
          </g>,
        );
      }
    }
    return (
      <g key={key}>
        <defs>
          <clipPath id={cid}>
            <path d={body} />
          </clipPath>
        </defs>
        {fins}
        <path d={body} fill={p.body} />
        <g clipPath={`url(#${cid})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={centre} stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth={round(mid * 1.1)} transform={`translate(0 ${round(mid * 0.95)})`} />
          {bellies}
          <path d={scales.join(" ")} stroke={p.bodyDark} strokeOpacity="0.22" strokeWidth="1" />
          <path d={centre} stroke={p.bodyLight} strokeOpacity="0.55" strokeWidth={round(mid * 0.55)} transform={`translate(0 ${round(-mid * 0.45)})`} />
          <path d={centre} stroke="#fff" strokeOpacity="0.4" strokeWidth={round(Math.max(1.2, mid * 0.12))} transform={`translate(${round(-mid * 0.08)} ${round(-mid * 0.62)})`} />
        </g>
        <path d={line(outer)} fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.3" />
        <path d={line(inner)} fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.3" />
      </g>
    );
  };
  return {
    back: <g>{runs.filter((r) => !r.f).map((r, i) => draw(r, `b${i}`))}</g>,
    front: <g>{runs.filter((r) => r.f).map((r, i) => draw(r, `f${i}`))}</g>,
  };
}

/** A wavering flame tongue along +x. */
function flame(l: number, w: number) {
  l = round(l);
  w = round(w);
  return `M0,${-w} C${round(l * 0.3)},${round(-w * 1.25)} ${round(l * 0.45)},${round(-w * 0.1)} ${round(l * 0.62)},${round(-w * 0.55)} C${round(l * 0.8)},${round(-w * 0.95)} ${round(l * 0.9)},${round(-w * 0.35)} ${l},0 C${round(l * 0.72)},${round(w * 0.35)} ${round(l * 0.4)},${round(w * 0.75)} 0,${w} Z`;
}

/** The captive sun: a white-hot core under a red-orange limb, so the gold coil reads against it. */
function Sun({ c, k, x, y, r, rays, flare = 1 }: { c: Ctx; k: string; x: number; y: number; r: number; rays: number; flare?: number }) {
  const { p, u } = c;
  const id = `${c.id}-${k}-sun`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.42" cy="0.4" r="0.62">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#fff3b8" />
          <stop offset="0.72" stopColor={p.accent} />
          <stop offset="1" stopColor={p.eye} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={round(r * 1.5)} fill={p.eye} opacity="0.28" filter={u("blur20")} className="sl-aura-pulse" style={{ transformOrigin: `${x}px ${y}px` }} />
      {rays > 0 && (
        <g className="sl-spin-slow" style={{ transformOrigin: `${x}px ${y}px` }}>
          <g filter={u("glow")}>
            {Array.from({ length: rays }).map((_, i) => {
              const a = (360 / rays) * i;
              const long = i % 2 === 0;
              const [bx, by] = polar(x, y, r * 0.9, a);
              return <path key={i} d={flame(r * (long ? 0.5 : 0.32) * flare, r * 0.11)} transform={`translate(${bx} ${by}) rotate(${round(a)})`} fill={long ? p.accent : p.eye} opacity={long ? 0.9 : 0.75} />;
            })}
          </g>
        </g>
      )}
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} filter={u("glow")} />
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
      <circle cx={x} cy={y} r={round(r * 0.97)} fill="none" stroke={p.eye} strokeOpacity="0.55" strokeWidth={round(r * 0.06)} />
      <g opacity="0.35" fill="none" stroke={p.eye} strokeWidth="1.2" strokeLinecap="round">
        <path d={`M${round(x - r * 0.5)},${round(y + r * 0.2)} C${round(x - r * 0.2)},${round(y + r * 0.35)} ${round(x + r * 0.2)},${round(y + r * 0.1)} ${round(x + r * 0.55)},${round(y + r * 0.3)}`} />
        <path d={`M${round(x - r * 0.3)},${round(y + r * 0.55)} C${round(x)},${round(y + r * 0.62)} ${round(x + r * 0.25)},${round(y + r * 0.5)} ${round(x + r * 0.42)},${round(y + r * 0.6)}`} />
      </g>
      <Spec x={round(x - r * 0.32)} y={round(y - r * 0.42)} rx={round(r * 0.32)} ry={round(r * 0.14)} o={0.5} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Eggling                                                             */
/* ------------------------------------------------------------------ */

/** Eggling: a chubby golden serpentling curled once around a small ember, its big round head resting on top. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const sun: [number, number] = [198, 262];
  const body = [
    ...coil({ cx: 198, cy: 276, rx: 58, ry: 24, tilt: -4, t0: 0.32 * Math.PI, t1: 2 * Math.PI + 0.05, drift: -6, w: (t) => 4 + 13 * Math.min(1, t * 2.4), n: 56 }),
    ...bez([256, 266], [266, 248], [258, 222], [238, 208], 17, 15).slice(1),
  ];
  const s = serpent(c, "egg", body, sun);
  return (
    <g>
      {s.back}
      <Sun c={c} k="egg" x={sun[0]} y={sun[1]} r={30} rays={0} />
      <g filter={u("glow")} className="sl-twinkle">
        {[
          [160, 238, 2.2],
          [150, 268, 1.6],
          [242, 300, 1.8],
        ].map(([x, y, r], i) => (
          <circle key={x} cx={x} cy={y} r={r} fill={i ? p.accent : p.eye} style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
      {s.front}
      {/* tail tip: a tiny fin bud */}
      <path d={flame(12, 4)} transform="translate(228 300) rotate(150)" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
      {/* big round head, chin resting on the ember */}
      <g transform="translate(236 206)">
        {/* frill buds: the first hint of the flame mane */}
        <g className="sl-sway" style={{ transformOrigin: "244px 196px" }}>
          {[-70, -36, -4, 28].map((a, i) => (
            <path key={a} d={flame(15 - Math.abs(i - 1.5) * 2, 4.4)} transform={`translate(8 -10) rotate(${a})`} fill={i % 2 ? p.eye : p.accent} opacity="0.92" filter={u("glow")} />
          ))}
        </g>
        {/* nub horns */}
        <path d="M-12,-38 C-10,-48 -2,-52 4,-50 C2,-44 -2,-38 -4,-34 Z" fill={u("horn")} {...rim(c, 0.8)} />
        <path d="M-30,-42 C-30,-52 -24,-58 -18,-58 C-18,-50 -20,-44 -22,-40 Z" fill={u("horn")} {...rim(c, 0.8)} />
        <path d="M14,-4 C14,-30 -6,-46 -32,-46 C-56,-46 -72,-30 -76,-10 C-78,6 -68,20 -48,22 C-24,24 14,20 14,-4 Z" fill={u("body")} {...rim(c)} />
        <path d="M-72,8 C-58,20 -28,24 -4,16 C-16,24 -48,28 -64,20 Z" fill={p.belly} opacity="0.9" />
        <path d="M-74,4 C-64,12 -48,15 -30,14" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="-70" cy="-6" r="1.8" fill={p.bodyDark} />
        {/* cheek fin bud */}
        <path d={blade(14, 5, 0.6)} transform="translate(6 8) rotate(30)" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        <ellipse cx="-16" cy="6" rx="8" ry="4.4" fill={p.eye} opacity="0.28" />
        <Spec x={-38} y={-36} rx={18} ry={6} rot={-8} o={0.34} />
        <Eye c={c} x={-40} y={-12} r={12} kind="round" />
        <Gem c={c} x={-8} y={-26} s={0.42} />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Hatchling                                                           */
/* ------------------------------------------------------------------ */

/** Hatchling: a longer, leaner serpent wrapped round a brighter sun-seed, neck lifted high, short flame mane and fin buds. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const sun: [number, number] = [196, 250];
  const body = [
    ...coil({ cx: 196, cy: 270, rx: 88, ry: 30, tilt: -8, t0: 0.22 * Math.PI, t1: 2 * Math.PI + 0.1, drift: -14, w: (t) => 2 + 11 * Math.min(1, t * 2), n: 64 }),
    ...bez([280, 226], [306, 194], [302, 160], [272, 138], 13, 11).slice(1),
  ];
  const s = serpent(c, "hatch", body, sun, { every: 6, len: 12, wid: 3.4, from: 14, to: 70 });
  return (
    <g>
      {s.back}
      <Sun c={c} k="hatch" x={sun[0]} y={sun[1]} r={42} rays={10} flare={0.8} />
      {s.front}
      {/* small tail fluke */}
      <path d={flame(18, 6)} transform="translate(244 296) rotate(160)" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
      {/* head: snout lengthening, eyes still big */}
      <g transform="translate(272 138) rotate(6)">
        <g className="sl-sway" style={{ transformOrigin: "278px 132px" }}>
          {[-80, -50, -20, 10, 40].map((a, i) => (
            <path key={a} d={flame(24 - Math.abs(i - 2) * 4, 5.4)} transform={`translate(6 -6) rotate(${a})`} fill={i % 2 ? p.eye : p.accent} opacity="0.92" filter={u("glow")} />
          ))}
        </g>
        <path d="M-8,-26 C-2,-38 8,-42 18,-42 C10,-36 6,-28 2,-20 Z" fill={u("horn")} {...rim(c, 0.8)} />
        <path d="M-80,4 C-66,10 -44,12 -28,13 C-16,14 -6,16 0,19 C-12,24 -40,22 -58,18 C-70,15 -78,11 -80,4 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M12,-4 C12,-24 -4,-34 -24,-34 C-42,-34 -56,-26 -70,-16 C-80,-10 -86,-4 -84,2 C-82,7 -72,8 -58,9 C-36,10 -14,14 2,14 C9,10 12,4 12,-4 Z" fill={u("body")} {...rim(c)} />
        <path d="M-84,2 C-70,7 -50,9 -32,10" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="-76" cy="-8" r="1.8" fill={p.bodyDark} />
        <path d="M-20,-30 C-32,-30 -42,-26 -48,-20" fill="none" stroke={p.horn} strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
        <path d={blade(20, 6, 0.6)} transform="translate(2 10) rotate(30)" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        <Spec x={-30} y={-26} rx={16} ry={4.4} rot={-6} o={0.32} />
        <Eye c={c} x={-32} y={-12} r={9} kind="round" />
        <Gem c={c} x={-4} y={-22} s={0.42} />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Evolved                                                             */
/* ------------------------------------------------------------------ */

/** The leviathan's long head, facing left, origin at the back of the skull. */
function adultHead(c: Ctx, mane: number, regal = false) {
  const { p, u } = c;
  return (
    <g>
      {/* flame mane sweeping back from the skull and down the neck */}
      <g className="sl-sway" style={{ transformOrigin: "0px 0px" }}>
        {[-110, -84, -58, -32, -6, 20, 46, 72, 96].map((a, i) => (
          <path key={a} d={flame((46 - Math.abs(i - 4) * 4) * mane, 9 * mane)} transform={`translate(4 -2) rotate(${a})`} fill={i % 2 ? p.eye : p.accent} opacity="0.9" filter={u("glow")} />
        ))}
        {[-90, -44, 0, 44, 84].map((a) => (
          <path key={a} d={flame(28 * mane, 5 * mane)} transform={`translate(6 -2) rotate(${a})`} fill="#fff6c7" opacity="0.85" />
        ))}
      </g>
      {/* swept horns */}
      <path d="M-24,-26 C-12,-42 6,-52 28,-56 C14,-46 2,-34 -8,-22 Z" fill={u("horn")} {...rim(c, 1)} />
      <path d="M-8,-24 C4,-36 20,-42 40,-42 C26,-34 14,-26 4,-16 Z" fill={u("horn")} {...rim(c, 1)} />
      {/* lower jaw */}
      <path d="M-88,6 C-70,9 -50,11 -34,12 C-20,13 -8,16 0,19 C-12,25 -38,23 -58,19 C-72,16 -84,12 -88,6 Z" fill={u("body")} {...rim(c)} />
      {regal && <path d="M-84,7 C-66,10 -48,12 -32,13" fill="none" stroke={p.eye} strokeWidth="3" strokeLinecap="round" filter={u("glow")} className="sl-core" />}
      {/* skull */}
      <path d="M14,-6 C12,-22 -6,-30 -28,-29 C-44,-28 -58,-21 -74,-14 C-86,-9 -96,-5 -96,1 C-96,5 -90,7 -82,7 L-46,9 C-30,9 -16,11 -2,15 C8,12 14,6 14,-6 Z" fill={u("body")} {...rim(c)} />
      <path d="M-94,2 C-76,6 -58,8 -40,9" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
      {/* brow ridge and muzzle scales */}
      <path d="M-16,-25 C-30,-28 -46,-24 -56,-16 C-44,-17 -32,-16 -18,-13 Z" fill={u("horn")} opacity="0.9" />
      <path d="M-62,-14 C-60,-11 -59,-9 -58,-6 M-72,-10 C-70,-7 -69,-5 -68,-2 M-82,-6 C-80,-4 -79,-2 -78,0" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1" />
      <path d="M-90,-4 C-88,-7 -84,-8 -82,-6" fill="none" stroke={p.bodyDark} strokeWidth="1.6" strokeLinecap="round" />
      {/* cheek fin */}
      <path d={blade(32, 9, 0.6)} transform="translate(-4 12) rotate(30)" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
      <path d="M-2,13 L24,28" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1" />
      <Spec x={-38} y={-24} rx={22} ry={4.4} rot={-6} o={0.4} />
      <Eye c={c} x={-36} y={-12} r={6.6} kind="slit" flip angle={-6} />
    </g>
  );
}

const evolved: Renderer = {
  floating: true,
  shadow: 130,
  halo: [200, 40, 30],
  render: (c) => {
    const { p, u } = c;
    const sun: [number, number] = [196, 234];
    const body = [
      ...bez([70, 334], [70, 314], [76, 290], [82, 270], 2, 13, true, 14),
      ...coil({ cx: 196, cy: 272, rx: 116, ry: 36, tilt: -6, t0: Math.PI - 0.06, t1: 4 * Math.PI, drift: -64, grow: 0.04, w: (t) => 13 + 7 * Math.sin(Math.min(1, t * 1.4) * Math.PI * 0.8), n: 120 }).slice(1),
      ...bez([312, 204], [340, 170], [338, 126], [300, 102], 17, 14).slice(1),
    ];
    const s = serpent(c, "evo", body, sun, { every: 5, len: 22, wid: 6, from: 16, to: 130 });
    return (
      <g>
        {s.back}
        <Sun c={c} k="evo" x={sun[0]} y={sun[1]} r={58} rays={16} />
        {s.front}
        {/* tail fluke */}
        <g transform="translate(70 334) rotate(-4)">
          <path d="M0,0 C-14,-10 -32,-12 -44,-4 C-30,0 -20,4 -14,10 C-24,16 -28,28 -24,36 C-12,26 -2,14 0,0 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.85" />
          <path d="M-4,2 L-34,-4 M-4,4 L-20,28" stroke={p.eye} strokeOpacity="0.35" strokeWidth="1" />
        </g>
        <g transform="translate(300 102) rotate(10)">
          {adultHead(c, 1)}
          <Gem c={c} x={-22} y={-19} s={0.46} />
        </g>
      </g>
    );
  },
};

/* ------------------------------------------------------------------ */
/* Ascended                                                            */
/* ------------------------------------------------------------------ */

/** Ascended: a vast leviathan spiralling two and a half times up a blazing sun, neck reared high, crowned head, flame mane, barbels and fin-wings. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const sun: [number, number] = [200, 232];
  const body = [
    ...bez([44, 360], [50, 340], [60, 318], [72, 302], 2, 14, true, 14),
    ...coil({ cx: 200, cy: 322, rx: 130, ry: 30, tilt: -4, t0: Math.PI - 0.06, t1: 6 * Math.PI, drift: -156, grow: -0.12, w: (t) => 14 + 8 * Math.sin(Math.min(1, t * 1.3) * Math.PI * 0.8), n: 200 }).slice(1),
  ];
  const last = body[body.length - 1];
  const all = [...body, ...bez([last.x, last.y], [round(last.x + 34), round(last.y - 34)], [354, 96], [306, 72], 19, 15).slice(1)];
  const s = serpent(c, "asc", all, sun, { every: 5, len: 24, wid: 6.5, from: 16, to: 214 });
  return (
    <g>
      {/* great pectoral fin-wings fanning out behind the reared neck */}
      <g className="sl-sway-slow" style={{ transformOrigin: "336px 150px" }}>
        {[-58, -34, -10, 14].map((a, i) => (
          <g key={a} transform={`translate(336 150) rotate(${a})`}>
            <path d={blade(70 - i * 8, 13, 0.6)} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.85" />
            <path d={`M4,0 L${62 - i * 8},0`} stroke={p.eye} strokeOpacity="0.4" strokeWidth="1" />
          </g>
        ))}
      </g>
      {s.back}
      <Sun c={c} k="asc" x={sun[0]} y={sun[1]} r={62} rays={20} flare={1.3} />
      {/* outer corona ring */}
      <g className="sl-spin-rev" style={{ transformOrigin: "200px 232px" }} filter={u("glow")}>
        {Array.from({ length: 12 }).map((_, i) => {
          const [x, y] = polar(200, 232, 104, i * 30 + 15);
          return <circle key={i} cx={x} cy={y} r={i % 2 ? 2 : 3} fill={i % 2 ? p.eye : p.accent} opacity="0.85" />;
        })}
      </g>
      {s.front}
      {/* ornate tail fluke with flame edges */}
      <g transform="translate(44 360) rotate(10)">
        <path d="M0,0 C-14,-14 -34,-16 -48,-8 C-34,-2 -24,2 -16,8 C-26,16 -30,28 -26,38 C-12,28 -2,14 0,0 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.85" />
        <path d={flame(16, 3)} transform="translate(-44 -8) rotate(175)" fill={p.eye} opacity="0.85" filter={u("glow")} />
        <path d={flame(14, 3)} transform="translate(-26 34) rotate(115)" fill={p.accent} opacity="0.85" filter={u("glow")} />
      </g>
      {/* reared, crowned head looking out over the sun */}
      <g transform="translate(306 72) rotate(-6)">
        <g className="sl-sway" style={{ transformOrigin: "306px 72px" }}>
          {[-120, -92, -64, -36, -8, 20, 48, 76].map((a, i) => (
            <path key={a} d={flame(66 - Math.abs(i - 3.5) * 6, 11)} transform={`translate(4 0) rotate(${a})`} fill={i % 2 ? p.eye : p.accent} opacity="0.7" filter={u("glow")} />
          ))}
        </g>
        {adultHead(c, 1.1, true)}
        {/* crown of horn spires */}
        {[
          [-34, -26, -104, 20],
          [-24, -28, -90, 28],
          [-14, -28, -76, 34],
        ].map(([x, y, a, l]) => (
          <path key={a} d={blade(l, 4.2, 0.7)} transform={`translate(${x} ${y}) rotate(${a})`} fill={u("horn")} {...rim(c, 0.8)} />
        ))}
        {/* trailing barbels */}
        <g className="sl-sway-slow" style={{ transformOrigin: "214px 78px" }}>
          <g fill="none" stroke={p.wingEdge} strokeLinecap="round" opacity="0.9">
            <path d="M-92,4 C-104,22 -98,42 -82,52 C-74,58 -74,68 -80,76" strokeWidth="2.2" />
            <path d="M-62,18 C-66,34 -60,46 -48,54" strokeWidth="1.6" />
          </g>
          <circle cx="-80" cy="76" r="2.6" fill={p.accent} filter={u("glow")} />
        </g>
        <Gem c={c} x={-22} y={-19} s={0.56} />
      </g>
    </g>
  );
}

export const solvanth: Renderer = {
  ...evolved,
  halo: [262, 22, 28],
  stageFit: [1.3, 1.1, 1, 0.92],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
