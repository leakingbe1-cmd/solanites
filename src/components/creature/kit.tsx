import type { ReactNode } from "react";
import type { Palette, Species } from "@/lib/species";

/**
 * Shared rendering kit for every Solanite.
 *
 * Species draw their own anatomy, but take materials, eyes, the Solgem and
 * highlights from here so lighting and finish stay consistent.
 */

export interface Ctx {
  id: string;
  p: Palette;
  species: Species;
  /** Evolution stage 0..3. */
  evo: number;
  /** Growth factor for evolving anatomy (0.55 hatchling … 1.12 apex). */
  g: number;
  /** Marking/ornament opacity by stage. */
  mark: number;
  /** `url(#…)` for a shared gradient/filter: body, tube, belly, wing, feather, horn, fin, glass, shade, light, veil, veil2, gem, eye, stars, glow, blur8. */
  u(name: string): string;
}

export interface Renderer {
  render(c: Ctx): ReactNode;
  /** Hovering/swimming species scale around their centre and cast a faint shadow. */
  floating?: boolean;
  /** Apex halo position [x, y, radius]. */
  halo?: [number, number, number];
  /** Extra scale so wide or tall body plans fit the frame. */
  fit?: number;
  /** Ground-shadow half width. */
  shadow?: number;
}

export const MIRROR = "translate(400 0) scale(-1 1)";

/** Pointed leaf/feather/petal along +x, length l, half-width w. */
export function blade(l: number, w: number, tip = 0.8) {
  l = round(l);
  w = round(w);
  return `M0,0 C${l * 0.3},${-w} ${l * tip},${-w * 0.8} ${l},0 C${l * tip},${w * 0.8} ${l * 0.3},${w} 0,0 Z`;
}

export const rad = (deg: number) => (deg * Math.PI) / 180;
/** Rounded so server and client render identical attribute strings. */
export const round = (n: number) => Math.round(n * 100) / 100;
export const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [round(cx + Math.cos(rad(deg)) * r), round(cy + Math.sin(rad(deg)) * r)];

/** Standard soft rim used on every primary form. */
export function rim(c: Ctx, width = 1.4) {
  return { stroke: c.p.bodyDark, strokeOpacity: 0.55, strokeWidth: width };
}

/** Key-light specular highlight. */
export function Spec({ x, y, rx, ry, rot = -20, o = 0.28 }: { x: number; y: number; rx: number; ry: number; rot?: number; o?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" opacity={o} transform={`rotate(${rot} ${x} ${y})`} />;
}

export type EyeKind = "almond" | "round" | "slit" | "orb" | "compound" | "lidded";

/**
 * One eye built the same way everywhere: dark socket, gradient iris, pupil,
 * specular dot. `angle` tilts it; `flip` mirrors an almond eye.
 */
export function Eye({ c, x, y, r = 8, kind = "almond", angle = 0, flip = false }: { c: Ctx; x: number; y: number; r?: number; kind?: EyeKind; angle?: number; flip?: boolean }) {
  const glow = ["epic", "legendary", "mythic", "secret"].includes(c.species.rarity);
  const k = r / 8;
  const t = `translate(${x} ${y}) rotate(${angle}) scale(${flip ? -k : k} ${k})`;
  return (
    <g transform={t}>
      <g className="sl-eye">
        {kind === "almond" && (
          <>
            <path d="M-12,1 C-6,-8 8,-8 12,-1 C6,6 -6,7 -12,1 Z" fill="#07040f" />
            {glow && <ellipse cx="1" cy="-0.5" rx="10" ry="7" fill={c.p.eye} opacity="0.5" filter={c.u("glow")} />}
            <ellipse cx="1" cy="-0.5" rx="7" ry="6.4" fill={c.u("eye")} />
            <ellipse cx="1.5" cy="-0.5" rx="1.8" ry="5.4" fill="#07040f" />
            <circle cx="4" cy="-3.2" r="2" fill="#fff" />
          </>
        )}
        {kind === "lidded" && (
          <>
            <path d="M-11,0 C-6,-6 7,-6 11,0 C6,5 -6,5 -11,0 Z" fill="#07040f" />
            <ellipse cx="0" cy="0.5" rx="6.5" ry="4.6" fill={c.u("eye")} />
            <circle cx="0.5" cy="0.8" r="2.6" fill="#07040f" />
            <circle cx="2.8" cy="-1" r="1.4" fill="#fff" />
            <path d="M-12,-1 C-6,-7 7,-7 12,-1" fill="none" stroke={c.p.bodyDark} strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {kind === "round" && (
          <>
            <circle r="9.5" fill="#07040f" />
            {glow && <circle r="10" fill={c.p.eye} opacity="0.45" filter={c.u("glow")} />}
            <circle r="7.2" fill={c.u("eye")} />
            <circle cx="0.6" cy="0.6" r="3.6" fill="#07040f" />
            <circle cx="3" cy="-3" r="2.2" fill="#fff" />
            <circle cx="-2.6" cy="2.8" r="0.9" fill="#fff" opacity="0.7" />
          </>
        )}
        {kind === "slit" && (
          <>
            <path d="M-13,2 C-6,-6 8,-6 13,-3 C7,4 -6,6 -13,2 Z" fill="#07040f" />
            <path d="M-10,1.5 C-5,-3.5 7,-3.8 10,-2 C6,2.5 -5,3.8 -10,1.5 Z" fill={c.u("eye")} filter={glow ? c.u("glow") : undefined} />
            <circle cx="5" cy="-1.6" r="1.1" fill="#fff" />
          </>
        )}
        {kind === "orb" && (
          <>
            <circle r="7" fill={c.p.eye} opacity="0.55" filter={c.u("glow")} />
            <circle r="4.6" fill={c.u("eye")} />
            <circle cx="1.6" cy="-1.6" r="1.4" fill="#fff" />
          </>
        )}
        {kind === "compound" && (
          <>
            <ellipse rx="11" ry="12" fill="#07040f" />
            <ellipse rx="9.5" ry="10.5" fill={c.u("eye")} />
            {[-5, 0, 5].map((dx) => [-6, -1, 4].map((dy) => <circle key={`${dx}${dy}`} cx={dx + (dy % 2 ? 2.5 : 0)} cy={dy} r="2" fill="#07040f" opacity="0.28" />))}
            <ellipse cx="-3" cy="-5" rx="3" ry="2" fill="#fff" opacity="0.85" />
          </>
        )}
      </g>
    </g>
  );
}

/** The Solgem — every Solanite carries exactly one. */
export function Gem({ c, x, y, s = 1, angle = 0 }: { c: Ctx; x: number; y: number; s?: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
      <g filter={c.u("glow")} className="sl-gem">
        <path d="M0,-11 L8,0 L0,11 L-8,0 Z" fill={c.u("gem")} />
      </g>
      <path d="M0,-9 L4,-1 L0,0 Z" fill="#fff" opacity="0.85" />
    </g>
  );
}

/** A rounded tube along a path (serpent bodies, necks, tails) with the shared shading. */
export function Tube({ c, d, w, belly = false, fill }: { c: Ctx; d: string; w: number; belly?: boolean; fill?: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={c.p.bodyDark} strokeWidth={w + 5} />
      <path d={d} stroke={fill ?? c.p.body} strokeWidth={w} />
      {belly && <path d={d} stroke={c.p.belly} strokeOpacity="0.45" strokeWidth={w * 0.32} transform={`translate(0 ${w * 0.22})`} />}
      <path d={d} stroke={c.p.bodyLight} strokeOpacity="0.55" strokeWidth={w * 0.28} transform={`translate(${-w * 0.08} ${-w * 0.24})`} />
      <path d={d} stroke="#fff" strokeOpacity="0.25" strokeWidth={w * 0.08} transform={`translate(${-w * 0.1} ${-w * 0.3})`} />
    </g>
  );
}

/** Tiny glowing dots used for photophores, spots and constellations. */
export function Dots({ c, pts, r = 2, color, glow = true }: { c: Ctx; pts: [number, number][]; r?: number; color?: string; glow?: boolean }) {
  return (
    <g filter={glow ? c.u("glow") : undefined} className={glow ? "sl-twinkle" : undefined}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? r * 1.3 : r} fill={color ?? c.p.accent} style={{ animationDelay: `${i * 0.31}s` }} />
      ))}
    </g>
  );
}

/** Joined constellation used by the cosmic species. */
export function Constellation({ c, pts }: { c: Ctx; pts: [number, number][] }) {
  return (
    <g opacity={c.mark}>
      <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" />
      <Dots c={c} pts={pts} r={1.8} color="#fff" />
    </g>
  );
}
