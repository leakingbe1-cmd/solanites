"use client";

import { useCallback, useEffect, useState } from "react";
import { CreatureDetail } from "@/components/creature/CreatureDetail";
import { CreatureCard } from "@/components/hatchery/CreatureCard";
import { EggCard } from "@/components/hatchery/EggCard";
import { EggInspector } from "@/components/hatchery/EggInspector";
import { HatchReveal } from "@/components/hatchery/HatchReveal";
import { SectionTitle, Stat } from "@/components/hatchery/HatcheryUi";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { describeGrowthSchedule, describeSchedule, incubationMsFor, initialGrowthMsFor } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { formatDuration, formatNumber, formatSpan, shortAddress } from "@/lib/format";
import { evolutionOf, type SolaniteRecord } from "@/lib/progression";
import { revealClassified } from "@/components/creature/revealClassified";
import { SPECIES_BY_ID } from "@/lib/species";
import type { HatchResult, TrackedEgg, TrackedHolderView, TrackerApiError } from "@/shared/trackedHolder";
import { useHatchery } from "@/state/HatcheryProvider";

type Load = { kind: "loading" } | { kind: "error"; code: string; message: string } | { kind: "ready"; view: TrackedHolderView; offset: number };

const POLL_MS = 20_000;

/** A tracked egg in the shape the existing egg and creature components expect. */
function toRecord(e: TrackedEgg, now: number, serverNow: number): SolaniteRecord {
  const elapsed = Math.max(0, now - e.incubationStartedAt);
  return {
    id: e.id,
    seed: e.displaySeed,
    acquiredAt: e.earnedAt,
    incubationMs: e.hatchedAt !== null ? e.incubationMs : Math.min(e.incubationMs, elapsed),
    durationMs: e.incubationMs,
    speciesId: e.speciesId ?? "",
    hatchedAt: e.hatchedAt,
    // Server-verified qualifying hold, counted forward only while the balance still backs it.
    growthMs: e.growthMs === null ? 0 : e.growthMs + (e.growing ? Math.max(0, now - serverNow) : 0),
    maturityMs: e.maturityMs,
    backed: e.hatchedAt === null || e.growing,
  };
}

/** A balance not re-verified for this long is shown as possibly out of date. */
const STALE_AFTER_MS = 30 * 60_000;

type Milestone = { text: string; inMs: number; progress: number | null; action?: "hatch" };

/**
 * The next thing that will happen for this address, from the server's
 * timestamps (shifted onto the server clock). Display only: the server decides
 * every transition.
 */
function nextMilestone(eggs: TrackedEgg[], now: number, serverNow: number): Milestone | null {
  const ready = eggs.find((e) => e.hatchedAt === null && now >= e.readyAt);
  if (ready) return { text: `Egg #${ready.sequence} has hatched. Reveal it to meet your Solanite`, inMs: 0, progress: 1, action: "hatch" };
  const options: Milestone[] = [];
  const incubating = eggs.find((e) => e.hatchedAt === null && now >= e.incubationStartedAt && now < e.readyAt);
  if (incubating) options.push({ text: `Egg #${incubating.sequence} hatches`, inMs: incubating.readyAt - now, progress: (now - incubating.incubationStartedAt) / Math.max(1, incubating.incubationMs) });
  for (const e of eggs) {
    if (e.hatchedAt === null || e.growthMs === null || !e.growing) continue;
    // Count forward from the server's figure the same way the creature card does.
    const evo = evolutionOf(e.growthMs + Math.max(0, now - serverNow), gameConfig, e.maturityMs);
    if (evo.isFinal || evo.nextLabel === null) continue;
    const name = e.speciesId ? (SPECIES_BY_ID[e.speciesId]?.name ?? "Your Solanite") : "Your Solanite";
    options.push({ text: evo.phase === "growing" ? `${name} is fully grown` : `${name} becomes ${evo.nextLabel}`, inMs: evo.toNextMs, progress: evo.toNextProgress });
  }
  return options.sort((x, y) => x.inMs - y.inMs)[0] ?? null;
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
      // Classified species arrive only with this holder's hatched eggs; make them drawable first.
      revealClassified(body.classified);
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

  // When the next milestone falls due, ask the server rather than waiting for the next poll.
  useEffect(() => {
    if (load.kind !== "ready") return;
    const m = nextMilestone(load.view.eggs, Date.now() + load.offset, load.view.serverNow);
    if (!m || m.action === "hatch") return;
    const t = window.setTimeout(refresh, Math.max(2000, m.inMs + 500));
    return () => window.clearTimeout(t);
  }, [load, refresh]);

  async function hatch(egg: TrackedEgg, record: SolaniteRecord) {
    setHatchError(null);
    const res = await fetch(`/api/eggs/${encodeURIComponent(egg.id)}/hatch`, { method: "POST" });
    const body = (await res.json().catch(() => null)) as HatchResult | TrackerApiError | null;
    if (!body || "error" in body) {
      setHatchError(body && "error" in body ? body.error.message : "Hatching failed. Please try again.");
      return refresh();
    }
    revealClassified(body.classified);
    setInspect(null);
    setHatching({ record, speciesId: body.speciesId });
  }

  if (load.kind === "loading") return <Shell address={address} onExit={h.disconnect} />;
  if (load.kind === "error")
    return (
      <Shell
        address={address}
        onExit={h.disconnect}
        error={load}
        onRetry={() => {
          setLoad({ kind: "loading" });
          refresh();
        }}
      />
    );

  const { view } = load;
  const now = Date.now() + load.offset;
  const eggs = view.eggs.filter((e) => e.status !== "hatched");
  const creatures = view.eggs.filter((e) => e.status === "hatched");
  const recordOf = (e: TrackedEgg) => toRecord(e, now, view.serverNow);
  const inspected = view.eggs.find((e) => e.id === inspect);
  const unit = view.rules.tokensPerEgg;
  const toNext = Number(view.holdings.toNextEgg);
  const lastVerified = view.sync.lastSyncedAt;
  const stale = lastVerified !== null && now - lastVerified > STALE_AFTER_MS;
  const milestone = nextMilestone(view.eggs, now, view.serverNow);
  const milestoneEgg = milestone?.action === "hatch" ? view.eggs.find((e) => e.hatchedAt === null && now >= e.readyAt) : undefined;

  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {view.source === "fixture" && <FixtureBanner />}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="sl-eyebrow">Tracked automatically · no wallet connected</p>
            <h1 className="mt-3 sl-display-l text-bone">The Hatchery</h1>
            <p className="mt-3 break-all font-mono text-xs text-mist">{address}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${stale || lastVerified === null ? "bg-amber-300" : "bg-sol-green"}`} />
            </span>
            <span data-testid="verification-status">
              {lastVerified !== null ? `Balance verified on Solana ${formatDuration(now - lastVerified)} ago · slot ${view.holdings.slot.toLocaleString()}` : "Balance not verified yet"}
            </span>
            <button onClick={h.disconnect} className="rounded-full border border-white/10 px-3 py-1.5 normal-case tracking-normal text-mist transition hover:text-bone">
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
          <div className="sl-glass rounded-md p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">Next egg</p>
            {view.holdings.excluded ? (
              <p className="mt-2 font-display text-xl text-bone">Not eligible</p>
            ) : (
              <>
                <p className="mt-2 font-display text-xl text-bone">+{toNext.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <ProgressBar value={1 - toNext / unit} className="mt-2" />
              </>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {view.holdings.excluded && <Note tone="warn">This is a project, pool or program-controlled address, so it does not earn eggs.</Note>}
          {!view.tracked && !view.holdings.excluded && <Note>No {gameConfig.token.symbol} has been seen at this address yet. Eggs appear here automatically once it holds {formatNumber(unit)} or more.</Note>}
          {view.sync.error && <Note tone="warn">{view.sync.error}</Note>}
          {stale && (
            <Note tone="warn">
              This balance was last verified {formatDuration(now - lastVerified!)} ago, so it may be out of date. It is re-checked automatically; new eggs are only issued from a fresh, complete
              reading of the chain.
            </Note>
          )}
          {Number(view.holdings.inheritedCreditAmount) > 0 && (
            <Note>
              {Number(view.holdings.inheritedCreditAmount).toLocaleString()} of these tokens came from a wallet where they had already earned an egg, so they don&apos;t earn another here. New eggs come
              from tokens that haven&apos;t earned one yet.
            </Note>
          )}
          {hatchError && <Note tone="warn">{hatchError}</Note>}
        </div>

        {milestone && (
          <div className="sl-glass mt-6 flex flex-col gap-3 rounded-md p-4 sm:flex-row sm:items-center sm:justify-between" data-testid="next-milestone">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sol-green/80">Next milestone</p>
              <p className="mt-1 font-display text-lg text-bone">{milestone.text}</p>
              {milestone.progress !== null && milestone.inMs > 0 && <ProgressBar value={milestone.progress} className="mt-2 max-w-md" label="Progress to the next milestone" />}
            </div>
            {milestoneEgg ? (
              <button onClick={() => hatch(milestoneEgg, recordOf(milestoneEgg))} className="sl-btn-gold shrink-0 rounded-full px-6 py-3 font-sans text-xs font-semibold tracking-[0.2em] text-bone">
                REVEAL
              </button>
            ) : (
              <p className="shrink-0 font-mono text-2xl tabular-nums text-bone" data-testid="next-milestone-in">
                {formatDuration(milestone.inMs)}
              </p>
            )}
          </div>
        )}

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
          <p className="rounded-md border border-white/5 p-10 text-center text-mist">
            {view.counts.earned ? "Every egg has hatched." : `Hold ${formatNumber(unit)} ${gameConfig.token.symbol} to earn your first egg. It hatches ${formatSpan(incubationMsFor(1))} after it appears, and the creature is fully grown ${formatSpan(initialGrowthMsFor(1))} after that.`}
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
          <p className="rounded-md border border-white/5 p-10 text-center text-mist">No Solanites hatched yet.</p>
        )}

        <p className="mt-16 text-xs leading-relaxed text-mist/70">
          Incubation: {describeSchedule()}. Growing up after hatching: {describeGrowthSchedule()}. Timers run on the server, so they keep going while you are away and look the same on every device. Earned eggs are never taken back if the balance
          later drops. Anyone can view a public address; nothing here needs or asks for a wallet signature, seed phrase or private key.
        </p>
      </div>

      <Modal open={!!inspected} onClose={() => setInspect(null)} label="Inspect" wide={inspected?.status === "hatched"}>
        {inspected &&
          (inspected.status === "hatched" && inspected.speciesId ? (
            <CreatureDetail key={inspected.id} species={SPECIES_BY_ID[inspected.speciesId]} record={recordOf(inspected)} ownerAddress={address} />
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
    <p className={`rounded-md border p-4 text-sm leading-relaxed ${tone === "warn" ? "border-amber-400/25 bg-amber-400/[0.06] text-amber-100/90" : "border-white/10 bg-white/[0.03] text-mist"}`}>{children}</p>
  );
}

function FixtureBanner() {
  return (
    <div role="status" className="mb-6 rounded-md border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
      <strong className="font-semibold">Fixture data.</strong> This server is running in local fixture mode: these holders, balances and eggs are test data, not real {gameConfig.token.symbol} holders.
    </div>
  );
}

function Shell({ address, onExit, onRetry, error }: { address: string; onExit(): void; onRetry?: () => void; error?: { code: string; message: string } }) {
  const notLive = error?.code === "NOT_CONFIGURED";
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="sl-eyebrow">Tracked address</p>
        <h1 className="mt-3 sl-display-l text-bone">The Hatchery</h1>
        <p className="mt-3 break-all font-mono text-xs text-mist">{shortAddress(address)}</p>
        {!error ? (
          <div className="mt-10" aria-busy="true">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist/70">Reading this address from Solana…</p>
            <div className="mt-4 h-40 animate-pulse rounded-md bg-white/[0.03]" />
          </div>
        ) : (
          <div role="alert" className="mt-10 rounded-md border border-amber-400/25 bg-amber-400/[0.06] p-6 text-amber-100/90">
            <p className="font-display text-lg text-amber-200">{notLive ? "Automatic tracking isn't switched on yet" : "Couldn't load this address"}</p>
            <p className="mt-2 text-sm leading-relaxed">
              {notLive ? "Egg tracking starts once the official token mint, a Solana data provider and the database are configured for this site. No eggs are shown rather than made-up ones." : error.message}
            </p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {error && !notLive && onRetry && (
            <button onClick={onRetry} className="sl-btn-outline rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-bone">
              Try again
            </button>
          )}
          <button onClick={onExit} className="rounded-full border border-white/15 px-6 py-3 text-xs uppercase tracking-[0.2em] text-mist transition hover:text-bone">
            {error ? "Use another address" : "Back"}
          </button>
        </div>
        {notLive && (
          <p className="mt-6 text-sm leading-relaxed text-mist">
            Meanwhile, the demo shows how incubation, hatching and evolution work with simulated data. Use another address, then choose <span className="text-bone">Explore the demo</span>.
          </p>
        )}
      </div>
    </div>
  );
}
