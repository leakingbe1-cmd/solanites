"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { graphicData } from "@/studio/copy";
import { AD_DURATION, CANVAS_FORMATS, FONT_LOADS, SOURCE_DURATION, drawAdFrame, drawEndCard, drawStatic, type CanvasFormatId, type CreativeCopy, type FrameSource, type Graphic } from "@/studio/render/draw";
import { downloadBlob } from "./studioUi";

export const SOURCE_SRC = "/campaign/phoenix-source.mp4";

export interface PreviewSpec {
  kind: "video" | "static" | "endcard";
  format: CanvasFormatId;
  graphic: Graphic;
  still: number;
  copy: CreativeCopy;
  fileStem: string;
}

// MP4 only when the browser really records H.264 (a bare "video/mp4" can mean VP9, which X rejects)
const RECORD_TYPES = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1.42E01E,opus", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];

/**
 * Live canvas preview drawn with the campaign renderer from the source clip.
 * Exports: PNG of the current frame, and a real-time recording of the full
 * advert (MediaRecorder: MP4 where the browser supports it, otherwise WebM).
 */
export function StudioPreview({ spec }: { spec: PreviewSpec }) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const time = useRef(0);
  const endedAt = useRef<number | null>(null);
  const raf = useRef(0);
  const audio = useRef<{ ctx: AudioContext; dest: MediaStreamAudioDestinationNode } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const specRef = useRef(spec);
  specRef.current = spec;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [shownT, setShownT] = useState(0);
  const [recording, setRecording] = useState<null | number>(null);
  const [status, setStatus] = useState<string | null>(null);
  const { w, h } = CANVAS_FORMATS[spec.format];

  const draw = useCallback(() => {
    const c = canvas.current;
    const v = video.current;
    if (!c || !v) return;
    const s = specRef.current;
    const f = CANVAS_FORMATS[s.format];
    if (c.width !== f.w || c.height !== f.h) {
      c.width = f.w;
      c.height = f.h;
    }
    const ctx = c.getContext("2d")!;
    const frame: FrameSource | null = v.readyState >= 2 ? { image: v, width: v.videoWidth, height: v.videoHeight } : null;
    if (s.kind === "video") drawAdFrame(ctx, s.format, time.current, frame, s.copy);
    else if (s.kind === "endcard") drawEndCard(ctx, s.format, frame, s.copy);
    else drawStatic(ctx, s.format, s.graphic, frame, s.copy, graphicData());
  }, []);

  const seek = useCallback(
    (t: number) =>
      new Promise<void>((res) => {
        const v = video.current;
        if (!v) return res();
        const target = Math.min(t, SOURCE_DURATION - 0.04);
        if (Math.abs(v.currentTime - target) < 0.01 && v.readyState >= 2) return res();
        const done = () => {
          v.removeEventListener("seeked", done);
          res();
        };
        v.addEventListener("seeked", done);
        v.currentTime = target;
      }),
    [],
  );

  // fonts and the first frame
  useEffect(() => {
    let live = true;
    const v = video.current!;
    const onData = async () => {
      await Promise.all(FONT_LOADS.map((f) => document.fonts.load(f).catch(() => null)));
      if (live) setReady(true);
    };
    const onErr = () => setError(`Couldn't load the Phoenix clip (${SOURCE_SRC}). Is it in public/campaign/?`);
    if (v.readyState >= 2) onData();
    const last = v.querySelector("source:last-of-type");
    v.addEventListener("loadeddata", onData);
    last?.addEventListener("error", onErr);
    return () => {
      live = false;
      v.removeEventListener("loadeddata", onData);
      last?.removeEventListener("error", onErr);
    };
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    video.current?.pause();
    setPlaying(false);
  }, []);

  // static frames (and paused video) redraw whenever the spec changes
  useEffect(() => {
    if (!ready || playing) return;
    const t = spec.kind === "video" ? time.current : spec.still;
    seek(t).then(draw);
  }, [ready, playing, spec, seek, draw]);

  // switching kind or format resets the timeline
  useEffect(() => {
    stop();
    time.current = spec.kind === "video" ? AD_DURATION - 0.01 : 0;
    setShownT(time.current);
  }, [spec.kind, spec.format, stop]);

  const loop = useCallback(() => {
    const v = video.current!;
    if (!v.paused && v.currentTime < SOURCE_DURATION - 0.05) {
      time.current = v.currentTime;
      endedAt.current = null;
    } else {
      // hold the last frame for the end screen
      endedAt.current ??= performance.now() - Math.max(0, time.current - SOURCE_DURATION) * 1000;
      time.current = SOURCE_DURATION + (performance.now() - endedAt.current) / 1000;
    }
    draw();
    setShownT(time.current);
    if (time.current >= AD_DURATION) {
      time.current = AD_DURATION - 0.001;
      draw();
      setPlaying(false);
      if (recorder.current?.state === "recording") recorder.current.stop();
      return;
    }
    raf.current = requestAnimationFrame(loop);
  }, [draw]);

  const play = useCallback(
    async (from?: number) => {
      const v = video.current!;
      let start = from ?? time.current;
      if (start >= AD_DURATION - 0.05) start = 0;
      time.current = start;
      endedAt.current = null;
      await seek(start);
      if (start < SOURCE_DURATION - 0.05) await v.play().catch(() => null);
      setPlaying(true);
      raf.current = requestAnimationFrame(loop);
    },
    [seek, loop],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const scrub = async (t: number) => {
    stop();
    time.current = t;
    setShownT(t);
    await seek(t);
    draw();
  };

  const savePng = () => {
    canvas.current?.toBlob((b) => b && downloadBlob(b, `${spec.fileStem}.png`), "image/png");
  };

  const record = async () => {
    const c = canvas.current!;
    const v = video.current!;
    const type = typeof MediaRecorder !== "undefined" ? RECORD_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) : undefined;
    if (!type || !c.captureStream) {
      setStatus("This browser can't record a canvas. Use Chrome, Edge or Safari, or run `npm run campaign:render`.");
      return;
    }
    stop();
    const stream = c.captureStream(30);
    try {
      // route the clip's audio into the recording (and nowhere else, so the preview stays silent)
      if (!audio.current) {
        const ctx = new AudioContext();
        const dest = ctx.createMediaStreamDestination();
        ctx.createMediaElementSource(v).connect(dest);
        audio.current = { ctx, dest };
      }
      await audio.current.ctx.resume();
      v.muted = false;
      audio.current.dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      /* no audio: the recording is still valid */
    }
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 14_000_000 });
    recorder.current = rec;
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      v.muted = true;
      setRecording(null);
      const blob = new Blob(chunks, { type: type.split(";")[0] });
      if (blob.size < 10_000) {
        setStatus("The recording came out empty. Keep this tab visible while it records.");
        return;
      }
      const ext = type.startsWith("video/mp4") ? "mp4" : "webm";
      downloadBlob(blob, `${spec.fileStem}.${ext}`);
      setStatus(`Saved ${spec.fileStem}.${ext} (${(blob.size / 1e6).toFixed(1)} MB, ${ext.toUpperCase()}).${ext === "webm" ? " X accepts MP4; convert with ffmpeg or use the rendered masters." : ""}`);
    };
    setStatus(null);
    setRecording(0);
    rec.start(250);
    await play(0);
  };

  useEffect(() => {
    if (recording === null) return;
    const id = setInterval(() => setRecording(Math.round((time.current / AD_DURATION) * 100)), 200);
    return () => clearInterval(id);
  }, [recording]);

  const isVideo = spec.kind === "video";
  const tall = h / w > 1.3;

  return (
    <div>
      <div className="relative mx-auto overflow-hidden rounded-xl border border-white/10 bg-black" style={{ aspectRatio: `${w} / ${h}`, maxWidth: tall ? 420 : "100%" }}>
        <canvas ref={canvas} width={w} height={h} className="block h-full w-full" />
        {!ready && <div className="absolute inset-0 grid place-items-center font-mono text-[11px] uppercase tracking-[0.3em] text-mist">{error ?? "Loading footage…"}</div>}
        {recording !== null && <div className="absolute left-3 top-3 rounded-full bg-rose-500/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white">● Recording {recording}%</div>}
      </div>
      <video ref={video} preload="auto" muted playsInline crossOrigin="anonymous" className="hidden">
        <source src={SOURCE_SRC} type="video/mp4" />
        {/* VP9 fallback for browsers without H.264 (e.g. some Linux Chromium/Firefox builds) */}
        <source src={SOURCE_SRC.replace(/\.mp4$/, ".webm")} type="video/webm" />
      </video>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isVideo && (
          <>
            <button type="button" disabled={!ready || recording !== null} onClick={() => (playing ? stop() : play())} className="sl-btn-primary rounded-full px-5 py-2 font-display text-[11px] font-semibold tracking-[0.2em] text-white disabled:opacity-50">
              {playing ? "PAUSE" : "PLAY"}
            </button>
            <input
              type="range"
              min={0}
              max={AD_DURATION}
              step={1 / 24}
              value={shownT}
              disabled={!ready || recording !== null}
              onChange={(e) => scrub(Number(e.target.value))}
              aria-label="Timeline"
              className="min-w-[140px] flex-1 accent-[#9945ff]"
            />
            <span className="w-20 text-right font-mono text-[11px] tabular-nums text-mist">{shownT.toFixed(1)}s / {AD_DURATION.toFixed(1)}s</span>
          </>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!ready || recording !== null} onClick={savePng} className="rounded-full border border-white/15 px-4 py-2 text-xs tracking-wider text-white transition hover:border-white/35 disabled:opacity-40">
          Download PNG{isVideo ? " (this frame)" : ""}
        </button>
        {isVideo && (
          <button type="button" disabled={!ready || recording !== null} onClick={record} className="rounded-full border border-sol-purple/50 px-4 py-2 text-xs tracking-wider text-white transition hover:border-sol-purple disabled:opacity-40">
            Record video with this copy ({AD_DURATION.toFixed(1)} s, real time)
          </button>
        )}
      </div>
      {status && <p className="mt-2 text-xs leading-relaxed text-mist">{status}</p>}
      {isVideo && <p className="mt-2 text-[11px] leading-relaxed text-mist/60">Recording runs in real time; keep the tab visible. For the highest quality, use the rendered masters (Assets tab) or re-render with <code className="font-mono">npm run campaign:render</code>.</p>}
    </div>
  );
}
