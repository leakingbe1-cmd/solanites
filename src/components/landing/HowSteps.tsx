import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { describeSchedule } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";
import { SPECIES_BY_ID } from "@/lib/species";

export function HowSteps() {
  const steps = [
    {
      n: "1",
      title: "Hold the qualifying amount",
      text: `Every ${formatNumber(gameConfig.token.tokensPerEgg)} ${gameConfig.token.symbol} you hold earns one egg. Holdings are tracked automatically from the blockchain, with no wallet connection needed.`,
      icon: (
        <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z M9 12l2 2 4-4" />
      ),
      visual: <EggArt stage={1} seed={5} />,
    },
    {
      n: "2",
      title: "Receive an egg & watch it develop",
      text: `Each egg incubates on the server clock, even while you are away: ${describeSchedule()}. It glows, cracks and stirs as it goes.`,
      icon: <path d="M12 3c4 0 7 6 7 11a7 7 0 0 1-14 0c0-5 3-11 7-11z M10 10l2 2-1 3" />,
      visual: <EggArt stage={3} progress={0.6} seed={5} inside={SPECIES_BY_ID["aurelion"]} />,
    },
    {
      n: "3",
      title: "Hatch & keep evolving",
      text: `Reveal a unique Solanite, then hold to evolve it through ${gameConfig.evolution.names.join(" → ")}.`,
      icon: <path d="M4 18l4-6 4 3 4-7 4 10 M4 21h16" />,
      visual: <CreatureArt species={SPECIES_BY_ID["aurelion"]} stage={1} />,
    },
  ];
  return (
    <div className="mt-14 grid gap-4 md:grid-cols-3">
      {steps.map((s) => (
        <div key={s.n} className="sl-card-hover sl-gradient-border group relative overflow-hidden rounded-3xl bg-white/[0.02] p-7 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sol-purple/30 to-sol-green/20 text-white ring-1 ring-white/10">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {s.icon}
                </svg>
              </div>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-sol-green/80">Step 0{s.n}</p>
            </div>
            {/* the journey in three drawings: dormant egg → stirring egg → hatched creature */}
            <div className="sl-art-host -mr-2 -mt-3 h-28 w-28 shrink-0" aria-hidden>
              {s.visual}
            </div>
          </div>
          <h3 className="mt-5 font-display text-xl text-white">{s.title}</h3>
          <p className="mt-3 leading-relaxed text-mist">{s.text}</p>
        </div>
      ))}
    </div>
  );
}
