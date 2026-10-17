import { gameConfig } from "@/config/gameConfig";
import { formatDays, formatNumber } from "@/lib/format";

export function HowSteps() {
  const steps = [
    {
      n: "1",
      title: "Hold the qualifying amount",
      text: `Every ${formatNumber(gameConfig.token.tokensPerEgg)} ${gameConfig.token.symbol} in your wallet backs one egg, up to ${gameConfig.eggs.maxEggsPerWallet} per wallet.`,
    },
    {
      n: "2",
      title: "Receive an egg and watch it develop",
      text: `Your egg incubates while you hold. It warms, fractures and stirs over roughly ${formatDays(gameConfig.eggs.incubationMs)}.`,
    },
    {
      n: "3",
      title: "Hatch and keep evolving",
      text: `Reveal a unique Solanite, then hold to evolve it through ${gameConfig.evolution.names.join(" → ")}.`,
    },
  ];
  return (
    <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-0">
      {steps.map((s, i) => (
        <li key={s.n} className={`border-t border-line pt-8 md:pr-10 ${i ? "md:pl-10 md:border-l" : ""}`}>
          <span className="sl-display text-6xl text-dim">{s.n}</span>
          <h3 className="mt-6 font-display text-2xl text-platinum">{s.title}</h3>
          <p className="mt-3 max-w-sm leading-relaxed text-mist">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
