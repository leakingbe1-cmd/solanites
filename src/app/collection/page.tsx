"use client";

import { useMemo, useState } from "react";
import { CollectionPlate } from "@/components/creature/CollectionPlate";
import { CreatureDetail } from "@/components/creature/CreatureDetail";
import { discoveryOf } from "@/lib/discovery";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useHatchery } from "@/state/HatcheryProvider";
import type { RarityId } from "@/config/gameConfig";
import { evolutionOf } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { ELEMENT_GLYPH, SPECIES, type Element, type Species } from "@/lib/species";



export default function CollectionPage() {
  const h = useHatchery();
  const [rarity, setRarity] = useState<RarityId | "all">("all");
  const [element, setElement] = useState<Element | "all">("all");
  const [status, setStatus] = useState<"all" | "owned" | "missing">("all");
  const [open, setOpen] = useState<Species | null>(null);

  const bestForm = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of h.records) if (r.hatchedAt !== null) m[r.speciesId] = Math.max(m[r.speciesId] ?? 0, evolutionOf(r.growthMs, h.config, r.maturityMs).stage);
    return m;
  }, [h.records, h.config]);

  const discovery = (s: Species) => discoveryOf(s, h.discovered);

  const elements = Array.from(new Set(SPECIES.map((s) => s.element)));
  const list = SPECIES.filter(
    (s) =>
      (rarity === "all" || s.rarity === rarity) &&
      (element === "all" || (s.element === element && discovery(s) !== "classified")) &&
      (status === "all" || (status === "owned" ? discovery(s) === "owned" : discovery(s) !== "owned")),
  );
  const ownedCount = SPECIES.filter((s) => h.discovered.includes(s.id)).length;

  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="sl-eyebrow">The Solanidex</p>
            <h1 className="mt-3 sl-display-l text-bone">The Collection</h1>
            <p className="mt-4 max-w-xl text-mist">Every known Solanite, catalogued by the Hatchery. Some signatures remain classified — the only way to reveal them is to hatch one yourself.</p>
          </div>
          <div className="sl-glass w-full rounded-md p-5 lg:w-80">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">Your discoveries</p>
              <p className="font-display text-2xl text-bone">
                {ownedCount}
                <span className="text-base text-mist">/{SPECIES.length}</span>
              </p>
            </div>
            <ProgressBar value={ownedCount / SPECIES.length} className="mt-3" />
          </div>
        </div>

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
              <option value="owned">Discovered by me</option>
              <option value="missing">Not yet discovered</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
          {list.map((s) => {
            return (
              <CollectionPlate
                key={s.id}
                species={s}
                discovery={discovery(s)}
                stage={bestForm[s.id]}
                bestLabel={bestForm[s.id] !== undefined ? h.config.evolution.names[bestForm[s.id]] : undefined}
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
