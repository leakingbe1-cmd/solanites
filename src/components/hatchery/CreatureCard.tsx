"use client";

import { CreatureArt } from "@/components/creature/CreatureArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { gameConfig } from "@/config/gameConfig";
import { formatDuration } from "@/lib/format";
import { evolutionOf, type SolaniteRecord } from "@/lib/progression";
import { RARITIES } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";
import { sfx } from "@/lib/sound";

/** A hatched Solanite as a specimen plate. */
export function CreatureCard({ record, onOpen }: { record: SolaniteRecord; onOpen(): void }) {
  const s = SPECIES_BY_ID[record.speciesId];
  const evo = evolutionOf(record.growthMs, gameConfig);
  const meta = RARITIES[s.rarity];
  return (
    <button
      onClick={() => {
        sfx.click();
        onOpen();
      }}
      className="group relative flex flex-col bg-void p-6 text-left transition-colors hover:bg-abyss sm:p-8"
    >
      <div className="flex items-baseline justify-between">
        <RarityBadge rarity={s.rarity} />
        <span className="text-[9px] uppercase tracking-[0.24em] text-mist">{record.backed ? evo.name : "Dormant"}</span>
      </div>
      <div className="relative mx-auto my-4 aspect-square w-full max-w-[300px] transition-transform duration-700 ease-out group-hover:scale-[1.03]">
        <CreatureArt species={s} stage={evo.stage} animated={false} />
      </div>
      <p className="font-display text-3xl text-platinum">{record.nickname ?? s.name}</p>
      <p className="mt-1 text-sm italic text-mist">{record.nickname ? s.name : s.epithet}</p>
      <div className="mt-6">
        <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-dim">
          <span>{evo.isMax ? "Apex form" : `Toward ${evo.nextName}`}</span>
          <span className="sl-num normal-case tracking-normal">{evo.isMax ? "—" : formatDuration(evo.remainingMs)}</span>
        </div>
        <ProgressBar value={evo.progress} className="mt-3" colors={[meta.color2, meta.color]} />
      </div>
    </button>
  );
}
