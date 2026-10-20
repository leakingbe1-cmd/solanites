"use client";

import { useEffect, useRef, useState } from "react";
import { freshnessParts, metricViews, POLL_MS, UNREACHABLE_NOTE, type MetricView } from "@/lib/homeMetrics";
import type { HomeStats } from "@/shared/homeStats";

/**
 * Live homepage metrics in the hero: holders, eggs collected and market cap, from
 * /api/home-stats. Polled every 30 s while the tab is visible; the last good answer stays on
 * screen if a refresh fails. Nothing is shown as a number unless the server has one.
 */
export function HomeMetrics() {
  const { stats, error } = useHomeStats();
  return <HomeMetricsView stats={stats} error={error} now={Date.now()} />;
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

/** The metrics for a given answer; exported for tests (no fetching, no timers). */
export function HomeMetricsView({ stats, error, now }: { stats: HomeStats | null; error: boolean; now: number }) {
  const loading = !stats && !error;
  const views: MetricView[] | null = stats
    ? metricViews(stats, now)
    : error
      ? (["Holders", "Eggs collected", "Live market cap"] as const).map((label, i) => ({ key: (["holders", "eggs", "marketCap"] as const)[i], label, value: null, format: String, status: "unavailable" as const, live: false, detail: UNREACHABLE_NOTE }))
      : null;
  return (
    <div role="region" aria-label="Live Solanites metrics" aria-busy={loading} className="sl-home-metrics" data-testid="home-metrics">
      <dl className="grid grid-cols-3 divide-x divide-white/10 rounded-md border border-white/[0.08] bg-void/55 py-2 backdrop-blur-sm sm:py-3.5">
        {(views ?? [null, null, null]).map((m, i) => (
          <div key={m?.key ?? i} className="flex min-w-0 flex-col items-center px-2 text-center lg:items-start lg:px-4 lg:text-left" data-metric={m?.key} data-status={m?.status ?? "loading"}>
            <dt className="flex min-w-0 max-w-full items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-dust sm:text-[10px] sm:tracking-[0.22em]">
              {m?.live && <span className="sl-live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-sol-green" aria-hidden data-live-dot />}
              {m?.shortLabel ? (
                <>
                  <span className="truncate sm:hidden">{m.shortLabel}</span>
                  <span className="hidden truncate sm:inline">{m.label}</span>
                </>
              ) : (
                <span className="truncate">{m?.label ?? ["Holders", "Eggs collected", "Live market cap"][i]}</span>
              )}
            </dt>
            <dd className="mt-1 min-h-[1.75rem] sm:mt-1.5 sm:min-h-[2.4rem]">
              {!m ? (
                <span className="block h-6 w-16 animate-pulse rounded bg-white/[0.06] sm:h-8 sm:w-24" data-skeleton />
              ) : m.value === null ? (
                <span className="font-display text-base text-mist sm:text-xl">Unavailable</span>
              ) : (
                <AnimatedNumber value={m.value} format={m.format} className="sl-metric-value font-display text-xl leading-tight tabular-nums text-bone sm:text-3xl" />
              )}
            </dd>
            {m?.detail && <dd className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-dust sm:text-[11px]">{m.detail}</dd>}
            {m?.live && <dd className="sr-only">Live</dd>}
          </div>
        ))}
      </dl>
      <p className="mt-1.5 truncate text-center font-mono text-[10px] tracking-[0.04em] text-dust/80 lg:text-left" data-testid="home-metrics-freshness">
        {stats
          ? freshnessParts(stats, now).map((p, i) => (
              <span key={p.text} className={p.optional ? "hidden sm:inline" : undefined}>
                {i > 0 && " · "}
                {p.text}
              </span>
            ))
          : loading
            ? "Loading live data…"
            : "Retrying every 30 s"}
      </p>
    </div>
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
