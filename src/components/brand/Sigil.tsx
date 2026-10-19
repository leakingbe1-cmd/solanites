import { useId } from "react";

/**
 * The Solanites sigil, "The Ascending Egg" (docs/design/creative-direction.md §5.1):
 * the Phoenix emerging from the egg, under the hero Phoenix's halo, inside the celestial
 * ring of twelve watches. One metal (gilt); the Solgem is the only colour.
 *
 * Variants: `full` (ring, ticks, halo, wings, egg, gem, tail; 48px and up), `emblem`
 * (no ring; 24px and up: nav, hero mark), `glyph` (egg and gem; 12px and up). `draw`
 * traces the mark in once (CSS); still under reduced motion. `chain` gives the gem the
 * Solana gradient for on-chain contexts; otherwise it is ember.
 */

type Variant = "full" | "emblem" | "glyph";

// Feathers: four per side rising from the egg's shoulders, plus a three-feather tail.
const WINGS = [
  "M47.00 52.00 C33.94 44.48 26.45 28.43 25.00 20.00 Q36.96 35.34 47.00 52.00Z",
  "M45.00 57.00 C30.44 52.59 18.77 38.78 15.00 31.00 Q30.73 43.16 45.00 57.00Z",
  "M44.00 62.00 C29.45 61.07 15.04 51.16 9.50 45.00 Q27.20 52.60 44.00 62.00Z",
  "M43.50 67.00 C30.71 68.67 16.11 63.06 10.00 59.00 Q26.94 62.19 43.50 67.00Z",
  "M73.00 52.00 C86.06 44.48 93.55 28.43 95.00 20.00 Q83.04 35.34 73.00 52.00Z",
  "M75.00 57.00 C89.56 52.59 101.23 38.78 105.00 31.00 Q89.27 43.16 75.00 57.00Z",
  "M76.00 62.00 C90.55 61.07 104.96 51.16 110.50 45.00 Q92.80 52.60 76.00 62.00Z",
  "M76.50 67.00 C89.29 68.67 103.89 63.06 110.00 59.00 Q93.06 62.19 76.50 67.00Z",
];
const TAIL = [
  "M60.00 91.00 C57.60 95.90 59.04 102.20 60.00 105.00 Q60.43 98.00 60.00 91.00Z",
  "M56.00 89.50 C55.47 94.51 51.50 99.09 49.50 101.00 Q52.44 95.07 56.00 89.50Z",
  "M64.00 89.50 C64.53 94.51 68.50 99.09 70.50 101.00 Q67.56 95.07 64.00 89.50Z",
];
const EGG = "M60,34 C71,34 78,52 78,68 C78,82 70,92 60,92 C50,92 42,82 42,68 C42,52 49,34 60,34Z";
const VIEWBOX: Record<Variant, string> = { full: "0 0 120 120", emblem: "4 14 112 96", glyph: "29 31 62 64" };

export function Sigil({
  variant = "full",
  className = "h-16 w-16",
  draw = false,
  chain = false,
  title,
}: {
  variant?: Variant;
  className?: string;
  draw?: boolean;
  chain?: boolean;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const gilt = `url(#${id}-g)`;
  const gem = `url(#${id}-gem)`;
  return (
    <svg
      viewBox={VIEWBOX[variant]}
      className={`sl-sigil ${draw ? "is-drawing" : ""} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        {/* user-space gradients, so straight strokes and the ticks still paint */}
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="112">
          <stop offset="0" stopColor="#fff1c9" />
          <stop offset="0.45" stopColor="#e8b75c" />
          <stop offset="1" stopColor="#a8692a" />
        </linearGradient>
        <linearGradient id={`${id}-gem`} x1="0" y1="0" x2="0" y2="1">
          {chain ? (
            <>
              <stop offset="0" stopColor="#9945ff" />
              <stop offset="0.55" stopColor="#00c2ff" />
              <stop offset="1" stopColor="#14f195" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#fff1c9" />
              <stop offset="0.5" stopColor="#f08a3c" />
              <stop offset="1" stopColor="#9a2f1e" />
            </>
          )}
        </linearGradient>
      </defs>

      {variant === "full" && (
        <g fill="none" stroke={gilt} strokeLinecap="round">
          <circle className="sl-sigil-ring" cx="60" cy="60" r="55" strokeWidth="1" opacity="0.85" pathLength={1} />
          <g className="sl-sigil-ticks" opacity="0.9">
            {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
              <line key={a} x1="60" y1="5" x2="60" y2={a % 90 === 0 ? 11 : 8.5} strokeWidth={a % 90 === 0 ? 1.4 : 0.9} transform={`rotate(${a} 60 60)`} />
            ))}
          </g>
        </g>
      )}

      {variant !== "glyph" && (
        <>
          <g className="sl-sigil-wings" fill={gilt}>
            {WINGS.map((d, i) => (
              <path key={d} d={d} style={draw ? { animationDelay: `${0.7 + (i % 4) * 0.1}s` } : undefined} />
            ))}
            {TAIL.map((d) => (
              <path key={d} d={d} style={draw ? { animationDelay: "1.1s" } : undefined} />
            ))}
          </g>
          <ellipse className="sl-sigil-halo" cx="60" cy="25" rx="10.5" ry="2.8" fill="none" stroke={gilt} strokeWidth={variant === "emblem" ? 2 : 1.5} pathLength={1} />
        </>
      )}

      <path className="sl-sigil-egg" d={EGG} fill="#07060a" stroke={gilt} strokeWidth={variant === "glyph" ? 4 : variant === "emblem" ? 2.4 : 1.8} pathLength={1} />
      <path className="sl-sigil-gem" d={variant === "glyph" ? "M60,52 L68,66.5 L60,81 L52,66.5Z" : "M60,57 L65.5,66.5 L60,77 L54.5,66.5Z"} fill={gem} />
    </svg>
  );
}
