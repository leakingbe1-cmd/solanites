import { useId } from "react";

/**
 * The Solanites sigil: the official mark (egg, Solgem and wing strokes) at the centre
 * of a celestial ring of twelve marks with an eclipse orbit, crowned by phoenix
 * feathers and a flame crest. Violet and cyan for the egg, restrained gold for the rest.
 *
 * One SVG at every size: small emblems, the hero, the Hatchery platform, end cards.
 * `draw` traces it in once (CSS) and is still under reduced motion.
 */

type Pt = [number, number];

/** A tapered feather blade from `base` to `tip`, bowed to one side. */
function blade(base: Pt, tip: Pt, width: number): string {
  const [bx, by] = base;
  const [tx, ty] = tip;
  const len = Math.hypot(tx - bx, ty - by);
  const nx = -(ty - by) / len;
  const ny = (tx - bx) / len;
  const mx = (bx + tx) / 2;
  const my = (by + ty) / 2;
  const f = (n: number) => n.toFixed(2);
  return `M${f(bx)} ${f(by)} Q${f(mx + nx * width)} ${f(my + ny * width)} ${f(tx)} ${f(ty)} Q${f(mx - nx * width * 0.35)} ${f(my - ny * width * 0.35)} ${f(bx)} ${f(by)}Z`;
}

const mirror = ([x, y]: Pt): Pt => [120 - x, y];
// Left wing: three primaries sweeping up and out from the egg's shoulder.
const WING: [Pt, Pt, number][] = [
  [[44, 58], [21, 24], 4.2],
  [[42, 64], [13, 40], 4],
  [[42, 70], [12, 58], 3.4],
];
const CREST: [Pt, Pt, number][] = [
  [[60, 33], [60, 19], 2.6],
  [[56, 34], [50, 24], 2],
  [[64, 34], [70, 24], -2],
];

export function Sigil({ className = "h-16 w-16", draw = false, title }: { className?: string; draw?: boolean; title?: string }) {
  const id = useId().replace(/:/g, "");
  const gold = `url(#${id}-gold)`;
  const egg = `url(#${id}-egg)`;
  return (
    <svg viewBox="0 0 120 120" className={`sl-sigil ${draw ? "is-drawing" : ""} ${className}`} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        {/* user-space gradients, so straight vertical strokes still paint */}
        <linearGradient id={`${id}-gold`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="120">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="0.45" stopColor="#f2c063" />
          <stop offset="1" stopColor="#b97a22" />
        </linearGradient>
        {/* in the egg group's own (scaled) coordinates */}
        <linearGradient id={`${id}-egg`} gradientUnits="userSpaceOnUse" x1="6" y1="4" x2="34" y2="38">
          <stop offset="0" stopColor="#9945ff" />
          <stop offset="0.6" stopColor="#00c2ff" />
          <stop offset="1" stopColor="#14f195" />
        </linearGradient>
      </defs>

      {/* celestial ring: twelve marks, the four cardinal ones longer */}
      <circle className="sl-sigil-ring" cx="60" cy="60" r="56" fill="none" stroke={gold} strokeWidth="0.9" opacity="0.8" pathLength={1} />
      <g className="sl-sigil-ticks" stroke={gold} strokeLinecap="round" opacity="0.85">
        {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
          <line key={a} x1="60" y1={a % 90 === 0 ? 1.5 : 3.5} x2="60" y2="8" strokeWidth={a % 90 === 0 ? 1.3 : 0.8} transform={`rotate(${a} 60 60)`} />
        ))}
      </g>
      {/* the eclipse: an inner orbit with one bright arc of corona, low on the left */}
      <circle className="sl-sigil-orbit" cx="60" cy="60" r="47" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.35" />
      <path className="sl-sigil-eclipse" d="M 36.5 100.7 A 47 47 0 0 1 15.8 76.1" fill="none" stroke={gold} strokeWidth="1.8" strokeLinecap="round" pathLength={1} />

      {/* phoenix primaries and flame crest */}
      <g className="sl-sigil-wings" fill={gold}>
        {WING.map(([b, t, w], i) => (
          <path key={`l${i}`} d={blade(b, t, w)} style={{ animationDelay: `${0.7 + i * 0.12}s` }} />
        ))}
        {WING.map(([b, t, w], i) => (
          <path key={`r${i}`} d={blade(mirror(b), mirror(t), -w)} style={{ animationDelay: `${0.7 + i * 0.12}s` }} />
        ))}
      </g>
      <g className="sl-sigil-crest" fill={gold}>
        {CREST.map(([b, t, w], i) => (
          <path key={i} d={blade(b, t, w)} style={{ animationDelay: `${1.05 + i * 0.08}s` }} />
        ))}
      </g>

      {/* the official mark: egg, Solgem, wing strokes (LogoMark geometry, centred) */}
      <g transform="translate(32 33.3) scale(1.4)">
        <path className="sl-sigil-egg" d="M20,3 C29,3 35,16 35,25 C35,33 28.5,38 20,38 C11.5,38 5,33 5,25 C5,16 11,3 20,3 Z" fill="#05050a" fillOpacity="0.6" stroke={egg} strokeWidth="1.6" pathLength={1} />
        <path className="sl-sigil-gem" d="M20,14 L25,21 L20,29 L15,21 Z" fill={egg} />
        <path d="M9,24 L14,22 L16,26 M31,24 L26,22 L24,26" fill="none" stroke={egg} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
