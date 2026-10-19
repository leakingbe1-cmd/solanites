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

import heroAssets from "@/data/heroAssets.json";

type HeroSource = { src: string; w: number };
type HeroVariant = { width: number; height: number; sources: Record<"avif" | "webp" | "jpg", HeroSource[]> };
const ECLIPSE = heroAssets as { desktop?: HeroVariant; mobile?: HeroVariant };
const srcSet = (list: HeroSource[]) => list.map((s) => `${s.src} ${s.w}w`).join(", ");

/**
 * The approved Eclipse Phoenix (scripts/hero-art.mjs → src/data/heroAssets.json), or the
 * retired still while no master has been approved. Portrait screens get their own
 * composition, never a crop of the landscape one.
 */
function HeroPicture() {
  const d = ECLIPSE.desktop;
  if (!d) {
    return (
      <picture>
        <source type="image/webp" srcSet="/hero/phoenix-2000.webp" />
        <img src="/hero/phoenix-2000.jpg" alt="" width={2000} height={1116} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
      </picture>
    );
  }
  const m = ECLIPSE.mobile;
  const portrait = "(max-aspect-ratio: 4/5)";
  const fallback = d.sources.jpg.find((s) => s.w === 1920) ?? d.sources.jpg.at(-1)!;
  return (
    <picture>
      {m && <source media={portrait} type="image/avif" srcSet={srcSet(m.sources.avif)} sizes="100vw" />}
      {m && <source media={portrait} type="image/webp" srcSet={srcSet(m.sources.webp)} sizes="100vw" />}
      {m && <source media={portrait} srcSet={srcSet(m.sources.jpg)} sizes="100vw" />}
      <source type="image/avif" srcSet={srcSet(d.sources.avif)} sizes="100vw" />
      <source type="image/webp" srcSet={srcSet(d.sources.webp)} sizes="100vw" />
      <img src={fallback.src} srcSet={srcSet(d.sources.jpg)} sizes="100vw" alt="" width={d.width} height={d.height} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
    </picture>
  );
}

// Eight embers rising from the Phoenix's body only: [left %, size px, duration s, delay s, drift px].
const EMBERS: [number, number, number, number, number][] = [
  [46, 3, 9, 2.2, 20], [50, 2, 11, 5.5, -16], [54, 3, 8.5, 3.2, 18], [58, 2, 12, 7.6, -22],
  [62, 3, 9.5, 4.4, 14], [66, 2, 10, 9.2, -12], [70, 3, 8.8, 2.8, 20], [74, 2, 11.5, 6.4, -18],
];

export function PhoenixHero() {
  return (
    <div className="sl-phx pointer-events-none absolute inset-0 overflow-hidden" data-art={ECLIPSE.desktop ? "eclipse" : "still"} aria-hidden="true">
      {/* without JavaScript nothing marks the hero awake: show the Phoenix as it rests */}
      <noscript dangerouslySetInnerHTML={{ __html: "<style>.sl-phx-art{opacity:1!important}</style>" }} />
      <div className="sl-phx-art">
        <div className="sl-phx-breathe h-full w-full">
          <HeroPicture />
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
