"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { CreatureScene } from "@/components/creature/CreatureScene";
import { EggArt } from "@/components/egg/EggArt";
import { HATCH_CLIP_BURST_MS, HATCH_CLIP_CREATURE_MS, HATCH_POSTER, type HatchClip } from "@/config/hatchClips";
import { hatchClipFor } from "@/lib/hatchClip";
import { RARITIES } from "@/lib/rarity";
import { ELEMENT_GLYPH, type Species } from "@/lib/species";
import { sfx } from "@/lib/sound";
import { ShareButton } from "@/components/share/ShareButton";
import { DemoTag } from "@/components/ui/DemoTag";
import type { ShareTarget } from "@/lib/share";

type Phase = "charge" | "burst" | "clip" | "reveal";

/** Charge-up timing grows with rarity so rare hatches feel heavier. */
const CHARGE_MS: Record<Species["rarity"], number> = { common: 1800, rare: 2200, epic: 2600, legendary: 3200, mythic: 3600, secret: 4200 };
/** A clip that hasn't started playing by then is dropped for the built-in hatch. */
const CLIP_STALL_MS = 10_000;

interface HatchRevealProps {
  species: Species;
  seed: number;
  onHatched(): void;
  onClose(): void;
  onView(): void;
  /** Offered after the reveal: the server card for a tracked egg, or a DEMO card. */
  share?: ShareTarget | null;
  /** Label of the closing button (the homepage demo says where it returns). */
  closeLabel?: string;
  /** A simulated result (homepage or Hatchery demo): labelled so a screenshot can't pass for a real hatch. */
  demo?: boolean;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The hatch, shown once the result is known (the server's for a real egg). With an owner clip for
 * the species it plays the clip, fades the creature in over its glow and then shows who hatched;
 * under reduced motion it shows the clip's last frame and the creature at once. Without a clip, or if
 * the clip fails or stalls, it plays the built-in hatch.
 */
export function HatchReveal({ species, seed, onHatched, onClose, onView, share, closeLabel = "Back to Hatchery", demo = false }: HatchRevealProps) {
  const clip = hatchClipFor(species.id);
  const [mode, setMode] = useState<"clip" | "still" | "builtin">(() => (!clip ? "builtin" : reducedMotion() ? "still" : "clip"));
  const [phase, setPhase] = useState<Phase>(mode === "clip" ? "clip" : mode === "still" ? "reveal" : "charge");
  const meta = RARITIES[species.rarity];
  const charge = CHARGE_MS[species.rarity];
  const hatched = useRef(false);
  const hatchOnce = () => {
    if (hatched.current) return;
    hatched.current = true;
    onHatched();
  };

  useEffect(() => {
    if (mode === "still") {
      hatchOnce();
      sfx.reveal(species.rarity);
      return;
    }
    if (mode !== "builtin") return;
    setPhase("charge");
    sfx.rumble();
    const cracks = [0.3, 0.55, 0.75, 0.9].map((f, i) => setTimeout(() => sfx.crack(0.6 + i * 0.15), charge * f));
    const t1 = setTimeout(() => {
      setPhase("burst");
      sfx.burst();
      hatchOnce();
    }, charge);
    const t2 = setTimeout(() => {
      setPhase("reveal");
      sfx.reveal(species.rarity);
    }, charge + 450);
    return () => [t1, t2, ...cracks].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Once revealed (the hatch is already recorded), Escape returns to the Hatchery.
  useEffect(() => {
    if (phase !== "reveal") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  const reveal = () => {
    hatchOnce();
    setPhase("reveal");
    sfx.reveal(species.rarity);
  };

  if (clip && mode !== "builtin")
    return createPortal(
      <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/90 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Hatching" data-hatch={mode} data-clip={clip.name}>
        <div className="flex min-h-full flex-col items-center px-4 pb-10 pt-[9vh] text-center">
          {demo && <DemoTag className="mb-3" testId="reveal-demo-label" />}
          {/* kept at its height during the clip, so the clip and the creature never move */}
          <p className="sl-letter h-5 font-display text-xs font-semibold uppercase sm:text-sm" style={{ color: meta.color, textShadow: `0 0 24px ${meta.glow}` }}>
            {phase === "reveal" && (species.rarity === "secret" ? "▚ SECRET ▞" : meta.label)}
          </p>
          <div className="relative mt-2 aspect-square w-[78vw] max-w-[400px] overflow-hidden rounded-md bg-black">
            {phase === "clip" ? (
              <ClipPlayer clip={clip} species={species} onBurst={() => (sfx.burst(), hatchOnce())} onEnd={reveal} onFail={() => setMode("builtin")} />
            ) : (
              <ClipStill clip={clip} species={species} />
            )}
          </div>
          {phase === "reveal" && <RevealDetails species={species} share={share} closeLabel={closeLabel} onView={onView} onClose={onClose} />}
        </div>
      </div>,
      document.body,
    );

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-hidden bg-black/90 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Hatching" data-hatch="builtin">
      {/* no rarity atmosphere, rays, nebula or particle burst behind the creature (approved art canon W2) */}
      {phase !== "charge" && <div className="sl-flash pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 50% 45%, #fff, ${meta.color} 30%, transparent 70%)` }} />}

      <div className="relative flex h-full flex-col items-center justify-center px-4">
        {phase === "charge" && (
          <div className="flex flex-col items-center">
            <p className="sl-fade-in mb-6 font-mono text-[11px] uppercase tracking-[0.5em] text-bone/60">Something is breaking through…</p>
            <div className="h-[46vh] max-h-[420px] w-[80vw] max-w-[360px]">
              <EggArt stage={4} seed={seed} hatching inside={species} />
            </div>
          </div>
        )}

        {phase === "reveal" && (
          <div className="flex w-full max-w-xl flex-col items-center text-center">
            {demo && <DemoTag className="mb-3" testId="reveal-demo-label" />}
            <p className="sl-letter font-display text-xs font-semibold uppercase sm:text-sm" style={{ color: meta.color, textShadow: `0 0 24px ${meta.glow}` }}>
              {species.rarity === "secret" ? "▚ SECRET ▞" : meta.label}
            </p>
            <div className="sl-pop relative mt-2 aspect-square w-[78vw] max-w-[400px]" style={{ animationDelay: "0.05s" }}>
              <CreatureScene species={species} stage={0} size="feature" className="absolute inset-0 rounded-md" />
            </div>
            <RevealDetails species={species} share={share} closeLabel={closeLabel} onView={onView} onClose={onClose} />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** The owner's clip: muted, inline, poster first, webm then mp4. The creature fades in over the glow at 4.4 s. */
function ClipPlayer({ clip, species, onBurst, onEnd, onFail }: { clip: HatchClip; species: Species; onBurst(): void; onEnd(): void; onFail(): void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [creature, setCreature] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(onFail);
    let burst = false;
    let raf = 0;
    // Polled each frame (timeupdate is only ~4 Hz), so the burst lands on the clip's frame 100.
    const tick = () => {
      const ms = v.currentTime * 1000;
      if (!burst && ms >= HATCH_CLIP_BURST_MS) {
        burst = true;
        onBurst();
      }
      if (ms >= HATCH_CLIP_CREATURE_MS) setCreature(true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const stall = window.setTimeout(() => v.currentTime === 0 && onFail(), CLIP_STALL_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(stall);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <video ref={ref} poster={HATCH_POSTER} muted playsInline autoPlay preload="auto" onEnded={onEnd} onError={onFail} onClick={onEnd} className="absolute inset-0 h-full w-full object-cover" data-testid="hatch-clip">
        <source src={clip.webm} type="video/webm" />
        {/* the last source failing means neither format played */}
        <source src={clip.mp4} type="video/mp4" onError={onFail} />
      </video>
      {creature && <ClipCreature species={species} />}
    </>
  );
}

/** The clip's last frame with the creature over its glow: the end of the clip, and the whole hatch under reduced motion. */
function ClipStill({ clip, species }: { clip: HatchClip; species: Species }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={clip.end} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <ClipCreature species={species} still />
    </>
  );
}

function ClipCreature({ species, still = false }: { species: Species; still?: boolean }) {
  return (
    <div className={`absolute left-1/2 top-[55%] aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 ${still ? "" : "sl-fade-in"}`} data-testid="hatch-creature">
      <CreatureArt species={species} stage={0} animated={false} showAura={false} />
    </div>
  );
}

function RevealDetails({ species, share, closeLabel, onView, onClose }: { species: Species; share?: ShareTarget | null; closeLabel: string; onView(): void; onClose(): void }): ReactNode {
  return (
    <>
      <h2 className="sl-fade-up sl-display-l text-bone" style={{ animationDelay: "0.5s" }}>
        {species.name}
      </h2>
      <p className="sl-fade-up mt-2 text-mist" style={{ animationDelay: "0.65s" }}>
        {species.epithet}
      </p>
      <div className="sl-fade-up mt-5 flex flex-wrap justify-center gap-2" style={{ animationDelay: "0.8s" }}>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-bone/80">
          {ELEMENT_GLYPH[species.element]} {species.element}
        </span>
        {species.personality.map((p) => (
          <span key={p} className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist">
            {p}
          </span>
        ))}
      </div>
      <div className="sl-fade-up mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "1s" }}>
        <button onClick={onView} className="sl-btn-outline rounded-full px-8 py-3.5 font-sans text-xs font-semibold tracking-[0.2em] text-bone">
          MEET YOUR SOLANITE
        </button>
        {share && <ShareButton target={share} speciesId={species.id} />}
        <button onClick={onClose} className="rounded-full border border-white/15 px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-mist transition hover:text-bone">
          {closeLabel}
        </button>
      </div>
    </>
  );
}
