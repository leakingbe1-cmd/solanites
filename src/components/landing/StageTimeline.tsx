import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { gameConfig } from "@/config/gameConfig";
import { formatSpan } from "@/lib/format";
import { SPECIES_BY_ID } from "@/lib/species";

export function StageTimeline() {
  const pct = (f: number) => `${Math.round(f * 100)}% incubated`;
  const stages = [
    { n: "01", title: "Acquired", text: "A dormant egg appears the moment your holdings qualify. No sign-up, no connection.", when: "Earned", visual: <EggArt stage={1} seed={1} /> },
    { n: "02", title: "Awakening", text: "The shell begins to glow. Hairline cracks leak light.", when: pct(gameConfig.eggs.crackingAt), visual: <EggArt stage={2} progress={0.6} seed={1} /> },
    { n: "03", title: "Stirring", text: "Energy surges. A silhouette moves behind the shell.", when: pct(gameConfig.eggs.stirringAt), visual: <EggArt stage={3} progress={0.5} seed={1} inside={SPECIES_BY_ID["stormquill"]} /> },
    { n: "04", title: "Hatch", text: "A dramatic reveal. Rarity is unveiled in light and particles.", when: "Ready", visual: <EggArt stage={4} seed={1} inside={SPECIES_BY_ID["stormquill"]} /> },
    { n: "05", title: "Evolve", text: "Keep holding. Your Solanite grows through four forms, from Eggling to Ascended.", when: `+${formatSpan(gameConfig.evolution.thresholdsMs.at(-1)!)}`, visual: <CreatureArt species={SPECIES_BY_ID["stormquill"]} stage={3} /> },
  ];
  return (
    <div className="relative mt-16">
      <div className="absolute left-0 right-0 top-[38%] hidden h-px bg-gradient-to-r from-transparent via-sol-purple/40 to-transparent lg:block" />
      <ol className="sl-scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {stages.map((s) => (
          <li key={s.n} className="group relative w-[70vw] max-w-[260px] shrink-0 snap-center lg:w-auto lg:max-w-none">
            <div className="relative mx-auto h-56 w-full transition-transform duration-500 group-hover:-translate-y-2">{s.visual}</div>
            <div className="mt-4 text-center">
              <p className="font-mono text-[10px] tracking-[0.3em] text-sol-green/80">
                STAGE {s.n} · {s.when}
              </p>
              <h3 className="mt-2 font-display text-lg text-white">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-mist">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
