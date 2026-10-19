"use client";

import { useEffect, useRef, useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { gameConfig } from "@/config/gameConfig";
import { formatDuration } from "@/lib/format";
import { evolutionOf, type GrowthPhase, type SolaniteRecord } from "@/lib/progression";
import { RARITIES } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";
import { sfx } from "@/lib/sound";

const PHASE_LABEL: Record<GrowthPhase, string> = { growing: "Growing", mature: "Fully grown", evolved: "Evolved", ascended: "Ascended" };

export function CreatureCard({ record, onOpen }: { record: SolaniteRecord; onOpen(): void }) {
  const s = SPECIES_BY_ID[record.speciesId];
  const evo = evolutionOf(record.growthMs, gameConfig, record.maturityMs);
  const meta = RARITIES[s.rarity];
  const paused = !record.backed;

  // A milestone reached while watching gets a short, quiet celebration.
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const prev = useRef(evo.label);
  useEffect(() => {
    if (prev.current === evo.label) return;
    prev.current = evo.label;
    setCelebrate(evo.phase === "mature" ? "Fully grown!" : `${evo.label}!`);
    const t = window.setTimeout(() => setCelebrate(null), 2600);
    return () => window.clearTimeout(t);
  }, [evo.label, evo.phase]);

  const next = evo.isFinal
    ? "Final rank reached"
    : paused
      ? "Paused: the balance no longer backs it"
      : evo.phase === "growing"
        ? `Fully grown (${evo.nextLabel}) in`
        : `${evo.nextLabel} in`;

  return (
    <button
      onClick={() => {
        sfx.click();
        onOpen();
      }}
      onMouseEnter={() => sfx.hover()}
      className="sl-card-hover group relative overflow-hidden rounded-md border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 text-left hover:border-white/15"
      style={{ "--card-glow": meta.glow, ...(celebrate ? { boxShadow: `0 0 0 1px ${meta.color}, 0 0 40px -8px ${meta.color}` } : {}) } as React.CSSProperties}
    >
      <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60" style={{ background: meta.color }} />
      <div className="relative flex items-center justify-between gap-2">
        <RarityBadge rarity={s.rarity} />
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${paused ? "bg-white/5 text-mist/70" : evo.phase === "growing" ? "bg-sol-blue/10 text-sol-blue" : "bg-sol-green/10 text-sol-green"}`}
          data-testid="creature-phase"
          data-phase={evo.phase}
        >
          {paused ? "Paused" : PHASE_LABEL[evo.phase]}
        </span>
      </div>
      <div className="sl-art-host relative mx-auto mt-1 aspect-square w-full max-w-[240px]" style={{ "--sl-glow": meta.glow } as React.CSSProperties}>
        <CreatureArt species={s} stage={evo.stage} />
        {celebrate && (
          <span role="status" className="sl-pop absolute inset-x-0 top-3 mx-auto w-fit rounded-full px-3 py-1 font-display text-xs text-black" style={{ background: meta.color }}>
            {celebrate}
          </span>
        )}
      </div>
      <p className="relative font-display text-xl text-bone">{record.nickname ?? s.name}</p>
      <p className="relative text-xs text-mist">
        {evo.label} form · {record.nickname ? s.name : s.epithet}
      </p>
      <div className="relative mt-4">
        <div className="flex justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-mist/70">
          <span>{next}</span>
          <span className="tabular-nums text-bone/80" data-testid="creature-next-in">
            {evo.isFinal ? "MAX" : paused ? "—" : formatDuration(evo.toNextMs)}
          </span>
        </div>
        <ProgressBar
          value={evo.toNextProgress}
          className="mt-2"
          colors={paused ? ["#6b6b80", "#a0a0b0"] : [meta.color2, meta.color]}
          label={evo.isFinal ? `${evo.label}: final rank` : `Progress to ${evo.phase === "growing" ? "fully grown" : evo.nextLabel}`}
        />
      </div>
    </button>
  );
}
