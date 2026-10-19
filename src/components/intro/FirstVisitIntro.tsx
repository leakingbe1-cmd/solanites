"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { Sigil } from "@/components/brand/Sigil";
import { gameConfig } from "@/config/gameConfig";
import { PHOENIX_INTRO } from "@/config/intro";
import { SPECIES, SPECIES_BY_ID } from "@/lib/species";
import { PhoenixVideo } from "./PhoenixVideo";
import { INTRO_ATTR, INTRO_REPLAY_EVENT, markIntroSeen } from "./introState";

/**
 * Cinematic, skippable first-visit intro: about six seconds of sequence, then it
 * hands over to the page by itself at 7.5 s unless the visitor is engaging with it.
 *
 * A dormant egg wakes, breaks into light and Pyraurum, the catalogue's
 * strongest finished artwork (also the homepage hero), rises in its Ascended
 * form while the wordmark and copy settle in. Both actions work from the first
 * frame; Escape skips. The page loads normally underneath and is shown as the
 * intro fades. With reduced motion the finished frame appears at once and
 * nothing moves or auto-advances.
 */

const FEATURED = SPECIES_BY_ID["pyraurum"];
const ASCENDED = gameConfig.evolution.names.length - 1;
const AUTO_CONTINUE_MS = 7500;
const EXIT_MS = 650;
const WORDMARK = "SOLANITES".split("");

type Variant = "animated" | "video";

/** The Runway phoenix video when it is enabled (or previewed with ?intro=video) and motion is welcome. */
function chooseVariant(): Variant {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "animated";
  if (PHOENIX_INTRO.enabled) return "video";
  return new URLSearchParams(window.location.search).get("intro") === "video" ? "video" : "animated";
}

export function FirstVisitIntro() {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [run, setRun] = useState(0);
  const [replay, setReplay] = useState(false);
  const [variant, setVariant] = useState<Variant>("animated");
  const root = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const held = useRef(false);
  const leavingRef = useRef(false);

  // Shown when the pre-paint script marked this visit as due, or on replay.
  useEffect(() => {
    const html = document.documentElement;
    if (html.hasAttribute(INTRO_ATTR)) {
      setVariant(chooseVariant());
      setOpen(true);
    }
    const replay = () => {
      leavingRef.current = false;
      held.current = false;
      setReplay(true);
      setVariant(chooseVariant());
      setLeaving(false);
      setRun((r) => r + 1);
      setOpen(true);
    };
    window.addEventListener(INTRO_REPLAY_EVENT, replay);
    return () => window.removeEventListener(INTRO_REPLAY_EVENT, replay);
  }, []);

  const close = useCallback(
    (to?: string) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      markIntroSeen();
      setLeaving(true);
      if (to && to !== path) router.push(to);
      window.setTimeout(() => {
        setOpen(false);
        setLeaving(false);
        leavingRef.current = false;
      }, EXIT_MS);
    },
    [path, router],
  );

  // While open: hide the pre-paint cover, lock scroll, make the page inert, trap focus, Escape skips.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.removeAttribute(INTRO_ATTR);
    const behind = Array.from(document.querySelectorAll<HTMLElement>("body > header, body > main, body > footer"));
    behind.forEach((el) => el.setAttribute("inert", ""));
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    primary.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      held.current = true;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab" && root.current) {
        const f = Array.from(root.current.querySelectorAll<HTMLElement>("button"));
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      behind.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = overflow;
    };
  }, [open, close, variant]);

  // The video ended (or never started): hand over, or fall back to the animated intro.
  const videoEnded = useCallback(() => close(), [close]);
  const videoFailed = useCallback(() => {
    setVariant("animated");
    setRun((r) => r + 1);
  }, []);

  // Without interaction the intro hands over to the page by itself. Never with
  // reduced motion, not while the pointer rests on the actions, and not once the
  // visitor has used the keyboard (the initial focus on Enter doesn't count).
  useEffect(() => {
    if (!open || leaving || variant === "video") return; // the video hands over when it ends
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (!held.current) close();
    }, AUTO_CONTINUE_MS);
    return () => window.clearInterval(t);
  }, [open, leaving, run, close, variant]);

  if (!open) return null;

  const actions = (
    <div
      className="sl-intro-actions flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center"
      onPointerEnter={() => (held.current = true)}
      onPointerLeave={() => (held.current = false)}
    >
      <button
        ref={primary}
        type="button"
        onClick={() => close("/hatchery")}
        className={`sl-btn-gold w-full whitespace-nowrap rounded-full px-8 py-4 font-display text-sm font-semibold tracking-[0.2em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green focus-visible:ring-offset-2 focus-visible:ring-offset-[#05040a] sm:w-auto`}
      >
        ENTER THE HATCHERY <span aria-hidden>→</span>
      </button>
      <button
        type="button"
        onClick={() => close()}
        className="w-full whitespace-nowrap rounded-full border border-white/15 bg-black/30 px-7 py-4 text-xs uppercase tracking-[0.25em] text-mist backdrop-blur transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green sm:w-auto"
      >
        Skip intro
      </button>
    </div>
  );

  if (variant === "video")
    return (
      <div
        key={`video-${run}`}
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sl-intro-title"
        className={`sl-intro fixed inset-0 z-[100] overflow-hidden bg-[#05040a] ${replay ? "is-replay" : ""} ${leaving ? "is-leaving" : ""}`}
        data-intro-variant="video"
      >
        <h1 id="sl-intro-title" className="sr-only">
          Solanites: a phoenix rises
        </h1>
        <PhoenixVideo onEnded={videoEnded} onFail={videoFailed} />
        {/* actions over a soft bottom fade, usable from the first frame */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 flex justify-center px-5 pb-7 sm:pb-9">{actions}</div>
      </div>
    );

  return (
    <div
      key={`animated-${run}`}
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sl-intro-title"
      aria-describedby="sl-intro-desc"
      className={`sl-intro fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-[#05040a] ${replay ? "is-replay" : ""} ${leaving ? "is-leaving" : ""}`}
    >
      {/* a vignette to hold the eye in the centre (canon W2: no nebula blobs, particles or halos behind artwork) */}
      <div className="sl-intro-light pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col items-center justify-between gap-5 overflow-x-clip px-5 pb-7 pt-8 text-center sm:pb-9 sm:pt-10">
        {/* wordmark */}
        <div className="flex flex-col items-center">
          <Sigil variant="emblem" className="sl-intro-mark h-9 w-10 sm:h-11 sm:w-12" />
          <p className="mt-4 flex font-display text-lg font-semibold text-white sm:text-2xl" aria-label="Solanites">
            {WORDMARK.map((ch, i) => (
              <span key={i} className="sl-intro-letter inline-block px-[0.14em] sm:px-[0.18em]" style={{ animationDelay: `${0.9 + i * 0.07}s` }} aria-hidden>
                {ch}
              </span>
            ))}
          </p>
        </div>

        {/* the egg wakes, breaks into light, and the creature rises */}
        <div className="relative aspect-square w-[min(68vw,40svh,400px)] shrink-0" aria-hidden>
          <div className="sl-intro-egg absolute inset-[8%]">
            <div className="sl-hero-float h-full w-full">
              <EggArt stage={4} seed={3} />
            </div>
          </div>
          <div className="sl-intro-flash absolute inset-[-10%] rounded-full" />
          <div className="sl-intro-creature absolute inset-0">
            <div className="sl-hero-float h-full w-full">
              <CreatureArt species={FEATURED} stage={ASCENDED} />
            </div>
          </div>
        </div>

        {/* copy */}
        <div>
          <p className="sl-intro-rise font-mono text-[10px] uppercase tracking-[0.4em] text-sol-green/80" style={{ animationDelay: "4.3s" }}>
            ◇ Genesis Hatchery · Season 0
          </p>
          <h1 id="sl-intro-title" className="sl-intro-rise mt-4 font-display text-[1.7rem] font-bold leading-[1.05] tracking-tight text-white sm:text-5xl" style={{ animationDelay: "4.5s" }}>
            A new world is
            <br />
            waiting to <span className="sl-gradient-text">hatch.</span>
          </h1>
          <p id="sl-intro-desc" className="sl-intro-rise mx-auto mt-4 max-w-md text-sm sm:max-w-xl leading-relaxed text-mist sm:text-base" style={{ animationDelay: "5.1s" }}>
            Discover {SPECIES.length} species. Hold {gameConfig.token.symbol} to earn eggs, hatch them, and watch your Solanites grow from Eggling to Ascended.
          </p>
        </div>

        {/* actions: usable from the first frame */}
        {actions}
        <p className="sl-intro-actions -mt-3 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 sm:block pointer-coarse:hidden">Press Esc to skip</p>
      </div>
    </div>
  );
}
