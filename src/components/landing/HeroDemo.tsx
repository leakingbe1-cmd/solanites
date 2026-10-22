"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EggArt } from "@/components/egg/EggArt";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { HATCH_POSTER } from "@/config/hatchClips";
import { gameConfig } from "@/config/gameConfig";
import { clipFor, demoSeed, rollDemo } from "@/lib/heroDemo";
import { demoShareable } from "@/lib/share";
import type { Species } from "@/lib/species";

type Phase = "idle" | "hatching" | "done";

// The reveal and the creature art are only needed after the tap: kept out of the first load, and
// fetched in idle time after first paint so the tap still plays at once.
const loadReveal = () => import("@/components/hatchery/HatchReveal").then((m) => m.HatchReveal);
const loadArt = () => import("@/components/creature/CreatureArt").then((m) => m.CreatureArt);
const loadShare = () => import("@/components/share/ShareButton").then((m) => m.ShareButton);
// Until the reveal's code has arrived, the tap still answers at once: the egg, centred and shaking.
const HatchReveal = dynamic(loadReveal, { ssr: false, loading: () => <RevealPoster /> });
const CreatureArt = dynamic(loadArt, { ssr: false });
const ShareButton = dynamic(loadShare, { ssr: false });

const whenIdle = (cb: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 300));

/**
 * The homepage's live demo: a simulated egg, already incubating, and one big "Hatch it". The result
 * is rolled when the egg appears (same odds as real eggs) and only shown by the hatch: the owner's
 * clip for that rarity when configured, otherwise the built-in hatch. Then the creature, a demo
 * share card (Common to Legendary) and the way into the Hatchery demo. Nothing is recorded.
 */
export function HeroDemo() {
  const [seed, setSeed] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Species | null>(null);
  // Rolled after mount so server and browser renders agree; the egg is visible from the first paint.
  useEffect(() => {
    const s = demoSeed();
    setSeed(s);
    setResult(rollDemo(s));
  }, []);

  // After first paint: fetch the reveal code, then warm only the rolled rarity's clip (if configured).
  useEffect(() => {
    whenIdle(() => void Promise.all([loadReveal(), loadArt(), loadShare()]).catch(() => {}));
  }, []);
  useEffect(() => {
    const clip = result ? clipFor(result) : null;
    if (!clip) return;
    whenIdle(() => {
      const v = document.createElement("video");
      v.preload = "auto";
      v.muted = true;
      v.src = clip;
    });
  }, [result]);

  const hatch = () => result && setPhase("hatching");
  const finish = () => setPhase("done");
  const clip = result ? clipFor(result) : null;

  return (
    <div className="w-full" data-testid="hero-demo" data-phase={phase}>
      {phase !== "done" || !result ? (
        <div className="flex items-center justify-center gap-4 lg:justify-start">
          <div className="relative h-28 w-24 shrink-0 sm:h-32 sm:w-28" aria-hidden>
            <EggArt stage={3} progress={0.92} seed={seed ?? 7} className="h-full w-full" />
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="rounded-full border border-amber-300/40 bg-black/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200" data-testid="hero-demo-label">
              Demo · simulated
            </span>
            <button
              type="button"
              onClick={hatch}
              disabled={!result}
              className="sl-btn-gold group inline-flex items-center gap-3 whitespace-nowrap rounded-full px-9 py-4 font-sans text-base font-semibold tracking-[0.2em] disabled:opacity-80"
              data-testid="hero-hatch"
            >
              HATCH IT
              <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </button>
          </div>
        </div>
      ) : (
        <DemoResult species={result} />
      )}

      {phase === "hatching" && result && seed !== null && (clip ? <ClipHatch src={clip} onEnd={finish} /> : <HatchReveal species={result} seed={seed} onHatched={() => {}} onClose={finish} onView={finish} closeLabel="Back to the egg" share={demoShareable(result) ? { kind: "demo", speciesId: result.id, stage: 0 } : null} />)}
    </div>
  );
}

/** The hatched demo creature with its rarity, name and form, then the two next steps. */
function DemoResult({ species }: { species: Species }) {
  return (
    <div className="flex items-center justify-center gap-4 lg:justify-start" data-testid="hero-demo-result">
      <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
        <CreatureArt species={species} stage={0} animated={false} />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-1.5 text-left">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200">Demo · simulated</span>
        <p className="font-display text-2xl leading-tight text-bone">{species.name}</p>
        <p className="flex flex-wrap items-center gap-2 text-xs text-mist">
          <RarityBadge rarity={species.rarity} /> {gameConfig.evolution.names[0]}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {demoShareable(species) && <ShareButton target={{ kind: "demo", speciesId: species.id, stage: 0 }} speciesId={species.id} className="px-4 py-2" />}
          <Link href="/hatchery?demo=1" className="whitespace-nowrap text-sm text-sol-green/90 underline-offset-4 hover:underline" data-testid="hero-keep-going">
            Keep going in the Hatchery →
          </Link>
        </div>
      </div>
    </div>
  );
}

/** The owner's hatch clip for the rolled rarity: muted, inline, poster first; tap or end to continue. */
function ClipHatch({ src, onEnd }: { src: string; onEnd(): void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    ref.current?.play().catch(onEnd);
  }, [onEnd]);
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/90 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Hatching" onClick={onEnd}>
      <video ref={ref} src={src} poster={HATCH_POSTER ?? undefined} muted playsInline autoPlay onEnded={onEnd} onError={onEnd} className="max-h-[80vh] w-full max-w-xl" />
    </div>,
    document.body,
  );
}

/** The first frame of the hatch, shown instantly on the tap while the full reveal loads. */
function RevealPoster() {
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/90 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Hatching">
      <div className="h-56 w-44 sm:h-72 sm:w-56" aria-hidden>
        <EggArt stage={4} progress={1} seed={3} hatching className="h-full w-full" />
      </div>
    </div>,
    document.body,
  );
}
