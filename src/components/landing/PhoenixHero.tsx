/**
 * The homepage hero's artwork: the realistic Runway phoenix (the same creature as
 * the intro video), full bleed behind the hero copy. Wide screens place it right of
 * centre with the copy over its darkened left wing; phones show its head and body
 * above the copy. Motion is CSS only (transform and opacity): a slow breath, a
 * pulsing fire glow at its heart, and embers rising past it. All of it stops under
 * reduced motion and while the hero is off screen.
 */

// Deterministic embers: [left %, size px, duration s, delay s, drift px].
const EMBERS: [number, number, number, number, number][] = [
  [8, 3, 9, 0, 30], [17, 2, 11, 3.5, -20], [26, 4, 8, 1.2, 25], [34, 2, 12, 6, -35], [41, 3, 9.5, 2.4, 18],
  [47, 2, 10, 7.5, -15], [53, 4, 8.5, 0.6, 30], [58, 2, 11.5, 4.8, -25], [63, 3, 9, 3, 20], [68, 2, 12.5, 8.2, -18],
  [73, 4, 8, 5.4, 28], [79, 2, 10.5, 1.8, -30], [85, 3, 9.5, 6.6, 22], [92, 2, 11, 2.9, -16],
];

export function PhoenixHero() {
  return (
    <div className="sl-phx pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="sl-phx-art">
        <div className="sl-phx-breathe h-full w-full">
          <picture>
            <source type="image/webp" srcSet="/hero/phoenix-1200.webp 1200w, /hero/phoenix-2000.webp 2000w" sizes="(min-width: 1024px) 130vw, 230vw" />
            <img src="/hero/phoenix-2000.jpg" alt="" width={2000} height={1116} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
          </picture>
        </div>
        <div className="sl-phx-glow" />
      </div>
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
