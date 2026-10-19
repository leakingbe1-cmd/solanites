/**
 * The homepage hero's artwork and its awakening: the realistic Phoenix (2000 × 1116
 * still, the only raster here) full bleed behind the copy. Wide screens place it right
 * of centre with the copy over its darkened left wing; phones show its head and body
 * above the copy.
 *
 * The awakening plays once, about three seconds, and never blocks the page: darkness
 * opens outwards from the Phoenix's heart, a golden pulse ignites, a violet current
 * passes through, the eclipse ring (the sigil's celestial ring) traces itself around
 * its head, then embers rise. CSS and SVG only (transform, opacity, stroke-dashoffset);
 * the final frame is the resting state, and reduced motion shows it at once.
 */

// Deterministic embers: [left %, size px, duration s, delay s, drift px].
const EMBERS: [number, number, number, number, number][] = [
  [8, 3, 9, 2.2, 30], [17, 2, 11, 5.5, -20], [26, 4, 8, 3.2, 25], [34, 2, 12, 8, -35], [41, 3, 9.5, 4.4, 18],
  [47, 2, 10, 9.5, -15], [53, 4, 8.5, 2.6, 30], [58, 2, 11.5, 6.8, -25], [63, 3, 9, 5, 20], [68, 2, 12.5, 10.2, -18],
  [73, 4, 8, 7.4, 28], [79, 2, 10.5, 3.8, -30], [85, 3, 9.5, 8.6, 22], [92, 2, 11, 4.9, -16],
];

export function PhoenixHero() {
  return (
    <div className="sl-phx pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* without JavaScript nothing marks the hero awake: show the Phoenix as it rests */}
      <noscript dangerouslySetInnerHTML={{ __html: "<style>.sl-phx-art{opacity:1!important}</style>" }} />
      <div className="sl-phx-art">
        <div className="sl-phx-breathe h-full w-full">
          <picture>
            <source type="image/webp" srcSet="/hero/phoenix-2000.webp" />
            <img src="/hero/phoenix-2000.jpg" alt="" width={2000} height={1116} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
          </picture>
        </div>
        {/* awakening light, positioned on the Phoenix itself */}
        <div className="sl-phx-pulse" />
        <div className="sl-phx-glow" />
        <svg className="sl-phx-eclipse" viewBox="0 0 200 200">
          <circle className="sl-phx-eclipse-ring" cx="100" cy="100" r="96" pathLength={1} />
          <g className="sl-phx-eclipse-ticks">
            {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
              <line key={a} x1="100" y1={a % 90 === 0 ? 0 : 2} x2="100" y2="9" transform={`rotate(${a} 100 100)`} />
            ))}
          </g>
        </svg>
        <div className="sl-phx-dawn" />
      </div>
      <div className="sl-phx-current" />
      {/* legibility: darken where the copy sits, and fade into the page below */}
      <div className="sl-phx-shade absolute inset-0" />
      <div className="sl-phx-embers absolute inset-0">
        {EMBERS.map(([left, size, dur, delay, drift], i) => (
          <span
            key={i}
            style={{ left: `${left}%`, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `${delay}s`, ["--drift" as string]: `${drift}px` }}
          />
        ))}
      </div>
    </div>
  );
}
