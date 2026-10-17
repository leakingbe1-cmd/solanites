import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { gameConfig } from "@/config/gameConfig";
import { formatDays } from "@/lib/format";
import { SPECIES_BY_ID } from "@/lib/species";

export function StageTimeline() {
  const inc = gameConfig.eggs.incubationMs;
  const sp = SPECIES_BY_ID["cryovant"];
  const stages = [
    { n: "I", title: "Acquired", text: "A dormant egg bonds to your wallet the moment you qualify.", when: "Day 0", visual: <EggArt stage={1} seed={1} animated={false} /> },
    { n: "II", title: "Awakening", text: "The shell warms. Hairline fissures begin to hold light.", when: formatDays(inc * gameConfig.eggs.crackingAt), visual: <EggArt stage={2} progress={0.6} seed={1} animated={false} /> },
    { n: "III", title: "Stirring", text: "Something moves. A shadow presses against the shell.", when: formatDays(inc * gameConfig.eggs.stirringAt), visual: <EggArt stage={3} progress={0.5} seed={1} inside={sp} animated={false} /> },
    { n: "IV", title: "Hatch", text: "The shell gives way. Its rarity is revealed for the first time.", when: formatDays(inc), visual: <EggArt stage={4} seed={1} inside={sp} animated={false} /> },
    { n: "V", title: "Evolve", text: "Keep holding. It grows through four forms to its Apex.", when: `+${formatDays(gameConfig.evolution.thresholdsMs.at(-1)!)}`, visual: <CreatureArt species={sp} stage={3} showAura={false} animated={false} /> },
  ];
  return (
    <ol className="sl-scrollbar-none -mx-4 mt-20 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-0 lg:overflow-visible lg:px-0">
      {stages.map((s, i) => (
        <li key={s.n} className={`relative w-[64vw] max-w-[240px] shrink-0 snap-center lg:w-auto lg:max-w-none lg:px-6 ${i ? "lg:border-l lg:border-line" : ""}`}>
          <div className="relative mx-auto h-52 w-full">{s.visual}</div>
          <div className="mt-8 text-center">
            <p className="font-display text-sm italic text-dim">{s.n}</p>
            <h3 className="mt-1 font-display text-2xl text-platinum">{s.title}</h3>
            <p className="sl-num mt-2 text-[10px] uppercase tracking-[0.2em] text-mist">{s.when}</p>
            <p className="mx-auto mt-4 max-w-[14rem] text-sm leading-relaxed text-mist">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
