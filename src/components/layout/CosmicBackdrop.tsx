/**
 * The site-wide cosmic backdrop: a faint warm light from above (the Phoenix), eclipse
 * violet and a trace of teal nebula, two depths of slowly drifting stars, one slow
 * glint, and a vignette. No embers here: embers only rise from a fire source.
 *
 * Rendered once in the root layout, fixed behind every page, so it never remounts
 * or restarts when the visitor navigates. CSS only (transform and opacity), no
 * script; still under reduced motion. Pages paint their own content above it.
 */

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
      <div className="sl-cosmos-vignette absolute inset-0" />
    </div>
  );
}
