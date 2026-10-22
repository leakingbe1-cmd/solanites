"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import { ago } from "@/lib/homeMetrics";
import { rarityChances } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { gameConfig } from "@/config/gameConfig";
import type { Proof } from "@/shared/proof";

type Load = { kind: "loading" } | { kind: "prelaunch" } | { kind: "error" } | { kind: "ready"; proof: Proof };

const pct = (x: number) => `${Number((x * 100).toFixed(1))}%`;

/**
 * /proof: what anyone can check about the tracker. Before launch it says what will appear here.
 * Never "provably fair": rarity is sealed at issue, but there is no per-egg commitment yet.
 */
export default function ProofPage() {
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    fetch("/api/proof", { cache: "no-store" })
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (r.ok) return setLoad({ kind: "ready", proof: body as Proof });
        setLoad(body?.error?.code === "NOT_CONFIGURED" ? { kind: "prelaunch" } : { kind: "error" });
      })
      .catch(() => setLoad({ kind: "error" }));
    const id = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  const configured = rarityChances(gameConfig);
  const p = load.kind === "ready" ? load.proof : null;
  const hatchedTotal = p ? RARITY_ORDER.reduce((n, r) => n + p.rarity[r].hatched, 0) : 0;

  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
        <p className="sl-eyebrow">Check us</p>
        <h1 className="mt-3 sl-display-l text-bone">Proof</h1>
        <p className="mt-4 max-w-2xl text-mist">
          What the tracker sees, published as it is: where it has synced to, how many eggs exist, what has hatched against the configured odds, and which wallets can never earn eggs.
        </p>
        {p?.source === "fixture" && <p className="mt-4 inline-flex rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300/90">Fixture data · local test holders</p>}

        {load.kind === "prelaunch" && (
          <div className="sl-panel mt-10 rounded-md p-6" data-testid="proof-prelaunch">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300/90">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80" aria-hidden /> Opens at launch
            </p>
            <p className="mt-3 text-bone">Once tracking is switched on, this page shows:</p>
            <ul className="mt-3 space-y-2 text-sm text-mist">
              <li>· the last sync time and the Solana slot it reached;</li>
              <li>· eggs issued and hatched;</li>
              <li>· creatures hatched per rarity, beside the configured odds below;</li>
              <li>· every wallet that can never earn eggs (project and program wallets), with the reason.</li>
            </ul>
          </div>
        )}
        {load.kind === "error" && <p className="sl-panel mt-10 rounded-md p-6 text-mist" role="status">Proof data is temporarily unavailable. Try again shortly.</p>}
        {load.kind === "loading" && <p className="sl-panel mt-10 rounded-md p-6 text-mist" role="status">Loading…</p>}

        {p && (
          <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Last sync", p.lastSyncAt ? ago(p.lastSyncAt, now) : "Not yet"],
              ["Latest slot", p.latestSlot ? formatNumber(p.latestSlot) : "—"],
              ["Eggs issued", formatNumber(p.eggs.issued)],
              ["Eggs hatched", formatNumber(p.eggs.hatched)],
            ].map(([k, v]) => (
              <div key={k} className="sl-glass rounded-md p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">{k}</dt>
                <dd className="mt-2 font-display text-2xl text-bone">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {p && p.supplyMatchesConfig !== null && (
          <p className="mt-3 text-sm text-mist">On-chain supply {p.supplyMatchesConfig ? "matches" : "does not match"} the configured supply at the last check.</p>
        )}

        <section className="mt-12" aria-labelledby="proof-rarity">
          <h2 id="proof-rarity" className="font-display text-2xl text-bone">
            {p ? "Hatched by rarity" : "Configured hatch odds"}
          </h2>
          <div className="sl-panel mt-4 overflow-hidden rounded-md">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/5 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist/60">
              <span>Rarity</span>
              <span className="text-right">Odds</span>
              <span className="w-24 text-right">{p ? "Hatched" : ""}</span>
            </div>
            {RARITY_ORDER.map((r) => (
              <div key={r} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/[0.04] px-5 py-3 last:border-0">
                <span className="text-sm" style={{ color: RARITIES[r].color }}>{RARITIES[r].label}</span>
                <span className="text-right font-mono text-xs text-bone/80">{pct(p ? p.rarity[r].configured : configured[r])}</span>
                <span className="w-24 text-right font-mono text-xs text-bone/80">
                  {p ? `${formatNumber(p.rarity[r].hatched)}${hatchedTotal ? ` · ${pct(p.rarity[r].hatched / hatchedTotal)}` : ""}` : ""}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-mist">
            Each egg&apos;s species is sealed on the server when the egg is issued, before anyone hatches it. There is no public per-egg commitment yet, so individual results can&apos;t be independently verified today; small samples will also differ from the odds.
          </p>
        </section>

        {p && (
          <section className="mt-12" aria-labelledby="proof-excluded">
            <h2 id="proof-excluded" className="font-display text-2xl text-bone">Wallets that never earn eggs</h2>
            <p className="mt-2 text-sm text-mist">{formatNumber(p.excludedCount)} in total{p.excludedCount > p.excluded.length ? `, the first ${p.excluded.length} shown` : ""}.</p>
            {p.excluded.length > 0 && (
              <ul className="sl-panel mt-4 divide-y divide-white/[0.04] rounded-md">
                {p.excluded.map((x) => (
                  <li key={x.address} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <code className="break-all font-mono text-xs text-bone">{x.address}</code>
                    <span className="shrink-0 text-xs text-mist">{x.reason === "project" ? "Project wallet" : "Program-controlled (e.g. a liquidity pool)"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <p className="mt-12 text-sm text-mist">
          The rules themselves are on <Link href="/how-it-works#rules" className="text-bone underline-offset-4 hover:underline">How It Works</Link>; changes are announced in the{" "}
          <Link href="/updates" className="text-bone underline-offset-4 hover:underline">shipping log</Link>.
        </p>
      </div>
    </div>
  );
}
