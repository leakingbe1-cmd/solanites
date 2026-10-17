import type { Palette, Species } from "@/lib/species";

/**
 * Shared rendering kit so every species is lit and finished the same way:
 * key light from the upper left, a cool rim light from the right, fine
 * surface grain, and small intense eyes rather than cartoon ones.
 */

export interface ArtCtx {
  id: string;
  p: Palette;
  evo: number;
  species: Species;
}

export const u = (ctx: ArtCtx, name: string) => `url(#${ctx.id}-${name})`;

export function KitDefs({ id, p }: { id: string; p: Palette }) {
  return (
    <defs>
      <radialGradient id={`${id}-hide`} cx="0.3" cy="0.22" r="0.95">
        <stop offset="0" stopColor={p.bodyLight} />
        <stop offset="0.42" stopColor={p.body} />
        <stop offset="1" stopColor={p.bodyDark} />
      </radialGradient>
      <linearGradient id={`${id}-hideV`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.bodyLight} />
        <stop offset="0.38" stopColor={p.body} />
        <stop offset="1" stopColor={p.bodyDark} />
      </linearGradient>
      <linearGradient id={`${id}-belly`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.belly} />
        <stop offset="1" stopColor={p.bodyDark} stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={p.horn} />
        <stop offset="0.28" stopColor={p.wing} />
        <stop offset="0.5" stopColor={p.horn} />
        <stop offset="0.74" stopColor={p.bodyDark} />
        <stop offset="1" stopColor={p.wing} />
      </linearGradient>
      <linearGradient id={`${id}-metalV`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.horn} />
        <stop offset="0.55" stopColor={p.wing} />
        <stop offset="1" stopColor={p.bodyDark} />
      </linearGradient>
      <linearGradient id={`${id}-membrane`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={p.wingEdge} stopOpacity="0.7" />
        <stop offset="0.5" stopColor={p.wing} stopOpacity="0.85" />
        <stop offset="1" stopColor={p.bodyDark} stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id={`${id}-veil`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.wingEdge} stopOpacity="0.55" />
        <stop offset="1" stopColor={p.wing} stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0" stopColor={p.accent} stopOpacity="0" />
        <stop offset="0.55" stopColor={p.accent} stopOpacity="0" />
        <stop offset="1" stopColor={p.accent} stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id={`${id}-key`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.25" stopColor={p.accent} />
        <stop offset="1" stopColor={p.accent} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-eye`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.45" stopColor={p.eye} />
        <stop offset="1" stopColor={p.eye} stopOpacity="0" />
      </radialGradient>
      <pattern id={`${id}-stars`} width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="9" r="0.9" fill="#fff" />
        <circle cx="34" cy="5" r="0.5" fill="#fff" opacity="0.7" />
        <circle cx="25" cy="27" r="1.2" fill="#dfe4ff" />
        <circle cx="49" cy="36" r="0.6" fill="#fff" />
        <circle cx="13" cy="46" r="0.8" fill="#e6dcff" opacity="0.8" />
        <circle cx="44" cy="54" r="0.4" fill="#fff" />
      </pattern>
      <pattern id={`${id}-scales`} width="10" height="8" patternUnits="userSpaceOnUse">
        <path d="M0,8 Q5,2 10,8" fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="0.8" />
      </pattern>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feComponentTransfer in="g" result="gm">
          <feFuncR type="linear" slope="0.32" intercept="0.76" />
          <feFuncG type="linear" slope="0.32" intercept="0.76" />
          <feFuncB type="linear" slope="0.32" intercept="0.76" />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="gm" mode="multiply" result="b" />
        <feComposite in="b" in2="SourceGraphic" operator="in" />
      </filter>
      <filter id={`${id}-bloom`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id={`${id}-haze`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="18" />
      </filter>
    </defs>
  );
}

/** A filled shape with consistent key light, rim light and edge. */
export function Lit({ ctx, d, fill, rim = true, edge = 0.55, keyLight = true }: { ctx: ArtCtx; d: string; fill: string; rim?: boolean; edge?: number; keyLight?: boolean }) {
  return (
    <g>
      <path d={d} fill={fill} stroke={ctx.p.bodyDark} strokeOpacity={edge} strokeWidth="1" strokeLinejoin="round" />
      {keyLight && <path d={d} fill={u(ctx, "key")} />}
      {rim && <path d={d} fill="none" stroke={u(ctx, "rim")} strokeWidth="1.6" strokeLinejoin="round" />}
    </g>
  );
}

/** Small, intense eye: dark socket, lit iris, pinpoint highlight. */
export function Eye({ ctx, x, y, r = 4, slit = true, angle = 0 }: { ctx: ArtCtx; x: number; y: number; r?: number; slit?: boolean; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* blink lives on an inner group so it never overrides the placement transform */}
      <g className="sl-eye" style={{ transformOrigin: "0px 0px" }}>
        <ellipse rx={r * 1.9} ry={r * 1.1} fill="#05040a" opacity="0.85" />
        <ellipse rx={r * 3} ry={r * 2.2} fill={u(ctx, "eye")} opacity="0.35" />
        <ellipse rx={r * 1.25} ry={r * 0.8} fill={ctx.p.eye} />
        {slit && <ellipse rx={r * 0.22} ry={r * 0.75} fill="#05040a" />}
        <circle cx={r * 0.45} cy={-r * 0.3} r={r * 0.28} fill="#fff" />
      </g>
    </g>
  );
}

/**
 * Faceted crystal: three planes (lit, mid, shadow) plus a hard highlight edge.
 * Drawn pointing up from its base, then rotated.
 */
export function Shard({ x, y, len, w, angle, light, mid, dark, glow }: { x: number; y: number; len: number; w: number; angle: number; light: string; mid: string; dark: string; glow?: string }) {
  const h = len;
  const tip = -h;
  const shoulder = -h * 0.72;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M${-w / 2},0 L${-w / 2},${shoulder} L0,${tip} L0,0 Z`} fill={light} />
      <path d={`M0,0 L0,${tip} L${w / 2},${shoulder} L${w / 2},0 Z`} fill={dark} />
      <path d={`M${-w * 0.18},${-h * 0.1} L${-w * 0.18},${shoulder * 0.98} L0,${tip} L${w * 0.12},${shoulder} L${w * 0.12},${-h * 0.1} Z`} fill={mid} opacity="0.75" />
      <path d={`M0,${-h * 0.05} L0,${tip}`} stroke="#fff" strokeOpacity="0.75" strokeWidth="0.8" />
      {glow && <path d={`M0,${-h * 0.3} L0,${tip * 0.85}`} stroke={glow} strokeWidth="2.2" strokeOpacity="0.55" strokeLinecap="round" />}
    </g>
  );
}

/** Curved claw / talon. */
export function Talon({ x, y, size = 1, angle = 0, fill }: { x: number; y: number; size?: number; angle?: number; fill: string }) {
  return <path d="M0,0 C2,5 1,10 -4,13 C-1,9 -2,5 -4,1 Z" transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`} fill={fill} />;
}
