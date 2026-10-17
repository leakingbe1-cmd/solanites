"use client";

import { EggArt } from "@/components/egg/EggArt";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { gameConfig } from "@/config/gameConfig";
import { formatDuration } from "@/lib/format";
import { EGG_STAGE_NAMES, eggStage, incubationProgress, stageProgress, timeToHatch, type SolaniteRecord } from "@/lib/progression";
import { SPECIES_BY_ID } from "@/lib/species";

const STAGE_COPY = [
  "",
  "The shell is cool and quiet. Something inside is listening to your wallet.",
  "The shell has warmed. Hairline fissures hold a thread of light.",
  "It moves. A shadow presses against the shell, restless and close.",
  "The shell can no longer hold it. Your Solanite is ready to meet you.",
];

/**
 * The incubation chamber: one egg, lit from above, with its instruments.
 * Used inline as the Hatchery's focal point.
 */
export function EggInspector({ record, simNow, index, onHatch }: { record: SolaniteRecord; simNow: number; index?: number; onHatch(): void }) {
  const cfg = gameConfig;
  const stage = eggStage(record, cfg);
  const progress = incubationProgress(record, cfg);
  const ready = stage === 4;
  const policyText = { pause: "Progress is paused until your balance is restored.", reset: "Progress resets to zero while your balance is below the threshold.", continue: "Progress continues regardless of balance." }[cfg.policies.belowThreshold];

  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr]">
      {/* the specimen */}
      <div className="relative flex min-h-[420px] items-end justify-center overflow-hidden px-6 pb-10 pt-14 sm:min-h-[520px]">
        <div className="pointer-events-none absolute left-1/2 top-[-12%] h-[70%] w-[60%] -translate-x-1/2 rounded-full bg-[#b9b6ff]/[0.07] blur-3xl" />
        <div className="absolute inset-x-[16%] bottom-8 h-10">
          <div className="sl-plinth h-full w-full" />
          <div className="absolute inset-x-[16%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
        <div className="relative h-[340px] w-[270px] sm:h-[430px] sm:w-[340px]">
          <EggArt stage={stage} progress={stageProgress(record, cfg)} seed={record.seed} inside={SPECIES_BY_ID[record.speciesId]} paused={!record.backed} />
        </div>
      </div>

      {/* the instruments */}
      <div className="flex flex-col justify-center border-t border-line px-6 py-10 sm:px-10 lg:border-l lg:border-t-0">
        <p className="sl-label">
          {index !== undefined && <span className="mr-3 text-dim">Egg {String(index + 1).padStart(2, "0")}</span>}
          Stage {stage} of 4
        </p>
        <h2 className="sl-display mt-4 text-5xl text-platinum sm:text-6xl">{EGG_STAGE_NAMES[stage]}</h2>
        <p className="mt-4 max-w-sm leading-relaxed text-mist">{STAGE_COPY[stage]}</p>

        {/* stage stepper */}
        <div className="mt-8 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s}>
              <div className={`h-px ${s <= stage ? "bg-platinum" : "bg-white/10"}`} />
              <p className={`mt-2.5 text-[9px] uppercase tracking-[0.2em] ${s === stage ? "text-platinum" : s < stage ? "text-mist" : "text-dim"}`}>{EGG_STAGE_NAMES[s]}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-8">
          <ProgressRing value={progress} size={132}>
            <span className="sl-display text-4xl text-platinum">{Math.floor(progress * 100)}</span>
            <span className="text-[9px] uppercase tracking-[0.28em] text-dim">percent</span>
          </ProgressRing>
          <dl className="grid min-w-[200px] flex-1 gap-3.5 text-sm">
            {[
              ["Qualifying hold", formatDuration(record.incubationMs)],
              ["Time to hatch", ready ? "Now" : formatDuration(timeToHatch(record, cfg))],
              ["Egg age", formatDuration(simNow - record.acquiredAt)],
              ["Rarity", "Sealed"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <dt className="text-mist">{k}</dt>
                <dd className={k === "Rarity" ? "text-silver" : "sl-num text-[13px] text-platinum"}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {!record.backed && <p className="mt-8 border-l border-ember/60 pl-4 text-sm leading-relaxed text-silver">This egg isn&apos;t backed by your current balance. {policyText}</p>}
        {ready ? (
          <button onClick={onHatch} className="sl-btn sl-btn-primary mt-10 w-full py-4 sm:w-auto sm:px-12">
            Hatch your Solanite
          </button>
        ) : (
          <p className="mt-8 max-w-sm text-xs leading-relaxed text-dim">
            Estimates assume your balance stays at or above {cfg.token.tokensPerEgg.toLocaleString()} tokens per egg. Rarity is sealed when the egg is granted and revealed at hatch.
          </p>
        )}
      </div>
    </div>
  );
}
