"use client";

import Link from "next/link";
import { useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { CreatureScene } from "@/components/creature/CreatureScene";
import { STATUS } from "@/components/market/CreatureMarketPanel";
import { panelMode } from "@/components/market/panelMode";
import { PriceChart } from "@/components/market/PriceChart";
import { TradingViewOverview } from "@/components/market/TradingViewOverview";
import { useMarketSnapshot } from "@/components/market/useMarketSnapshot";
import { gameConfig } from "@/config/gameConfig";
import { GROWTH_RULES } from "@/lib/market/growth";
import type { WidgetStatus } from "@/lib/market/tradingview";
import type { MarketRange } from "@/lib/market/types";
import { RARITIES } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";

/**
 * Homepage "Market Bond" section: the creature-and-stock link as a headline feature, right
 * after the hero. The creature stays the hero of the section; the market sits beside it.
 *
 * Everything market-related comes from /api/market/:speciesId (the stock service's public
 * endpoint), so tickers stay out of the bundle, the data label is the service's own
 * ("Unavailable", "Sample data", "Previous close"…) and nothing is shown that the service
 * doesn't have: no price, chart or vigour is drawn without real stored data. With public display
 * off (the default), the only prices are TradingView's widget, and only when the server marks the
 * snapshot for it (panelMode, the same rule as the profile panel); Market Vigour isn't shown.
 *
 * Featured species are public ones with finished painted art. A species' stock is the same at
 * every stage (it is keyed by species, never by stage), which the stage strip makes visible.
 */
const FEATURED = ["aurelion", "mossling", "glimmeray", "frostkit", "driftfin", "pallow"] as const;
const RANGES: MarketRange[] = ["1W", "1M", "3M", "1Y"];
const STAGES = gameConfig.evolution.names;
const UP = "#46c9b0";
const DOWN = "#ef6a5a";

const fmtPrice = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtSigned = (n: number, dp = 2) => `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n).toFixed(dp)}`;
const fmtSession = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function StockShowcase() {
  const [pick, setPick] = useState<(typeof FEATURED)[number]>(FEATURED[0]);
  const [stage, setStage] = useState(3);
  const [range, setRange] = useState<MarketRange>("1M");
  const species = SPECIES_BY_ID[pick];
  const accent = species.palette.accent;
  const load = useMarketSnapshot(pick, range);
  const snap = load.state === "ok" ? load.snap : null;
  const stock = snap?.stock ?? null;
  const mode = snap ? panelMode(snap, { ownerTools: false }) : null;
  const [widget, setWidget] = useState<WidgetStatus>("idle");
  const status = mode?.kind === "widget" ? (widget === "failed" ? STATUS.unavailable : { label: "TradingView", tone: "text-vellum border-rim-strong" }) : snap ? STATUS[snap.status] : null;

  return (
    <div className="grid items-start gap-x-14 gap-y-8 lg:grid-cols-12" data-testid="stock-showcase">
      {/* ── the bond in one line, and the creature picker (first on phones) ── */}
      <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-1">
        <p className="sl-eyebrow is-gilt">Market Bond</p>
        <h2 className="mt-4 sl-display-l text-bone">
          Every Solanite is bonded to a <span className="italic text-gilt">real company.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
          Each species is paired with one publicly traded stock for life, the same from {STAGES[0]} to {STAGES[STAGES.length - 1]}. Follow your creature&apos;s company
          right beside it.
        </p>

        {/* species picker */}
        <div role="radiogroup" aria-label="Featured Solanite" className="sl-scrollbar-none -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {FEATURED.map((id) => {
            const s = SPECIES_BY_ID[id];
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={pick === id}
                onClick={() => setPick(id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm transition ${pick === id ? "border-white/30 bg-white/10 text-bone" : "border-white/10 text-mist hover:text-bone"}`}
              >
                <span className="block h-8 w-8 overflow-hidden rounded-full bg-black/40">
                  <CreatureArt species={s} stage={2} animated={false} />
                </span>
                {s.name}
              </button>
            );
          })}
        </div>

      </div>

      {/* ── the creature, with its stock at every stage ── */}
      <div className="lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <div className="sl-plate relative overflow-hidden p-4 sm:p-6" style={{ "--tier": RARITIES[species.rarity].color } as React.CSSProperties}>
          <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="text-[#f6d488]/70">№ {String(species.dex).padStart(3, "0")}</span>
            <span style={{ color: RARITIES[species.rarity].color }}>{RARITIES[species.rarity].label}</span>
          </div>
          <div className="relative mx-auto mt-2 aspect-square w-full max-w-[420px]">
            <CreatureScene key={`${pick}-${stage}`} species={species} stage={stage} size="quiet" className="absolute inset-0 rounded-[3px]" artClassName="sl-art-host" />
          </div>
          <div className="relative mt-2 flex flex-wrap items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
            <div className="min-w-0">
              <p className="font-display text-3xl leading-none text-bone sm:text-4xl">{species.name}</p>
              <p className="mt-1.5 text-sm text-mist">{species.epithet}</p>
            </div>
            <TickerChip ticker={stock?.ticker} accent={accent} large />
          </div>
        </div>

        {/* the same company at every stage */}
        <div className="mt-4" role="group" aria-label={`${species.name}'s four stages`}>
          <p className="sl-label text-dust">Same stock at every stage</p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
            {STAGES.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => setStage(i)}
                aria-pressed={stage === i}
                className={`sl-plate relative flex min-w-0 flex-col items-center px-1 pb-2 pt-1 transition ${stage === i ? "outline outline-1 outline-gilt/60" : "opacity-80 hover:opacity-100"}`}
                data-stage={i}
              >
                <span className="block aspect-square w-full">
                  <CreatureArt species={species} stage={i} animated={false} />
                </span>
                <span className="mt-1 block max-w-full truncate text-[11px] text-bone">{name}</span>
                <span className="mt-1 font-mono text-[10px] tracking-[0.12em] text-mist" data-stage-ticker>
                  {stock?.ticker ?? "···"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── the linked stock, with the service's own data status ── */}
      <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-2">
        {/* the linked stock */}
        <div className="sl-plate relative p-5 sm:p-6" aria-live="polite" aria-busy={load.state === "loading"}>
          {load.state === "loading" && (
            <div aria-hidden>
              <div className="h-4 w-28 rounded bg-white/5" />
              <div className="mt-3 h-7 w-56 rounded bg-white/5" />
              <div className="mt-6 h-[180px] rounded-xl bg-white/[0.03]" />
            </div>
          )}
          {(load.state === "error" || load.state === "hidden") && (
            <p className="text-sm text-vellum">{load.state === "error" ? load.message : "This Solanite's stock link isn't available."}</p>
          )}
          {snap && stock && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="sl-label text-dust">{species.name}&apos;s stock</p>
                  <p className="mt-1.5 break-words font-display text-2xl leading-tight text-bone sm:text-3xl">{stock.company}</p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-vellum">
                    {stock.ticker} · {stock.exchange} <span className="normal-case tracking-normal text-dust">· {stock.sector}</span>
                  </p>
                </div>
                {status && (
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${status.tone}`} data-testid="market-status">
                    {status.label}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm italic text-vellum">{stock.connection}</p>

              {mode?.kind === "widget" ? (
                <div className="mt-5" data-testid="market-widget">
                  <TradingViewOverview key={mode.symbol} symbol={mode.symbol} company={stock.company} accent={accent} onStatus={setWidget} />
                  <p className="mt-3 text-xs text-dust">Prices and chart by TradingView; timing per TradingView, may be delayed.</p>
                </div>
              ) : mode?.kind === "none" ? (
                <p className="mt-5 text-sm text-vellum" data-testid="market-no-price">
                  No price shown: {snap.statusDetail.replace(/^./, (c) => c.toLowerCase())}
                </p>
              ) : (
                <>
              {snap.quote ? (
                <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-1">
                  <span className="font-display text-4xl leading-none tabular-nums text-bone">{fmtPrice(snap.quote.price)}</span>
                  {snap.quote.change !== null && snap.quote.changePct !== null && (
                    <span className="flex items-center gap-1.5 tabular-nums text-bone">
                      <span aria-hidden style={{ color: snap.quote.direction === "up" ? UP : snap.quote.direction === "down" ? DOWN : undefined }}>
                        {snap.quote.direction === "up" ? "▲" : snap.quote.direction === "down" ? "▼" : "■"}
                      </span>
                      {fmtSigned(snap.quote.change)} <span className="text-vellum">({fmtSigned(snap.quote.changePct)}%)</span>
                    </span>
                  )}
                  <span className="w-full text-xs text-dust">Close of {fmtSession(snap.quote.sessionDate)} · {snap.statusDetail}</span>
                </div>
              ) : (
                <p className="mt-5 text-sm text-vellum" data-testid="market-no-price">
                  No price shown: {snap.statusDetail.replace(/^./, (c) => c.toLowerCase())}
                </p>
              )}

              <div className="mt-5">
                <div role="tablist" aria-label="Price history range" className="mb-3 flex flex-wrap gap-1">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      role="tab"
                      aria-selected={r === range}
                      onClick={() => setRange(r)}
                      className={`rounded-full px-3 py-1 font-mono text-[11px] tracking-[0.12em] transition ${r === range ? "bg-white/10 text-bone" : "text-dust hover:text-bone"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {snap.chart.points.length >= 2 ? (
                  <PriceChart chart={snap.chart} accent={accent} label={`${stock.ticker} closing prices, ${range}`} />
                ) : (
                  <div className="grid h-[140px] place-items-center rounded-xl border border-dashed border-white/10 px-6 text-center text-sm text-dust" data-testid="market-no-chart">
                    Price history appears here once market data is connected. Nothing is estimated or filled in.
                  </div>
                )}
              </div>

              <VigourBlock growth={snap.growth} ticker={stock.ticker} />
                </>
              )}
            </>
          )}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href={`/collection?species=${pick}`} className="sl-btn-gold group inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.18em]">
            OPEN {species.name.toUpperCase()}&apos;S PROFILE
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
          </Link>
          <Link href="/collection" className="sl-btn-outline inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.18em]">
            BROWSE THE COLLECTION
          </Link>
        </div>
        <p className="mt-5 max-w-2xl text-xs leading-relaxed text-dust">
          {mode?.kind === "widget" ? "Market data: TradingView widget. " : ""}For game flavour only, not investment advice. A creature&apos;s stock never changes ownership,
          rarity, hatch odds, evolution timing or rewards, and owning a Solanite has nothing to do with owning shares.
        </p>
      </div>
    </div>
  );
}

function TickerChip({ ticker, accent, large = false }: { ticker?: string; accent: string; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono uppercase text-bone ${large ? "px-4 py-1.5 text-sm tracking-[0.18em]" : "px-2.5 py-0.5 text-[11px] tracking-[0.14em]"}`}
      style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}33` }}
      data-testid="ticker-chip"
    >
      {ticker ?? "···"}
    </span>
  );
}

/** Market Vigour: the stored value when the service has trading days, otherwise only the rules. */
function VigourBlock({ growth, ticker }: { growth: { value: number; label: string } | null; ticker: string }) {
  const R = GROWTH_RULES;
  return (
    <div className="mt-6 border-t border-rim pt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="sl-label text-dust">Market Vigour</p>
        {growth ? (
          <p className="tabular-nums text-bone">
            <span className="font-display text-3xl">{growth.value.toFixed(1)}</span> <span className="text-sm text-vellum">/ 100 · {growth.label}</span>
          </p>
        ) : (
          <p className="text-sm text-dust">No trading days recorded yet</p>
        )}
      </div>
      <div className="relative mt-3 h-1.5 rounded-full bg-white/[0.07]" aria-hidden>
        {growth && <div className="absolute inset-y-0 left-0 rounded-full bg-bone/70" style={{ width: `${growth.value}%` }} />}
        <div className="absolute -top-1 h-3.5 w-px bg-dust" style={{ left: `${R.neutral}%` }} title={`Neutral (${R.neutral})`} />
      </div>
      <ul className="mt-5 grid gap-3 text-sm text-vellum sm:grid-cols-3">
        <li>
          <span className="block font-display text-xl text-bone">±{R.pointsPerPercent} per 1%</span>
          Each trading day, {ticker}&apos;s close against the day before: every 1% up adds {R.pointsPerPercent} points, every 1% down takes {R.pointsPerPercent} away.
        </li>
        <li>
          <span className="block font-display text-xl text-bone">±{R.dailyCap} a day</span>
          No single day moves it more than {R.dailyCap} points, and only the last {R.windowSessions} trading days count, so old moves fade out.
        </li>
        <li>
          <span className="block font-display text-xl text-bone">0 – 100</span>
          It starts at a neutral {R.neutral} and always stays between 0 and 100. Each day is counted once and never re-applied.
        </li>
      </ul>
    </div>
  );
}
