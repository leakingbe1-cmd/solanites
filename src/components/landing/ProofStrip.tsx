"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gameConfig } from "@/config/gameConfig";
import { formatCount, isPreLaunch, metricViews, POLL_MS, type MetricView } from "@/lib/homeMetrics";
import { formatNumber } from "@/lib/format";
import { CATALOGUE_SIZE } from "@/lib/species";
import type { HomeStats } from "@/shared/homeStats";
import type { Proof } from "@/shared/proof";
import { useHatchery } from "@/state/HatcheryProvider";

/**
 * The proof strip under the hero. Before launch it lists what is real today (species, the tracker,
 * fixed rules) with links to /proof and How It Works. Once the server has a mint and RPC it switches
 * itself to live numbers (holders, eggs issued, eggs hatched) and a read-only "paste any wallet"
 * lookup. A figure without data is left out; nothing ever reads "Unavailable", and no price is shown.
 */
export function ProofStrip() {
  const { stats } = useHomeStats();
  const live = !!stats && !isPreLaunch(stats);
  const hatched = useHatchedCount(live);
  return <ProofStripView stats={stats} hatched={hatched} now={Date.now()} />;
}

function useHomeStats() {
  const [state, setState] = useState<{ stats: HomeStats | null; error: boolean }>({ stats: null, error: false });
  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    const load = async () => {
      try {
        const res = await fetch("/api/home-stats", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const stats = (await res.json()) as HomeStats;
        if (alive) setState({ stats, error: false });
      } catch {
        if (alive) setState((s) => ({ ...s, error: true }));
      }
    };
    // One timer at a time; none while the tab is hidden.
    const schedule = () => {
      window.clearTimeout(timer);
      if (alive && !document.hidden) timer = window.setTimeout(() => void load().then(schedule), POLL_MS);
    };
    const onVisibility = () => (document.hidden ? window.clearTimeout(timer) : void load().then(schedule));
    void load().then(schedule);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return state;
}

/** Eggs hatched so far, from /api/proof; null until known or before launch. */
function useHatchedCount(live: boolean): number | null {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!live) return;
    fetch("/api/proof", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Proof>) : null))
      .then((p) => p && setN(p.eggs.hatched))
      .catch(() => {});
  }, [live]);
  return n;
}

/** The figures with data, live mode only: holders and eggs (never market cap), plus eggs hatched. */
export function liveFigures(stats: HomeStats | null, hatched: number | null, now: number): MetricView[] {
  if (!stats || isPreLaunch(stats)) return [];
  const views = metricViews(stats, now).filter((v) => v.key !== "marketCap" && v.value !== null);
  if (hatched !== null) views.push({ key: "eggs", label: "Eggs hatched", value: hatched, format: formatCount, status: "live", live: true, detail: null });
  return views;
}

/** The strip for a given answer; exported for tests (no fetching, no timers). */
export function ProofStripView({ stats, hatched, now }: { stats: HomeStats | null; hatched: number | null; now: number }) {
  const figures = liveFigures(stats, hatched, now);
  return (
    <section aria-label="What you can check" className="relative border-y border-white/5 bg-void/80 py-8 sm:py-10" data-testid="proof-strip" data-state={figures.length ? "live" : "prelaunch"}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {figures.length ? <LiveFigures figures={figures} /> : <TodayFacts />}
        <div className="flex flex-col gap-3 lg:items-end">
          {figures.length > 0 && <WalletLookup />}
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <Link href="/proof" className="text-sol-green/90 underline-offset-4 hover:underline">
              Check the proof →
            </Link>
            <Link href="/how-it-works" className="text-sol-green/90 underline-offset-4 hover:underline">
              How it works →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Before launch: only what is true today. */
function TodayFacts() {
  const facts = [
    { k: `${CATALOGUE_SIZE} species`, v: "live, every one painted", href: "/collection" },
    { k: "Holder tracker", v: "built: eggs come from on-chain balances, no wallet connection", href: "/proof" },
    { k: "Rules", v: `fixed in code: ${formatNumber(gameConfig.token.tokensPerEgg)} ${gameConfig.token.symbol} = 1 egg`, href: "/how-it-works#rules" },
  ];
  return (
    <div>
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-200/90">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80" aria-hidden />
        Pre-launch · live numbers switch on at launch
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3 sm:gap-6">
        {facts.map((f) => (
          <li key={f.k}>
            <Link href={f.href} className="group block">
              <span className="font-display text-xl text-bone">{f.k}</span> <span className="text-sm text-mist group-hover:text-bone">{f.v}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveFigures({ figures }: { figures: MetricView[] }) {
  return (
    <dl className="grid grid-cols-3 gap-4 sm:gap-8">
      {figures.map((m) => (
        <div key={m.label} className="flex min-w-0 flex-col" data-metric={m.label}>
          <dt className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-dust sm:text-[10px] sm:tracking-[0.22em]">
            {m.live && <span className="sl-live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-sol-green" aria-hidden data-live-dot />}
            <span className="truncate">{m.label}</span>
          </dt>
          <dd className="mt-1">
            <AnimatedNumber value={m.value!} format={m.format} className="font-display text-2xl tabular-nums text-bone sm:text-3xl" />
          </dd>
          {m.detail && <dd className="text-[11px] text-dust">{m.detail}</dd>}
        </div>
      ))}
    </dl>
  );
}

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** Read-only: any public address, opened in the tracked Hatchery. No wallet connection or signature. */
function WalletLookup() {
  const h = useHatchery();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState(false);
  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const a = address.trim();
        if (!BASE58.test(a)) return setError(true);
        h.watch(a);
        router.push("/hatchery");
      }}
    >
      <input
        value={address}
        onChange={(e) => (setAddress(e.target.value), setError(false))}
        placeholder="Paste any wallet to see its eggs"
        aria-label="Public Solana address"
        aria-invalid={error}
        className={`min-w-0 flex-1 rounded-full border bg-abyss px-4 py-2.5 font-mono text-xs text-bone outline-none placeholder:text-mist/60 ${error ? "border-amber-300/60" : "border-white/10 focus:border-white/25"}`}
      />
      <button type="submit" className="shrink-0 rounded-full border border-white/15 px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-bone hover:bg-white/5">
        See eggs
      </button>
    </form>
  );
}

/** Eases from the previous value to the new one (about 0.7 s); jumps straight there under reduced motion. */
function AnimatedNumber({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (start === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(value);
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 700);
      setShown(start + (value - start) * (1 - (1 - k) ** 3));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className={className} data-value={value}>
      {format(shown)}
    </span>
  );
}
