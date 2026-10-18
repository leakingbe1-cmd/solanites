import { byStage, Gem, polar, rad, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/**
 * GENESIS — "Slot Zero". A levitating obsidian polyhedron with green edge
 * light, a single visor eye and orbiting Solana bars. Each stage is a
 * different solid: a seed tetrahedron, an unfolding octahedron, a full
 * icosahedral construct, and finally nested cages round one unblinking eye.
 */

/* ───────────────────────────── 3D kit ───────────────────────────── */

type V3 = [number, number, number];
type P2 = [number, number];
interface Solid {
  v: V3[];
  f: number[][];
  e: [number, number][];
}

const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Edges are the vertex pairs at the shortest distance (true for every regular solid used here). */
function solid(v: V3[], f: number[][]): Solid {
  let min = Infinity;
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) min = Math.min(min, dist(v[i], v[j]));
  const e: [number, number][] = [];
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (dist(v[i], v[j]) < min * 1.01) e.push([i, j]);
  return { v, f, e };
}

/** Regular tetrahedron, apex up (+y), one base corner at the back. */
const TETRA = (() => {
  const r = Math.sqrt(8) / 3;
  const v: V3[] = [[0, 1, 0], ...[-90, 30, 150].map((a): V3 => [r * Math.cos(rad(a)), -1 / 3, r * Math.sin(rad(a))])];
  return solid(v, [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]]);
})();

const OCTA = (() => {
  const v: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const eq = [0, 4, 1, 5];
  const f = eq.flatMap((a, i) => [[2, a, eq[(i + 1) % 4]], [3, a, eq[(i + 1) % 4]]]);
  return solid(v, f);
})();

const ICOSA = (() => {
  const t = (1 + Math.sqrt(5)) / 2;
  const v: V3[] = [];
  for (const a of [-1, 1]) for (const b of [-t, t]) v.push([0, a, b], [a, b, 0], [b, 0, a]);
  const n = Math.hypot(1, t);
  const vs = v.map(([x, y, z]): V3 => [x / n, y / n, z / n]);
  const f: number[][] = [];
  const near = (i: number, j: number) => Math.abs(dist(v[i], v[j]) - 2) < 0.01;
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) if (near(i, j) && near(j, k) && near(i, k)) f.push([i, j, k]);
  return solid(vs, f);
})();

const CUBE = (() => {
  const v: V3[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x * 0.58, y * 0.58, z * 0.58]);
  return solid(v, []);
})();

const LIGHT: V3 = (() => {
  const l: V3 = [-0.45, 0.68, 0.6];
  const n = Math.hypot(...l);
  return [l[0] / n, l[1] / n, l[2] / n];
})();

interface View {
  cx: number;
  cy: number;
  s: number;
  yaw: number;
  pitch: number;
  roll?: number;
  /** Per-axis stretch applied before rotation. */
  k?: V3;
}

function turn([x, y, z]: V3, { yaw, pitch, roll = 0, k = [1, 1, 1] }: View): V3 {
  [x, y, z] = [x * k[0], y * k[1], z * k[2]];
  const [cy, sy] = [Math.cos(rad(yaw)), Math.sin(rad(yaw))];
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  const [cp, sp] = [Math.cos(rad(pitch)), Math.sin(rad(pitch))];
  [y, z] = [y * cp - z * sp, y * sp + z * cp];
  const [cr, sr] = [Math.cos(rad(roll)), Math.sin(rad(roll))];
  [x, y] = [x * cr - y * sr, x * sr + y * cr];
  return [x, y, z];
}

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a: string, b: string, t: number) {
  const [A, B] = [hex(a), hex(b)];
  const tt = Math.max(0, Math.min(1, t));
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * tt).toString(16).padStart(2, "0")).join("")}`;
}

function hull(pts: P2[]): P2[] {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [];
  for (const p of s) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  const up: P2[] = [];
  for (const p of [...s].reverse()) {
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}

const poly = (pts: P2[]) => `M${pts.map(([x, y]) => `${x},${y}`).join(" L")} Z`;

/** Projects a solid: screen points, depth, and its visible shaded faces. */
function project(S: Solid, view: View) {
  const r = S.v.map((v) => turn(v, view));
  const pts = r.map(([x, y]): P2 => [round(view.cx + x * view.s), round(view.cy - y * view.s)]);
  const faces = S.f
    .map((f) => {
      const [a, b, c] = f.map((i) => r[i]);
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let n: V3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const m = f.reduce((o, i) => [o[0] + r[i][0], o[1] + r[i][1], o[2] + r[i][2]] as V3, [0, 0, 0] as V3);
      if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) n = [-n[0], -n[1], -n[2]];
      const l = Math.hypot(...n);
      n = [n[0] / l, n[1] / l, n[2] / l];
      const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      const c2: P2 = [round(f.reduce((s, i) => s + pts[i][0], 0) / f.length), round(f.reduce((s, i) => s + pts[i][1], 0) / f.length)];
      return { f, n, lit, mid: c2, d: poly(f.map((i) => pts[i])) };
    })
    .filter((x) => x.n[2] > 0.02);
  return { pts, z: r.map((v) => v[2]), faces, hull: hull(pts) };
}

/** Obsidian facet colour: lit from the upper left, green bounce from below, violet from the right. */
function facetColor(c: Ctx, n: V3, lit: number) {
  const { p } = c;
  let col = lit < 0.5 ? mix("#030308", p.body, lit * 2) : mix(p.body, mix(p.bodyLight, p.horn, 0.18), (lit - 0.5) * 2);
  col = mix(col, p.belly, Math.max(0, -n[1]) * 0.26);
  col = mix(col, p.accent, Math.max(0, n[0]) * 0.22);
  return col;
}

/** A solid obsidian polyhedron with green edge light and a glowing silhouette. */
function Poly({ c, S, view, edge = 0.5, outline = 1.6, shimmer = true }: { c: Ctx; S: Solid; view: View; edge?: number; outline?: number; shimmer?: boolean }) {
  const { p, u } = c;
  const pr = project(S, view);
  const h = poly(pr.hull);
  return (
    <g>
      <path d={h} fill={p.bodyDark} />
      {pr.faces.map((f, i) => (
        <path key={i} d={f.d} fill={facetColor(c, f.n, f.lit)} stroke={p.wingEdge} strokeOpacity={round(edge * (0.35 + f.lit * 0.65))} strokeWidth="0.9" strokeLinejoin="round" />
      ))}
      {shimmer &&
        pr.faces
          .filter((f) => f.lit > 0.72)
          .map((f, i) => <path key={`s${i}`} d={f.d} fill="#fff" opacity="0.07" className="sl-shimmer-facet" style={{ animationDelay: `${round(i * 0.6)}s` }} />)}
      <path d={h} fill={u("shade")} opacity="0.55" />
      <path d={h} fill="none" stroke={p.wingEdge} strokeWidth={outline} strokeLinejoin="round" filter={u("glow")} className="sl-rune-pulse" />
      <path d={h} fill="none" {...rim(c, 1)} strokeLinejoin="round" />
    </g>
  );
}

/** Wireframe cage: front edges bright, back edges faint, glowing vertex nodes. */
function Cage({ c, S, view, color, w = 1.4, nodes = true }: { c: Ctx; S: Solid; view: View; color: string; w?: number; nodes?: boolean }) {
  const pr = project(S, view);
  const zmax = Math.max(...pr.z);
  return (
    <g>
      {S.e.map(([a, b], i) => {
        const z = (pr.z[a] + pr.z[b]) / 2;
        const front = z > 0;
        const [p1, p2] = [pr.pts[a], pr.pts[b]];
        return (
          <path
            key={i}
            d={`M${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`}
            stroke={color}
            strokeWidth={front ? w : round(w * 0.6)}
            strokeOpacity={round(front ? 0.55 + 0.4 * (z / zmax) : 0.22)}
            strokeDasharray={front ? undefined : "3 5"}
            strokeLinecap="round"
          />
        );
      })}
      {nodes && (
        <g filter={c.u("glow")} className="sl-twinkle">
          {pr.pts.map(([x, y], i) => (pr.z[i] > -0.2 ? <circle key={i} cx={x} cy={y} r={pr.z[i] > 0.3 ? 2.6 : 1.8} fill={i % 2 ? c.p.accent : c.p.belly} style={{ animationDelay: `${round(i * 0.37)}s` }} /> : null))}
        </g>
      )}
    </g>
  );
}

/* ───────────────────────────── orbits & bars ───────────────────────────── */

interface Ring {
  cx: number;
  cy: number;
  R: number;
  /** Ellipse flattening (ry / rx). */
  f: number;
  /** Screen rotation of the orbit plane. */
  tilt: number;
}

function ringPt(o: Ring, deg: number): { x: number; y: number; depth: number; ang: number } {
  const a = rad(deg);
  const [lx, ly] = [o.R * Math.cos(a), o.R * o.f * Math.sin(a)];
  const t = rad(o.tilt);
  const x = round(o.cx + lx * Math.cos(t) - ly * Math.sin(t));
  const y = round(o.cy + lx * Math.sin(t) + ly * Math.cos(t));
  const ang = round((Math.atan2(o.R * o.f * Math.cos(a), -o.R * Math.sin(a)) * 180) / Math.PI + o.tilt);
  return { x, y, depth: Math.sin(a), ang };
}

/** Half of an orbit path: the back (upper) half or the front (lower) half. */
function ringPath(o: Ring, front: boolean) {
  const pts = Array.from({ length: 25 }, (_, i) => ringPt(o, (front ? 0 : 180) + i * 7.5));
  return `M${pts.map((q) => `${q.x},${q.y}`).join(" L")}`;
}

/** One Solana bar: a slanted parallelogram in the green→violet gradient. */
function Bar({ c, grad, x, y, ang, len, th, depth }: { c: Ctx; grad: string; x: number; y: number; ang: number; len: number; th: number; depth: number }) {
  const k = round(0.78 + 0.22 * depth);
  const [L, T, sk] = [round(len / 2), round(th / 2), round(th * 0.7)];
  const d = `M${-L + sk},${-T} L${L + sk},${-T} L${L - sk},${T} L${-L - sk},${T} Z`;
  const a = ang;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${k})`} opacity={round(0.5 + 0.5 * Math.max(0, depth) + 0.15)}>
      <path d={d} fill={grad} filter={c.u("glow")} className="sl-rune-pulse" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
      <path d={`M${-L + sk},${-T + 1} L${L + sk - 2},${-T + 1}`} stroke="#fff" strokeOpacity="0.7" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

/** Bars mostly keep to the orbit plane's tilt, turning only slightly with the curve. */
function flat(o: Ring, ang: number) {
  let d = ((((ang - o.tilt) % 360) + 540) % 360) - 180;
  if (d > 90) d -= 180;
  if (d < -90) d += 180;
  return round(o.tilt + d * 0.25);
}

/** Draws the back or front half of an orbit and the bars on it. */
function Orbit({ c, grad, o, at, len, th, front, line = 0.5 }: { c: Ctx; grad: string; o: Ring; at: number[]; len: number; th: number; front: boolean; line?: number }) {
  const { p, u } = c;
  return (
    <g>
      <path d={ringPath(o, front)} fill="none" stroke={front ? p.belly : p.accent} strokeOpacity={front ? line : round(line * 0.6)} strokeWidth="1" strokeDasharray="2 6" className="sl-dash" />
      {front && <path d={ringPath(o, true)} fill="none" stroke={p.belly} strokeOpacity={round(line * 0.4)} strokeWidth="3" filter={u("blur8")} />}
      {at
        .map((deg) => ringPt(o, deg))
        .filter((q) => (q.depth >= 0) === front)
        .map((q, i) => (
          <Bar key={i} c={c} grad={grad} x={q.x} y={q.y} ang={flat(o, q.ang)} len={len} th={th} depth={q.depth} />
        ))}
    </g>
  );
}

function SolDefs({ c, stage }: { c: Ctx; stage: string }) {
  const { p } = c;
  return (
    <defs>
      <linearGradient id={`${c.id}${stage}-sol`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={p.belly} />
        <stop offset="0.55" stopColor="#19c8d8" />
        <stop offset="1" stopColor={p.accent} />
      </linearGradient>
      <radialGradient id={`${c.id}${stage}-core`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={p.belly} stopOpacity="0.55" />
        <stop offset="0.45" stopColor={p.accent} stopOpacity="0.22" />
        <stop offset="1" stopColor={p.accent} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${c.id}${stage}-iris`} cx="0.42" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.3" stopColor={p.belly} />
        <stop offset="0.75" stopColor="#0a8f63" />
        <stop offset="1" stopColor={p.accent} />
      </radialGradient>
    </defs>
  );
}

/** Energy tether trailing below the construct (it never touches the ground). */
function Tether({ c, x, y1, y2, w = 2 }: { c: Ctx; x: number; y1: number; y2: number; w?: number }) {
  const { p, u } = c;
  return (
    <g>
      <path d={`M${x},${y1} L${x},${y2}`} stroke={p.belly} strokeWidth={w * 3} strokeOpacity="0.25" filter={u("blur8")} />
      <path d={`M${x},${y1} L${x},${y2}`} stroke={p.belly} strokeWidth={w} strokeDasharray="2 6" strokeLinecap="round" filter={u("glow")} className="sl-dash" />
    </g>
  );
}

/** A lens eye: dark socket, layered iris, slit pupil, highlights. Unblinking by design. */
function Lens({ c, stage, x, y, r, rings = 1 }: { c: Ctx; stage: string; x: number; y: number; r: number; rings?: number }) {
  const { p, u } = c;
  return (
    <g>
      <circle cx={x} cy={y} r={round(r * 1.25)} fill="#020205" stroke={p.bodyLight} strokeWidth="1.2" />
      <circle cx={x} cy={y} r={round(r * 1.1)} fill={p.belly} opacity="0.5" filter={u("glow")} className="sl-core" />
      <circle cx={x} cy={y} r={r} fill={`url(#${c.id}${stage}-iris)`} />
      {Array.from({ length: rings }, (_, i) => (
        <circle key={i} cx={x} cy={y} r={round(r * (0.78 - i * 0.18))} fill="none" stroke="#04140d" strokeOpacity="0.45" strokeWidth="0.9" />
      ))}
      <ellipse cx={x} cy={y} rx={round(r * 0.2)} ry={round(r * 0.62)} fill="#020205" />
      <circle cx={round(x + r * 0.36)} cy={round(y - r * 0.38)} r={round(r * 0.22)} fill="#fff" />
      <circle cx={round(x - r * 0.34)} cy={round(y + r * 0.34)} r={round(r * 0.09)} fill="#fff" opacity="0.7" />
    </g>
  );
}

/** A dark visor band following `pts` (left→right), with a glowing scan line and an iris riding in it. */
function Visor({ c, stage, pts, h, iris, eye }: { c: Ctx; stage: string; pts: P2[]; h: number; iris: P2; eye: number }) {
  const { p, u } = c;
  const top = pts.map(([x, y]): P2 => [x, round(y - h / 2)]);
  const bot = [...pts].reverse().map(([x, y]): P2 => [x, round(y + h / 2)]);
  const mid = `M${pts.map(([x, y]) => `${x},${y}`).join(" L")}`;
  return (
    <g>
      <path d={poly([...top, ...bot])} fill="#020205" stroke={p.bodyLight} strokeWidth="1" strokeLinejoin="round" />
      <path d={mid} fill="none" stroke={p.belly} strokeWidth={round(h * 0.28)} strokeLinecap="round" strokeLinejoin="round" opacity="0.85" filter={u("glow")} className="sl-twinkle" />
      <path d={`M${top[0][0] + 3},${top[0][1] + 1.5} L${top[top.length - 1][0] - 3},${top[top.length - 1][1] + 1.5}`} stroke="#fff" strokeOpacity="0.22" strokeWidth="1" />
      <ellipse cx={iris[0]} cy={iris[1]} rx={round(eye * 1.5)} ry={round(eye * 1.1)} fill={p.belly} opacity="0.6" filter={u("glow")} className="sl-core" />
      <ellipse cx={iris[0]} cy={iris[1]} rx={round(eye * 0.95)} ry={round(eye * 0.85)} fill={`url(#${c.id}${stage}-iris)`} />
      <ellipse cx={iris[0]} cy={iris[1]} rx={round(eye * 0.26)} ry={round(eye * 0.6)} fill="#05150e" />
      <circle cx={round(iris[0] + eye * 0.38)} cy={round(iris[1] - eye * 0.35)} r={round(eye * 0.22)} fill="#fff" />
    </g>
  );
}

/** A small floating satellite shard (a stretched octahedron), with an optional glowing core line. */
function Shard({ c, x, y, s, roll, yaw = 30, len = 2.2 }: { c: Ctx; x: number; y: number; s: number; roll: number; yaw?: number; len?: number }) {
  return <Poly c={c} S={OCTA} view={{ cx: x, cy: y, s, yaw, pitch: 12, roll, k: [0.55, len, 0.55] }} edge={0.6} outline={1.1} shimmer={false} />;
}

/* ───────────────────────────── Eggling ───────────────────────────── */

/** Eggling: a tiny seed tetrahedron with one huge round eye and a single orbiting bar. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const st = "egg";
  const grad = `url(#${c.id}${st}-sol)`;
  const view: View = { cx: 200, cy: 228, s: 66, yaw: 10, pitch: 24, roll: -4, k: [1.05, -1, 1.05] };
  const pr = project(TETRA, view);
  const top = pr.hull.reduce((a, b) => (b[1] < a[1] ? b : a));
  const tip = pr.hull.reduce((a, b) => (b[1] > a[1] ? b : a));
  const front = pr.faces.reduce((a, b) => (b.n[2] > a.n[2] ? b : a));
  const [ex, ey] = [front.mid[0], round(front.mid[1] - 6)];
  const o: Ring = { cx: 200, cy: 240, R: 86, f: 0.26, tilt: -10 };
  const at = [35];
  return (
    <g>
      <SolDefs c={c} stage={st} />
      <circle cx="200" cy="230" r="92" fill={`url(#${c.id}${st}-core)`} className="sl-aura-pulse" style={{ transformOrigin: "200px 230px" }} />
      <Tether c={c} x={tip[0]} y1={round(tip[1] + 6)} y2={round(tip[1] + 40)} w={1.6} />
      {/* the faint glass shell it is still half inside */}
      <circle cx="200" cy="230" r="70" fill={p.belly} opacity="0.04" />
      <path d="M140,262 A70,70 0 0 1 150,178" fill="none" stroke={p.belly} strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M260,190 A70,70 0 0 1 262,262" fill="none" stroke={p.accent} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M150,178 L158,186 L154,194 M260,190 L252,196 L256,204" fill="none" stroke={p.belly} strokeOpacity="0.35" strokeWidth="1" />
      <Orbit c={c} grad={grad} o={o} at={at} len={38} th={12} front={false} />
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 230px" }}>
        <Poly c={c} S={TETRA} view={view} edge={0.55} />
        {/* the one green light, far too big for its little body */}
        <circle cx={ex} cy={ey} r="34" fill={p.belly} opacity="0.16" filter={u("blur8")} />
        <Lens c={c} stage={st} x={ex} y={ey} r={18} />
        <Spec x={round(ex - 24)} y={round(ey - 20)} rx={12} ry={3.5} rot={-20} o={0.3} />
      </g>
      {/* the seed spark it is named for */}
      <Gem c={c} x={round(top[0] + 2)} y={round(top[1] - 14)} s={0.42} />
      <Orbit c={c} grad={grad} o={o} at={at} len={38} th={12} front />
    </g>
  );
}

/* ───────────────────────────── Hatchling ───────────────────────────── */

/** Hatchling: an unfolding octahedron with its first visor, two orbiting bars and two little satellite shards. */
function hatchling(c: Ctx) {
  const { p } = c;
  const st = "hat";
  const grad = `url(#${c.id}${st}-sol)`;
  const view: View = { cx: 200, cy: 214, s: 70, yaw: 32, pitch: 24, roll: -12, k: [1, 1.12, 1] };
  const pr = project(OCTA, view);
  // equator vertices in left→right order: −x, +z (front), +x
  const eq = [pr.pts[1], pr.pts[4], pr.pts[0]];
  const visor: P2[] = [
    [round(eq[0][0] + 10), round(eq[0][1] - 1)],
    [eq[1][0], round(eq[1][1] + 1)],
    [round(eq[2][0] - 10), round(eq[2][1] - 1)],
  ];
  const iris: P2 = [round((visor[0][0] + visor[2][0]) / 2 + 8), round((visor[0][1] + visor[2][1]) / 2 + 4)];
  const o: Ring = { cx: 200, cy: 222, R: 112, f: 0.28, tilt: -12 };
  const at = [150, 20];
  return (
    <g>
      <SolDefs c={c} stage={st} />
      <circle cx="200" cy="214" r="118" fill={`url(#${c.id}${st}-core)`} className="sl-aura-pulse" style={{ transformOrigin: "200px 214px" }} />
      <Tether c={c} x={200} y1={300} y2={340} />
      <Orbit c={c} grad={grad} o={o} at={at} len={44} th={13} front={false} />
      {/* half-grown satellite shards, like small hands held out */}
      {[-1, 1].map((m) => (
        <g key={m} transform={`translate(${200 + m * 92} 238)`}>
          <g className="sl-sway" style={{ transformOrigin: "0px 0px", animationDelay: `${m > 0 ? 1.2 : 0}s` }}>
            <Shard c={c} x={0} y={0} s={11} roll={m * -28} />
          </g>
        </g>
      ))}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 214px" }}>
        <Poly c={c} S={OCTA} view={view} edge={0.6} />
        <Visor c={c} stage={st} pts={visor} h={18} iris={iris} eye={10} />
        <Spec x={round(pr.pts[2][0] - 16)} y={round(pr.pts[2][1] + 36)} rx={16} ry={4} rot={-62} o={0.26} />
        <Gem c={c} x={round(pr.pts[2][0] - 2)} y={round(pr.pts[2][1] + 42)} s={0.46} />
      </g>
      <Orbit c={c} grad={grad} o={o} at={at} len={44} th={13} front />
    </g>
  );
}

/* ───────────────────────────── Evolved ───────────────────────────── */

/** Evolved: a full icosahedral construct with a wrapped visor, crown spike, pauldron shards, a segmented tether and three bars. */
function evolvedArt(c: Ctx) {
  const { p } = c;
  const st = "evo";
  const grad = `url(#${c.id}${st}-sol)`;
  const view: View = { cx: 200, cy: 200, s: 74, yaw: 18, pitch: 14, k: [1, 1.12, 1] };
  const pr = project(ICOSA, view);
  const xs = pr.hull.map((q) => q[0]);
  const [l, r] = [Math.min(...xs), Math.max(...xs)];
  const vy = 200;
  const visor: P2[] = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const x = round(l + 10 + (r - l - 20) * t);
    return [x, round(vy - 3 + 6 * Math.sin(t * Math.PI))];
  });
  const o: Ring = { cx: 200, cy: 210, R: 140, f: 0.3, tilt: -14 };
  const at = [200, 340, 30];
  const topY = Math.min(...pr.hull.map((q) => q[1]));
  return (
    <g>
      <SolDefs c={c} stage={st} />
      <circle cx="200" cy="205" r="140" fill={`url(#${c.id}${st}-core)`} className="sl-aura-pulse" style={{ transformOrigin: "200px 205px" }} />
      <Orbit c={c} grad={grad} o={o} at={at} len={54} th={14} front={false} />
      {/* segmented tether: three diminishing floating cells */}
      <Tether c={c} x={200} y1={292} y2={352} />
      {[0, 1, 2].map((i) => (
        <Poly key={i} c={c} S={OCTA} view={{ cx: 200, cy: 306 + i * 18, s: round(10 - i * 2.6), yaw: 30 + i * 20, pitch: 10, k: [1, 0.9, 1] }} edge={0.6} outline={1} shimmer={false} />
      ))}
      {/* pauldron shards */}
      {[-1, 1].map((m) => (
        <g key={m} transform={`translate(${200 + m * 112} 196)`}>
          <g className="sl-sway" style={{ transformOrigin: "0px 0px", animationDelay: `${m > 0 ? 1.4 : 0}s` }}>
            <Shard c={c} x={0} y={-8} s={15} roll={m * -34} />
            <Shard c={c} x={m * 14} y={34} s={9} roll={m * -60} />
          </g>
        </g>
      ))}
      {/* crown spike */}
      <g className="sl-sway" style={{ transformOrigin: `200px ${topY}px` }}>
        <Shard c={c} x={200} y={round(topY - 26)} s={12} roll={0} len={2.4} />
      </g>
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 200px" }}>
        <Poly c={c} S={ICOSA} view={view} edge={0.55} outline={1.8} />
        <Visor c={c} stage={st} pts={visor} h={18} iris={[196, round(vy + 3)]} eye={11} />
        <Spec x={168} y={150} rx={20} ry={5} rot={-34} o={0.24} />
        <Gem c={c} x={194} y={162} s={0.62} />
      </g>
      <Orbit c={c} grad={grad} o={o} at={at} len={54} th={14} front />
      {/* hard-light motes */}
      <g fill={p.belly} filter={c.u("glow")} className="sl-twinkle">
        {[
          [70, 120],
          [334, 128],
          [92, 300],
          [316, 292],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x},${y - 4} L${x + 4},${y} L${x},${y + 4} L${x - 4},${y} Z`} fill={i % 2 ? p.accent : p.belly} style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
      </g>
    </g>
  );
}

const evolved: Renderer = {
  floating: true,
  shadow: 90,
  halo: [200, 44, 32],
  render: evolvedArt,
};

/* ───────────────────────────── Ascended ───────────────────────────── */

/** Ascended: Slot Zero. A core around one unblinking eye inside nested cages, shard wings, crown, crossed orbits of bars. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const st = "asc";
  const grad = `url(#${c.id}${st}-sol)`;
  const [cx, cy] = [200, 204];
  const core: View = { cx, cy, s: 68, yaw: 26, pitch: 16, k: [1, 1.08, 1] };
  const o1: Ring = { cx, cy: cy + 4, R: 150, f: 0.26, tilt: -16 };
  const o2: Ring = { cx, cy: cy + 4, R: 132, f: 0.3, tilt: 20 };
  const at1 = [30, 90, 150, 250];
  const at2 = [60, 120, 290];
  // shard wings: two fanned arrays of floating facets
  const wing = (m: number) =>
    [0, 1, 2, 3].map((i) => {
      const a = m > 0 ? -40 + i * 26 : 220 - i * 26;
      const [x, y] = polar(cx, cy - 6, 112 + (i === 1 || i === 2 ? 14 : 0), a);
      return (
        <g key={`${m}${i}`} transform={`translate(${x} ${y})`}>
          <g className="sl-sway" style={{ transformOrigin: "0px 0px", animationDelay: `${round(i * 0.5 + (m > 0 ? 1 : 0))}s` }}>
            <Shard c={c} x={0} y={0} s={round(13 - Math.abs(i - 1.5) * 2)} roll={round(-(a + 90))} yaw={30 + i * 15} len={2.5} />
          </g>
        </g>
      );
    });
  return (
    <g>
      <SolDefs c={c} stage={st} />
      <circle cx={cx} cy={cy} r="172" fill={`url(#${c.id}${st}-core)`} className="sl-aura-pulse" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {/* outer cage: a great icosahedron of light, slowly turning */}
      <g className="sl-spin-slow" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <Cage c={c} S={ICOSA} view={{ cx, cy, s: 128, yaw: 8, pitch: 22 }} color={p.accent} w={1.2} />
      </g>
      <Orbit c={c} grad={grad} o={o1} at={at1} len={50} th={13} front={false} />
      <Orbit c={c} grad={grad} o={o2} at={at2} len={42} th={12} front={false} />
      {/* segmented tether */}
      <Tether c={c} x={cx} y1={290} y2={366} w={2.4} />
      {[0, 1, 2, 3].map((i) => (
        <Poly key={i} c={c} S={OCTA} view={{ cx, cy: 296 + i * 17, s: round(11 - i * 2.2), yaw: 20 + i * 25, pitch: 10 }} edge={0.6} outline={1} shimmer={false} />
      ))}
      {wing(-1)}
      {wing(1)}
      {/* crown: three spikes */}
      <g className="sl-sway" style={{ transformOrigin: `${cx}px 128px` }}>
        <Shard c={c} x={round(cx - 26)} y={112} s={9} roll={24} len={2.3} />
        <Shard c={c} x={round(cx + 26)} y={112} s={9} roll={-24} len={2.3} />
        <Shard c={c} x={cx} y={94} s={13} roll={0} len={2.7} />
      </g>
      {/* middle cage: a violet-green cube hugging the core */}
      <g opacity="0.75">
        <Cage c={c} S={CUBE} view={{ cx, cy, s: 96, yaw: 40, pitch: 24 }} color={p.belly} w={1.3} nodes={false} />
      </g>
      <g className="sl-sway-slow" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <Poly c={c} S={ICOSA} view={core} edge={0.6} outline={2} />
        <Lens c={c} stage={st} x={cx} y={round(cy + 6)} r={24} rings={3} />
        {/* eye frame: three glowing brackets */}
        <g stroke={p.accent} strokeWidth="2" fill="none" strokeLinecap="round" filter={u("glow")} className="sl-rune-pulse">
          {[-90, 30, 150].map((a) => {
            const [x1, y1] = polar(cx, cy + 6, 37, a - 22);
            const [x2, y2] = polar(cx, cy + 6, 37, a + 22);
            return <path key={a} d={`M${x1},${y1} A37,37 0 0 1 ${x2},${y2}`} />;
          })}
        </g>
        <Spec x={176} y={164} rx={16} ry={4.5} rot={-36} o={0.26} />
      </g>
      <Gem c={c} x={cx} y={136} s={0.6} />
      <Orbit c={c} grad={grad} o={o2} at={at2} len={42} th={12} front />
      <Orbit c={c} grad={grad} o={o1} at={at1} len={50} th={13} front line={0.7} />
      {/* drifting glyph motes */}
      <g className="sl-twinkle" filter={u("glow")}>
        {[
          [44, 96],
          [356, 92],
          [30, 300],
          [372, 286],
          [120, 44],
          [282, 40],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x},${y - 5} L${x + 3},${y} L${x},${y + 5} L${x - 3},${y} Z`} fill={i % 2 ? p.accent : p.belly} style={{ animationDelay: `${i * 0.45}s` }} />
        ))}
      </g>
    </g>
  );
}

export const genesis: Renderer = {
  ...evolved,
  halo: [200, 44, 32],
  stageFit: [1.2, 1.06, 1, 0.94],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
