"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CreatureScene } from "@/components/creature/CreatureScene";
import { EggArt } from "@/components/egg/EggArt";
import { RARITIES } from "@/lib/rarity";
import { ELEMENT_GLYPH, type Species } from "@/lib/species";
import { sfx } from "@/lib/sound";
import { ShareButton } from "@/components/share/ShareButton";
import { DemoTag } from "@/components/ui/DemoTag";
import type { ShareTarget } from "@/lib/share";

type Phase = "charge" | "burst" | "reveal";

/** Charge-up timing grows with rarity so rare hatches feel heavier. */
const CHARGE_MS: Record<Species["rarity"], number> = { common: 1800, rare: 2200, epic: 2600, legendary: 3200, mythic: 3600, secret: 4200 };

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

export function HatchReveal({ species, seed, onHatched, onClose, onView, share, closeLabel = "Back to Hatchery", demo = false }: HatchRevealProps) {
  const [phase, setPhase] = useState<Phase>("charge");
  const meta = RARITIES[species.rarity];
  const charge = CHARGE_MS[species.rarity];

  useEffect(() => {
    sfx.rumble();
    const cracks = [0.3, 0.55, 0.75, 0.9].map((f, i) => setTimeout(() => sfx.crack(0.6 + i * 0.15), charge * f));
    const t1 = setTimeout(() => {
      setPhase("burst");
      sfx.burst();
      onHatched();
    }, charge);
    const t2 = setTimeout(() => {
      setPhase("reveal");
      sfx.reveal(species.rarity);
    }, charge + 450);
    return () => [t1, t2, ...cracks].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once revealed (the hatch is already recorded), Escape returns to the Hatchery.
  useEffect(() => {
    if (phase !== "reveal") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-hidden bg-black/90 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Hatching">
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
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
