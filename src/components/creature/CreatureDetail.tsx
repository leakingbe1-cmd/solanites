"use client";

import { useState } from "react";
import { CreatureArt } from "./CreatureArt";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gameConfig } from "@/config/gameConfig";
import { RARITIES } from "@/lib/rarity";
import { statsAt, type Species } from "@/lib/species";
import { evolutionOf, type SolaniteRecord } from "@/lib/progression";
import { formatDuration } from "@/lib/format";

interface CreatureDetailProps {
  species: Species;
  /** Present when the viewer owns this creature. */
  record?: SolaniteRecord;
  discovered?: boolean;
  onRename?: (name: string) => void;
}

/** An archive record: the specimen as centrepiece, metadata set quietly beside it. */
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
    <div className="grid lg:grid-cols-[1.35fr_1fr]">
      {/* specimen */}
      <div className="relative overflow-hidden border-b border-line lg:border-b-0 lg:border-r">
        <div className="pointer-events-none absolute left-1/2 top-[-15%] h-[70%] w-[70%] -translate-x-1/2 rounded-full blur-3xl" style={{ background: hidden ? "rgba(150,150,200,0.06)" : meta.glow }} />
        <div className="relative mx-auto aspect-square w-full max-w-[600px] p-4 sm:p-8">
          <CreatureArt species={species} stage={form} silhouette={hidden} showAura={!hidden} />
        </div>
        {/* evolution forms */}
        <div className="relative grid grid-cols-4 border-t border-line">
          {names.map((n, i) => {
            const locked = record ? i > (evoInfo?.stage ?? 0) : hidden;
            return (
              <button key={n} onClick={() => setForm(i)} className={`relative px-2 pb-4 pt-3 transition-colors ${i ? "border-l border-line" : ""} ${form === i ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}>
                {form === i && <span className="absolute inset-x-0 top-0 h-px bg-platinum" />}
                <div className="mx-auto aspect-square w-full max-w-[96px]">
                  <CreatureArt species={species} stage={i} animated={false} showAura={false} silhouette={locked} />
                </div>
                <p className={`mt-1 text-[9px] uppercase tracking-[0.22em] ${form === i ? "text-platinum" : "text-dim"}`}>{n}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* record */}
      <div className="flex flex-col px-6 py-10 sm:px-10 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <RarityBadge rarity={species.rarity} size="md" hidden={hidden && species.rarity === "secret"} />
          <span className="sl-num text-xs text-dim">No. {String(species.dex).padStart(3, "0")}</span>
        </div>

        {record && editing ? (
          <form
            className="mt-6 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onRename?.(name);
              setEditing(false);
            }}
          >
            <label htmlFor="sl-rename" className="sr-only">
              Name your Solanite
            </label>
            <input
              id="sl-rename"
              autoFocus
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder={species.name}
              className="w-full border-b border-white/25 bg-transparent py-2 font-display text-4xl text-platinum outline-none focus:border-platinum"
            />
            <button className="sl-btn sl-btn-ghost px-4">Save</button>
          </form>
        ) : (
          <h2 className="sl-display mt-6 flex items-baseline gap-3 text-5xl text-platinum sm:text-6xl">
            {hidden ? "Unrecorded" : (record?.nickname ?? species.name)}
            {record && (
              <button onClick={() => setEditing(true)} className="text-dim transition-colors hover:text-platinum" aria-label="Rename">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 20h4L19 9l-4-4L4 16v4z" /></svg>
              </button>
            )}
          </h2>
        )}
        <p className="mt-3 font-display text-xl italic text-silver">{hidden ? "Signature detected. Not yet hatched." : record?.nickname ? `${species.name}, ${species.epithet}` : species.epithet}</p>

        {!hidden && <p className="mt-6 max-w-md leading-relaxed text-mist">{species.anatomy}</p>}

        <dl className="mt-8 grid grid-cols-3 border-y border-line text-sm">
          {[
            ["Element", hidden ? "—" : species.element],
            ["Form", names[form]],
            ["Status", record ? (record.backed ? "Bonded" : "Dormant") : discovered ? "Recorded" : "Unrecorded"],
          ].map(([k, v], i) => (
            <div key={k} className={`py-4 ${i ? "border-l border-line pl-4" : ""}`}>
              <dt className="text-[9px] uppercase tracking-[0.26em] text-dim">{k}</dt>
              <dd className="mt-1.5 truncate text-platinum">{v}</dd>
            </div>
          ))}
        </dl>

        {record && evoInfo && (
          <div className="mt-8">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-silver">{evoInfo.isMax ? "Apex reached" : `Evolving toward ${evoInfo.nextName}`}</span>
              <span className="sl-num text-xs text-mist">{evoInfo.isMax ? "—" : formatDuration(evoInfo.remainingMs)}</span>
            </div>
            <ProgressBar value={evoInfo.progress} className="mt-3" colors={[meta.color2, meta.color]} />
            <p className="mt-3 text-xs text-dim">
              Bonded for {formatDuration(record.growthMs)} since hatching{!record.backed && ". Growth paused: balance below threshold"}
            </p>
          </div>
        )}

        {!hidden && (
          <>
            <dl className="mt-8 flex gap-10">
              {(Object.keys(stats) as (keyof typeof stats)[]).map((k) => (
                <div key={k}>
                  <dt className="text-[9px] uppercase tracking-[0.26em] text-dim">{k}</dt>
                  <dd className="sl-display mt-1 text-3xl text-platinum">{stats[k]}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-[10px] uppercase tracking-[0.26em] text-mist">{species.personality.join(" · ")}</p>
            <p className="mt-8 border-l pl-5 font-display text-lg italic leading-relaxed text-silver" style={{ borderColor: `${meta.color}88` }}>
              {species.lore}
            </p>
          </>
        )}
        {hidden && <p className="mt-8 max-w-md leading-relaxed text-mist">This Solanite has not been hatched by you. Its silhouette is all the archive will show until one is.</p>}
      </div>
    </div>
  );
}
