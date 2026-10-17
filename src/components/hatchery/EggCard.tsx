"use client";

import { EggArt } from "@/components/egg/EggArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gameConfig } from "@/config/gameConfig";
import { formatDuration } from "@/lib/format";
import { EGG_STAGE_NAMES, eggStage, incubationProgress, stageProgress, timeToHatch, type SolaniteRecord } from "@/lib/progression";
import { SPECIES_BY_ID } from "@/lib/species";
import { sfx } from "@/lib/sound";

/** An egg slot in the chamber rack. Selecting it brings it under the light. */
export function EggCard({ record, index, selected, onSelect }: { record: SolaniteRecord; index: number; selected: boolean; onSelect(): void }) {
  const stage = eggStage(record, gameConfig);
  const progress = incubationProgress(record, gameConfig);
  const ready = stage === 4;
  const paused = !record.backed;
  return (
    <button
      onClick={() => {
        sfx.click();
        onSelect();
      }}
      aria-pressed={selected}
      className={`group relative flex flex-col bg-void p-5 text-left transition-colors ${selected ? "bg-panel" : "hover:bg-abyss"}`}
    >
      {selected && <span className="absolute inset-x-0 top-0 h-px bg-platinum" />}
      <div className="flex items-baseline justify-between">
        <span className="sl-num text-[10px] text-dim">{String(index + 1).padStart(2, "0")}</span>
        <span className={`text-[9px] uppercase tracking-[0.24em] ${paused ? "text-ember" : ready ? "text-platinum" : "text-mist"}`}>{paused ? "Paused" : EGG_STAGE_NAMES[stage]}</span>
      </div>
      <div className="relative mx-auto my-4 h-36 w-28 transition-transform duration-700 group-hover:-translate-y-1">
        <EggArt stage={stage} progress={stageProgress(record, gameConfig)} seed={record.seed} inside={SPECIES_BY_ID[record.speciesId]} paused={paused} animated={false} />
      </div>
      <div className="mt-auto">
        <div className="flex items-baseline justify-between">
          <span className="sl-display text-2xl text-platinum">{(progress * 100).toFixed(1)}%</span>
          <span className="sl-num text-[10px] text-mist">{ready ? "Ready" : formatDuration(timeToHatch(record, gameConfig))}</span>
        </div>
        <ProgressBar value={progress} className="mt-3" colors={paused ? ["#5c5e6c", "#8a8c9c"] : ["#9a8cff", "#ecedf3"]} />
      </div>
    </button>
  );
}
