"use client";

import { useEffect, useState } from "react";
import { tradingViewSymbol } from "@/lib/market/tradingview";
import { MARKET_RANGES, type DataStatus, type MarketRange, type MarketSnapshot } from "@/lib/market/types";
import { PriceChart } from "./PriceChart";
import { TradingViewOverview } from "./TradingViewOverview";

/**
 * The stock linked to a species, for the creature detail view. Sits beside the artwork as an
 * information panel; it never recolours the creature. Everything comes from /api/market, which
 * reads stored end-of-day data on the server, so opening many creatures costs no provider calls.
 *
 * `owner`: the viewer's wallet when they own this creature; it only re-fetches on change. Mythic
 * and Secret links need a wallet-signed reveal session (see components/wallet/revealWithWallet).
 */

const UP = "#46c9b0";
const DOWN = "#ef6a5a";

export const STATUS: Record<DataStatus, { label: string; tone: string }> = {
  realtime: { label: "Real-time", tone: "text-vellum border-rim-strong" },
  previous_close: { label: "Previous close", tone: "text-vellum border-rim-strong" },
  delayed: { label: "Delayed 15 min", tone: "text-vellum border-rim-strong" },
  stale: { label: "Stale data", tone: "text-gilt border-gilt/40" },
  sample: { label: "Sample data", tone: "text-eclipse-soft border-eclipse/50" },
  unavailable: { label: "Unavailable", tone: "text-dust border-rim" },
};

const MARKET_STATE: Record<string, string> = { open: "Market open", pre_market: "Pre-market", after_hours: "After hours", closed: "Market closed" };

const fmtPrice = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtSigned = (n: number, dp = 2) => `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n).toFixed(dp)}`;
const fmtSession = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fmtTime = (ms: number) => new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

type Load = { state: "loading" } | { state: "ok"; snap: MarketSnapshot } | { state: "classified" } | { state: "error"; message: string };

export function CreatureMarketPanel({
  speciesId,
  accent,
  owner,
  className = "",
  fetchSnapshot,
}: {
  speciesId: string;
  accent: string;
  owner?: string | null;
  className?: string;
  /** Owner tools only: load through another endpoint (the token-gated diagnostics route). */
  fetchSnapshot?: (range: MarketRange, signal: AbortSignal) => Promise<Response>;
}) {
  const [range, setRange] = useState<MarketRange>("1M");
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [refetching, setRefetching] = useState(false);
  const [explain, setExplain] = useState(false);

  useEffect(() => {
    const ctl = new AbortController();
    setRefetching(true);
    // Classified links are disclosed only to a wallet-signed reveal session (an httpOnly cookie
    // sent automatically); a submitted address is never treated as proof, so none is sent.
    const q = new URLSearchParams({ range });
    (fetchSnapshot ? fetchSnapshot(range, ctl.signal) : fetch(`/api/market/${encodeURIComponent(speciesId)}?${q}`, { signal: ctl.signal }))
      .then(async (r) => {
        if (r.status === 404) return setLoad({ state: "classified" });
        if (!r.ok) {
          const b = await r.json().catch(() => null);
          return setLoad({ state: "error", message: b?.error?.message ?? "Market data is temporarily unavailable." });
        }
        setLoad({ state: "ok", snap: (await r.json()) as MarketSnapshot });
      })
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setLoad({ state: "error", message: "Market data couldn't be reached. Check your connection and try again." });
      })
      .finally(() => !ctl.signal.aborted && setRefetching(false));
    return () => ctl.abort();
    // fetchSnapshot is a caller-provided loader; a new function identity alone shouldn't refetch.
  }, [speciesId, owner, range]);

  const shell = `min-w-0 rounded-2xl border border-rim bg-umbra/70 p-5 sm:p-6 ${className}`;

  if (load.state === "loading") {
    return (
      <section className={shell} aria-busy>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dust">Linked stock</p>
        <div className="mt-4 h-6 w-48 rounded bg-white/5" />
        <div className="mt-6 h-[180px] rounded-xl bg-white/[0.03]" />
      </section>
    );
  }
  if (load.state === "classified") {
    return (
      <section className={shell}>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dust">Linked stock</p>
        <p className="mt-3 font-display text-xl text-bone">Classified</p>
        <p className="mt-1 text-sm text-vellum">This Solanite&apos;s market link reveals itself to whoever hatches one.</p>
      </section>
    );
  }
  if (load.state === "error") {
    return (
      <section className={shell}>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dust">Linked stock</p>
        <p className="mt-3 text-sm text-vellum">{load.message}</p>
      </section>
    );
  }

  const { snap } = load;
  const { stock, quote, growth, market } = snap;
  // No licensed feed on our server: show TradingView's widget, which licenses and serves genuine
  // (delayed) prices in the visitor's browser, instead of a permanent "unavailable" panel.
  const tvSymbol = snap.status === "unavailable" ? tradingViewSymbol(stock.exchange, stock.ticker) : null;
  const st = tvSymbol ? { label: "Delayed · TradingView", tone: "text-vellum border-rim-strong" } : STATUS[snap.status];
  const dirColor = quote?.direction === "up" ? UP : quote?.direction === "down" ? DOWN : undefined;
  const marketLine = market.reason === "holiday" && market.holiday ? `Market closed · ${market.holiday}` : `${MARKET_STATE[market.state]}${market.earlyClose ? " · early close" : ""}`;

  return (
    <section className={`${shell} transition-opacity duration-300 ${refetching ? "opacity-70" : ""}`} aria-label={`${stock.company} stock linked to this Solanite`}>
      {/* Identity */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dust">Linked stock</p>
          <h3 className="mt-1.5 break-words font-display text-2xl leading-tight text-bone">{stock.company}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="rounded-full border px-2.5 py-0.5 text-bone" style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}33` }}>{stock.ticker}</span>
            <span className="text-vellum">{stock.exchange}</span>
            <span className="text-dust">·</span>
            <span className="normal-case tracking-normal text-dust">{stock.sector}</span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${st.tone}`}>{st.label}</span>
      </div>
      <p className="mt-3 text-sm italic text-vellum">{stock.connection}</p>

      {tvSymbol ? (
        <>
          {/* Price and history from TradingView (delayed for stocks) */}
          <div className="mt-5">
            <TradingViewOverview symbol={tvSymbol} company={stock.company} accent={accent} />
          </div>
          <p className="mt-3 text-xs text-dust">Prices and chart are provided by TradingView and are delayed (stock prices on TradingView widgets are delayed under exchange rules, typically 15 minutes or more). They are not real-time.</p>
          <div className="mt-6 border-t border-rim pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dust">Market Vigour</p>
            <p className="mt-2 text-sm text-dust">Off for now. Vigour is worked out on our server from daily closes, and that needs a licensed data feed that isn&apos;t connected yet. It&apos;s cosmetic only and never affects stats, odds, ownership or rewards.</p>
          </div>
          <p className="mt-5 border-t border-rim pt-3 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-dust">Market data: TradingView widget (delayed) · For game flavour only, not investment advice.</p>
        </>
      ) : (
        <>
      {/* Performance */}
      <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-2">
        {quote ? (
          <>
            <span className="font-display text-4xl leading-none text-bone tabular-nums">{fmtPrice(quote.price)}</span>
            {quote.changePct !== null && quote.change !== null ? (
              <span className="flex items-center gap-1.5 text-base tabular-nums text-bone">
                <span aria-hidden style={{ color: dirColor }}>{quote.direction === "up" ? "▲" : quote.direction === "down" ? "▼" : "■"}</span>
                <span>{fmtSigned(quote.change)}</span>
                <span className="text-vellum">({fmtSigned(quote.changePct)}%)</span>
                <span className="sr-only">{quote.direction === "up" ? "up" : quote.direction === "down" ? "down" : "unchanged"} on the session</span>
              </span>
            ) : (
              <span className="text-sm text-dust">Daily change unavailable for this session</span>
            )}
          </>
        ) : (
          <span className="text-sm text-vellum">No price to show.</span>
        )}
      </div>
      <p className="mt-2 text-xs text-dust">
        {snap.statusDetail}
        {quote && <> · {quote.previousSessionDate ? `vs ${fmtSession(quote.previousSessionDate)}` : ""}</>} · {marketLine}
      </p>

      {/* Chart */}
      <div className="mt-5">
        <div role="tablist" aria-label="Chart range" className="mb-3 flex flex-wrap gap-1">
          {MARKET_RANGES.map((r) => (
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
        <PriceChart chart={snap.chart} accent={accent} label={`${stock.ticker} closing prices, ${range}`} />
      </div>

      {/* Growth */}
      <div className="mt-6 border-t border-rim pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dust">Market Vigour</p>
          <button type="button" onClick={() => setExplain((v) => !v)} aria-expanded={explain} className="font-mono text-[10px] uppercase tracking-[0.2em] text-dust hover:text-bone">
            {explain ? "Close" : "How it works"}
          </button>
        </div>
        {growth ? (
          <>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-3xl text-bone tabular-nums">{growth.value.toFixed(1)}</span>
              <span className="text-sm text-vellum">/ 100 · {growth.label}</span>
            </div>
            <div className="relative mt-2 h-1.5 rounded-full bg-white/[0.07]" aria-hidden>
              <div className="absolute inset-y-0 left-0 rounded-full bg-bone/70" style={{ width: `${growth.value}%` }} />
              <div className="absolute -top-1 h-3.5 w-px bg-dust" style={{ left: "50%" }} title="Neutral (50)" />
            </div>
            <ul className="mt-4 space-y-1.5 text-xs">
              {growth.window.slice(0, 5).map((e) => (
                <li key={e.date} className="flex items-center justify-between gap-3 text-vellum tabular-nums">
                  <span>{fmtSession(e.date)}</span>
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden style={{ color: e.changePct > 0 ? UP : e.changePct < 0 ? DOWN : undefined }}>{e.changePct > 0 ? "▲" : e.changePct < 0 ? "▼" : "■"}</span>
                    {fmtSigned(e.changePct)}%
                  </span>
                  <span className="w-20 text-right text-bone">{fmtSigned(e.points, 1)} pts</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-dust">No sessions recorded yet. Vigour starts at a neutral 50 once the first trading day is recorded.</p>
        )}
        {explain && (
          <div className="mt-4 space-y-2 rounded-xl bg-white/[0.03] p-4 text-xs leading-relaxed text-vellum">
            <p>
              Each completed trading day, {stock.ticker}&apos;s close is compared with the previous session&apos;s. Every 1% move is worth {growth?.rules.pointsPerPercent ?? 4} points, capped at ±{growth?.rules.dailyCap ?? 10} a day. Vigour is {growth?.rules.neutral ?? 50} plus the
              last {growth?.rules.windowSessions ?? 20} sessions&apos; points, kept between 0 and 100, so old moves fade out.
            </p>
            <p>Each day is recorded once and never re-applied. Vigour is a cosmetic indicator: it doesn&apos;t change this Solanite&apos;s stats, evolution, rarity, hatch odds, ownership or any reward.</p>
            <p>For game flavour only, not investment advice. Owning a Solanite has nothing to do with owning {stock.ticker} shares.</p>
          </div>
        )}
      </div>

      {/* Source */}
      <p className="mt-5 border-t border-rim pt-3 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-dust">
        {snap.source.name} · {snap.source.plan}
        {snap.source.fetchedAt ? ` · updated ${fmtTime(snap.source.fetchedAt)}` : ""}
      </p>
        </>
      )}
    </section>
  );
}
