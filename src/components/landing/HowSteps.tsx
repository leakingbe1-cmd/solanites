import { describeSchedule } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";

export function HowSteps() {
  const steps = [
    {
      n: "1",
      title: "Hold the qualifying amount",
      text: `Every ${formatNumber(gameConfig.token.tokensPerEgg)} ${gameConfig.token.symbol} you hold earns one egg. Holdings are tracked automatically from the blockchain, with no wallet connection needed.`,
      icon: (
        <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z M9 12l2 2 4-4" />
      ),
    },
    {
      n: "2",
      title: "Receive an egg & watch it develop",
      text: `Each egg incubates on the server clock, even while you are away: ${describeSchedule()}. It glows, cracks and stirs as it goes.`,
      icon: <path d="M12 3c4 0 7 6 7 11a7 7 0 0 1-14 0c0-5 3-11 7-11z M10 10l2 2-1 3" />,
    },
    {
      n: "3",
      title: "Hatch & keep evolving",
      text: `Reveal a unique Solanite, then hold to evolve it through ${gameConfig.evolution.names.join(" → ")}.`,
      icon: <path d="M4 18l4-6 4 3 4-7 4 10 M4 21h16" />,
    },
  ];
  return (
    <div className="mt-14 grid gap-4 md:grid-cols-3">
      {steps.map((s) => (
        <div key={s.n} className="sl-card-hover sl-gradient-border group relative overflow-hidden rounded-3xl bg-white/[0.02] p-7 sm:p-8">
          <span className="absolute -right-4 -top-10 font-display text-[9rem] font-bold leading-none text-white/[0.03] transition group-hover:text-white/[0.06]">{s.n}</span>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sol-purple/30 to-sol-green/20 text-white ring-1 ring-white/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {s.icon}
            </svg>
          </div>
          <h3 className="mt-6 font-display text-xl text-white">{s.title}</h3>
          <p className="mt-3 leading-relaxed text-mist">{s.text}</p>
        </div>
      ))}
    </div>
  );
}
