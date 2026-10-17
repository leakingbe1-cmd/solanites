"use client";

import { useMemo, useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { CreatureDetail } from "@/components/creature/CreatureDetail";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useHatchery } from "@/state/HatcheryProvider";
import type { RarityId } from "@/config/gameConfig";
import { evolutionOf } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, type Element, type Species } from "@/lib/species";
import { sfx } from "@/lib/sound";

/** Mythic and Secret entries stay classified until the viewer hatches one. */
const CLASSIFIED: RarityId[] = ["mythic", "secret"];

type Discovery = "owned" | "catalogued" | "classified";

export default function CollectionPage() {
  const h = useHatchery();
  const [rarity, setRarity] = useState<RarityId | "all">("all");
  const [element, setElement] = useState<Element | "all">("all");
  const [status, setStatus] = useState<"all" | "owned" | "missing">("all");
  const [open, setOpen] = useState<Species | null>(null);

  const bestForm = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of h.records) if (r.hatchedAt !== null) m[r.speciesId] = Math.max(m[r.speciesId] ?? 0, evolutionOf(r.growthMs, h.config).stage);
    return m;
  }, [h.records, h.config]);

  const discovery = (s: Species): Discovery => (h.discovered.includes(s.id) ? "owned" : CLASSIFIED.includes(s.rarity) ? "classified" : "catalogued");

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
      <div className="relative mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <p className="sl-label">The Archive</p>
            <h1 className="sl-display mt-4 text-6xl text-platinum sm:text-7xl">The Collection</h1>
            <p className="mt-6 max-w-lg leading-relaxed text-mist">Every Solanite the Hatchery has recorded. Some entries hold only a silhouette; the only way to complete them is to hatch one yourself.</p>
          </div>
          <div className="w-full lg:w-72">
            <div className="flex items-baseline justify-between">
              <p className="sl-label">Your discoveries</p>
              <p className="sl-display text-4xl text-platinum">
                {ownedCount}
                <span className="text-xl text-dim"> / {SPECIES.length}</span>
              </p>
            </div>
            <ProgressBar value={ownedCount / SPECIES.length} className="mt-4" />
          </div>
        </div>

        {/* filters */}
        <div className="sticky top-16 z-20 -mx-4 mt-14 border-y border-line bg-void/90 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-20 lg:-mx-10 lg:px-10">
          <div className="sl-scrollbar-none flex items-center gap-7 overflow-x-auto py-4">
            <FilterTab active={rarity === "all"} onClick={() => setRarity("all")}>
              All
            </FilterTab>
            {RARITY_ORDER.map((r) => (
              <FilterTab key={r} active={rarity === r} onClick={() => setRarity(r)} color={RARITIES[r].color}>
                {RARITIES[r].label}
              </FilterTab>
            ))}
            <span className="h-4 w-px shrink-0 bg-line" />
            <label htmlFor="sl-element" className="sr-only">
              Element
            </label>
            <select id="sl-element" value={element} onChange={(e) => setElement(e.target.value as Element | "all")} className="shrink-0 cursor-pointer bg-transparent text-[11px] uppercase tracking-[0.2em] text-mist outline-none">
              <option value="all">All elements</option>
              {elements.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
            <label htmlFor="sl-status" className="sr-only">
              Discovery status
            </label>
            <select id="sl-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="shrink-0 cursor-pointer bg-transparent text-[11px] uppercase tracking-[0.2em] text-mist outline-none">
              <option value="all">All entries</option>
              <option value="owned">Discovered by me</option>
              <option value="missing">Not yet discovered</option>
            </select>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 border-l border-t border-line [&>*]:border-b [&>*]:border-r [&>*]:border-line sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const d = discovery(s);
            const meta = RARITIES[s.rarity];
            const hidden = d === "classified";
            return (
              <button
                key={s.id}
                onClick={() => {
                  sfx.click();
                  setOpen(s);
                }}
                className="group relative flex flex-col bg-void p-6 text-left transition-colors duration-500 hover:bg-abyss sm:p-8"
              >
                <div className="flex items-baseline justify-between">
                  <span className="sl-num text-[11px] text-dim">No. {String(s.dex).padStart(3, "0")}</span>
                  <span className={`text-[9px] uppercase tracking-[0.26em] ${d === "owned" ? "text-platinum" : "text-dim"}`}>{d === "owned" ? "Discovered" : hidden ? "Unrecorded" : "Catalogued"}</span>
                </div>
                <div className="relative mx-auto my-6 aspect-square w-full max-w-[320px] transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                  <CreatureArt species={s} stage={bestForm[s.id] ?? 2} silhouette={hidden} showAura={!hidden} animated={false} />
                </div>
                <p className="font-display text-3xl text-platinum">{hidden ? "Unrecorded" : s.name}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.26em]">
                  <span style={{ color: hidden && s.rarity === "secret" ? "#5c5e6c" : meta.color }}>{hidden && s.rarity === "secret" ? "Unknown" : meta.label}</span>
                  {!hidden && <span className="text-dim"> · {s.element}</span>}
                  {bestForm[s.id] !== undefined && <span className="text-dim"> · {h.config.evolution.names[bestForm[s.id]]}</span>}
                </p>
              </button>
            );
          })}
        </div>
        {list.length === 0 && <p className="mt-16 text-center text-mist">No Solanites match these filters.</p>}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} wide label="Solanite details">
        {open && <CreatureDetail key={open.id} species={open} discovered={discovery(open) !== "classified"} />}
      </Modal>
    </div>
  );
}

function FilterTab({ active, onClick, color, children }: { active: boolean; onClick(): void; color?: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`relative shrink-0 py-1 text-[11px] uppercase tracking-[0.24em] transition-colors ${active ? "text-platinum" : "text-dim hover:text-silver"}`}>
      {color && <span className="mr-2 inline-block h-[5px] w-[5px] rotate-45 align-middle" style={{ background: color, opacity: active ? 1 : 0.5 }} />}
      {children}
      {active && <span className="absolute inset-x-0 -bottom-[17px] h-px bg-platinum" />}
    </button>
  );
}
