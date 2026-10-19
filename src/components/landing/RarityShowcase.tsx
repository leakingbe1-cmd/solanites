"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { Modal } from "@/components/ui/Modal";
import { gameConfig } from "@/config/gameConfig";
import { CLASSIFIED_RARITIES } from "@/lib/discovery";
import { rarityChances } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { SPECIES_BY_ID, type Species } from "@/lib/species";

// The detail view is only needed after a click, so it stays out of the homepage bundle.
const CreatureDetail = dynamic(() => import("@/components/creature/CreatureDetail").then((m) => m.CreatureDetail), { ssr: false });

const FEATURED: Record<string, string> = {
  common: "mossling",
  rare: "duskwing",
  epic: "neonyx",
  legendary: "aurelion",
  // classified tiers show the generic sealed form: their real designs never ship to the browser
  mythic: "sealed-mythic",
  secret: "sealed-secret",
};

/**
 * One card per rarity tier. Each opens the same creature detail view the
 * Collection uses, so classified (Mythic/Secret) species stay classified there
 * too, and are drawn here as the generic sealed silhouette.
 */
export function RarityShowcase() {
  const chances = rarityChances(gameConfig);
  const [open, setOpen] = useState<Species | null>(null);
  return (
    <>
      <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {RARITY_ORDER.map((r) => {
          const meta = RARITIES[r];
          const s = SPECIES_BY_ID[FEATURED[r]];
          const classified = CLASSIFIED_RARITIES.includes(r);
          const c = chances[r] * 100;
          const rate = c < 1 ? c.toFixed(1) : String(Math.round(c));
          return (
            <button
              key={r}
              type="button"
              onClick={() => setOpen(s)}
              aria-label={`${classified ? `Classified ${meta.label} Solanite` : `${s.name}, ${meta.label}`}: ${rate}% hatch rate. View details`}
              className="sl-card-hover group relative flex flex-col overflow-hidden rounded-md border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-3 text-left transition-colors hover:border-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green/70 sm:p-4"
              style={{ boxShadow: `inset 0 1px 0 ${meta.color}22` }}
            >
              <span className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }} aria-hidden />
              <span
                className="sl-art-host relative -mx-2 -mt-1 block aspect-square sm:-mx-3"
                style={{ "--sl-glow": classified ? `${meta.color}55` : meta.glow } as React.CSSProperties}
                aria-hidden
              >
                <CreatureArt species={s} stage={2} silhouette={classified} showAura={!classified} animated={false} />
                {r === "secret" && <span className="absolute inset-0 grid place-items-center font-display text-4xl text-bone/80">?</span>}
              </span>
              <span className="relative mt-1 flex flex-1 flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: meta.color }}>
                  {meta.label}
                </span>
                <span className="mt-1 font-display text-base text-bone">{classified ? "Classified" : s.name}</span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-mist/80">{meta.tagline}</span>
                <span className="mt-4 flex items-baseline justify-between gap-2 font-mono text-[11px]">
                  <span className="text-bone/70">{rate}%</span>
                  <span className="text-bone/35 transition-colors group-hover:text-bone/70">
                    hatch rate<span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
                  </span>
                </span>
                {/* linear scale: the bar is the share of hatches, so the rarest tiers really are a sliver */}
                <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
                  <span className="block h-full min-w-[3px] rounded-full" style={{ width: `${c}%`, background: `linear-gradient(90deg, ${meta.color2}, ${meta.color})`, boxShadow: `0 0 8px ${meta.color}` }} />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} xl label="Solanite details">
        {open && <CreatureDetail key={open.id} species={open} onSelectSpecies={setOpen} />}
      </Modal>
    </>
  );
}
