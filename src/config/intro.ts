/**
 * Phoenix video intro (Runway-generated), shown inside the existing first-visit
 * intro in place of its animated sequence.
 *
 * - `enabled` makes it the default intro. While false, preview it with
 *   `?intro=video` on any page.
 * - Videos and posters live outside the app code, under `public/intro/` (or any
 *   CDN: set NEXT_PUBLIC_INTRO_VIDEO_BASE to serve them from elsewhere).
 * - Any failure (missing file, autoplay blocked, slow network) falls back to the
 *   animated intro, so the site is always reachable. Reduced motion always uses
 *   the animated intro's still frame.
 *
 * Generate or replace the clips with docs/phoenix-intro.md.
 */

/**
 * The first-visit intro overlay as a whole. Off by the owner's decision (19 Oct): the
 * current intro footage is 720p, so the homepage opens straight onto the approved Phoenix
 * still and its headline, with no overlay, video request or replay button. The intro code
 * and the 720p files stay in the repo, unused, until a genuine native 1080p replacement is
 * approved (docs/intro-1080p-quote.md). Turn it back on here.
 */
export const FIRST_VISIT_INTRO = { enabled: false } as const;

const base = (process.env.NEXT_PUBLIC_INTRO_VIDEO_BASE ?? "/intro").replace(/\/$/, "");

export const PHOENIX_INTRO = {
  /** Off: the 720p footage is retired from the active site (see FIRST_VISIT_INTRO). */
  enabled: false,
  /** Desktop and landscape screens. */
  landscape: { webm: `${base}/phoenix-16x9.webm`, mp4: `${base}/phoenix-16x9.mp4`, poster: `${base}/phoenix-16x9-poster.jpg` },
  /** Phones and portrait screens. */
  portrait: { webm: `${base}/phoenix-9x16.webm`, mp4: `${base}/phoenix-9x16.mp4`, poster: `${base}/phoenix-9x16-poster.jpg` },
  /** Expected length; the intro closes this long after start even if `ended` never fires. */
  durationMs: 16_800,
  /** Hold on the final SOLANITES frame before handing over to the page. */
  holdAfterEndMs: 1_200,
  /** If playback hasn't started by then, use the animated intro instead. */
  startTimeoutMs: 4_000,
  /** The video files carry an audio track (muted until the visitor turns it on). */
  hasAudio: true,
} as const;
