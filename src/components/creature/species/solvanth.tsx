import type { ReactNode } from "react";
import { blade, byStage, Eye, Gem, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Solvanth — a leviathan coiled around a captive sun. */

/* ------------------------------------------------------------------ */
/* Shared serpent construction                                         */
/* ------------------------------------------------------------------ */

/** One sample of the serpent's centreline: position, half-width and whether it passes in front of the sun. */
type P = { x: number; y: number; w: number; f: boolean };

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
    return { x: round(o.cx + x * Math.cos(tl) - y * Math.sin(tl)), y: round(cy + x * Math.sin(tl) + y * Math.cos(tl)), w: round(o.w(u)), f: Math.sin(t) >= 0 };
  });
}

/** Samples a cubic Bézier (necks and free tails) with a linear taper. */
function bez(a: [number, number], b: [number, number], c: [number, number], d: [number, number], w0: number, w1: number, f = true, n = 18): P[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const m = 1 - t;
    const x = m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0];
    const y = m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1];
    return { x: round(x), y: round(y), w: round(w0 + (w1 - w0) * t), f };
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
 * can be sandwiched between them.
 */
function serpent(c: Ctx, pts: P[], sun: [number, number], fin?: Fin, band = 4): { back: ReactNode; front: ReactNode } {
  const { p, u } = c;
  // Split into consecutive runs by depth, overlapping one sample so seams are covered.
  const runs: { f: boolean; a: number; b: number }[] = [];
  pts.forEach((pt, i) => {
    const last = runs[runs.length - 1];
    if (last && last.f === pt.f) last.b = i;
    else runs.push({ f: pt.f, a: Math.max(0, i - 1), b: i });
  });
  const draw = (r: { f: boolean; a: number; b: number }, key: number) => {
    const outer = side(pts, 1, sun, r.a, r.b);
    const inner = side(pts, -1, sun, r.a, r.b);
    const body = `${line(outer)} ${line([...inner].reverse()).replace("M", "L")} Z`;
    const bellyIn = side(pts, -0.92, sun, r.a, r.b);
    const bellyOut = side(pts, -0.34, sun, r.a, r.b);
    const belly = `${line(bellyOut)} ${line([...bellyIn].reverse()).replace("M", "L")} Z`;
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
        const ang = round(((out + d * 0.45) * 180) / Math.PI);
        const sc = pt.w / 14;
        const bx = round(pt.x + nx * pt.w * 0.6);
        const by = round(pt.y + ny * pt.w * 0.6);
        fins.push(
          <g key={i} transform={`translate(${bx} ${by}) rotate(${ang})`}>
            <path d={blade(fin.len * sc, fin.wid * sc, 0.62)} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.75" strokeWidth="1" />
            <path d={`M2,0 L${round(fin.len * sc * 0.82)},0`} stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="0.9" />
          </g>,
        );
      }
    }
    // Ventral plates and dorsal scale bands across the body.
    const bands: string[] = [];
    const plates: string[] = [];
    for (let i = r.a + 1; i < r.b; i++) {
      if (i % band) continue;
      const pt = pts[i];
      if (pt.w < 5) continue;
      const [nx, ny] = normal(pts, i, sun);
      const at = (s: number) => `${round(pt.x + nx * pt.w * s)},${round(pt.y + ny * pt.w * s)}`;
      plates.push(`M${at(-0.9)} L${at(-0.36)}`);
      bands.push(`M${at(-0.3)} Q${round(pt.x + nx * pt.w * 0.3 + (pts[i - 1].x - pt.x) * 0.8)},${round(pt.y + ny * pt.w * 0.3 + (pts[i - 1].y - pt.y) * 0.8)} ${at(0.92)}`);
    }
    return (
      <g key={key}>
        {fins}
        <path d={body} fill={p.body} />
        <path d={line(side(pts, 0.5, sun, r.a, r.b))} fill="none" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth={round(pts[Math.floor((r.a + r.b) / 2)].w * 0.9)} strokeLinecap="butt" />
        <path d={belly} fill={p.belly} opacity="0.85" />
        <path d={plates.join(" ")} stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1" fill="none" />
        <path d={bands.join(" ")} stroke={p.bodyDark} strokeOpacity="0.28" strokeWidth="1.1" fill="none" />
        <path d={line(side(pts, -0.12, sun, r.a, r.b))} fill="none" stroke={p.bodyLight} strokeOpacity="0.6" strokeWidth={round(pts[Math.floor((r.a + r.b) / 2)].w * 0.36)} strokeLinecap="round" />
        <path d={line(side(pts, -0.2, sun, r.a, r.b))} fill="none" stroke="#fff" strokeOpacity="0.32" strokeWidth={round(Math.max(1, pts[Math.floor((r.a + r.b) / 2)].w * 0.1))} strokeLinecap="round" />
        <path d={line(outer)} fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.3" />
        <path d={line(inner)} fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.3" />
      </g>
    );
  };
  return {
    back: <g>{runs.filter((r) => !r.f).map((r, i) => draw(r, i))}</g>,
    front: <g>{runs.filter((r) => r.f).map((r, i) => draw(r, i))}</g>,
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
  const sun: [number, number] = [200, 250];
  const body = [
    ...bez([252, 312], [236, 318], [214, 316], [196, 312], 3, 9),
    ...coil({ cx: 200, cy: 254, rx: 62, ry: 30, tilt: -6, t0: 1.72, t1: 2 * Math.PI + 0.1, drift: -8, w: (t) => 13 + 5 * Math.sin(t * Math.PI), n: 46 }).slice(1),
    ...bez([262, 236], [268, 216], [252, 200], [232, 196], 14, 13).slice(1),
  ];
  const s = serpent(c, body, sun, undefined, 5);
  return (
    <g>
      {s.back}
      <Sun c={c} k="egg" x={sun[0]} y={sun[1]} r={34} rays={0} />
      {/* a few sparks flicking off the ember */}
      <g filter={u("glow")} className="sl-twinkle">
        {[
          [168, 214, 2.2],
          [236, 222, 1.8],
          [154, 248, 1.6],
        ].map(([x, y, r], i) => (
          <circle key={x} cx={x} cy={y} r={r} fill={i ? p.accent : p.eye} style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
      {s.front}
      {/* tail tip curled over the front with the faintest fin bud */}
      <path d="M252,312 C262,310 270,302 268,294 C264,300 258,304 250,306 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.7" />
      {/* big round head, chin resting on the ember */}
      <g transform="translate(232 196)">
        {/* frill buds: the first hint of the mane */}
        <g className="sl-sway" style={{ transformOrigin: "232px 186px" }}>
          {[-60, -25, 10].map((a, i) => (
            <path key={a} d={flame(14 - i * 2, 4)} transform={`translate(8 -12) rotate(${a})`} fill={i === 1 ? p.eye : p.accent} opacity="0.9" filter={u("glow")} />
          ))}
        </g>
        <path d="M14,-4 C14,-30 -6,-44 -32,-44 C-56,-44 -72,-28 -74,-8 C-76,8 -66,20 -46,22 C-24,24 14,20 14,-4 Z" fill={u("body")} {...rim(c)} />
        {/* small rounded snout and smile */}
        <path d="M-72,4 C-62,14 -44,18 -24,16" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M-68,10 C-54,20 -26,22 -6,16 C-16,24 -48,26 -64,18 Z" fill={p.belly} opacity="0.9" />
        <circle cx="-68" cy="-6" r="1.8" fill={p.bodyDark} />
        <path d="M-30,-42 C-20,-46 -6,-42 2,-34" fill="none" stroke={p.horn} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="-14" cy="6" rx="8" ry="4.4" fill={p.eye} opacity="0.28" />
        <Spec x={-38} y={-34} rx={18} ry={6} rot={-8} o={0.32} />
        <Eye c={c} x={-40} y={-10} r={12} kind="round" />
        <Gem c={c} x={-6} y={-30} s={0.42} />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Hatchling                                                           */
/* ------------------------------------------------------------------ */

/** Hatchling: a longer, leaner serpent wrapped one and a half times round a brighter sun-seed, neck lifted, short flame mane. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const sun: [number, number] = [196, 246];
  const body = [
    ...bez([86, 318], [104, 322], [126, 316], [142, 304], 2, 9),
    ...coil({ cx: 198, cy: 250, rx: 84, ry: 30, tilt: -8, t0: 2.6, t1: 2 * Math.PI + 0.15, drift: -16, grow: 0.08, w: (t) => 10 + 4 * Math.sin(t * Math.PI), n: 50 }).slice(1),
    ...bez([290, 222], [312, 186], [296, 150], [264, 140], 12, 10).slice(1),
  ];
  const s = serpent(c, body, sun, { every: 5, len: 12, wid: 4, from: 10, to: 60 }, 4);
  return (
    <g>
      {s.back}
      <Sun c={c} k="hatch" x={sun[0]} y={sun[1]} r={44} rays={10} flare={0.8} />
      {s.front}
      {/* small tail fluke */}
      <g transform="translate(86 318)">
        <path d="M0,0 C-10,-10 -24,-12 -32,-6 C-22,-4 -14,0 -10,6 C-18,10 -22,18 -20,24 C-10,16 -2,8 0,0 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.75" />
      </g>
      {/* head: snout lengthening, eyes still big */}
      <g transform="translate(264 140)">
        <g className="sl-sway" style={{ transformOrigin: "270px 136px" }}>
          {[-70, -40, -10, 22].map((a, i) => (
            <path key={a} d={flame(22 - Math.abs(i - 1.5) * 4, 5.5)} transform={`translate(6 -8) rotate(${a})`} fill={i % 2 ? p.eye : p.accent} opacity="0.9" filter={u("glow")} />
          ))}
        </g>
        <path d="M-6,-24 C-2,-34 6,-38 14,-38 C8,-32 4,-26 2,-20 Z" fill={u("horn")} {...rim(c, 0.8)} />
        <path d="M12,-4 C12,-24 -4,-34 -24,-34 C-42,-34 -56,-26 -70,-16 C-80,-10 -84,-2 -80,4 C-76,10 -64,12 -50,13 C-30,15 -8,18 4,12 C10,8 12,4 12,-4 Z" fill={u("body")} {...rim(c)} />
        <path d="M-80,4 C-66,12 -40,16 -14,15 C-24,22 -56,22 -74,14 Z" fill={p.belly} opacity="0.9" />
        <path d="M-78,2 C-62,8 -44,10 -30,9" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="-74" cy="-8" r="1.8" fill={p.bodyDark} />
        <path d="M-20,-30 C-32,-30 -42,-26 -48,-20" fill="none" stroke={p.horn} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
        <Spec x={-28} y={-26} rx={16} ry={4.4} rot={-6} o={0.3} />
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
function adultHead(c: Ctx, mane: number) {
  const { p, u } = c;
  return (
    <g>
      {/* flame mane sweeping back from the skull */}
      <g className="sl-sway" style={{ transformOrigin: "0px 0px" }}>
        {[-95, -68, -42, -16, 12, 40, 66].map((a, i) => (
          <path key={a} d={flame((40 - Math.abs(i - 3) * 5) * mane, 8)} transform={`translate(4 -4) rotate(${a})`} fill={i % 2 ? p.eye : p.accent} opacity="0.92" filter={u("glow")} />
        ))}
        {[-80, -30, 26].map((a) => (
          <path key={a} d={flame(26 * mane, 5)} transform={`translate(6 -4) rotate(${a})`} fill="#fff6c7" opacity="0.85" />
        ))}
      </g>
      {/* swept horns */}
      <path d="M-14,-24 C-2,-38 16,-46 38,-48 C22,-40 10,-30 2,-18 Z" fill={u("horn")} {...rim(c, 1)} />
      {/* lower jaw */}
      <path d="M-82,6 C-66,10 -48,12 -34,13 C-20,15 -8,19 0,22 C-12,30 -36,28 -56,23 C-70,20 -80,14 -82,6 Z" fill={u("body")} {...rim(c)} />
      <path d="M-78,10 C-60,18 -32,24 -6,23 C-20,28 -50,26 -70,18 Z" fill={p.belly} opacity="0.9" />
      {/* skull */}
      <path d="M14,-6 C12,-22 -6,-30 -28,-29 C-44,-28 -58,-21 -74,-14 C-86,-9 -94,-5 -94,1 C-94,6 -88,8 -80,8 L-46,10 C-30,10 -16,11 -4,15 C6,12 14,6 14,-6 Z" fill={u("body")} {...rim(c)} />
      {/* brow ridge and muzzle scales */}
      <path d="M-18,-25 C-32,-27 -46,-23 -56,-16 C-44,-17 -32,-16 -20,-14 Z" fill={u("horn")} opacity="0.9" />
      <path d="M-62,-14 L-58,-8 M-72,-10 L-68,-4 M-82,-6 L-78,-1" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1" />
      <path d="M-92,3 C-76,7 -58,9 -40,10" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-88,-4 C-86,-7 -82,-8 -80,-6" fill="none" stroke={p.bodyDark} strokeWidth="1.6" strokeLinecap="round" />
      {/* cheek fin */}
      <path d={blade(30, 8, 0.6)} transform="translate(-6 12) rotate(28)" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.75" />
      <Spec x={-36} y={-24} rx={22} ry={4.4} rot={-6} o={0.38} />
      <Eye c={c} x={-36} y={-12} r={6.4} kind="slit" flip angle={-6} />
    </g>
  );
}

const evolved: Renderer = {
  floating: true,
  shadow: 130,
  halo: [200, 40, 30],
  render: (c) => {
    const { p, u } = c;
    const sun: [number, number] = [196, 236];
    const body = [
      ...bez([66, 330], [76, 312], [86, 286], [86, 262], 2, 13, true, 14),
      ...coil({ cx: 196, cy: 244, rx: 112, ry: 36, tilt: -8, t0: Math.PI - 0.02, t1: 4 * Math.PI, drift: -38, grow: 0.12, w: (t) => 14 + 6 * Math.sin(Math.min(1, t * 1.3) * Math.PI * 0.9), n: 120 }).slice(1),
      ...bez([316, 186], [346, 150], [334, 108], [296, 98], 17, 14).slice(1),
    ];
    const s = serpent(c, body, sun, { every: 6, len: 20, wid: 6, from: 18, to: 130 }, 4);
    return (
      <g>
        {s.back}
        <Sun c={c} k="evo" x={sun[0]} y={sun[1]} r={60} rays={16} />
        {s.front}
        {/* tail fluke */}
        <g transform="translate(66 330) rotate(20)">
          <path d="M0,0 C-14,-12 -32,-14 -44,-6 C-30,-2 -20,2 -14,8 C-24,14 -28,26 -24,34 C-12,24 -2,12 0,0 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
          <path d="M-4,2 L-34,-6 M-4,4 L-20,26" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1" />
        </g>
        <g transform="translate(296 98) rotate(8)">
          {adultHead(c, 1)}
          <Gem c={c} x={-24} y={-20} s={0.46} />
        </g>
      </g>
    );
  },
};

/* ------------------------------------------------------------------ */
/* Ascended                                                            */
/* ------------------------------------------------------------------ */

/** Ascended: a vast leviathan looped twice about a blazing sun, head reared high and crowned, flame mane, barbels and fin-wings. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const sun: [number, number] = [200, 236];
  const body = [
    ...bez([52, 352], [62, 332], [70, 300], [78, 276], 2, 14, true, 14),
    ...coil({ cx: 200, cy: 254, rx: 126, ry: 34, tilt: -6, t0: Math.PI - 0.06, t1: 5 * Math.PI + 0.2, drift: -76, grow: 0.06, w: (t) => 14 + 8 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.9), n: 190 }).slice(1),
  ];
  const last = body[body.length - 1];
  const neck = bez([last.x, last.y], [round(last.x - 30), round(last.y - 30)], [262, 150], [250, 112], 20, 16).slice(1);
  const all = [...body, ...neck];
  const s = serpent(c, all, sun, { every: 6, len: 24, wid: 7, from: 18, to: 200 }, 4);
  return (
    <g>
      {/* great pectoral fin-wings fanning behind the reared neck */}
      <g className="sl-sway-slow" style={{ transformOrigin: "262px 168px" }}>
        {[-150, -128, -106, -84].map((a, i) => (
          <path key={a} d={blade(78 - i * 8, 14, 0.6)} transform={`translate(262 168) rotate(${a + 180})`} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" />
        ))}
      </g>
      {s.back}
      <Sun c={c} k="asc" x={sun[0]} y={sun[1]} r={64} rays={20} flare={1.25} />
      {/* outer corona ring */}
      <g className="sl-spin-rev" style={{ transformOrigin: "200px 236px" }} filter={u("glow")}>
        {Array.from({ length: 12 }).map((_, i) => {
          const [x, y] = polar(200, 236, 112, i * 30 + 15);
          return <circle key={i} cx={x} cy={y} r={i % 2 ? 2 : 3} fill={i % 2 ? p.eye : p.accent} opacity="0.85" />;
        })}
      </g>
      {s.front}
      {/* ornate tail fluke with flame edges */}
      <g transform="translate(52 352) rotate(30)">
        <path d="M0,0 C-16,-16 -40,-18 -56,-8 C-40,-2 -28,2 -18,10 C-30,18 -34,32 -30,42 C-14,30 -2,14 0,0 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.85" />
        <path d={flame(18, 3)} transform="translate(-50 -8) rotate(170)" fill={p.eye} opacity="0.85" filter={u("glow")} />
        <path d={flame(16, 3)} transform="translate(-30 40) rotate(110)" fill={p.accent} opacity="0.85" filter={u("glow")} />
      </g>
      {/* reared, crowned head looking out over the sun */}
      <g transform="translate(250 112) rotate(-14)">
        {/* back mane layer: tall flames */}
        <g className="sl-sway" style={{ transformOrigin: "250px 112px" }}>
          {[-120, -96, -72, -48, -24, 0, 24, 50].map((a, i) => (
            <path key={a} d={flame(62 - Math.abs(i - 3.5) * 7, 10)} transform={`translate(2 -2) rotate(${a})`} fill={i % 2 ? p.eye : p.accent} opacity="0.85" filter={u("glow")} />
          ))}
        </g>
        {adultHead(c, 1.15)}
        {/* crown: five horn spires */}
        {[
          [-30, -28, -100, 22],
          [-18, -30, -82, 30],
          [-6, -28, -64, 36],
          [4, -24, -46, 30],
        ].map(([x, y, a, l]) => (
          <path key={a} d={blade(l, 4.4, 0.7)} transform={`translate(${x} ${y}) rotate(${a})`} fill={u("horn")} {...rim(c, 0.8)} />
        ))}
        {/* trailing barbels */}
        <g fill="none" stroke={p.wingEdge} strokeWidth="2" strokeLinecap="round" opacity="0.9">
          <path d="M-90,4 C-100,22 -94,42 -78,54 C-70,60 -70,70 -76,78" />
          <path d="M-60,16 C-64,32 -58,46 -46,54" strokeWidth="1.5" />
        </g>
        <circle cx="-76" cy="78" r="2.4" fill={p.accent} filter={u("glow")} />
        {/* mouth glow: sunfire behind the teeth */}
        <path d="M-88,4 C-72,9 -52,11 -36,11" fill="none" stroke={p.eye} strokeWidth="2.4" strokeLinecap="round" filter={u("glow")} className="sl-core" />
        <Gem c={c} x={-24} y={-20} s={0.56} />
      </g>
    </g>
  );
}

export const solvanth: Renderer = {
  ...evolved,
  halo: [236, 36, 28],
  stageFit: [1.3, 1.1, 1, 0.94],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
