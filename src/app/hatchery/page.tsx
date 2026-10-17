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
import { ParticleField } from "@/components/ui/ParticleField";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatNumber } from "@/lib/format";
import { phaseOf, tokensToNextEgg } from "@/lib/progression";
import { SPECIES_BY_ID } from "@/lib/species";

export default function HatcheryPage() {
  const h = useHatchery();
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

  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px]">
        <ParticleField density={0.00008} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">{h.isDemo ? "Demo session · simulated data" : "Experimental live session"}</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">The Hatchery</h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sol-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sol-green" />
            </span>
            Simulated clock · {new Date(h.simNow).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · ×{formatNumber(h.speed)}
          </div>
        </div>

        {/* status */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Wallet balance" value={`${formatNumber(h.balance)}`} sub={`${cfg.token.symbol}${h.balanceSource === "mock" ? " · mock" : " · RPC"}`} />
          <Stat
            label="Eligibility"
            value={eligible ? "Eligible" : "Not eligible"}
            sub={eligible ? `${h.allowedEggs} egg${h.allowedEggs === 1 ? "" : "s"} backed` : `Need ${formatNumber(cfg.token.tokensPerEgg)} per egg`}
            accent={eligible ? "#14f195" : "#ffb84d"}
          />
          <Stat label="Collection" value={`${h.records.length} / ${cfg.eggs.maxEggsPerWallet}`} sub={`${eggs.length} incubating · ${creatures.length} hatched`} />
          <div className="sl-glass rounded-2xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">Next egg</p>
            {toNext === 0 ? (
              <p className="mt-2 font-display text-xl text-white">Max reached</p>
            ) : (
              <>
                <p className="mt-2 font-display text-xl text-white">+{formatNumber(toNext)}</p>
                <ProgressBar value={1 - toNext / cfg.token.tokensPerEgg} className="mt-2" />
              </>
            )}
          </div>
        </div>

        {unbacked > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm text-amber-100/90">
            <span className="mt-0.5 text-amber-300">⚠</span>
            <p>
              Your balance backs {h.allowedEggs} of {h.records.length} Solanites. {unbacked} {unbacked === 1 ? "is" : "are"} dormant —{" "}
              {cfg.policies.belowThreshold === "pause" ? "their progress is paused" : cfg.policies.belowThreshold === "reset" ? "their progress is being reset" : "progress continues anyway"} until you hold{" "}
              {formatNumber(h.records.length * cfg.token.tokensPerEgg)} tokens again. Newest eggs go dormant first.
            </p>
          </div>
        )}

        {/* eggs */}
        <SectionTitle title="Incubating" count={eggs.length} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {eggs.map((r) => (
            <EggCard key={r.id} record={r} index={ordered.indexOf(r)} onOpen={() => setInspect(r.id)} onHatch={() => setHatching(r.id)} />
          ))}
          {h.canClaim && (
            <button
              onClick={h.claimEgg}
              className="sl-card-hover group flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-sol-green/40 bg-sol-green/[0.03] p-6 text-center transition hover:bg-sol-green/[0.06]"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full border border-sol-green/40 text-3xl text-sol-green transition group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(20,241,149,0.4)]">+</span>
              <span className="mt-5 font-display text-lg text-white">Claim new egg</span>
              <span className="mt-2 text-sm text-mist">Your balance qualifies for {h.allowedEggs - h.records.length} more.</span>
            </button>
          )}
          {Array.from({ length: lockedSlots }).map((_, i) => (
            <div key={i} className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-white/[0.01] p-6 text-center">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              <p className="mt-4 font-display text-white/50">Locked slot</p>
              <p className="mt-1 text-xs text-mist/50">Hold {formatNumber((Math.max(h.allowedEggs, h.records.length) + i + 1) * cfg.token.tokensPerEgg)} tokens</p>
            </div>
          ))}
          {eggs.length === 0 && !h.canClaim && lockedSlots === 0 && <p className="text-mist">No eggs incubating.</p>}
        </div>

        {/* creatures */}
        <SectionTitle title="Your Solanites" count={creatures.length} />
        {creatures.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {creatures.map((r) => (
              <CreatureCard key={r.id} record={r} onOpen={() => setInspect(r.id)} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-white/5 p-10 text-center text-mist">No Solanites yet. Your first hatch is waiting.</p>
        )}

        <div className="mt-16">
          <SimulationPanel />
        </div>
      </div>

      <Modal open={!!inspected} onClose={() => setInspect(null)} label="Inspect" wide={inspected ? phaseOf(inspected, cfg) === "creature" : false}>
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
    <div className="sl-glass rounded-2xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">{label}</p>
      <p className="mt-2 font-display text-xl text-white" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-xs text-mist">{sub}</p>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-5 mt-14 flex items-center gap-4">
      <h2 className="font-display text-xl text-white sm:text-2xl">{title}</h2>
      <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-xs text-mist">{count}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}
