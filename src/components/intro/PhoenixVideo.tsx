"use client";

import { useEffect, useRef, useState } from "react";
import { PHOENIX_INTRO } from "@/config/intro";

/**
 * The Runway phoenix intro video, full screen and without controls. Plays
 * muted (browsers only autoplay muted video); picks the 9:16 cut on portrait
 * screens and the 16:9 master otherwise. No poster: the video opens from black, the
 * intro's own background, so a slow start never flashes the ending. Calls `onFail` if the file is
 * missing, autoplay is blocked or playback hasn't started in time, so the
 * caller can fall back to the animated intro instead of a blank screen.
 */
export function PhoenixVideo({ onEnded, onFail }: { onEnded: () => void; onFail: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [cut] = useState(() => (typeof window !== "undefined" && window.innerHeight > window.innerWidth ? PHOENIX_INTRO.portrait : PHOENIX_INTRO.landscape));
  const [muted, setMuted] = useState(true);
  const started = useRef(false);
  const done = useRef(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const finish = () => {
      if (done.current) return;
      done.current = true;
      window.setTimeout(onEnded, PHOENIX_INTRO.holdAfterEndMs);
    };
    const fail = () => {
      if (done.current) return;
      done.current = true;
      onFail();
    };
    v.play().catch(fail);
    const startGuard = window.setTimeout(() => !started.current && fail(), PHOENIX_INTRO.startTimeoutMs);
    // Never let a stalled video hold visitors: hand over after its expected length regardless.
    const lengthGuard = window.setTimeout(finish, PHOENIX_INTRO.durationMs + PHOENIX_INTRO.startTimeoutMs);
    const onPlaying = () => (started.current = true);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("ended", finish);
    v.addEventListener("error", fail);
    return () => {
      window.clearTimeout(startGuard);
      window.clearTimeout(lengthGuard);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ended", finish);
      v.removeEventListener("error", fail);
    };
  }, [onEnded, onFail]);

  return (
    <>
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        muted={muted}
        autoPlay
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        data-testid="phoenix-video"
      >
        {/* VP9 first (smaller), H.264 for Safari and older browsers. The last source failing fires `fail`. */}
        <source src={cut.webm} type="video/webm" />
        <source src={cut.mp4} type="video/mp4" onError={() => video.current?.dispatchEvent(new Event("error"))} />
      </video>
      {PHOENIX_INTRO.hasAudio && (
        <button
          type="button"
          onClick={() => {
            const v = video.current;
            if (!v) return;
            v.muted = !muted;
            setMuted(!muted);
          }}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur transition hover:text-white"
        >
          {muted ? "Sound on" : "Sound off"}
        </button>
      )}
    </>
  );
}
