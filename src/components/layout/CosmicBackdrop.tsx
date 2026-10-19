/**
 * The site-wide cosmic backdrop: layered purple and cyan nebulae, two depths of
 * slowly drifting stars, a few twinkling glints, gold embers and a vignette.
 *
 * Rendered once in the root layout, fixed behind every page, so it never remounts
 * or restarts when the visitor navigates. CSS only (transform and opacity), no
 * script; still under reduced motion. Pages paint their own content above it.
 */

// Deterministic gold embers: [left %, size px, duration s, delay s, drift px].
const EMBERS: [number, number, number, number, number][] = [
  [6, 2, 26, 0, 40], [19, 3, 31, 9, -30], [34, 2, 24, 4, 25], [51, 2, 29, 15, -20],
  [63, 3, 27, 2, 35], [78, 2, 33, 11, -35], [90, 2, 25, 6, 20],
];

export function CosmicBackdrop() {
  return (
    <div className="sl-cosmos pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="sl-cosmos-nebula absolute inset-0" />
      {/* per-area light, cross-faded by RealmLight (html[data-realm]) */}
      <div className="sl-realm sl-realm-gold absolute inset-0" />
      <div className="sl-realm sl-realm-cyan absolute inset-0" />
      <div className="sl-realm sl-realm-violet absolute inset-0" />
      <div className="sl-cosmos-stars sl-cosmos-stars-far" />
      <div className="sl-cosmos-stars sl-cosmos-stars-near" />
      <div className="sl-cosmos-glints absolute inset-0" />
      <div className="sl-cosmos-embers absolute inset-0">
        {EMBERS.map(([left, size, dur, delay, drift], i) => (
          <span key={i} style={{ left: `${left}%`, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `${delay}s`, ["--drift" as string]: `${drift}px` }} />
        ))}
      </div>
      <div className="sl-cosmos-vignette absolute inset-0" />
    </div>
  );
}
