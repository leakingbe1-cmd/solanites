"use client";

import { useState } from "react";
import { useHatchery } from "@/state/HatcheryProvider";
import { ConnectGate } from "@/components/hatchery/ConnectGate";
import { EggCard } from "@/components/hatchery/EggCard";
import { CreatureCard } from "@/components/hatchery/CreatureCard";
import { EggInspector } from "@/components/hatchery/EggInspector";
import { HatchReveal } from "@/components/hatchery/HatchReveal";
import { SimulationPanel } from "@/components/hatchery/SimulationPanel";
import { CreatureDetail } from "@/components/creature/CreatureDetail";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatNumber } from "@/lib/format";
import { phaseOf, tokensToNextEgg } from "@/lib/progression";
import { SPECIES_BY_ID } from "@/lib/species";

export default function HatcheryPage() {
  const h = useHatchery();
  const [selected, setSelected] = useState<string | null>(null);
  const [inspect, setInspect] = useState<string | null>(null);
  const [hatching, setHatching] = useState<string | null>(null);

  if (!h.hydrated) return <div className="min-h-screen" />;
  if (!h.wallet) return <ConnectGate />;

  const cfg = h.config;
  const ordered = [...h.records].sort((a, b) => a.acquiredAt - b.acquiredAt);
  const eggs = ordered.filter((r) => phaseOf(r, cfg) !== "creature");
  const creatures = ordered.filter((r) => phaseOf(r, cfg) === "creature");
  const unbacked = h.records.filter((r) => !r.backed).length;
  const eligible = h.allowedEggs > 0;
  const lockedSlots = Math.max(0, cfg.eggs.maxEggsPerWallet - Math.max(h.allowedEggs, h.records.length));
  const toNext = tokensToNextEgg(h.balance, cfg);
  const inspected = h.records.find((r) => r.id === inspect);
  const hatchRec = h.records.find((r) => r.id === hatching);
  // The egg under the light: the user's pick, else the first one ready, else the oldest.
  const focus = eggs.find((r) => r.id === selected) ?? eggs.find((r) => phaseOf(r, cfg) === "ready") ?? eggs[0];

  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-10">
        {/* header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="sl-label">{h.isDemo ? "Demo session · Simulated data" : "Experimental live session"}</p>
            <h1 className="sl-display mt-4 text-6xl text-platinum sm:text-7xl">The Hatchery</h1>
          </div>
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-mist">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-platinum" />
            Simulated clock
            <span className="sl-num normal-case tracking-normal text-silver">
              {new Date(h.simNow).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · ×{formatNumber(h.speed)}
            </span>
          </p>
        </div>

        {/* status line */}
        <dl className="mt-10 grid grid-cols-2 border-y border-line lg:grid-cols-4">
          <Stat label="Balance" value={formatNumber(h.balance)} sub={`${cfg.token.symbol} · ${h.balanceSource === "mock" ? "mock" : "RPC"}`} />
          <Stat label="Eligibility" value={eligible ? "Eligible" : "Not eligible"} sub={eligible ? `${h.allowedEggs} egg${h.allowedEggs === 1 ? "" : "s"} backed` : `Need ${formatNumber(cfg.token.tokensPerEgg)} per egg`} accent={eligible ? undefined : "#e2c27e"} />
          <Stat label="Collection" value={`${h.records.length} / ${cfg.eggs.maxEggsPerWallet}`} sub={`${eggs.length} incubating · ${creatures.length} hatched`} />
          <div className="border-l border-line px-5 py-6 sm:px-7">
            <dt className="sl-label">Next egg</dt>
            {toNext === 0 ? (
              <dd className="sl-display mt-3 text-3xl text-platinum">Max reached</dd>
            ) : (
              <dd>
                <p className="sl-display mt-3 text-3xl text-platinum">+{formatNumber(toNext)}</p>
                <ProgressBar value={1 - toNext / cfg.token.tokensPerEgg} className="mt-3" />
              </dd>
            )}
          </div>
        </dl>

        {unbacked > 0 && (
          <p className="mt-6 border-l border-ember/70 py-1 pl-4 text-sm leading-relaxed text-silver">
            Your balance backs {h.allowedEggs} of {h.records.length} Solanites. {unbacked} {unbacked === 1 ? "is" : "are"} dormant:{" "}
            {cfg.policies.belowThreshold === "pause" ? "their progress is paused" : cfg.policies.belowThreshold === "reset" ? "their progress is being reset" : "progress continues anyway"} until you hold{" "}
            {formatNumber(h.records.length * cfg.token.tokensPerEgg)} tokens again. Newest eggs go dormant first.
          </p>
        )}

        {/* the chamber */}
        <section className="mt-12 border border-line bg-[linear-gradient(180deg,#0c0c10,#070709)]" aria-label="Incubation chamber">
          {focus ? (
            <EggInspector key={focus.id} record={focus} index={ordered.indexOf(focus)} simNow={h.simNow} onHatch={() => setHatching(focus.id)} />
          ) : (
            <div className="px-6 py-24 text-center">
              <p className="sl-display text-4xl text-platinum">The chamber is empty.</p>
              <p className="mt-4 text-mist">{h.canClaim ? "Your balance qualifies for an egg. Claim it below." : "Hold enough tokens to qualify for an egg."}</p>
            </div>
          )}
        </section>

        {/* egg rack */}
        <SectionTitle title="Incubating" count={eggs.length} />
        <div className="grid grid-cols-2 border-l border-t border-line [&>*]:border-b [&>*]:border-r [&>*]:border-line sm:grid-cols-3 lg:grid-cols-6">
          {eggs.map((r) => (
            <EggCard key={r.id} record={r} index={ordered.indexOf(r)} selected={focus?.id === r.id} onSelect={() => setSelected(r.id)} />
          ))}
          {h.canClaim && (
            <button onClick={h.claimEgg} className="group flex min-h-[280px] flex-col items-center justify-center bg-void p-5 text-center transition-colors hover:bg-abyss">
              <span className="grid h-12 w-12 place-items-center border border-platinum/40 font-display text-3xl text-platinum transition-colors group-hover:border-platinum">+</span>
              <span className="mt-5 font-display text-xl text-platinum">Claim new egg</span>
              <span className="mt-2 text-xs text-mist">Qualifies for {h.allowedEggs - h.records.length} more</span>
            </button>
          )}
          {Array.from({ length: lockedSlots }).map((_, i) => (
            <div key={i} className="flex min-h-[280px] flex-col items-center justify-center bg-void p-5 text-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-dim" fill="none" stroke="currentColor" strokeWidth="1.1"><rect x="5" y="11" width="14" height="9" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              <p className="mt-4 font-display text-lg text-mist">Locked</p>
              <p className="sl-num mt-1 text-[10px] text-dim">{formatNumber((Math.max(h.allowedEggs, h.records.length) + i + 1) * cfg.token.tokensPerEgg)} tokens</p>
            </div>
          ))}
        </div>
        {eggs.length === 0 && !h.canClaim && lockedSlots === 0 && <p className="mt-4 text-mist">No eggs incubating.</p>}

        {/* creatures */}
        <SectionTitle title="Your Solanites" count={creatures.length} />
        {creatures.length ? (
          <div className="grid border-l border-t border-line [&>*]:border-b [&>*]:border-r [&>*]:border-line sm:grid-cols-2 lg:grid-cols-3">
            {creatures.map((r) => (
              <CreatureCard key={r.id} record={r} onOpen={() => setInspect(r.id)} />
            ))}
          </div>
        ) : (
          <p className="border border-line p-12 text-center text-mist">No Solanites yet. Your first hatch is waiting.</p>
        )}

        <div className="mt-20">
          <SimulationPanel />
        </div>
      </div>

      <Modal open={!!inspected} onClose={() => setInspect(null)} label="Inspect" wide>
        {inspected &&
          (phaseOf(inspected, cfg) === "creature" ? (
            <CreatureDetail key={inspected.id} species={SPECIES_BY_ID[inspected.speciesId]} record={inspected} onRename={(n) => h.rename(inspected.id, n)} />
          ) : (
            <EggInspector
              record={inspected}
              simNow={h.simNow}
              onHatch={() => {
                setInspect(null);
                setHatching(inspected.id);
              }}
            />
          ))}
      </Modal>

      {hatchRec && (
        <HatchReveal
          species={SPECIES_BY_ID[hatchRec.speciesId]}
          seed={hatchRec.seed}
          onHatched={() => h.hatch(hatchRec.id)}
          onClose={() => setHatching(null)}
          onView={() => {
            const id = hatchRec.id;
            setHatching(null);
            setInspect(id);
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) {
  return (
    <div className="border-l border-line px-5 py-6 first:border-l-0 sm:px-7 [&:nth-child(3)]:border-l-0 lg:[&:nth-child(3)]:border-l">
      <dt className="sl-label">{label}</dt>
      <dd className="sl-display mt-3 text-3xl text-platinum" style={accent ? { color: accent } : undefined}>
        {value}
      </dd>
      <dd className="mt-1.5 text-xs text-mist">{sub}</dd>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-6 mt-20 flex items-baseline gap-4">
      <h2 className="font-display text-3xl text-platinum sm:text-4xl">{title}</h2>
      <span className="sl-num text-xs text-dim">{String(count).padStart(2, "0")}</span>
    </div>
  );
}
