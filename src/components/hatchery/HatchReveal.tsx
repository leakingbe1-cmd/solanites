"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { BurstCanvas } from "@/components/ui/BurstCanvas";
import { RARITIES } from "@/lib/rarity";
import { ELEMENT_GLYPH, type Species } from "@/lib/species";
import { sfx } from "@/lib/sound";

type Phase = "charge" | "burst" | "reveal";

/** Charge-up timing grows with rarity so rare hatches feel heavier. */
const CHARGE_MS: Record<Species["rarity"], number> = { common: 1800, rare: 2200, epic: 2600, legendary: 3200, mythic: 3600, secret: 4200 };

interface HatchRevealProps {
  species: Species;
  seed: number;
  onHatched(): void;
  onClose(): void;
  onView(): void;
}

export function HatchReveal({ species, seed, onHatched, onClose, onView }: HatchRevealProps) {
  const [phase, setPhase] = useState<Phase>("charge");
  const [burst, setBurst] = useState(0);
  const meta = RARITIES[species.rarity];
  const big = ["legendary", "mythic", "secret"].includes(species.rarity);
  const charge = CHARGE_MS[species.rarity];

  useEffect(() => {
    sfx.rumble();
    const cracks = [0.3, 0.55, 0.75, 0.9].map((f, i) => setTimeout(() => sfx.crack(0.6 + i * 0.15), charge * f));
    const t1 = setTimeout(() => {
      setPhase("burst");
      setBurst(Date.now());
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

  const colors = species.rarity === "secret" ? ["#14f195", "#9945ff", "#ff3df2", "#00c2ff", "#ffffff"] : [meta.color, meta.color2, "#ffffff"];

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-hidden bg-black/90 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Hatching">
      {/* rarity atmosphere */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: phase === "reveal" ? 1 : phase === "charge" ? 0.35 : 0.8, background: `radial-gradient(circle at 50% 45%, ${meta.glow}, transparent 60%)` }}
      />
      {phase === "reveal" && (big || species.rarity === "epic") && (
        <div
          className="sl-rays absolute left-1/2 top-[45%] h-[220vmax] w-[220vmax] opacity-50"
          style={{
            transform: "translate(-50%, -50%)",
            background:
              species.rarity === "secret"
                ? "repeating-conic-gradient(from 0deg, #14f19533 0deg 6deg, transparent 6deg 18deg, #ff3df233 18deg 24deg, transparent 24deg 36deg)"
                : `repeating-conic-gradient(from 0deg, ${meta.color}30 0deg 5deg, transparent 5deg 15deg)`,
            maskImage: "radial-gradient(circle, black 0%, transparent 45%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 45%)",
          }}
        />
      )}
      {species.rarity === "mythic" && phase === "reveal" && (
        <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(40rem 30rem at 30% 30%, #6c4bff33, transparent), radial-gradient(40rem 30rem at 70% 60%, #2fa8ff2a, transparent)" }} />
      )}
      <BurstCanvas colors={colors} count={big ? 320 : 160} trigger={burst} />
      {phase !== "charge" && <div className="sl-flash pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 50% 45%, #fff, ${meta.color} 30%, transparent 70%)` }} />}

      <div className="relative flex h-full flex-col items-center justify-center px-4">
        {phase === "charge" && (
          <div className="flex flex-col items-center">
            <p className="sl-fade-in mb-6 font-mono text-[11px] uppercase tracking-[0.5em] text-bone/60">Something is breaking through…</p>
            <div className="h-[46vh] max-h-[420px] w-[80vw] max-w-[360px]" style={{ filter: `drop-shadow(0 0 60px ${meta.glow})` }}>
              <EggArt stage={4} seed={seed} hatching inside={species} />
            </div>
          </div>
        )}

        {phase === "reveal" && (
          <div className="flex w-full max-w-xl flex-col items-center text-center">
            <p className="sl-letter font-display text-xs font-semibold uppercase sm:text-sm" style={{ color: meta.color, textShadow: `0 0 24px ${meta.glow}` }}>
              {species.rarity === "secret" ? "▚ SECRET ▞" : meta.label}
            </p>
            <div className="sl-pop relative mt-2 aspect-square w-[78vw] max-w-[400px]" style={{ animationDelay: "0.05s" }}>
              <CreatureArt species={species} stage={0} />
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
              <button onClick={onClose} className="rounded-full border border-white/15 px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-mist transition hover:text-bone">
                Back to Hatchery
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
