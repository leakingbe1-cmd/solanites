/**
 * Phoenix video intro: configuration.
 *
 * The first-visit intro has two modes:
 *  - "classic": the built-in egg → Pyraurum animation (always available, no assets).
 *  - "video":   the Runway-generated Phoenix film with the SOLANITES wordmark
 *               rendered on top in HTML (crisp at any size, never AI-garbled).
 *
 * Video mode is OFF by default. Preview it any time with `/?intro=video`
 * before making it the default with NEXT_PUBLIC_INTRO_VIDEO_ENABLED=1.
 *
 * Asset URLs can point at /public (e.g. /intro/phoenix-16x9.mp4) or at any
 * CDN / Vercel Blob URL, so the films stay out of the app bundle. Every value
 * here is public by nature (it is shipped to the browser); no secret belongs here.
 * Runway API keys are only ever used by the offline script in scripts/, never the site.
 *
 * Whenever the video can't play (missing file, error, slow network, data saver,
 * autoplay blocked, reduced motion) the intro falls back to "classic", so the
 * site is never blocked by the film.
 */

const env = (v: string | undefined, fallback: string) => (v && v.trim() ? v.trim() : fallback);
const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const introVideoConfig = {
  /** Make the video intro the default first-visit experience. */
  enabled: process.env.NEXT_PUBLIC_INTRO_VIDEO_ENABLED === "1",

  /** Landscape master (16:9), used on wide screens. MP4 (H.264) is the universal fallback. */
  landscape: {
    webm: env(process.env.NEXT_PUBLIC_INTRO_VIDEO_16X9_WEBM, ""),
    mp4: env(process.env.NEXT_PUBLIC_INTRO_VIDEO_16X9_MP4, "/intro/phoenix-16x9.mp4"),
    poster: env(process.env.NEXT_PUBLIC_INTRO_POSTER_16X9, "/intro/phoenix-poster-16x9.jpg"),
  },
  /** Vertical cut (9:16), used on portrait screens (phones). */
  portrait: {
    webm: env(process.env.NEXT_PUBLIC_INTRO_VIDEO_9X16_WEBM, ""),
    mp4: env(process.env.NEXT_PUBLIC_INTRO_VIDEO_9X16_MP4, "/intro/phoenix-9x16.mp4"),
    poster: env(process.env.NEXT_PUBLIC_INTRO_POSTER_9X16, "/intro/phoenix-poster-9x16.jpg"),
  },

  /** Optional sound design. Muted by default; the visitor can turn it on. Empty = no sound button. */
  audio: env(process.env.NEXT_PUBLIC_INTRO_AUDIO, "/intro/phoenix-intro.mp3"),

  /** Length of the film in ms (used for the wordmark cue and the safety timer). */
  durationMs: num(process.env.NEXT_PUBLIC_INTRO_DURATION_MS, 10000),
  /** When the SOLANITES wordmark starts to appear, in ms from the start of the film. */
  wordmarkAtMs: num(process.env.NEXT_PUBLIC_INTRO_WORDMARK_AT_MS, 7600),
  /** How long the final frame + wordmark is held after the film ends before handing over. */
  holdMs: num(process.env.NEXT_PUBLIC_INTRO_HOLD_MS, 2200),
  /** If the film hasn't started playing by then, fall back to the classic intro. */
  startTimeoutMs: num(process.env.NEXT_PUBLIC_INTRO_START_TIMEOUT_MS, 3000),
} as const;

export type IntroMode = "classic" | "video";
