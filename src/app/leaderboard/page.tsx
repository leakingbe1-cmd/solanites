"use client";

import { useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { gameConfig } from "@/config/gameConfig";
import { mockLeaderboard, rarityScore, type LeaderEntry } from "@/data/leaderboard";
import { shortAddress } from "@/lib/format";
import { RARITIES } from "@/lib/rarity";

const DATA = mockLeaderboard();

const TABS = [
  { id: "evolved", label: "Most Evolved", sort: (a: LeaderEntry, b: LeaderEntry) => b.evoStage - a.evoStage || b.growthDays - a.growthDays, metric: (e: LeaderEntry) => `${e.growthDays}d bonded` },
  { id: "holders", label: "Longest Holders", sort: (a: LeaderEntry, b: LeaderEntry) => b.heldDays - a.heldDays, metric: (e: LeaderEntry) => `${e.heldDays} days held` },
  { id: "rarest", label: "Rarest Discoveries", sort: (a: LeaderEntry, b: LeaderEntry) => rarityScore(b) - rarityScore(a), metric: (e: LeaderEntry) => RARITIES[e.species.rarity].label },
] as const;

export default function LeaderboardPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("evolved");
  const t = TABS.find((x) => x.id === tab)!;
  const rows = [...DATA].sort(t.sort).slice(0, 25);
  const podium = [rows[1], rows[0], rows[2]];

  return (
    <div className="relative min-h-screen overflow-x-clip pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="sl-eyebrow">Hall of Keepers</p>
          <h1 className="mt-3 sl-display-l text-bone">Leaderboard</h1>
          <p className="mx-auto mt-4 max-w-lg text-mist">The most devoted keepers in the Hatchery.</p>
          <p className="mx-auto mt-4 inline-block rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300/90">Simulated data · prototype</p>
        </div>

        <div className="mx-auto mt-10 flex w-fit gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
          {TABS.map((x) => (
            <button key={x.id} onClick={() => setTab(x.id)} className={`rounded-full px-3 py-2 text-xs transition sm:px-5 sm:text-sm ${tab === x.id ? "bg-white/10 text-bone" : "text-mist hover:text-bone"}`}>
              {x.label}
            </button>
          ))}
        </div>

        {/* podium */}
        <div className="mt-12 grid grid-cols-3 items-end gap-2 sm:gap-5">
          {podium.map((e, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const meta = RARITIES[e.species.rarity];
            return (
              <div key={`${tab}-${e.wallet}`} className={`sl-fade-up sl-plate relative flex flex-col items-center rounded-md p-3 text-center sm:p-6 ${rank === 1 ? "sl-podium-first pb-8 sm:pb-12" : ""}`} style={{ animationDelay: `${rank * 0.1}s` }}>
                <span className={`relative font-display text-xl sm:text-3xl ${rank === 1 ? "sl-phx-gold" : "text-[#f6d488]/55"}`}>#{rank}</span>
                <div className={`relative ${rank === 1 ? "h-28 w-28 sm:h-56 sm:w-56" : "h-20 w-20 sm:h-40 sm:w-40"}`}>
                  <CreatureArt species={e.species} stage={e.evoStage} animated={false} />
                </div>
                <p className="relative truncate font-display text-sm text-bone sm:text-lg">{e.nickname ?? e.species.name}</p>
                <p className="relative font-mono text-[10px] text-mist sm:text-xs">{shortAddress(e.wallet)}</p>
                <p className="relative mt-2 font-mono text-[10px] uppercase tracking-wider sm:text-xs" style={{ color: meta.color }}>
                  {t.metric(e)}
                </p>
              </div>
            );
          })}
        </div>

        {/* table */}
        <div className="sl-panel mt-10 overflow-hidden rounded-md">
          <div className="hidden grid-cols-[60px_1.4fr_1fr_1fr_1fr] gap-4 border-b border-white/5 bg-white/[0.02] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-mist/60 md:grid">
            <span>Rank</span>
            <span>Solanite</span>
            <span>Keeper</span>
            <span>Form</span>
            <span className="text-right">Held</span>
          </div>
          {rows.slice(3).map((e, i) => (
            <div key={`${tab}-${e.wallet}`} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-3 transition hover:bg-white/[0.02] md:grid-cols-[60px_1.4fr_1fr_1fr_1fr] md:gap-4 md:px-6">
              <span className="font-mono text-sm text-mist">{i + 4}</span>
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-12 w-12 shrink-0">
                  <CreatureArt species={e.species} stage={e.evoStage} animated={false} showAura={false} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-bone">{e.nickname ?? e.species.name}</p>
                  <RarityBadge rarity={e.species.rarity} />
                </div>
              </div>
              <span className="hidden font-mono text-xs text-mist md:block">{shortAddress(e.wallet)}</span>
              <span className="hidden text-sm text-bone/80 md:block">{gameConfig.evolution.names[e.evoStage]}</span>
              <span className="text-right font-mono text-xs text-bone/80">{tab === "evolved" ? `${e.growthDays}d` : `${e.heldDays}d`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
