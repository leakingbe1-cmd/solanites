"use client";

import { useEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { introVideoConfig as cfg } from "@/config/intro";

/**
 * Phoenix film intro (video mode of FirstVisitIntro).
 *
 * Full-screen, muted, inline video with no player chrome. The landscape master
 * plays on wide screens and the vertical cut on portrait screens. The SOLANITES
 * wordmark is drawn in HTML over the final pose at `wordmarkAtMs`, then the last
 * frame is held for `holdMs` and the intro hands over to the page.
 *
 * Anything that stops the film from starting (error, slow network, autoplay
 * blocked) calls `onFail` and the parent falls back to the classic intro, so a
 * visitor is never stuck. Skip and Esc work from the first frame.
 */

type Phase = "loading" | "playing" | "reveal" | "hold";
const WORDMARK = "SOLANITES".split("");

export function PhoenixVideoIntro({
  onClose,
  onFail,
  primaryRef,
  held,
}: {
  onClose: (to?: string) => void;
  onFail: () => void;
  primaryRef: RefObject<HTMLButtonElement | null>;
  held: MutableRefObject<boolean>;
}) {
  const [portrait] = useState(() => window.matchMedia("(orientation: portrait)").matches);
  const src = portrait ? cfg.portrait : cfg.landscape;
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [sound, setSound] = useState(false);
  const started = useRef(false);
  const failed = useRef(false);

  const fail = () => {
    if (started.current || failed.current) return;
    failed.current = true;
    onFail();
  };

  // Start playback; fall back if the film can't start in time or autoplay is refused.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const startTimer = window.setTimeout(fail, cfg.startTimeoutMs);
    // Safety net: whatever happens to the media events, the intro always ends.
    const endTimer = window.setTimeout(() => setPhase("hold"), cfg.durationMs + 4000);

    const onPlaying = () => {
      started.current = true;
      window.clearTimeout(startTimer);
      setPhase((p) => (p === "loading" ? "playing" : p));
    };
    const onTime = () => {
      if (v.currentTime * 1000 >= cfg.wordmarkAtMs) setPhase((p) => (p === "playing" ? "reveal" : p));
    };
    const onEnded = () => setPhase("hold");
    const onError = () => (started.current ? setPhase("hold") : fail());

    v.addEventListener("playing", onPlaying);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    v.addEventListener("error", onError);
    v.muted = true;
    v.play()?.catch(() => fail());

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("error", onError);
      audio.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hold the final frame + wordmark, then hand over (unless the visitor is on the buttons).
  useEffect(() => {
    if (phase !== "hold") return;
    const t = window.setInterval(() => {
      if (!held.current) onClose();
    }, cfg.holdMs);
    return () => window.clearInterval(t);
  }, [phase, held, onClose]);

  // Optional sound design, kept in step with the film; muted until the visitor asks.
  const toggleSound = () => {
    const a = audio.current;
    const v = video.current;
    if (!a) return;
    if (sound) {
      a.pause();
      setSound(false);
      return;
    }
    if (v && v.currentTime * 1000 < cfg.durationMs) a.currentTime = v.currentTime;
    a.muted = false;
    a.play().then(() => setSound(true)).catch(() => setSound(false));
  };

  const revealed = phase === "reveal" || phase === "hold";

  return (
    <div className="sl-phoenix fixed inset-0 bg-black">
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        poster={src.poster}
        muted
        playsInline
        autoPlay
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        tabIndex={-1}
      >
        {src.webm ? <source src={src.webm} type="video/webm" /> : null}
        <source src={src.mp4} type="video/mp4" />
      </video>
      {cfg.audio ? <audio ref={audio} src={cfg.audio} preload="none" /> : null}

      {/* depth at the edges and a dark floor so the wordmark always reads */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.6)_100%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden />

      {/* lightweight loading state: a single breathing ember line until the first frame plays */}
      {phase === "loading" ? <div className="sl-phoenix-loader pointer-events-none absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2" aria-hidden /> : null}

      {/* top bar: sound + skip, usable from the first frame */}
      <div
        className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-6 sm:top-6"
        onPointerEnter={() => (held.current = true)}
        onPointerLeave={() => (held.current = false)}
      >
        {cfg.audio ? (
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            className="rounded-full border border-white/15 bg-black/30 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 backdrop-blur transition hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green"
          >
            {sound ? "Sound on" : "Sound off"}
          </button>
        ) : null}
        <button
          ref={primaryRef}
          type="button"
          onClick={() => onClose()}
          className="rounded-full border border-white/15 bg-black/30 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur transition hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green"
        >
          Skip intro <span aria-hidden>→</span>
        </button>
      </div>

      {/* the reveal: wordmark in HTML over the final pose */}
      <div className="absolute inset-x-0 bottom-[11%] flex flex-col items-center px-5 text-center sm:bottom-[13%]">
        <h1 id="sl-intro-title" className="sr-only">Solanites</h1>
        <p id="sl-intro-desc" className="sr-only">A phoenix rises from the dark and spreads its wings. Skip the intro at any time.</p>
        {revealed ? (
          <>
            <p className="sl-phoenix-wordmark flex font-display text-[2.1rem] font-bold leading-none sm:text-6xl lg:text-7xl" aria-hidden>
              {WORDMARK.map((ch, i) => (
                <span key={i} className="sl-intro-letter inline-block px-[0.09em] sm:px-[0.12em]" style={{ animationDelay: `${i * 0.06}s` }}>
                  {ch}
                </span>
              ))}
            </p>
            <span className="sl-phoenix-rule mt-5 block h-px w-40 sm:w-64" aria-hidden />
            <div
              className="sl-intro-rise mt-7 flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center"
              style={{ animationDelay: "0.9s" }}
              onPointerEnter={() => (held.current = true)}
              onPointerLeave={() => (held.current = false)}
            >
              <button
                type="button"
                onClick={() => onClose("/hatchery")}
                className="sl-btn-primary w-full whitespace-nowrap rounded-full px-8 py-3.5 font-display text-xs font-semibold tracking-[0.2em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
              >
                ENTER THE HATCHERY <span aria-hidden>→</span>
              </button>
              <button
                type="button"
                onClick={() => onClose()}
                className="w-full whitespace-nowrap rounded-full border border-white/15 px-7 py-3.5 text-xs uppercase tracking-[0.25em] text-mist transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green sm:w-auto"
              >
                Explore
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
