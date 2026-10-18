"use client";

import { EggArt } from "@/components/egg/EggArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gameConfig } from "@/config/gameConfig";
import { formatDuration } from "@/lib/format";
import { EGG_STAGE_NAMES, eggStage, incubationProgress, stageProgress, timeToHatch, type SolaniteRecord } from "@/lib/progression";
import { SPECIES_BY_ID } from "@/lib/species";
import { sfx } from "@/lib/sound";

export function EggCard({
  record,
  index,
  onOpen,
  onHatch,
  badge,
  footnote,
}: {
  record: SolaniteRecord;
  index: number;
  onOpen(): void;
  onHatch(): void;
  /** Overrides the stage badge, e.g. "Queued" for a tracked egg waiting its turn. */
  badge?: string;
  /** Overrides the "Held …" line. */
  footnote?: string;
}) {
  const stage = eggStage(record, gameConfig);
  const progress = incubationProgress(record, gameConfig);
  const ready = stage === 4;
  const paused = !record.backed;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        sfx.click();
        onOpen();
      }}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      onMouseEnter={() => sfx.hover()}
      className={`sl-card-hover group relative cursor-pointer overflow-hidden rounded-3xl border bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 outline-none focus-visible:ring-2 focus-visible:ring-sol-purple ${
        ready ? "border-sol-green/40 shadow-[0_0_60px_-20px_rgba(20,241,149,0.6)]" : "border-white/[0.07] hover:border-white/15"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">Egg #{String(index + 1).padStart(2, "0")}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
            paused ? "bg-amber-400/10 text-amber-300" : ready ? "bg-sol-green/15 text-sol-green" : "bg-white/5 text-white/70"
          }`}
        >
          {badge ?? (paused ? "Paused" : EGG_STAGE_NAMES[stage])}
        </span>
      </div>
      <div className="relative mx-auto mt-2 h-52 w-full transition-transform duration-500 group-hover:scale-[1.04]">
        <EggArt stage={stage} progress={stageProgress(record, gameConfig)} seed={record.seed} inside={SPECIES_BY_ID[record.speciesId]} paused={paused} />
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-2xl text-white">{(progress * 100).toFixed(1)}%</span>
          <span className="font-mono text-xs text-mist">{ready ? "Ready" : `${formatDuration(timeToHatch(record, gameConfig))} left`}</span>
        </div>
        <ProgressBar value={progress} className="mt-2.5" colors={ready ? ["#14f195", "#9fffd8"] : paused ? ["#6b6b80", "#a0a0b0"] : ["#9945ff", "#14f195"]} />
        <p className="mt-2.5 font-mono text-[10px] uppercase tracking-wider text-mist/60">{footnote ?? `Held ${formatDuration(record.incubationMs)}`}</p>
      </div>
      {ready && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHatch();
          }}
          className="sl-btn-primary mt-4 w-full rounded-2xl py-3 font-display text-xs font-semibold tracking-[0.25em] text-white"
        >
          HATCH NOW
        </button>
      )}
    </div>
  );
}
