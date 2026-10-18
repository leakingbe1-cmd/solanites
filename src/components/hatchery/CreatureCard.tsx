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
      onMouseEnter={() => sfx.hover()}
      className="sl-card-hover group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 text-left hover:border-white/15"
    >
      <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60" style={{ background: meta.color }} />
      <div className="relative flex items-center justify-between">
        <RarityBadge rarity={s.rarity} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-mist/70">{record.backed ? evo.label : "Dormant"}</span>
      </div>
      <div className="sl-art-host relative mx-auto mt-1 aspect-square w-full max-w-[240px]" style={{ "--sl-glow": meta.glow } as React.CSSProperties}>
        <CreatureArt species={s} stage={evo.stage} />
      </div>
      <p className="relative font-display text-xl text-white">{record.nickname ?? s.name}</p>
      <p className="relative text-xs text-mist">{record.nickname ? s.name : s.epithet}</p>
      <div className="relative mt-4">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-mist/70">
          <span>{evo.isFinal ? "Final rank" : `→ ${evo.nextLabel}`}</span>
          <span>{evo.isFinal ? "MAX" : formatDuration(evo.toNextMs)}</span>
        </div>
        <ProgressBar value={evo.toNextProgress} className="mt-2" colors={[meta.color2, meta.color]} />
      </div>
    </button>
  );
}
