/**
 * First-visit intro: when it shows and how it is remembered.
 *
 * Only a non-sensitive "seen" flag is stored (localStorage). The intro shows
 * on a first visit that lands on the homepage or the Hatchery; deep links to
 * any other page are never interrupted. `?intro=1` forces it (replay / review).
 */

export const INTRO_STORAGE_KEY = "solanites:intro:v1";
/** Attribute set on <html> before first paint while the intro is due. */
export const INTRO_ATTR = "data-sl-intro";
/** Window event that replays the intro from anywhere (footer, Hatchery). */
export const INTRO_REPLAY_EVENT = "solanites:replay-intro";
export const INTRO_PATHS = ["/", "/hatchery"];

export function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, JSON.stringify({ seen: true, at: Date.now() }));
  } catch {
    /* storage unavailable: the intro simply won't be remembered */
  }
}

export function replayIntro() {
  window.dispatchEvent(new Event(INTRO_REPLAY_EVENT));
}

/**
 * Runs inline in <head> before the page paints, so a first-time visitor never
 * sees the page flash before the intro covers it, and returning visitors never
 * see the cover at all. If storage is unavailable the intro is skipped rather
 * than shown on every load.
 */
export const INTRO_BOOT_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search).get("intro");var p=location.pathname.replace(/\\/$/,"")||"/";var due=q==="1"||(q!=="0"&&${JSON.stringify(INTRO_PATHS)}.indexOf(p)>-1&&!localStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)}));if(due)document.documentElement.setAttribute(${JSON.stringify(INTRO_ATTR)},"")}catch(e){}})();`;
