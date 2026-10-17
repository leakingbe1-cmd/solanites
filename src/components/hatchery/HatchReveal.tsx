"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { BurstCanvas } from "@/components/ui/BurstCanvas";
import { RARITIES } from "@/lib/rarity";
import type { Species } from "@/lib/species";
import { sfx } from "@/lib/sound";

type Phase = "charge" | "burst" | "reveal";

/** Charge-up timing grows with rarity so rare hatches feel heavier. */
const CHARGE_MS: Record<Species["rarity"], number> = { common: 2200, rare: 2600, epic: 3000, legendary: 3600, mythic: 4000, secret: 4600 };

interface HatchRevealProps {
  species: Species;
  seed: number;
  onHatched(): void;
  onClose(): void;
  onView(): void;
}

/**
 * The hatching event. Darkness, a single light, a trembling egg, a measured
 * flash, then the creature emerging from shadow. Each tier earns one
 * signature: a gilded ring (Legendary), a starfield (Mythic), an inversion
 * (Secret). Particles are reserved for Epic and above.
 */
export function HatchReveal({ species, seed, onHatched, onClose, onView }: HatchRevealProps) {
  const [phase, setPhase] = useState<Phase>("charge");
  const [burst, setBurst] = useState(0);
  const meta = RARITIES[species.rarity];
  const tier = species.rarity;
  const particles = tier === "epic" || tier === "legendary" || tier === "mythic" || tier === "secret";
  const charge = CHARGE_MS[tier];

  useEffect(() => {
    sfx.rumble();
    const cracks = [0.35, 0.6, 0.8, 0.93].map((f, i) => setTimeout(() => sfx.crack(0.5 + i * 0.15), charge * f));
    const t1 = setTimeout(() => {
      setPhase("burst");
      setBurst(Date.now());
      sfx.burst();
      onHatched();
    }, charge);
    const t2 = setTimeout(() => {
      setPhase("reveal");
      sfx.reveal(tier);
    }, charge + 700);
    return () => [t1, t2, ...cracks].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colors = tier === "secret" ? ["#86ecca", "#a98bff", "#ffffff"] : [meta.color, "#ffffff"];

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-hidden bg-[#030304]" role="dialog" aria-modal="true" aria-label="Hatching">
      {/* overhead light */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-20%] h-[90%] w-[70vmin] -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-[2000ms]"
        style={{ background: phase === "reveal" ? meta.glow : "rgba(185,182,255,0.06)", opacity: phase === "charge" ? 0.8 : 1 }}
      />
      {tier === "mythic" && phase === "reveal" && (
        <div className="sl-fade-in absolute inset-0 opacity-40" style={{ animationDuration: "3s", backgroundImage: "radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 20%, #fff, transparent), radial-gradient(1px 1px at 40% 70%, #dfe4ff, transparent), radial-gradient(1px 1px at 85% 60%, #fff, transparent), radial-gradient(1px 1px at 10% 80%, #fff, transparent), radial-gradient(1px 1px at 55% 45%, #e6dcff, transparent)", backgroundSize: "340px 340px" }} />
      )}
      {particles && <BurstCanvas colors={colors} count={tier === "epic" ? 70 : 120} trigger={burst} />}
      {phase !== "charge" && (
        <div className="sl-flash pointer-events-none absolute inset-0" style={{ background: tier === "secret" ? "#e9fff6" : `radial-gradient(circle at 50% 46%, #ffffff, ${meta.color} 22%, transparent 62%)`, mixBlendMode: tier === "secret" ? "difference" : "normal" }} />
      )}

      <div className="relative flex h-full flex-col items-center justify-center px-4">
        {phase === "charge" && (
          <div className="flex flex-col items-center">
            <div className="h-[48vh] max-h-[440px] w-[78vw] max-w-[350px]">
              <EggArt stage={4} seed={seed} hatching inside={species} />
            </div>
            <p className="sl-label sl-fade-in mt-10" style={{ animationDelay: "0.6s" }}>
              The shell is giving way
            </p>
          </div>
        )}

        {phase === "reveal" && (
          <div className="flex w-full max-w-2xl flex-col items-center text-center">
            <p className="sl-letter text-[11px] uppercase" style={{ color: meta.color }}>
              {tier === "secret" ? "Secret · Unindexed" : meta.label}
            </p>
            <div className="relative mt-2 aspect-square w-[80vw] max-w-[440px]">
              {tier === "legendary" && (
                <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
                  <circle cx="200" cy="196" r="166" fill="none" stroke={meta.color} strokeOpacity="0.5" strokeWidth="0.8" className="sl-draw" transform="rotate(-90 200 196)" />
                </svg>
              )}
              <div className="sl-emerge absolute inset-0">
                <CreatureArt species={species} stage={0} showAura={tier !== "legendary"} />
              </div>
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="sl-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
            <h2 className="sl-display sl-fade-up text-6xl text-platinum sm:text-7xl" style={{ animationDelay: "1.4s" }}>
              {species.name}
            </h2>
            <p className="sl-fade-up mt-3 font-display text-xl italic text-silver" style={{ animationDelay: "1.6s" }}>
              {species.epithet}
            </p>
            <p className="sl-fade-up mt-5 max-w-md text-sm leading-relaxed text-mist" style={{ animationDelay: "1.8s" }}>
              {species.anatomy}
            </p>
            <p className="sl-fade-up mt-5 text-[10px] uppercase tracking-[0.3em] text-dim" style={{ animationDelay: "1.9s" }}>
              {species.element} · {species.personality.join(" · ")}
            </p>
            <div className="sl-fade-up mt-11 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "2.2s" }}>
              <button onClick={onView} className="sl-btn sl-btn-primary px-9 py-4">
                Meet your Solanite
              </button>
              <button onClick={onClose} className="sl-btn sl-btn-ghost px-9 py-4">
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
