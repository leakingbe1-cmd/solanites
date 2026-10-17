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
  { id: "evolved", label: "Most Evolved", sort: (a: LeaderEntry, b: LeaderEntry) => b.evoStage - a.evoStage || b.growthDays - a.growthDays, metric: (e: LeaderEntry) => `${e.growthDays} days bonded` },
  { id: "holders", label: "Longest Holders", sort: (a: LeaderEntry, b: LeaderEntry) => b.heldDays - a.heldDays, metric: (e: LeaderEntry) => `${e.heldDays} days held` },
  { id: "rarest", label: "Rarest Discoveries", sort: (a: LeaderEntry, b: LeaderEntry) => rarityScore(b) - rarityScore(a), metric: (e: LeaderEntry) => RARITIES[e.species.rarity].label },
] as const;

export default function LeaderboardPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("evolved");
  const t = TABS.find((x) => x.id === tab)!;
  const rows = [...DATA].sort(t.sort).slice(0, 25);
  const podium = [rows[1], rows[0], rows[2]];

  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-28 sm:px-6 lg:px-10">
        <div className="text-center">
          <p className="sl-label">Hall of Keepers</p>
          <h1 className="sl-display mt-4 text-6xl text-platinum sm:text-7xl">Leaderboard</h1>
          <p className="mx-auto mt-5 max-w-lg text-mist">The most devoted keepers in the Hatchery.</p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-ember">Simulated data · prototype</p>
        </div>

        <div className="mx-auto mt-12 flex w-fit gap-8 border-b border-line">
          {TABS.map((x) => (
            <button key={x.id} onClick={() => setTab(x.id)} className={`relative pb-4 text-[11px] uppercase tracking-[0.22em] transition-colors ${tab === x.id ? "text-platinum" : "text-dim hover:text-silver"}`}>
              {x.label}
              {tab === x.id && <span className="absolute inset-x-0 -bottom-px h-px bg-platinum" />}
            </button>
          ))}
        </div>

        {/* podium */}
        <div className="mt-14 grid grid-cols-3 items-end border-l border-t border-line [&>*]:border-b [&>*]:border-r [&>*]:border-line">
          {podium.map((e, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            return (
              <div key={`${tab}-${e.wallet}`} className={`sl-fade-up flex flex-col items-center bg-void px-2 pb-8 text-center sm:px-6 ${rank === 1 ? "pt-10 sm:pb-12" : "pt-6"}`} style={{ animationDelay: `${rank * 0.12}s` }}>
                <span className={`sl-display ${rank === 1 ? "text-4xl text-platinum sm:text-5xl" : "text-3xl text-dim"}`}>{rank === 1 ? "I" : rank === 2 ? "II" : "III"}</span>
                <div className={rank === 1 ? "my-2 h-32 w-32 sm:h-64 sm:w-64" : "my-2 h-24 w-24 sm:h-44 sm:w-44"}>
                  <CreatureArt species={e.species} stage={e.evoStage} animated={false} />
                </div>
                <p className="truncate font-display text-lg text-platinum sm:text-2xl">{e.nickname ?? e.species.name}</p>
                <p className="sl-num mt-1 text-[10px] text-dim sm:text-xs">{shortAddress(e.wallet)}</p>
                <p className="mt-3 text-[9px] uppercase tracking-[0.24em] text-mist sm:text-[10px]">{t.metric(e)}</p>
              </div>
            );
          })}
        </div>

        {/* table */}
        <div className="mt-12">
          <div className="hidden grid-cols-[60px_1.6fr_1fr_1fr_80px] gap-4 border-b border-line pb-3 text-[9px] uppercase tracking-[0.26em] text-dim md:grid">
            <span>Rank</span>
            <span>Solanite</span>
            <span>Keeper</span>
            <span>Form</span>
            <span className="text-right">Days</span>
          </div>
          {rows.slice(3).map((e, i) => (
            <div key={`${tab}-${e.wallet}`} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-line py-3 transition-colors hover:bg-white/[0.015] md:grid-cols-[60px_1.6fr_1fr_1fr_80px] md:gap-4">
              <span className="sl-num text-sm text-dim">{String(i + 4).padStart(2, "0")}</span>
              <div className="flex min-w-0 items-center gap-4">
                <div className="h-14 w-14 shrink-0">
                  <CreatureArt species={e.species} stage={e.evoStage} animated={false} showAura={false} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-xl text-platinum">{e.nickname ?? e.species.name}</p>
                  <RarityBadge rarity={e.species.rarity} />
                </div>
              </div>
              <span className="sl-num hidden text-xs text-mist md:block">{shortAddress(e.wallet)}</span>
              <span className="hidden text-sm text-silver md:block">{gameConfig.evolution.names[e.evoStage]}</span>
              <span className="sl-num text-right text-xs text-silver">{tab === "evolved" ? e.growthDays : e.heldDays}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
