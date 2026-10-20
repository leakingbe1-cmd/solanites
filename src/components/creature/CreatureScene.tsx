"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { Species } from "@/lib/species";
import { STAGE_FRAMING, sceneAssets, sceneOf, SEALED_SCENE, type Particle } from "@/lib/creatureScenes";
import { CreatureArt } from "./CreatureArt";
import "./scenes.css";

/**
 * A creature in its biome: the species' painted plate framed for the stage, its own light,
 * a little environmental movement at the larger sizes, and the creature idling in front.
 *
 *   card    — Collection plates and small tiles: the plate at thumbnail size, body idle only
 *   quiet   — beside content that must lead (the homepage Market Bond): plate, gentle idle
 *   feature — showcase panels: plate, idle with parts and glow, a few drifting particles
 *   detail  — the creature profile: as feature, with the full particle count
 *
 * Classified or sealed species (or a stage the viewer may not see) get the generic sealed
 * vault and a still silhouette: no species biome, motion or asset path is revealed.
 */
export type SceneSize = "card" | "quiet" | "feature" | "detail";

interface CreatureSceneProps {
  species: Species;
  stage: number;
  size: SceneSize;
  silhouette?: boolean;
  /** Hides the species' own biome too (a classified species the viewer has not discovered). */
  sealed?: boolean;
  /** Shows the scene at rest: no idle, no particles (a form that is not the selected one). */
  still?: boolean;
  className?: string;
  /** Classes for the creature's box inside the scene (e.g. a max width in a wide panel). */
  artClassName?: string;
  children?: ReactNode;
}

const PARTICLES: Record<SceneSize, number> = { card: 0, quiet: 0, feature: 6, detail: 9 };

export function CreatureScene({ species, stage, size, silhouette = false, sealed = false, still: atRest = false, className = "", artClassName = "", children }: CreatureSceneProps) {
  const evo = Math.max(0, Math.min(3, Math.round(stage)));
  const scene = sealed ? SEALED_SCENE : sceneOf(species.id);
  const assets = sealed ? null : sceneAssets(species.id);
  const frame = STAGE_FRAMING[evo];
  const ref = useVisibility<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [missing, setMissing] = useState(false);
  // one 1024 painting at every size, like the creature art (canon C12; the site's media standard)
  const plate = assets?.plate;
  const still = atRest || silhouette || sealed || scene === SEALED_SCENE;
  const moving = !still && !reduced;
  const count = moving && frame.stir ? Math.round(PARTICLES[size] * (evo === 3 ? 1 : 0.6)) : 0;
  const [fx, fy] = scene.biome.focus ?? [50, 48];

  const style = {
    "--sc-0": scene.biome.tones[0],
    "--sc-1": scene.biome.tones[1],
    "--sc-2": scene.biome.tones[2],
    "--bz": frame.zoom,
    "--bl": frame.light * (1 + (scene.biome.lift ?? 0)),
    "--bs": frame.sat * (scene.biome.calm ?? 1),
    "--bf": size === "card" ? frame.blur * 0.6 : frame.blur,
    "--bx": `${fx}%`,
    "--by": `${fy}%`,
    "--ba": frame.air,
    "--bv": frame.vignette,
  } as CSSProperties;

  return (
    <div ref={ref} className={`sl-scene sl-scene-${size} ${/\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative"} ${className}`} style={style} data-biome={scene.biome.id} data-stage={evo} data-stir={moving && frame.stir && (size === "feature" || size === "detail") ? "" : undefined}>
      <div className="sl-biome" aria-hidden>
        {plate && !missing && (
          // eslint-disable-next-line @next/next/no-img-element -- pre-optimised static WebP plate with its own small size
          <img
            className="sl-biome-plate"
            src={plate}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setMissing(true)}
          />
        )}
        <div className="sl-biome-air" />
        {count > 0 && <Motes kind={scene.biome.particle} count={count} seed={species.dex * 7 + evo} />}
        <div className="sl-biome-vignette" />
      </div>
      <div className={`sl-scene-art ${artClassName}`}>
        {children ?? <CreatureArt species={species} stage={evo} silhouette={silhouette} animated={false} idle={moving ? (size === "card" || size === "quiet" ? "body" : "full") : undefined} />}
      </div>
    </div>
  );
}

/* ── environmental particles ── */

const MOTE: Record<Exclude<Particle, "none">, { color: string; fall: boolean; size: [number, number]; dur: [number, number]; o: number }> = {
  spores: { color: "rgba(214, 255, 170, 0.9)", fall: false, size: [3, 5], dur: [14, 22], o: 0.55 },
  leaves: { color: "rgba(196, 214, 120, 0.85)", fall: true, size: [4, 6], dur: [16, 24], o: 0.5 },
  bubbles: { color: "rgba(200, 240, 255, 0.85)", fall: false, size: [3, 6], dur: [10, 16], o: 0.45 },
  snow: { color: "rgba(244, 250, 255, 0.95)", fall: true, size: [3, 5], dur: [14, 22], o: 0.7 },
  ice: { color: "rgba(196, 238, 255, 0.9)", fall: false, size: [2, 4], dur: [16, 24], o: 0.5 },
  embers: { color: "rgba(255, 176, 92, 0.95)", fall: false, size: [2, 4], dur: [9, 15], o: 0.65 },
  ash: { color: "rgba(220, 200, 190, 0.7)", fall: true, size: [2, 4], dur: [18, 26], o: 0.35 },
  motes: { color: "rgba(255, 226, 168, 0.85)", fall: false, size: [2, 4], dur: [16, 26], o: 0.45 },
  plankton: { color: "rgba(186, 236, 255, 0.8)", fall: true, size: [2, 3], dur: [18, 28], o: 0.45 },
  glyphs: { color: "rgba(62, 242, 224, 0.85)", fall: false, size: [2, 4], dur: [16, 24], o: 0.45 },
  petals: { color: "rgba(255, 236, 214, 0.9)", fall: true, size: [3, 5], dur: [18, 28], o: 0.45 },
};

function Motes({ kind, count, seed }: { kind: Particle; count: number; seed: number }) {
  if (kind === "none") return null;
  const m = MOTE[kind];
  const r = rand(seed);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const dur = m.dur[0] + r() * (m.dur[1] - m.dur[0]);
        const style = {
          // keep the middle clear: particles drift through the outer thirds
          "--x": `${(i % 2 ? 62 + r() * 32 : 6 + r() * 32).toFixed(1)}%`,
          "--s": `${(m.size[0] + r() * (m.size[1] - m.size[0])).toFixed(1)}px`,
          "--d": `${dur.toFixed(1)}s`,
          "--w": `${(-r() * dur).toFixed(1)}s`,
          "--c": m.color,
          "--o": m.o,
        } as CSSProperties;
        return <span key={i} className="sl-mote" data-fall={m.fall ? "" : undefined} style={style} />;
      })}
    </>
  );
}

function rand(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* ── one shared observer: a scene animates only while it is on screen ── */

let observer: IntersectionObserver | null = null;
function observe(el: Element) {
  if (typeof IntersectionObserver === "undefined") {
    el.setAttribute("data-active", "");
    return () => {};
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.setAttribute("data-active", "");
        else e.target.removeAttribute("data-active");
      }
    },
    { rootMargin: "80px" },
  );
  observer.observe(el);
  return () => observer?.unobserve(el);
}

function useVisibility<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => (ref.current ? observe(ref.current) : undefined), []);
  return ref;
}

const RM = "(prefers-reduced-motion: reduce)";
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const q = window.matchMedia(RM);
      q.addEventListener("change", cb);
      return () => q.removeEventListener("change", cb);
    },
    () => window.matchMedia(RM).matches,
    () => false,
  );
}
