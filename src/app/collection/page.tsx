"use client";

import { useEffect, useMemo, useState } from "react";
import { CollectionPlate } from "@/components/creature/CollectionPlate";
import { CreatureDetail } from "@/components/creature/CreatureDetail";
import { discoveryOf } from "@/lib/discovery";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useHatchery } from "@/state/HatcheryProvider";
import type { RarityId } from "@/config/gameConfig";
import { evolutionOf } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { CATALOGUE_SIZE, ELEMENT_GLYPH, SPECIES, type Element, type Species } from "@/lib/species";
import { speciesOfDay } from "@/lib/dailyLoop";



export default function CollectionPage() {
  const h = useHatchery();
  const [rarity, setRarity] = useState<RarityId | "all">("all");
  const [element, setElement] = useState<Element | "all">("all");
  const [status, setStatus] = useState<"all" | "owned" | "missing">("all");
  const [open, setOpen] = useState<Species | null>(null);
  // Set after mount so the server render and the visitor's day can't disagree.
  const [today, setToday] = useState<Species | null>(null);
  useEffect(() => setToday(speciesOfDay(Date.now())), []);

  const bestForm = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of h.records) if (r.hatchedAt !== null) m[r.speciesId] = Math.max(m[r.speciesId] ?? 0, evolutionOf(r.growthMs, h.config, r.maturityMs).stage);
    return m;
  }, [h.records, h.config]);

  // Demo hatches are simulated: labelled Demo on the counter and plates (retention item 1 on integration separates them fully).
  const isDemo = h.wallet?.kind === "demo";
  const watched = h.wallet?.kind === "watch" ? h.wallet.address : null;
  const discovery = (s: Species) => discoveryOf(s, h.discovered);

  // /collection?species=<id> (e.g. from the homepage Market Bond section) opens that species.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("species");
    const s = id ? SPECIES.find((c) => c.id === id) : undefined;
    if (s) setOpen(s);
  }, []);

  const catalogue = SPECIES;
  const elements = Array.from(new Set(catalogue.map((s) => s.element)));
  const list = catalogue.filter(
    (s) =>
      (rarity === "all" || s.rarity === rarity) &&
      (element === "all" || s.element === element) &&
      (status === "all" || (status === "owned" ? discovery(s) === "owned" : discovery(s) !== "owned")),
  );
  const ownedCount = catalogue.filter((s) => h.discovered.includes(s.id)).length;

  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="sl-eyebrow">The Solanidex</p>
            <h1 className="mt-3 sl-display-l text-bone">The Collection</h1>
            <p className="mt-4 max-w-xl text-mist">Every known Solanite, catalogued by the Hatchery, from the commonest to the rarest Mythic and Secret.</p>
          </div>
          <div className="sl-glass w-full rounded-md p-5 lg:w-80">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">{isDemo ? "Demo discoveries (not real)" : "Your discoveries"}</p>
              <p className="font-display text-2xl text-bone">
                {ownedCount}
                <span className="text-base text-mist">/{CATALOGUE_SIZE}</span>
              </p>
            </div>
            <ProgressBar value={ownedCount / CATALOGUE_SIZE} className="mt-3" />
          </div>
        </div>

        {today && (
          <button type="button" onClick={() => setOpen(today)} className="sl-glass mt-8 flex w-full items-center gap-4 rounded-md p-4 text-left transition hover:bg-white/[0.04]" data-testid="species-of-day">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gilt">Species of the day</span>
            <span className="font-display text-xl text-bone">{today.name}</span>
            <span className="hidden text-sm text-mist sm:inline">{today.epithet}</span>
            <span className="ml-auto text-xs text-mist">Changes daily · open →</span>
          </button>
        )}

        {/* filters */}
        <div className="sticky top-16 z-20 -mx-4 mt-10 border-y border-white/5 bg-void/80 px-4 py-3 backdrop-blur-xl lg:top-20">
          <div className="sl-scrollbar-none flex items-center gap-2 overflow-x-auto">
            <FilterChip active={rarity === "all"} onClick={() => setRarity("all")}>
              All
            </FilterChip>
            {RARITY_ORDER.map((r) => (
              <FilterChip key={r} active={rarity === r} onClick={() => setRarity(r)} color={RARITIES[r].color}>
                {RARITIES[r].label}
              </FilterChip>
            ))}
            <span className="mx-1 h-6 w-px shrink-0 bg-white/10" />
            <select value={element} onChange={(e) => setElement(e.target.value as Element | "all")} className="shrink-0 rounded-full border border-white/10 bg-abyss px-3 py-1.5 text-xs text-mist outline-none" aria-label="Element filter">
              <option value="all">All elements</option>
              {elements.map((el) => (
                <option key={el} value={el}>
                  {ELEMENT_GLYPH[el]} {el}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="shrink-0 rounded-full border border-white/10 bg-abyss px-3 py-1.5 text-xs text-mist outline-none" aria-label="Discovery filter">
              <option value="all">All statuses</option>
              <option value="owned">{isDemo && !watched ? "Demo discoveries" : "Discovered by me"}</option>
              <option value="missing">Not yet discovered</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {list.map((s) => {
            return (
              <CollectionPlate
                key={s.id}
                species={s}
                discovery={discovery(s)}
                stage={bestForm[s.id]}
                bestLabel={bestForm[s.id] !== undefined ? h.config.evolution.names[bestForm[s.id]] : undefined}
                demo={isDemo && !watched}
                onOpen={() => setOpen(s)}
              />
            );
          })}
        </div>
        {list.length === 0 && <p className="mt-16 text-center text-mist">No Solanites match these filters.</p>}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} xl label="Solanite details">
        {open &&
          (() => {
            const i = list.findIndex((s) => s.id === open.id);
            return (
              <CreatureDetail
                key={open.id}
                species={open}
                onSelectSpecies={setOpen}
                onPrev={i > 0 ? () => setOpen(list[i - 1]) : undefined}
                onNext={i >= 0 && i < list.length - 1 ? () => setOpen(list[i + 1]) : undefined}
              />
            );
          })()}
      </Modal>
    </div>
  );
}

function FilterChip({ active, onClick, color, children }: { active: boolean; onClick(): void; color?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-xs transition ${active ? "border-white/30 bg-white/10 text-bone" : "border-white/10 text-mist hover:text-bone"}`}
      style={active && color ? { borderColor: `${color}88`, color, background: `${color}14` } : undefined}
    >
      {children}
    </button>
  );
}
