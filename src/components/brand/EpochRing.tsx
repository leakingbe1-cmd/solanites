/**
 * The Solanites Epoch Ring: the glyph that replaces any third-party chain mark on
 * creatures and on-chain details. Three epoch arcs around a small Solgem.
 *
 * Canonical geometry: Creature Studio's mark B (docs/creature-studio/glyph/
 * mark-b-epoch-ring.svg), selected in review on 2026-10-19 and adopted by
 * docs/canon/solanites-art-canon.md. Single colour, stroke-based, legible from 16 px.
 */
const ARCS = ["M36.34 7.38 A25 25 0 0 1 55.49 40.55", "M51.15 48.07 A25 25 0 0 1 12.85 48.07", "M8.51 40.55 A25 25 0 0 1 27.66 7.38"];

export function EpochRing({ className = "h-6 w-6", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {ARCS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d="M32 22 L40 32 L32 42 L24 32 Z" fill="currentColor" />
    </svg>
  );
}
