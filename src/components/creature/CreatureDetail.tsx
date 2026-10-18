"use client";

import { useMemo, useState } from "react";
import { CreatureArt } from "./CreatureArt";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gameConfig } from "@/config/gameConfig";
import { stageAsset } from "@/lib/creatureAssets";
import { designOf } from "@/lib/creatureDesigns";
import { discoveryOf, type Discovery } from "@/lib/discovery";
import { formatDays, formatDuration } from "@/lib/format";
import { evolutionOf, type SolaniteRecord } from "@/lib/progression";
import { RARITIES } from "@/lib/rarity";
import { ELEMENT_GLYPH, SPECIES, statsAt, type Species } from "@/lib/species";
import { useHatchery } from "@/state/HatcheryProvider";

interface CreatureDetailProps {
  species: Species;
  /** Present when the viewer owns this creature (Hatchery). */
  record?: SolaniteRecord;
  onRename?: (name: string) => void;
  /** Collection browsing: open another species. */
  onSelectSpecies?: (s: Species) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const STATUS_LABEL: Record<Discovery, string> = { owned: "Discovered by you", catalogued: "Catalogued", classified: "Classified" };

export function CreatureDetail({ species, record, onRename, onSelectSpecies, onPrev, onNext }: CreatureDetailProps) {
  const h = useHatchery();
  const names = gameConfig.evolution.names;
  const discovery = discoveryOf(species, h.discovered);
  const hidden = discovery === "classified";
  const design = designOf(species.id);
  const meta = RARITIES[species.rarity];

  // Real progression only: the owned creature's stage, or the best stage among the viewer's hatched creatures of this species.
  const evoInfo = record ? evolutionOf(record.growthMs, gameConfig) : null;
  const bestOwned = useMemo(() => {
    let best = -1;
    for (const r of h.records) if (r.speciesId === species.id && r.hatchedAt !== null) best = Math.max(best, evolutionOf(r.growthMs, gameConfig).stage);
    return best;
  }, [h.records, species.id]);
  const current = evoInfo?.stage ?? (bestOwned >= 0 ? bestOwned : null);

  const [selected, setSelected] = useState(current ?? 3);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(record?.nickname ?? "");

  /** A stage is locked when this specific creature hasn't reached it, or the whole species is classified. */
  const locked = (i: number) => hidden || (record ? i > (evoInfo?.stage ?? 0) : false);
  const selLocked = locked(selected);
  const stats = statsAt(species, selected);

  const related = useMemo(() => {
    const others = SPECIES.filter((s) => s.id !== species.id);
    const sameElement = others.filter((s) => s.element === species.element);
    const sameRarity = others.filter((s) => s.rarity === species.rarity && s.element !== species.element);
    return [...sameElement, ...sameRarity].slice(0, 5);
  }, [species]);

  return (
    <div className="p-5 sm:p-7">
      {(onPrev || onNext) && (
        <div className="mb-5 flex gap-2 pr-12">
          <button onClick={onPrev} disabled={!onPrev} className="rounded-full border border-white/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mist transition enabled:hover:text-white disabled:opacity-30">
            ‹ Prev
          </button>
          <button onClick={onNext} disabled={!onNext} className="rounded-full border border-white/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition enabled:hover:border-white/30 disabled:opacity-30">
            Next ›
          </button>
        </div>
      )}

      {/* ── identity + four stages ── */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="min-w-0">
          <p className="font-mono text-xs text-mist/60">#{String(species.dex).padStart(3, "0")}</p>
          {record && editing ? (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                onRename?.(name);
                setEditing(false);
              }}
            >
              <input id="creature-nickname" autoFocus value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder={species.name} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-display text-xl text-white outline-none focus:border-sol-purple" />
              <button className="rounded-xl bg-white/10 px-4 text-sm">Save</button>
            </form>
          ) : (
            <h2 className="mt-1 flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {hidden ? "???" : (record?.nickname ?? species.name)}
              {record && (
                <button onClick={() => setEditing(true)} className="text-mist/50 transition hover:text-white" aria-label="Rename">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
                  </svg>
                </button>
              )}
            </h2>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RarityBadge rarity={species.rarity} size="md" hidden={hidden && species.rarity === "secret"} />
            {!hidden && (
              <span className="text-sm text-mist">
                {ELEMENT_GLYPH[species.element]} {species.element}
              </span>
            )}
          </div>
          {record?.nickname && <p className="mt-2 text-sm text-mist">{species.name} · {species.epithet}</p>}
          <p className="mt-4 text-sm leading-relaxed text-mist">
            {hidden ? "This Solanite's signature has been detected, but no keeper has revealed it to you. Hatch one to see its true form." : species.lore}
          </p>
          <dl className="mt-5 divide-y divide-white/5 border-y border-white/5 text-sm">
            {[
              ["Element", hidden ? "???" : `${ELEMENT_GLYPH[species.element]} ${species.element}`],
              ["Rarity", hidden && species.rarity === "secret" ? "Unknown" : meta.label],
              ["Evolution stages", String(names.length)],
              ["Status", record ? (record.backed ? "Bonded" : "Dormant — balance below threshold") : STATUS_LABEL[discovery]],
              ["Your best", current !== null ? names[current] : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist/60">{k}</dt>
                <dd className="text-right text-white/90">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className="sl-scrollbar-none -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0" aria-label="Evolution stages">
          {names.map((n, i) => {
            const isLocked = locked(i);
            const isCurrent = current === i;
            const isSel = selected === i;
            return (
              <li key={n} className="w-[62vw] max-w-[230px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                <button
                  onClick={() => setSelected(i)}
                  aria-pressed={isSel}
                  className={`relative flex h-full w-full flex-col overflow-hidden rounded-2xl border text-left transition ${isSel ? "border-white/30 bg-white/[0.06]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/15"}`}
                  style={isCurrent ? { boxShadow: `0 0 0 1px ${meta.color}, 0 0 30px -10px ${meta.glow}` } : undefined}
                >
                  <div className="relative aspect-square w-full" style={{ background: `radial-gradient(circle at 50% 60%, ${isLocked ? "rgba(110,90,255,0.12)" : meta.glow}, transparent 70%)` }}>
                    <CreatureArt species={species} stage={i} animated={false} showAura={false} silhouette={isLocked} />
                    {isCurrent && <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-black" style={{ background: meta.color }}>{record ? "Current" : "Your best"}</span>}
                    {isLocked && !hidden && <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-mist">Locked</span>}
                    {i < names.length - 1 && <span className="absolute -right-2 top-1/2 hidden text-lg text-mist/40 sm:block" aria-hidden>›</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-mist/60">Stage {i + 1}</p>
                    <p className="mt-0.5 font-display text-base text-white">{n}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-mist">
                      {hidden ? "Undiscovered." : isLocked ? `Unlocks after ${formatDays(gameConfig.evolution.thresholdsMs[i])} bonded.` : (design?.stages[i]?.summary ?? "")}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── featured stage ── */}
      <div className="mt-6 grid overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] md:grid-cols-[1.3fr_1fr]">
        <div className="relative aspect-square md:aspect-auto md:min-h-[420px]" style={{ background: `radial-gradient(circle at 50% 55%, ${selLocked ? "rgba(110,90,255,0.15)" : meta.glow}, transparent 70%)` }}>
          <div className="absolute inset-0 mx-auto max-w-[520px]">
            <CreatureArt species={species} stage={selected} silhouette={selLocked} />
          </div>
          {!selLocked && !stageAsset(species.id, selected) && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-mist/70">Placeholder art</span>
          )}
        </div>
        <div className="flex min-w-0 flex-col p-5 sm:p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/60">Stage {selected + 1} of 4</p>
          <h3 className="mt-1 font-display text-2xl text-white">{names[selected]} form</h3>
          {hidden ? (
            <p className="mt-3 text-sm leading-relaxed text-mist">Its form is unknown until you discover it.</p>
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-mist">{selLocked ? `Not reached yet. This form unlocks after ${formatDays(gameConfig.evolution.thresholdsMs[selected])} of qualifying hold since hatching.` : design?.stages[selected]?.summary}</p>
              {design && !selLocked && (
                <dl className="mt-4 space-y-2 text-xs leading-relaxed">
                  {[
                    ["Form", design.silhouette],
                    ["Materials", design.materials],
                    ["Element", design.effects],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[76px_1fr] gap-2">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/60">{k}</dt>
                      <dd className="text-white/80">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {!selLocked && (
                <div className="mt-5 space-y-2.5">
                  {(Object.keys(stats) as (keyof typeof stats)[]).map((k) => (
                    <div key={k} className="grid grid-cols-[64px_1fr_32px] items-center gap-3 text-xs">
                      <span className="uppercase tracking-widest text-mist/70">{k}</span>
                      <ProgressBar value={stats[k] / 250} colors={[meta.color2, meta.color]} glow={false} />
                      <span className="text-right font-mono text-white/80">{stats[k]}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                {species.personality.map((p) => (
                  <span key={p} className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist">
                    {p}
                  </span>
                ))}
              </div>
            </>
          )}
          {record && evoInfo && (
            <div className="mt-auto pt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-white">{evoInfo.isMax ? "Ascended" : `Evolving to ${evoInfo.nextName}`}</span>
                <span className="font-mono text-xs text-mist">{evoInfo.isMax ? "MAX" : formatDuration(evoInfo.remainingMs)}</span>
              </div>
              <ProgressBar value={evoInfo.progress} className="mt-2.5" colors={[meta.color2, meta.color]} />
              <p className="mt-2 text-xs text-mist/70">
                Bonded for {formatDuration(record.growthMs)} since hatching{!record.backed && " · growth paused (balance below threshold)"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── related ── */}
      {related.length > 0 && (
        <div className="mt-7">
          <h3 className="flex items-center gap-3 font-display text-lg text-white">
            Related creatures <span className="font-sans text-xs text-mist">{hidden ? "" : `${species.element} & ${meta.label}`}</span>
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((s) => {
              const d = discoveryOf(s, h.discovered);
              const rh = d === "classified";
              const body = (
                <>
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                    <span className="text-mist/60">#{String(s.dex).padStart(3, "0")}</span>
                    {d === "owned" && <span className="text-sol-green">● Discovered</span>}
                  </div>
                  <div className="sl-art-host aspect-square" style={{ "--sl-glow": rh ? "rgba(110,90,255,0.3)" : RARITIES[s.rarity].glow } as React.CSSProperties}>
                    <CreatureArt species={s} stage={2} showAura={false} silhouette={rh} />
                  </div>
                  <p className="truncate font-display text-sm text-white">{rh ? "???" : s.name}</p>
                  <div className="mt-1.5">
                    <RarityBadge rarity={s.rarity} hidden={rh && s.rarity === "secret"} />
                  </div>
                </>
              );
              return onSelectSpecies ? (
                <button key={s.id} onClick={() => onSelectSpecies(s)} className="sl-card-hover group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 text-left hover:border-white/15">
                  {body}
                </button>
              ) : (
                <div key={s.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3">
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
