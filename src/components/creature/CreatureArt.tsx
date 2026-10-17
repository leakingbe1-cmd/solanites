"use client";

import { useId, type ComponentType } from "react";
import type { BodyPlan, Species } from "@/lib/species";
import { RARITIES } from "@/lib/rarity";
import { KitDefs, type ArtCtx } from "./kit";
import { Driftfin, Mossling } from "./species/common";
import { Cryovant, Duskwing } from "./species/rare";
import { Aurorath, Neonyx } from "./species/epic";
import { Aurelion, Pyraurum } from "./species/legendary";
import { Astravex, Orbelith } from "./species/mythic";
import { Genesis, Nullborn } from "./species/secret";

/**
 * Renders a Solanite specimen.
 *
 * Every species has its own hand-built body plan (see ./species), drawn with
 * a shared lighting kit so the collection reads as one archive. `stage`
 * (0 Hatchling … 3 Apex) changes proportions and grows anatomy (crests,
 * crystals, armour, feathers) rather than just scaling the drawing.
 */

interface CreatureArtProps {
  species: Species;
  /** Evolution stage 0 (Hatchling) … 3 (Apex). */
  stage?: number;
  animated?: boolean;
  /** Draw the presentation light and rarity treatment behind the specimen. */
  showAura?: boolean;
  /** Renders the creature as a dark silhouette (undiscovered / inside egg). */
  silhouette?: boolean;
  className?: string;
}

const ART: Record<BodyPlan, ComponentType<ArtCtx>> = {
  shellback: Mossling,
  veilfin: Driftfin,
  cloakwing: Duskwing,
  crystalstag: Cryovant,
  hoodserpent: Neonyx,
  skyray: Aurorath,
  regaldragon: Aurelion,
  bladephoenix: Pyraurum,
  orbitalconstruct: Astravex,
  voidwhale: Orbelith,
  prismform: Genesis,
  nullmoth: Nullborn,
};

/** Creatures that hover rather than stand: their shadow sits further below. */
const FLOATING: BodyPlan[] = ["veilfin", "skyray", "orbitalconstruct", "voidwhale", "prismform", "nullmoth"];

export function CreatureArt({ species, stage = 2, animated = true, showAura = true, silhouette = false, className = "" }: CreatureArtProps) {
  const raw = useId();
  const id = "sl" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const evo = Math.max(0, Math.min(3, Math.round(stage)));
  const p = species.palette;
  const Art = ART[species.bodyPlan];
  const scale = [0.66, 0.8, 0.92, 1][evo];
  const floating = FLOATING.includes(species.bodyPlan);

  return (
    <svg
      viewBox="0 0 400 400"
      className={`sl-creature ${animated ? "is-animated" : ""} rar-${species.rarity} ${silhouette ? "is-silhouette" : ""} ${className}`}
      role="img"
      aria-label={silhouette ? "Unrecorded Solanite" : `${species.name}, ${RARITIES[species.rarity].label} ${species.element} Solanite`}
    >
      <KitDefs id={id} p={p} />
      {showAura && !silhouette && <Presentation id={id} species={species} evo={evo} />}
      <ellipse cx="200" cy={floating ? 372 : 352} rx={(floating ? 70 : 120) * scale} ry={floating ? 7 : 10} fill="#000" opacity={floating ? 0.45 : 0.7} filter={`url(#${id}-soft)`} />
      <g transform={`translate(200 352) scale(${scale}) translate(-200 -352)`}>
        <g className={floating ? "sl-float" : "sl-breathe"} style={{ transformOrigin: "200px 352px" }}>
          <Art id={id} p={p} evo={evo} species={species} />
        </g>
      </g>
    </svg>
  );
}

/**
 * Restrained presentation light. Rarity is mostly carried by the anatomy;
 * this layer only adds a quiet, tier-specific frame.
 */
function Presentation({ id, species, evo }: { id: string; species: Species; evo: number }) {
  const r = RARITIES[species.rarity];
  const tier = species.rarity;
  return (
    <g aria-hidden>
      <defs>
        <radialGradient id={`${id}-spot`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={r.color} stopOpacity={tier === "common" ? 0.1 : 0.16} />
          <stop offset="0.55" stopColor={r.color} stopOpacity={tier === "common" ? 0.04 : 0.06} />
          <stop offset="1" stopColor={r.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill={`url(#${id}-spot)`} />
      {(tier === "legendary" || tier === "mythic") && (
        <g fill="none" stroke={r.color} className="sl-ring">
          <circle cx="200" cy="196" r="164" strokeOpacity="0.28" strokeWidth="0.8" />
          <circle cx="200" cy="196" r="156" strokeOpacity="0.12" strokeWidth="0.6" strokeDasharray="1 5" />
        </g>
      )}
      {tier === "mythic" && <circle cx="200" cy="196" r="150" fill={`url(#${id}-stars)`} opacity="0.4" className="sl-twinkle" />}
    </g>
  );
}
