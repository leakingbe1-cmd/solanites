"use client";

import { useCallback, useEffect, useState } from "react";
import { CreatureDetail } from "@/components/creature/CreatureDetail";
import { CreatureCard } from "@/components/hatchery/CreatureCard";
import { EggCard } from "@/components/hatchery/EggCard";
import { EggInspector } from "@/components/hatchery/EggInspector";
import { HatchReveal } from "@/components/hatchery/HatchReveal";
import { SectionTitle, Stat } from "@/components/hatchery/HatcheryUi";
import { Modal } from "@/components/ui/Modal";
import { ParticleField } from "@/components/ui/ParticleField";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { describeSchedule } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { formatDuration, formatNumber, shortAddress } from "@/lib/format";
import type { SolaniteRecord } from "@/lib/progression";
import { SPECIES_BY_ID } from "@/lib/species";
import type { HatchResult, TrackedEgg, TrackedHolderView, TrackerApiError } from "@/shared/trackedHolder";
import { useHatchery } from "@/state/HatcheryProvider";

type Load = { kind: "loading" } | { kind: "error"; code: string; message: string } | { kind: "ready"; view: TrackedHolderView; offset: number };

const POLL_MS = 20_000;

/** A tracked egg in the shape the existing egg and creature components expect. */
function toRecord(e: TrackedEgg, now: number): SolaniteRecord {
  const elapsed = Math.max(0, now - e.incubationStartedAt);
  return {
    id: e.id,
    seed: e.displaySeed,
    acquiredAt: e.earnedAt,
    incubationMs: e.hatchedAt !== null ? e.incubationMs : Math.min(e.incubationMs, elapsed),
    durationMs: e.incubationMs,
    speciesId: e.speciesId ?? "",
    hatchedAt: e.hatchedAt,
    growthMs: e.hatchedAt !== null ? Math.max(0, now - e.hatchedAt) : 0,
    backed: true,
  };
}

/**
 * Hatchery for an automatically tracked address. Read-only: no wallet
 * connection. Eggs, timers and outcomes come from the server; the browser
 * only counts down between refreshes.
 */
export function TrackedHatchery({ address }: { address: string }) {
  const h = useHatchery();
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  // Re-render once a second so countdowns move between server refreshes.
  const [, setTick] = useState(0);
  const [inspect, setInspect] = useState<string | null>(null);
  const [hatching, setHatching] = useState<{ record: SolaniteRecord; speciesId: string } | null>(null);
  const [hatchError, setHatchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/holders/${encodeURIComponent(address)}`, { cache: "no-store" });
      const body = (await res.json().catch(() => null)) as TrackedHolderView | TrackerApiError | null;
      if (!body) return setLoad({ kind: "error", code: "UPSTREAM_ERROR", message: `The server answered HTTP ${res.status}.` });
      if ("error" in body) return setLoad((l) => (l.kind === "ready" && body.error.code === "RPC_UNAVAILABLE" ? l : { kind: "error", code: body.error.code, message: body.error.message }));
      setLoad({ kind: "ready", view: body, offset: body.serverNow - Date.now() });
    } catch {
      setLoad((l) => (l.kind === "ready" ? l : { kind: "error", code: "UPSTREAM_ERROR", message: "Could not reach the Solanites server." }));
    }
  }, [address]);

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, POLL_MS);
    const clock = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [refresh]);

  async function hatch(egg: TrackedEgg, record: SolaniteRecord) {
    setHatchError(null);
    const res = await fetch(`/api/eggs/${encodeURIComponent(egg.id)}/hatch`, { method: "POST" });
    const body = (await res.json().catch(() => null)) as HatchResult | TrackerApiError | null;
    if (!body || "error" in body) {
      setHatchError(body && "error" in body ? body.error.message : "Hatching failed. Please try again.");
      return refresh();
    }
    setInspect(null);
    setHatching({ record, speciesId: body.speciesId });
  }

  if (load.kind === "loading") return <Shell address={address} onExit={h.disconnect} />;
  if (load.kind === "error") return <Shell address={address} onExit={h.disconnect} error={load} />;

  const { view } = load;
  const now = Date.now() + load.offset;
  const eggs = view.eggs.filter((e) => e.status !== "hatched");
  const creatures = view.eggs.filter((e) => e.status === "hatched");
  const recordOf = (e: TrackedEgg) => toRecord(e, now);
  const inspected = view.eggs.find((e) => e.id === inspect);
  const unit = view.rules.tokensPerEgg;
  const toNext = Number(view.holdings.toNextEgg);

  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px]">
        <ParticleField density={0.00008} />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {view.source === "fixture" && <FixtureBanner />}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">Tracked automatically · no wallet connected</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">The Hatchery</h1>
            <p className="mt-3 break-all font-mono text-xs text-mist">{address}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sol-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sol-green" />
            </span>
            {view.sync.lastSyncedAt ? `Verified ${formatDuration(now - view.sync.lastSyncedAt)} ago · slot ${view.holdings.slot.toLocaleString()}` : "Waiting for first sync"}
            <button onClick={h.disconnect} className="rounded-full border border-white/10 px-3 py-1.5 normal-case tracking-normal text-mist transition hover:text-white">
              Change address
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Qualifying holdings"
            value={`${Number(view.holdings.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            sub={`${gameConfig.token.symbol} · ${view.holdings.qualifyingUnits} × ${formatNumber(unit)}`}
          />
          <Stat label="Eggs earned" value={String(view.counts.earned)} sub={`${view.counts.incubating} incubating · ${view.counts.queued} queued · ${view.counts.ready} ready`} accent={view.counts.earned ? "#14f195" : undefined} />
          <Stat label="Hatched" value={String(view.counts.hatched)} sub="Solanites revealed" />
          <div className="sl-glass rounded-2xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">Next egg</p>
            {view.holdings.excluded ? (
              <p className="mt-2 font-display text-xl text-white">Not eligible</p>
            ) : (
              <>
                <p className="mt-2 font-display text-xl text-white">+{toNext.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <ProgressBar value={1 - toNext / unit} className="mt-2" />
              </>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {view.holdings.excluded && <Note tone="warn">This is a project, pool or program-controlled address, so it does not earn eggs.</Note>}
          {!view.tracked && !view.holdings.excluded && <Note>No {gameConfig.token.symbol} has been seen at this address yet. Eggs appear here automatically once it holds {formatNumber(unit)} or more.</Note>}
          {view.sync.error && <Note tone="warn">{view.sync.error}</Note>}
          {Number(view.holdings.inheritedCreditAmount) > 0 && (
            <Note>
              {Number(view.holdings.inheritedCreditAmount).toLocaleString()} of these tokens came from a wallet where they had already earned an egg, so they don&apos;t earn another here. New eggs come
              from tokens that haven&apos;t earned one yet.
            </Note>
          )}
          {hatchError && <Note tone="warn">{hatchError}</Note>}
        </div>

        <SectionTitle title="Incubating" count={eggs.length} />
        {eggs.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {eggs.map((e) => {
              const rec = recordOf(e);
              const startsIn = e.incubationStartedAt - now;
              return (
                <EggCard
                  key={e.id}
                  record={rec}
                  index={e.sequence - 1}
                  badge={startsIn > 0 ? "Queued" : undefined}
                  footnote={startsIn > 0 ? `Starts in ${formatDuration(startsIn)}` : `Earned ${formatDuration(now - e.earnedAt)} ago`}
                  onOpen={() => setInspect(e.id)}
                  onHatch={() => hatch(e, rec)}
                />
              );
            })}
          </div>
        ) : (
          <p className="rounded-3xl border border-white/5 p-10 text-center text-mist">
            {view.counts.earned ? "Every egg has hatched." : `Hold ${formatNumber(unit)} ${gameConfig.token.symbol} to earn your first egg. It hatches ${describeSchedule().split(",")[0]} after it appears.`}
          </p>
        )}

        <SectionTitle title="Your Solanites" count={creatures.length} />
        {creatures.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {creatures.map((e) => (
              <CreatureCard key={e.id} record={recordOf(e)} onOpen={() => setInspect(e.id)} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-white/5 p-10 text-center text-mist">No Solanites hatched yet.</p>
        )}

        <p className="mt-16 text-xs leading-relaxed text-mist/70">
          Incubation: {describeSchedule()}. Timers run on the server, so they keep going while you are away and look the same on every device. Earned eggs are never taken back if the balance
          later drops. Anyone can view a public address; nothing here needs or asks for a wallet signature, seed phrase or private key.
        </p>
      </div>

      <Modal open={!!inspected} onClose={() => setInspect(null)} label="Inspect" wide={inspected?.status === "hatched"}>
        {inspected &&
          (inspected.status === "hatched" && inspected.speciesId ? (
            <CreatureDetail key={inspected.id} species={SPECIES_BY_ID[inspected.speciesId]} record={recordOf(inspected)} />
          ) : (
            <EggInspector
              record={recordOf(inspected)}
              simNow={now}
              tracked={{ sequence: inspected.sequence, startsInMs: Math.max(0, inspected.incubationStartedAt - now) }}
              onHatch={() => hatch(inspected, recordOf(inspected))}
            />
          ))}
      </Modal>

      {hatching && (
        <HatchReveal
          species={SPECIES_BY_ID[hatching.speciesId]}
          seed={hatching.record.seed}
          onHatched={() => h.discover(hatching.speciesId)}
          onClose={() => {
            setHatching(null);
            refresh();
          }}
          onView={() => {
            const id = hatching.record.id;
            setHatching(null);
            refresh().then(() => setInspect(id));
          }}
        />
      )}
    </div>
  );
}

function Note({ children, tone }: { children: React.ReactNode; tone?: "warn" }) {
  return (
    <p className={`rounded-2xl border p-4 text-sm leading-relaxed ${tone === "warn" ? "border-amber-400/25 bg-amber-400/[0.06] text-amber-100/90" : "border-white/10 bg-white/[0.03] text-mist"}`}>{children}</p>
  );
}

function FixtureBanner() {
  return (
    <div role="status" className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
      <strong className="font-semibold">Fixture data.</strong> This server is running in local fixture mode: these holders, balances and eggs are test data, not real {gameConfig.token.symbol} holders.
    </div>
  );
}

function Shell({ address, onExit, error }: { address: string; onExit(): void; error?: { code: string; message: string } }) {
  const notLive = error?.code === "NOT_CONFIGURED";
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">Tracked address</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white">The Hatchery</h1>
        <p className="mt-3 break-all font-mono text-xs text-mist">{shortAddress(address)}</p>
        {!error ? (
          <div className="mt-10 h-40 animate-pulse rounded-3xl bg-white/[0.03]" />
        ) : (
          <div role="alert" className="mt-10 rounded-3xl border border-amber-400/25 bg-amber-400/[0.06] p-6 text-amber-100/90">
            <p className="font-display text-lg text-amber-200">{notLive ? "Automatic tracking isn't switched on yet" : "Couldn't load this address"}</p>
            <p className="mt-2 text-sm leading-relaxed">
              {notLive ? "Egg tracking starts once the official token mint, a Solana data provider and the database are configured for this site. No eggs are shown rather than made-up ones." : error.message}
            </p>
          </div>
        )}
        <button onClick={onExit} className="mt-6 rounded-full border border-white/15 px-6 py-3 text-xs uppercase tracking-[0.2em] text-mist transition hover:text-white">
          Back
        </button>
      </div>
    </div>
  );
}
