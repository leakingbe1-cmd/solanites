"use client";

import { useState } from "react";
import { CreatureArt } from "./CreatureArt";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gameConfig } from "@/config/gameConfig";
import { RARITIES } from "@/lib/rarity";
import { ELEMENT_GLYPH, statsAt, type Species } from "@/lib/species";
import { evolutionOf, type SolaniteRecord } from "@/lib/progression";
import { formatDuration } from "@/lib/format";

interface CreatureDetailProps {
  species: Species;
  /** Present when the viewer owns this creature. */
  record?: SolaniteRecord;
  discovered?: boolean;
  onRename?: (name: string) => void;
}

export function CreatureDetail({ species, record, discovered = true, onRename }: CreatureDetailProps) {
  const evoInfo = record ? evolutionOf(record.growthMs, gameConfig) : null;
  const [form, setForm] = useState(evoInfo?.stage ?? 2);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(record?.nickname ?? "");
  const meta = RARITIES[species.rarity];
  const hidden = !discovered;
  const stats = statsAt(species, form);
  const names = gameConfig.evolution.names;

  return (
    <div className="grid md:grid-cols-[1.1fr_1fr]">
      <div className="relative overflow-hidden rounded-t-3xl p-6 sm:rounded-l-3xl sm:rounded-tr-none" style={{ background: `radial-gradient(circle at 50% 40%, ${hidden ? "rgba(120,100,255,0.15)" : meta.glow}, transparent 70%)` }}>
        <div className="mx-auto aspect-square w-full max-w-[420px]">
          <CreatureArt species={species} stage={form} silhouette={hidden} />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {names.map((n, i) => {
            const locked = record ? i > (evoInfo?.stage ?? 0) : hidden;
            return (
              <button
                key={n}
                onClick={() => setForm(i)}
                className={`group rounded-2xl border p-1.5 transition ${form === i ? "border-white/30 bg-white/[0.06]" : "border-white/5 hover:border-white/15"}`}
              >
                <div className="aspect-square">
                  <CreatureArt species={species} stage={i} animated={false} showAura={false} silhouette={locked} />
                </div>
                <p className={`mt-1 truncate font-mono text-[9px] uppercase tracking-wider ${form === i ? "text-white" : "text-mist/70"}`}>{n}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <RarityBadge rarity={species.rarity} size="md" hidden={hidden && species.rarity === "secret"} />
          <span className="font-mono text-xs text-mist/60">#{String(species.dex).padStart(3, "0")}</span>
        </div>
        {record && editing ? (
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onRename?.(name);
              setEditing(false);
            }}
          >
            <input autoFocus value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder={species.name} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-display text-xl text-white outline-none focus:border-sol-purple" />
            <button className="rounded-xl bg-white/10 px-4 text-sm">Save</button>
          </form>
        ) : (
          <h2 className="mt-4 flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {hidden ? "???" : (record?.nickname ?? species.name)}
            {record && (
              <button onClick={() => setEditing(true)} className="text-mist/50 transition hover:text-white" aria-label="Rename">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20h4L19 9l-4-4L4 16v4z" /></svg>
              </button>
            )}
          </h2>
        )}
        <p className="mt-1 text-mist">{hidden ? "Undiscovered" : record?.nickname ? `${species.name} · ${species.epithet}` : species.epithet}</p>

        <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            ["Element", hidden ? "???" : `${ELEMENT_GLYPH[species.element]} ${species.element}`],
            ["Form", names[form]],
            ["Status", record ? (record.backed ? "Bonded" : "Dormant") : discovered ? "Discovered" : "Unknown"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-white/5 bg-white/[0.02] px-2 py-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-mist/60">{k}</dt>
              <dd className="mt-1 truncate text-sm text-white">{v}</dd>
            </div>
          ))}
        </dl>

        {record && evoInfo && (
          <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-white">{evoInfo.isMax ? "Apex reached" : `Evolving to ${evoInfo.nextName}`}</span>
              <span className="font-mono text-xs text-mist">{evoInfo.isMax ? "MAX" : formatDuration(evoInfo.remainingMs)}</span>
            </div>
            <ProgressBar value={evoInfo.progress} className="mt-3" colors={[meta.color2, meta.color]} />
            <p className="mt-3 text-xs text-mist/70">Bonded for {formatDuration(record.growthMs)} since hatching{!record.backed && " · growth paused (balance below threshold)"}</p>
          </div>
        )}

        {!hidden && (
          <>
            <div className="mt-5 space-y-3">
              {(Object.keys(stats) as (keyof typeof stats)[]).map((k) => (
                <div key={k} className="grid grid-cols-[70px_1fr_36px] items-center gap-3 text-xs">
                  <span className="uppercase tracking-widest text-mist/70">{k}</span>
                  <ProgressBar value={stats[k] / 250} colors={[meta.color2, meta.color]} glow={false} />
                  <span className="text-right font-mono text-white/80">{stats[k]}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {species.personality.map((p) => (
                <span key={p} className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist">
                  {p}
                </span>
              ))}
            </div>
            <p className="mt-5 border-l-2 pl-4 text-sm italic leading-relaxed text-mist" style={{ borderColor: meta.color }}>
              {species.lore}
            </p>
          </>
        )}
        {hidden && <p className="mt-6 text-sm leading-relaxed text-mist">This Solanite has not been hatched by you yet. Its signature has been detected in the hatchery records — hold, hatch, and it may reveal itself.</p>}
      </div>
    </div>
  );
}
