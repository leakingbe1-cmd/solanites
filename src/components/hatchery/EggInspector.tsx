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
  "Light is seeping through hairline fractures. The egg recognises its keeper.",
  "It moves. A silhouette presses against the shell, restless and close.",
  "The shell can no longer hold it. Your Solanite is ready to meet you.",
];

export function EggInspector({ record, simNow, onHatch }: { record: SolaniteRecord; simNow: number; onHatch(): void }) {
  const cfg = gameConfig;
  const stage = eggStage(record, cfg);
  const progress = incubationProgress(record, cfg);
  const ready = stage === 4;
  const policyText = { pause: "Progress pauses until your balance is restored.", reset: "Progress resets to zero while your balance is below the threshold.", continue: "Progress continues regardless of balance." }[cfg.policies.belowThreshold];

  return (
    <div className="grid md:grid-cols-[1fr_1.05fr]">
      <div className="relative flex items-center justify-center overflow-hidden p-8" style={{ background: "radial-gradient(circle at 50% 50%, rgba(153,69,255,0.25), transparent 70%)" }}>
        <div className="h-[340px] w-full max-w-[300px]">
          <EggArt stage={stage} progress={stageProgress(record, cfg)} seed={record.seed} inside={SPECIES_BY_ID[record.speciesId]} paused={!record.backed} />
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-sol-green/80">Stage {stage} of 4</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">{EGG_STAGE_NAMES[stage]}</h2>
        <p className="mt-2 leading-relaxed text-mist">{STAGE_COPY[stage]}</p>

        {/* stage stepper */}
        <div className="mt-6 grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div key={s}>
              <div className={`h-1 rounded-full ${s < stage ? "bg-sol-green" : s === stage ? "bg-gradient-to-r from-sol-purple to-sol-green" : "bg-white/10"}`} />
              <p className={`mt-2 font-mono text-[9px] uppercase tracking-wider ${s <= stage ? "text-white/80" : "text-mist/40"}`}>{EGG_STAGE_NAMES[s]}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center gap-6">
          <ProgressRing value={progress} size={116} colors={ready ? ["#14f195", "#9fffd8"] : ["#9945ff", "#14f195"]}>
            <span className="font-display text-xl text-white">{Math.floor(progress * 100)}%</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-mist">incubated</span>
          </ProgressRing>
          <dl className="grid flex-1 gap-3 text-sm">
            <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
              <dt className="text-mist">Qualifying hold</dt>
              <dd className="font-mono text-white">{formatDuration(record.incubationMs)}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
              <dt className="text-mist">Est. to hatch</dt>
              <dd className="font-mono text-white">{ready ? "Now" : formatDuration(timeToHatch(record, cfg))}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
              <dt className="text-mist">Egg age</dt>
              <dd className="font-mono text-white">{formatDuration(simNow - record.acquiredAt)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-mist">Rarity</dt>
              <dd className="font-mono text-white/70">??? sealed</dd>
            </div>
          </dl>
        </div>

        {!record.backed && (
          <p className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-relaxed text-amber-200/90">
            This egg isn&apos;t backed by your current balance. {policyText}
          </p>
        )}
        {ready ? (
          <button onClick={onHatch} className="sl-btn-primary mt-7 w-full rounded-2xl py-4 font-display text-sm font-semibold tracking-[0.25em] text-white">
            HATCH YOUR SOLANITE
          </button>
        ) : (
          <p className="mt-7 text-xs leading-relaxed text-mist/70">
            Estimates assume your balance stays at or above {cfg.token.tokensPerEgg.toLocaleString()} tokens per egg. Rarity is sealed when the egg is granted and revealed at hatch.
          </p>
        )}
      </div>
    </div>
  );
}
