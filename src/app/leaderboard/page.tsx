"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { columnText, formName, freshness, HOLDERS_NOTE, metricText, RANK_RULES, SAMPLE_LABEL, SAMPLE_PODIUM, sourceBadge, TABS } from "@/lib/leaderboard";
import { RARITIES } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";
import { LEADERBOARD_POLL_MS, type Leaderboard, type LeaderboardCategory, type LeaderRow } from "@/shared/leaderboard";

type Load = { board: Leaderboard | null; refreshFailed: boolean; unavailable: string | null; notConfigured?: boolean };

/** Polls /api/leaderboard every 30 s while the tab is visible; keeps the last good answer on failure. */
function useLeaderboard(): Load {
  const [state, setState] = useState<Load>({ board: null, refreshFailed: false, unavailable: null });
  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    const load = async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const message: string = body?.error?.message ?? "The leaderboard is temporarily unavailable.";
          const notConfigured = body?.error?.code === "NOT_CONFIGURED";
          if (alive) setState((s) => (s.board ? { ...s, refreshFailed: true } : { board: null, refreshFailed: true, unavailable: message, notConfigured }));
          return;
        }
        if (alive) setState({ board: body as Leaderboard, refreshFailed: false, unavailable: null });
      } catch {
        if (alive) setState((s) => (s.board ? { ...s, refreshFailed: true } : { board: null, refreshFailed: true, unavailable: "The leaderboard is temporarily unavailable." }));
      }
    };
    // One timer at a time; none while the tab is hidden.
    const schedule = () => {
      window.clearTimeout(timer);
      if (alive && !document.hidden) timer = window.setTimeout(() => void load().then(schedule), LEADERBOARD_POLL_MS);
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

/** Before launch: the three lists, what it takes to rank, and a clearly labelled sample podium. */
function PreLaunchLeaderboard() {
  const podium = [SAMPLE_PODIUM[1], SAMPLE_PODIUM[0], SAMPLE_PODIUM[2]];
  return (
    <div className="relative min-h-screen overflow-x-clip pt-24 lg:pt-28" data-testid="leaderboard-prelaunch">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="sl-eyebrow">Hall of Keepers</p>
          <h1 className="mt-3 sl-display-l text-bone">Leaderboard</h1>
          <p className="mx-auto mt-4 max-w-lg text-mist">Three lists, ranked from on-chain holding and the creatures you hatch.</p>
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80" aria-hidden="true" />
            Opens at launch
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {TABS.map((x) => (
            <div key={x.id} className="sl-panel rounded-md p-5">
              <p className="font-display text-xl text-bone">{x.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-mist">{RANK_RULES[x.id]}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-14">
          <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-amber-300/90" data-testid="sample-label">
            {SAMPLE_LABEL} · {TABS[0].label}
          </p>
          <div className="grid grid-cols-3 items-end gap-2 opacity-80 sm:gap-5">
            {podium.map((e) => {
              const species = e.creature ? SPECIES_BY_ID[e.creature.speciesId] : undefined;
              const color = species ? RARITIES[species.rarity].color : undefined;
              return (
                <div key={e.rank} className={`sl-plate relative flex flex-col items-center rounded-md border border-dashed border-amber-300/20 p-3 text-center sm:p-6 ${e.rank === 1 ? "pb-8 sm:pb-12" : ""}`}>
                  <span className="relative font-display text-xl text-[#f6d488]/55 sm:text-3xl">#{e.rank}</span>
                  <Art row={e} size={e.rank === 1 ? "h-28 w-28 sm:h-56 sm:w-56" : "h-20 w-20 sm:h-40 sm:w-40"} />
                  <p className="relative truncate font-display text-sm text-bone sm:text-lg">{species?.name}</p>
                  <p className="relative font-mono text-[10px] uppercase tracking-wider text-amber-300/80 sm:text-xs">Sample</p>
                  <p className="relative mt-2 font-mono text-[10px] uppercase tracking-wider sm:text-xs" style={color ? { color } : undefined}>
                    {metricText("evolved", e)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-mist">
          Want to see how ranking feels? <Link href="/hatchery?demo=1" className="text-bone underline-offset-4 hover:underline">Try the demo</Link>. Demo creatures never appear here.
        </p>
      </div>
    </div>
  );
}

/** Re-renders every few seconds so "updated Xs ago" stays true between polls. */
function useNow(stepMs = 5_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), stepMs);
    return () => window.clearInterval(id);
  }, [stepMs]);
  return now;
}

function Art({ row, size, aura = true }: { row: LeaderRow; size: string; aura?: boolean }) {
  const species = row.creature ? SPECIES_BY_ID[row.creature.speciesId] : undefined;
  return <div className={`relative ${size}`}>{species && row.creature ? <CreatureArt species={species} stage={row.creature.stage} animated={false} showAura={aura} /> : <EggArt stage={1} />}</div>;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<LeaderboardCategory>("evolved");
  const { board, refreshFailed, unavailable, notConfigured } = useLeaderboard();
  const now = useNow();
  const t = TABS.find((x) => x.id === tab)!;
  const rows = board?.categories[tab] ?? [];
  const podium = [rows[1], rows[0], rows[2]];
  const badge = board ? sourceBadge(board) : null;
  const fresh = board ? freshness(board, now, refreshFailed) : null;

  if (!board && notConfigured) return <PreLaunchLeaderboard />;

  return (
    <div className="relative min-h-screen overflow-x-clip pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="sl-eyebrow">Hall of Keepers</p>
          <h1 className="mt-3 sl-display-l text-bone">Leaderboard</h1>
          <p className="mx-auto mt-4 max-w-lg text-mist">The most devoted keepers in the Hatchery.</p>
          {badge && (
            <p
              className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] ${
                badge.kind === "live" ? "border-sol-green/25 bg-sol-green/5 text-sol-green/90" : "border-amber-400/20 bg-amber-400/5 text-amber-300/90"
              }`}
            >
              {badge.kind === "live" && <span className="h-1.5 w-1.5 rounded-full bg-sol-green" aria-hidden="true" />}
              {badge.text}
            </p>
          )}
          {fresh && (
            <p className={`mt-3 font-mono text-[11px] ${fresh.stale ? "text-amber-300/80" : "text-mist"}`} aria-live="polite">
              {fresh.text}
            </p>
          )}
        </div>

        <div className="mx-auto mt-10 flex w-fit gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
          {TABS.map((x) => (
            <button key={x.id} onClick={() => setTab(x.id)} className={`rounded-full px-3 py-2 text-xs transition sm:px-5 sm:text-sm ${tab === x.id ? "bg-white/10 text-bone" : "text-mist hover:text-bone"}`}>
              {x.label}
            </button>
          ))}
        </div>
        {tab === "holders" && board && <p className="mx-auto mt-4 max-w-xl text-center text-xs text-mist">{HOLDERS_NOTE}</p>}

        {!board && (
          <p className="sl-panel mx-auto mt-12 max-w-lg rounded-md p-6 text-center text-mist" role="status">
            {unavailable ?? "Loading the Hall of Keepers…"}
          </p>
        )}
        {board && rows.length === 0 && (
          <p className="sl-panel mx-auto mt-12 max-w-lg rounded-md p-6 text-center text-mist" role="status">
            No keepers qualify for this list yet.
          </p>
        )}

        {/* podium: the top three of the same ranked list as the table */}
        {rows.length > 0 && (
          <div className="mt-12 grid grid-cols-3 items-end gap-2 sm:gap-5">
            {podium.map((e, i) => {
              const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
              if (!e) return <div key={`empty-${rank}`} />;
              const color = e.creature ? RARITIES[SPECIES_BY_ID[e.creature.speciesId]?.rarity ?? "common"].color : undefined;
              const species = e.creature ? SPECIES_BY_ID[e.creature.speciesId] : undefined;
              return (
                <div key={`${tab}-${e.rank}-${e.keeper}`} className={`sl-fade-up sl-plate relative flex flex-col items-center rounded-md p-3 text-center sm:p-6 ${rank === 1 ? "sl-podium-first pb-8 sm:pb-12" : ""}`} style={{ animationDelay: `${rank * 0.1}s` }}>
                  <span className={`relative font-display text-xl sm:text-3xl ${rank === 1 ? "sl-phx-gold" : "text-[#f6d488]/55"}`}>#{rank}</span>
                  <Art row={e} size={rank === 1 ? "h-28 w-28 sm:h-56 sm:w-56" : "h-20 w-20 sm:h-40 sm:w-40"} />
                  <p className="relative truncate font-display text-sm text-bone sm:text-lg">{species?.name ?? "Unhatched"}</p>
                  <p className="relative font-mono text-[10px] text-mist sm:text-xs">{e.keeper}</p>
                  <p className="relative mt-2 font-mono text-[10px] uppercase tracking-wider sm:text-xs" style={color ? { color } : undefined}>
                    {metricText(tab, e)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* table */}
        {rows.length > 3 && (
          <div className="sl-panel mt-10 overflow-hidden rounded-md">
            <div className="hidden grid-cols-[60px_1.4fr_1fr_1fr_1fr] gap-4 border-b border-white/5 bg-white/[0.02] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-mist/60 md:grid">
              <span>Rank</span>
              <span>Solanite</span>
              <span>Keeper</span>
              <span>Form</span>
              <span className="text-right">{t.column}</span>
            </div>
            {rows.slice(3).map((e) => {
              const species = e.creature ? SPECIES_BY_ID[e.creature.speciesId] : undefined;
              return (
                <div key={`${tab}-${e.rank}-${e.keeper}`} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-3 transition hover:bg-white/[0.02] md:grid-cols-[60px_1.4fr_1fr_1fr_1fr] md:gap-4 md:px-6">
                  <span className="font-mono text-sm text-mist">{e.rank}</span>
                  <div className="flex min-w-0 items-center gap-3">
                    <Art row={e} size="h-12 w-12 shrink-0" aura={false} />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-bone">{species?.name ?? "Unhatched"}</p>
                      {species && <RarityBadge rarity={species.rarity} />}
                    </div>
                  </div>
                  <span className="hidden font-mono text-xs text-mist md:block">{e.keeper}</span>
                  <span className="hidden text-sm text-bone/80 md:block">{formName(e)}</span>
                  <span className="text-right font-mono text-xs text-bone/80">{columnText(tab, e)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
