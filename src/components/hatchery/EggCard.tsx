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
      className={`sl-card-hover group relative cursor-pointer overflow-hidden rounded-md border bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-3 outline-none sm:p-5 focus-visible:ring-2 focus-visible:ring-gilt ${
        ready ? "border-sol-green/40 shadow-[0_0_60px_-20px_rgba(20,241,149,0.6)]" : "border-white/[0.07] hover:border-white/15"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist/70 sm:tracking-[0.25em]">Egg #{String(index + 1).padStart(2, "0")}</span>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider sm:px-2.5 sm:text-[10px] ${
            paused ? "bg-amber-400/10 text-amber-300" : ready ? "bg-sol-green/15 text-sol-green" : "bg-white/5 text-bone/70"
          }`}
        >
          {badge ?? (paused ? "Paused" : EGG_STAGE_NAMES[stage])}
        </span>
      </div>
      <div className="relative mx-auto mt-2 h-32 w-full sm:h-52 transition-transform duration-500 group-hover:scale-[1.04]">
        <EggArt stage={stage} progress={stageProgress(record, gameConfig)} seed={record.seed} inside={SPECIES_BY_ID[record.speciesId]} paused={paused} />
      </div>
      <div className="mt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <span className="font-display text-xl text-bone sm:text-2xl">{(progress * 100).toFixed(1)}%</span>
          <span className="font-mono text-[10px] text-mist sm:text-xs">{ready ? "Ready" : `${formatDuration(timeToHatch(record, gameConfig))} left`}</span>
        </div>
        <ProgressBar value={progress} className="mt-2.5" colors={ready ? ["#14f195", "#9fffd8"] : paused ? ["#6b6b80", "#a0a0b0"] : ["#a8692a", "#f6d488"]} />
        <p className="mt-2.5 font-mono text-[10px] uppercase tracking-wider text-mist/60">{footnote ?? `Held ${formatDuration(record.incubationMs)}`}</p>
      </div>
      {ready && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHatch();
          }}
          className="sl-btn-gold mt-3 w-full rounded-full py-2.5 font-sans text-[11px] font-semibold tracking-[0.18em] sm:mt-4 sm:py-3 sm:text-xs sm:tracking-[0.25em]"
        >
          HATCH NOW
        </button>
      )}
    </div>
  );
}
