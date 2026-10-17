/**
 * Small geometry helpers for organic creature shapes.
 * Output is rounded and deterministic so server and client renders match.
 */

export type P = [number, number];

const f = (n: number) => Math.round(n * 10) / 10;

/** Round to 0.1 so trig results match exactly between server and browser. */
export const r = f;

/** Uniform Catmull-Rom spline through `points`, sampled ~`samples` times. */
export function spline(points: P[], samples = 72): P[] {
  const out: P[] = [];
  const n = points.length;
  const steps = Math.max(2, Math.ceil(samples / (n - 1)));
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (k: 0 | 1) =>
        0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      out.push([c(0), c(1)]);
    }
  }
  out.push(points[n - 1]);
  return out;
}

function normals(c: P[]): P[] {
  return c.map((_, i) => {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(c.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  });
}

const toPath = (pts: P[]) => "M" + pts.map((p) => `${f(p[0])},${f(p[1])}`).join(" L") + " Z";

/** Closed outline of a tapering body that follows a centerline. */
export function tube(points: P[], width: (t: number) => number, samples = 80): string {
  const c = spline(points, samples);
  const nm = normals(c);
  const left: P[] = [];
  const right: P[] = [];
  c.forEach((p, i) => {
    const w = width(i / (c.length - 1)) / 2;
    left.push([p[0] + nm[i][0] * w, p[1] + nm[i][1] * w]);
    right.push([p[0] - nm[i][0] * w, p[1] - nm[i][1] * w]);
  });
  return toPath([...left, ...right.reverse()]);
}

/** A fin/frill growing off one side of a tube between t0 and t1. */
export function fin(points: P[], width: (t: number) => number, side: 1 | -1, t0: number, t1: number, height: (u: number) => number, samples = 80): string {
  const c = spline(points, samples);
  const nm = normals(c);
  const base: P[] = [];
  const outer: P[] = [];
  const i0 = Math.round(t0 * (c.length - 1));
  const i1 = Math.round(t1 * (c.length - 1));
  for (let i = i0; i <= i1; i++) {
    const u = (i - i0) / Math.max(1, i1 - i0);
    const w = (width(i / (c.length - 1)) / 2) * 0.85;
    const h = w + height(u);
    base.push([c[i][0] + nm[i][0] * w * side, c[i][1] + nm[i][1] * w * side]);
    outer.push([c[i][0] + nm[i][0] * h * side, c[i][1] + nm[i][1] * h * side]);
  }
  return toPath([...base, ...outer.reverse()]);
}

/** Point + tangent angle (degrees) at parameter t along the spline. */
export function along(points: P[], t: number, side = 0, width?: (t: number) => number, samples = 80): { x: number; y: number; angle: number } {
  const c = spline(points, samples);
  const nm = normals(c);
  const i = Math.max(0, Math.min(c.length - 1, Math.round(t * (c.length - 1))));
  const a = c[Math.max(0, i - 1)];
  const b = c[Math.min(c.length - 1, i + 1)];
  const off = side && width ? (width(t) / 2) * side : 0;
  return {
    x: f(c[i][0] + nm[i][0] * off),
    y: f(c[i][1] + nm[i][1] * off),
    angle: f((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI),
  };
}

/** Open polyline path along a spline (for spines, seams, ventral lines). */
export function line(points: P[], samples = 60): string {
  return "M" + spline(points, samples).map((p) => `${f(p[0])},${f(p[1])}`).join(" L");
}

export function polar(cx: number, cy: number, r: number, deg: number): P {
  const a = (deg * Math.PI) / 180;
  return [f(cx + Math.cos(a) * r), f(cy + Math.sin(a) * r)];
}
