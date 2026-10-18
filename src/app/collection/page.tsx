"use client";

import { useMemo, useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { CreatureDetail } from "@/components/creature/CreatureDetail";
import { discoveryOf } from "@/lib/discovery";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { useHatchery } from "@/state/HatcheryProvider";
import type { RarityId } from "@/config/gameConfig";
import { evolutionOf } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { ELEMENT_GLYPH, SPECIES, type Element, type Species } from "@/lib/species";
import { sfx } from "@/lib/sound";



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
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">The Solanidex</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">The Collection</h1>
            <p className="mt-4 max-w-xl text-mist">Every known Solanite, catalogued by the Hatchery. Some signatures remain classified — the only way to reveal them is to hatch one yourself.</p>
          </div>
          <div className="sl-glass w-full rounded-2xl p-5 lg:w-80">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">Your discoveries</p>
              <p className="font-display text-2xl text-white">
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

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                onMouseEnter={() => sfx.hover()}
                className="sl-card-hover group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-3 text-left hover:border-white/15 sm:p-4"
              >
                <div className="absolute inset-x-0 top-0 h-px opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${hidden ? "#666" : meta.color}, transparent)` }} />
                <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-25 blur-3xl transition group-hover:opacity-50" style={{ background: hidden ? "#5b4bff" : meta.color }} />
                <div className="relative flex items-center justify-between">
                  <span className="font-mono text-[10px] text-mist/60">#{String(s.dex).padStart(3, "0")}</span>
                  <span className={`font-mono text-[9px] uppercase tracking-wider ${d === "owned" ? "text-sol-green" : "text-mist/50"}`}>{d === "owned" ? "● Discovered" : hidden ? "Classified" : "Catalogued"}</span>
                </div>
                <div className="sl-art-host relative aspect-square" style={{ "--sl-glow": hidden ? "rgba(110,90,255,0.3)" : meta.glow } as React.CSSProperties}>
                  <CreatureArt species={s} stage={bestForm[s.id] ?? 2} silhouette={hidden} showAura={!hidden} animated={!hidden} />
                  {hidden && <span className="absolute inset-0 grid place-items-center font-display text-3xl text-white/70">?</span>}
                </div>
                <div className="relative">
                  <p className="truncate font-display text-base text-white sm:text-lg">{hidden ? "???" : s.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <RarityBadge rarity={s.rarity} hidden={hidden && s.rarity === "secret"} />
                    {!hidden && <span className="text-[11px] text-mist">{ELEMENT_GLYPH[s.element]} {s.element}</span>}
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-mist/50">{bestForm[s.id] !== undefined ? `Your best: ${h.config.evolution.names[bestForm[s.id]]}` : "Evolution: —"}</p>
                </div>
              </button>
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
      className={`shrink-0 rounded-full border px-4 py-1.5 text-xs transition ${active ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-mist hover:text-white"}`}
      style={active && color ? { borderColor: `${color}88`, color, background: `${color}14` } : undefined}
    >
      {children}
    </button>
  );
}
