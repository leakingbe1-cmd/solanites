"use client";

import { useId, type CSSProperties } from "react";
import { sceneAssets, stageIdle, type PartRig } from "@/lib/creatureScenes";

/**
 * A species' idle movement over its own painted artwork (see src/lib/creatureScenes.ts).
 *
 * The body moves as one piece on two nested layers with unrelated periods. At the larger
 * sizes a part (a tail, tendrils, a lure…) may move on its own: it is cut from the same
 * image by a polygon and turned about a hinge on the body, while the body layer leaves a
 * matching hole, so nothing is duplicated and the join stays closed. Glow maps pulse only
 * the creature's own anatomical light.
 */
export function IdleArt({ speciesId, stage, src, srcSet, sizes, full }: { speciesId: string; stage: number; src: string; srcSet?: string; sizes: string; full: boolean }) {
  const idle = stageIdle(speciesId, stage);
  const assets = sceneAssets(speciesId);
  const parts = full ? (idle.parts ?? []) : [];
  const glow = full && idle.glow ? (assets?.glow[stage] ?? null) : null;
  // a stable per-instance offset so a grid of the same species never moves in step
  const delay = -((hash(useId() + speciesId + stage) % 1000) / 1000) * idle.period * 2.37;
  const style = { "--a": full ? idle.amp : idle.amp * 0.8, "--p": `${idle.period}s`, "--dl": `${delay.toFixed(2)}s` } as CSSProperties;

  const img = (cls = "sl-creature-img") => (
    // eslint-disable-next-line @next/next/no-img-element -- pre-optimised static WebP with its own thumbnail
    <img src={src} srcSet={srcSet} sizes={sizes} alt="" loading="lazy" decoding="async" draggable={false} className={cls} />
  );
  const glowImg = glow ? (
    // eslint-disable-next-line @next/next/no-img-element -- derived glow map, same canvas as the art
    <img src={glow} alt="" loading="lazy" decoding="async" draggable={false} className="sl-idle-glow" />
  ) : null;

  return (
    <div className="sl-idle" data-body={idle.body} style={style}>
      <div className="sl-idle-b">
        <div className="sl-idle-a">
          <div className="sl-idle-seg" style={parts.length ? { clipPath: bodyClip(parts) } : undefined}>
            {img()}
            {glowImg}
          </div>
          {parts.map((p, i) => (
            <div key={i} className="sl-idle-seg" data-part={p.part} data-motion={p.motion} style={partStyle(p)}>
              {img("sl-creature-img sl-idle-part")}
              {glowImg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const pct = (n: number) => `${+n.toFixed(2)}%`;
const pts = (poly: number[]) => poly.reduce<string[]>((out, v, i) => (i % 2 ? out : [...out, `${pct(v)} ${pct(poly[i + 1])}`]), []);

/** The body: the whole canvas less each part's region (even-odd, joined by zero-width slits). */
export function bodyClip(parts: PartRig[]): string {
  const outer = ["0% 0%", "100% 0%", "100% 100%", "0% 100%", "0% 0%"];
  const holes = parts.flatMap((p) => {
    const ring = pts(p.poly);
    return [...ring, ring[0], "0% 0%"];
  });
  return `polygon(evenodd, ${[...outer, ...holes].join(", ")})`;
}

/** A part: its region grown by a hair, so it overlaps the body across the cut, turning about the hinge. */
export function partStyle(p: PartRig): CSSProperties {
  return {
    clipPath: `polygon(${pts(dilate(p.poly, 0.3)).join(", ")})`,
    transformOrigin: `${pct(p.hinge[0])} ${pct(p.hinge[1])}`,
    "--r": p.deg,
    "--pp": `${p.period}s`,
  } as CSSProperties;
}

/** Offsets a polygon outward by `by` (in %): each vertex moves along its outward corner normal. */
export function dilate(poly: number[], by: number): number[] {
  const n = poly.length / 2;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += poly[2 * i] * poly[2 * j + 1] - poly[2 * j] * poly[2 * i + 1];
  }
  const sign = area > 0 ? 1 : -1; // outward normal side depends on winding
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const [px, py] = [poly[2 * ((i + n - 1) % n)], poly[2 * ((i + n - 1) % n) + 1]];
    const [cx, cy] = [poly[2 * i], poly[2 * i + 1]];
    const [nx, ny] = [poly[2 * ((i + 1) % n)], poly[2 * ((i + 1) % n) + 1]];
    const e1 = norm(cy - py, -(cx - px));
    const e2 = norm(ny - cy, -(nx - cx));
    const m = norm(e1[0] + e2[0], e1[1] + e2[1]);
    out.push(cx + sign * m[0] * by, cy + sign * m[1] * by);
  }
  return out;
}

function norm(x: number, y: number): [number, number] {
  const d = Math.hypot(x, y) || 1;
  return [x / d, y / d];
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
