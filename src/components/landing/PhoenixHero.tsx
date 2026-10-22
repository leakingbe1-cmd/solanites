/**
 * The homepage hero's artwork and its awakening: the Phoenix still (served at its native
 * 2752 × 1536, the only raster here) full bleed behind the copy. Wide screens place it right
 * of centre with the copy over its darkened left wing; phones show its head and body
 * above the copy.
 *
 * The awakening plays once and never blocks the page: darkness opens outwards from the
 * Phoenix's heart. No pulse, ring, halo, glow, haze or embers are added on or around
 * it (approved art canon W2; the still itself stays live under W3).
 * CSS only (transform, opacity); the final frame is the resting state, and reduced
 * motion shows it at once.
 */

import { preload } from "react-dom";
import heroAssets from "@/data/heroAssets.json";

type HeroSource = { src: string; w: number };
type HeroVariant = { width: number; height: number; sources: Record<"avif" | "webp" | "jpg", HeroSource[]> };
const ECLIPSE = heroAssets as { current?: HeroVariant; phone?: HeroVariant; desktop?: HeroVariant; mobile?: HeroVariant };
/**
 * What the art box really occupies, so the browser picks a file at least that many device
 * pixels wide: 130% of the viewport on wide screens; on phones the box is 56% of the
 * screen height and the 16:9 still fills it by height (≈ 100vh wide).
 */
const CURRENT_SIZES = "(min-width: 1024px) 130vw, 100vh";
/**
 * Portrait phones get the lighter centre crop (1.3 : 1, full height): the 56% box is never
 * wider than that there, so they see exactly what the full still showed them.
 */
const PHONE_MEDIA = "(max-width: 1023px) and (max-aspect-ratio: 2/3)";
const PHONE_SIZES = "73vh";
const srcSet = (list: HeroSource[]) => list.map((s) => `${s.src} ${s.w}w`).join(", ");

/**
 * The approved replacement phoenix when there is one (scripts/hero-art.mjs →
 * src/data/heroAssets.json, with its own portrait composition for phones); until then the
 * current still at its native 2752 × 1536 in AVIF/WebP/JPEG; the old 2000 px export only
 * if neither has been built.
 */
function HeroPicture() {
  const d = ECLIPSE.desktop;
  const c = ECLIPSE.current;
  if (!d && c) {
    const fallback = c.sources.jpg[0];
    const p = ECLIPSE.phone;
    // The still is the first screen's largest paint: start its download from <head>, before CSS and scripts.
    if (p) preload(p.sources.avif[0].src, { as: "image", type: "image/avif", imageSrcSet: srcSet(p.sources.avif), imageSizes: PHONE_SIZES, media: PHONE_MEDIA, fetchPriority: "high" });
    preload(c.sources.avif[0].src, { as: "image", type: "image/avif", imageSrcSet: srcSet(c.sources.avif), imageSizes: CURRENT_SIZES, ...(p && { media: `not all and ${PHONE_MEDIA}` }), fetchPriority: "high" });
    return (
      <picture>
        {p && <source media={PHONE_MEDIA} type="image/avif" srcSet={srcSet(p.sources.avif)} sizes={PHONE_SIZES} />}
        {p && <source media={PHONE_MEDIA} type="image/webp" srcSet={srcSet(p.sources.webp)} sizes={PHONE_SIZES} />}
        {p && <source media={PHONE_MEDIA} srcSet={srcSet(p.sources.jpg)} sizes={PHONE_SIZES} />}
        <source type="image/avif" srcSet={srcSet(c.sources.avif)} sizes={CURRENT_SIZES} />
        <source type="image/webp" srcSet={srcSet(c.sources.webp)} sizes={CURRENT_SIZES} />
        <img src={fallback.src} srcSet={srcSet(c.sources.jpg)} sizes={CURRENT_SIZES} alt="" width={c.width} height={c.height} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
      </picture>
    );
  }
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
        {/* the awakening: darkness opening outwards from the Phoenix's heart */}
        <div className="sl-phx-dawn" />
      </div>
      {/* legibility: darken where the copy sits, and fade into the page below */}
      <div className="sl-phx-shade absolute inset-0" />
    </div>
  );
}
