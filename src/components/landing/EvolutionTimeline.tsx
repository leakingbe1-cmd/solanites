import { gameConfig } from "@/config/gameConfig";
import { eggProgression, fastTrackAfterMaturityMs, incubationMsFor, initialGrowthMsFor, isFastTrack } from "@/config/eggProgression";
import { formatNumber, formatSpan } from "@/lib/format";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/**
 * The whole life of a first creature as one timeline, every time read from the live config:
 * egg → Eggling → Hatchling → Evolved → Ascended (and its ranks). Times are holding time.
 * While the onboarding fast track is on, the first egg follows it, and the note gives the standard pace.
 */
export function EvolutionTimeline() {
  const [eggling, hatchling, evolved, ascended] = gameConfig.evolution.names;
  const fast = isFastTrack(1);
  const hatchMs = incubationMsFor(1);
  const growMs = initialGrowthMsFor(1);
  const [toEvolved, toAscended] = fast ? fastTrackAfterMaturityMs(gameConfig.evolution.afterMaturityMs.length) : gameConfig.evolution.afterMaturityMs;
  const [stdEvolved, stdAscended] = gameConfig.evolution.afterMaturityMs;
  const ranks = gameConfig.evolution.ascensionRanksMs;
  const lastIncubation = eggProgression.incubationScheduleMs.at(-1)!;
  const lastGrowth = eggProgression.initialGrowthScheduleMs.at(-1)!;
  const ft = eggProgression.fastTrack;
  const steps = [
    { at: "Start", name: "Egg", text: `Hold ${formatNumber(gameConfig.token.tokensPerEgg)} ${gameConfig.token.symbol} and an egg is yours. It incubates for ${formatSpan(hatchMs)}.` },
    { at: `+${formatSpan(hatchMs)}`, name: eggling, text: `It hatches and starts growing.` },
    { at: `+${formatSpan(growMs)}`, name: hatchling, text: `Fully grown: its first true form.` },
    { at: `+${formatSpan(toEvolved)}`, name: evolved, text: `${formatSpan(toEvolved)} after it grew up.` },
    { at: `+${formatSpan(toAscended - toEvolved)}`, name: ascended, text: `${formatSpan(toAscended)} after it grew up. Ascension ranks II–${ROMAN[ranks.length + 1]} follow at ${ranks.map(formatSpan).join(", ")}.` },
  ];
  return (
    <div className="mt-10" data-testid="evolution-timeline">
      <ol className="grid gap-3 sm:grid-cols-5 sm:gap-4">
        {steps.map((s, i) => (
          <li key={s.name} className="relative rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gilt/80">{i === 0 ? s.at : `${s.at} later`}</p>
            <p className="mt-2 font-display text-2xl text-bone">{s.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-mist">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm leading-relaxed text-mist/80">
        {fast
          ? `Fast track: your first ${ft.eggs} eggs hatch in ${formatSpan(ft.hatchMs)} and their creatures grow one form every ${formatSpan(ft.stageMs)}, from the moment you hatch them. From egg ${ft.eggs + 1} on, the standard pace applies: ${formatSpan(incubationMsFor(ft.eggs + 1))} to incubate and ${formatSpan(initialGrowthMsFor(ft.eggs + 1))} to grow up, then ${evolved} comes ${formatSpan(stdEvolved)} and ${ascended} ${formatSpan(stdAscended)} after growing up.`
          : `Times are for your first egg. Each later egg takes a little longer, up to ${formatSpan(lastIncubation)} to incubate and ${formatSpan(lastGrowth)} to grow up.`}
        {" "}Times count only while you hold.
        {gameConfig.policies.belowThreshold === "pause" && " Dropping below the threshold pauses progress."}
      </p>
    </div>
  );
}
