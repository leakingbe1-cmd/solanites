/**
 * The homepage hero's artwork and its awakening: the realistic Phoenix (2000 × 1116
 * still, the only raster here) full bleed behind the copy. Wide screens place it right
 * of centre with the copy over its darkened left wing; phones show its head and body
 * above the copy.
 *
 * The awakening plays once and never blocks the page: darkness opens outwards from the
 * Phoenix's heart and a golden pulse ignites once. No ring, halo, glow, haze or embers
 * are added around it (approved art canon W2; the still itself stays live under W3).
 * CSS only (transform, opacity); the final frame is the resting state, and reduced
 * motion shows it at once.
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
        <div className="sl-phx-dawn" />
      </div>
      {/* legibility: darken where the copy sits, and fade into the page below */}
      <div className="sl-phx-shade absolute inset-0" />
    </div>
  );
}
