"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CollectionPlate } from "@/components/creature/CollectionPlate";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { revealClassified } from "@/components/creature/revealClassified";
import { EggArt } from "@/components/egg/EggArt";
import { CreatureCard } from "@/components/hatchery/CreatureCard";
import { HatchReveal } from "@/components/hatchery/HatchReveal";
import { HatcheryChamber } from "@/components/hatchery/HatcheryChamber";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { gameConfig, type RarityId } from "@/config/gameConfig";
import { DEFAULT_DEV_ODDS, type DevOddsSettings } from "@/lib/devOdds";
import { CLASSIFIED_RARITIES, discoveryOf } from "@/lib/discovery";
import { FIRST_MATURITY_MS, type SolaniteRecord } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, SPECIES_BY_ID, type Species } from "@/lib/species";
import type { ClassifiedBundle } from "@/shared/classified";
import { DevOddsPanel } from "./DevOddsPanel";

const STAGES = gameConfig.evolution.names;

/**
 * A creature record that exists only in this component's memory, so the Hatchery card can
 * be previewed at any stage. It is never dispatched to the Hatchery state, stored or sent.
 */
function previewRecord(s: Species, stage: number): SolaniteRecord {
  const m = FIRST_MATURITY_MS;
  const growth = [m * 0.5, m, m + gameConfig.evolution.afterMaturityMs[0], m + gameConfig.evolution.afterMaturityMs[1]][stage];
  return { id: `preview_${s.id}`, seed: 1, acquiredAt: 0, incubationMs: 0, speciesId: s.id, hatchedAt: 0, growthMs: growth, maturityMs: m, backed: true };
}

/**
 * Developer Mode (owner only; rendered by /studio/dev after a server-side credential
 * check). Previews every species at every stage, including Mythic and Secret, the way
 * the Collection, the Hatchery and the hatch reveal present them. Everything here is a
 * preview: no ownership, eggs, progression, tokens or rewards are created or changed,
 * and the public pages read nothing from this page.
 *
 * The classified (Mythic and Secret) species are not in this component's code: the server
 * page sends them, with finished art, only after the owner's sign-in (`classified`).
 */
export function DeveloperMode({ classified }: { classified: ClassifiedBundle[] }) {
  const [ready, setReady] = useState(false);
  const all = useMemo(() => [...SPECIES, ...classified.map((b) => b.species)], [classified]);
  useEffect(() => {
    revealClassified(classified);
    setReady(true);
  }, [classified]);
  return ready ? <DeveloperModeView all={all} /> : <p className="px-4 pt-32 text-center text-mist" data-testid="developer-loading">Loading Developer Mode…</p>;
}

function DeveloperModeView({ all: ALL }: { all: Species[] }) {
  const router = useRouter();
  const [rarity, setRarity] = useState<RarityId | "all">("all");
  const [selected, setSelected] = useState<Species>(ALL.find((s) => s.rarity === "mythic") ?? ALL[0]);
  const [stage, setStage] = useState(2);
  const [eggStage, setEggStage] = useState<1 | 2 | 3 | 4>(3);
  const [odds, setOdds] = useState<DevOddsSettings>({ ...DEFAULT_DEV_ODDS });
  const [reveal, setReveal] = useState<{ species: Species; seed: number } | null>(null);

  const list = useMemo(() => ALL.filter((s) => rarity === "all" || s.rarity === rarity), [ALL, rarity]);
  const restricted = CLASSIFIED_RARITIES.includes(selected.rarity);

  function exit() {
    setOdds({ ...DEFAULT_DEV_ODDS });
    setReveal(null);
    router.push("/");
  }

  return (
    <div className="relative" data-developer-mode="on">
      {/* always visible while Developer Mode is open */}
      <div role="status" className="sticky top-16 z-40 border-y border-amber-300/30 bg-[#140f05]/95 backdrop-blur lg:top-20" data-testid="developer-banner">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="text-sm text-amber-100">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber-300">Developer Mode on</span>
            <span className="ml-3 text-amber-100/80">Previews and simulations only. Nothing here changes ownership, eggs, progression, rewards or the public site.</span>
          </p>
          <button type="button" onClick={exit} className="sl-btn-outline rounded-full px-5 py-2 text-xs uppercase tracking-[0.2em]" data-testid="exit-developer-mode">
            Exit Developer Mode
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <p className="sl-eyebrow">Owner tools</p>
        <h1 className="sl-display-l mt-3 text-bone">Developer Mode</h1>
        <p className="mt-3 max-w-2xl text-mist">All {ALL.length} species and all {STAGES.length} stages, including Mythic and Secret, which stay classified for everyone else until they hatch one.</p>

        {/* species browser */}
        <section aria-labelledby="dev-species" className="mt-10">
          <h2 id="dev-species" className="sl-label text-dust">Species</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", ...RARITY_ORDER] as const).map((r) => (
              <button key={r} type="button" aria-pressed={rarity === r} onClick={() => setRarity(r)} className={`rounded-full border px-3 py-1 text-xs ${rarity === r ? "border-gilt/60 text-bone" : "border-white/10 text-mist hover:text-bone"}`}>
                {r === "all" ? `All (${ALL.length})` : `${RARITIES[r].label} (${ALL.filter((s) => s.rarity === r).length})`}
              </button>
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7" data-testid="dev-species-grid">
            {list.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelected(s)}
                  aria-pressed={selected.id === s.id}
                  className={`sl-plate relative w-full p-2 text-left ${selected.id === s.id ? "outline outline-1 outline-gilt/60" : ""}`}
                  data-species={s.id}
                >
                  <div className="aspect-square">
                    <CreatureArt species={s} stage={stage} animated={false} />
                  </div>
                  <p className="truncate text-xs text-bone">{s.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: RARITIES[s.rarity].color }}>
                    {RARITIES[s.rarity].label}
                    {CLASSIFIED_RARITIES.includes(s.rarity) ? " · classified publicly" : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* the selected species */}
        <section aria-labelledby="dev-selected" className="mt-12 grid gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="dev-selected" className="sl-display-m text-bone">
              {selected.name}
            </h2>
            <RarityBadge rarity={selected.rarity} size="md" />
            <span className="text-sm text-mist">
              № {String(selected.dex).padStart(3, "0")} · {selected.element}
              {restricted ? " · hidden from the public until hatched" : ""}
            </span>
          </div>

          <div>
            <h3 className="sl-label text-dust">Evolution stages</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="dev-stages">
              {STAGES.map((name, i) => (
                <button key={name} type="button" onClick={() => setStage(i)} aria-pressed={stage === i} className={`sl-plate p-3 text-left ${stage === i ? "outline outline-1 outline-gilt/60" : ""}`}>
                  <div className="aspect-square">
                    <CreatureArt species={selected} stage={i} />
                  </div>
                  <p className="text-sm text-bone">{name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <h3 className="sl-label text-dust">Collection card</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-2 text-xs text-mist">Public view</p>
                  <CollectionPlate species={selected} discovery={discoveryOf(selected, [])} onOpen={() => {}} />
                </div>
                <div>
                  <p className="mb-2 text-xs text-mist">Revealed</p>
                  <CollectionPlate species={selected} discovery="owned" stage={stage} bestLabel={STAGES[stage]} onOpen={() => {}} />
                </div>
              </div>
            </div>
            <div>
              <h3 className="sl-label text-dust">Hatchery egg</h3>
              <div className="mt-3 flex gap-2">
                {([1, 2, 3, 4] as const).map((n) => (
                  <button key={n} type="button" onClick={() => setEggStage(n)} aria-pressed={eggStage === n} className={`rounded-full border px-3 py-1 text-xs ${eggStage === n ? "border-gilt/60 text-bone" : "border-white/10 text-mist"}`}>
                    Egg {n}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex justify-center">
                <HatcheryChamber className="scale-[0.8]">
                  <EggArt stage={eggStage} progress={0.9} seed={7} inside={selected} className="h-full w-full" />
                </HatcheryChamber>
              </div>
            </div>
            <div>
              <h3 className="sl-label text-dust">Hatchery card</h3>
              <div className="mt-3 max-w-[300px]">
                <CreatureCard record={previewRecord(selected, stage)} onOpen={() => {}} />
              </div>
              <button type="button" onClick={() => setReveal({ species: selected, seed: 7 })} className="sl-btn-outline mt-4 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.2em]" data-testid="preview-reveal">
                Preview hatch reveal
              </button>
            </div>
          </div>
        </section>

        <div className="mt-14">
          <DevOddsPanel settings={odds} onChange={setOdds} onHatch={(id, seed) => setReveal({ species: SPECIES_BY_ID[id], seed })} />
        </div>
      </div>

      {reveal && <HatchReveal key={`${reveal.species.id}-${reveal.seed}`} species={reveal.species} seed={reveal.seed} onHatched={() => {}} onClose={() => setReveal(null)} onView={() => setReveal(null)} />}
    </div>
  );
}
