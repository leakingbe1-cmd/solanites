"use client";

import { useCallback, useEffect, useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import type { GrowthEntry } from "@/lib/market/growth";
import type { MarketRange } from "@/lib/market/types";
import { RARITIES } from "@/lib/rarity";
import { SPECIES } from "@/lib/species";
import { CreatureMarketPanel } from "./CreatureMarketPanel";

/**
 * Owner test view (see app/dev/market). Read-only: every request goes to /api/dev/market,
 * which checks the dev token on the server. Nothing is drawn, including classified species,
 * until that check passes. The token stays in this tab's session storage only.
 */

interface LinkDiag {
  speciesId: string;
  ticker: string;
  company: string;
  exchange: string;
  review?: string;
  latestSession: string | null;
  latestClose: number | null;
  expectedSession: string;
  upToDate: boolean;
  growth: { value: number; label: string } | null;
  state: { lastErrorCode: string | null; needsHistory: boolean };
}
interface Diag {
  provider: { name: string; plan: string } | null;
  links: LinkDiag[];
}

const TOKEN_KEY = "solanites:dev-token";
const STAGES = ["Eggling", "Hatchling", "Evolved", "Ascended"];

export function MarketInspector() {
  const [token, setToken] = useState("");
  const [diag, setDiag] = useState<Diag | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(SPECIES[0].id);
  const [stage, setStage] = useState(3);
  const [sim, setSim] = useState("2.5, -1.8, 0.6");
  const [simOut, setSimOut] = useState<{ entries: GrowthEntry[]; vigour: { value: number; label: string } } | null>(null);

  const headers = useCallback((): HeadersInit => (token ? { authorization: `Bearer ${token}` } : {}), [token]);

  const load = useCallback(async () => {
    setError(null);
    const r = await fetch("/api/dev/market", { headers: headers() }).catch(() => null);
    if (!r) return setError("The server couldn't be reached.");
    if (r.status === 404) return setError("Not authorised. Enter the dev token (or run locally in fixture mode).");
    if (!r.ok) return setError((await r.json().catch(() => null))?.error?.message ?? `Error ${r.status}`);
    setDiag((await r.json()) as Diag);
  }, [headers]);

  useEffect(() => {
    try {
      setToken(sessionStorage.getItem(TOKEN_KEY) ?? "");
    } catch {
      /* storage unavailable */
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const runSim = async () => {
    const r = await fetch(`/api/dev/market?simulate=${encodeURIComponent(sim)}`, { headers: headers() });
    if (r.ok) setSimOut(await r.json());
  };

  const species = SPECIES.find((s) => s.id === selected)!;
  const link = diag?.links.find((l) => l.speciesId === selected);
  const fetchSnapshot = (range: MarketRange, signal: AbortSignal) => fetch(`/api/dev/market?species=${encodeURIComponent(selected)}&range=${range}`, { headers: headers(), signal });

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-dust">Owner tools · read only</p>
      <h1 className="mt-2 font-display text-4xl text-bone">Market links</h1>
      <p className="mt-2 max-w-2xl text-sm text-vellum">Every Solanite&apos;s linked stock, data status and growth calculation, including classified species. Nothing here can change game state, ownership, odds or rewards.</p>

      <form
        className="mt-6 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            sessionStorage.setItem(TOKEN_KEY, token);
          } catch {
            /* storage unavailable */
          }
          load();
        }}
      >
        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Dev token" autoComplete="off" className="min-w-0 flex-1 rounded-full border border-rim bg-umbra px-4 py-2 text-sm text-bone placeholder:text-dust" />
        <button className="rounded-full border border-rim-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">Load</button>
      </form>
      {error && <p className="mt-3 text-sm text-gilt">{error}</p>}

      {diag && (
        <>
          <p className="mt-4 font-mono text-[11px] text-dust">Provider: {diag.provider ? `${diag.provider.name} (${diag.provider.plan})` : "not configured"} · expected session {diag.links[0]?.expectedSession}</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <div className="min-w-0 max-h-[70vh] overflow-auto rounded-2xl border border-rim">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-basalt font-mono text-[10px] uppercase tracking-[0.14em] text-dust">
                  <tr>
                    <th className="px-3 py-2 font-normal">Species</th>
                    <th className="px-3 py-2 font-normal">Ticker</th>
                    <th className="px-3 py-2 font-normal">Latest close</th>
                    <th className="px-3 py-2 text-right font-normal">Vigour</th>
                  </tr>
                </thead>
                <tbody>
                  {SPECIES.map((s) => {
                    const l = diag.links.find((x) => x.speciesId === s.id);
                    return (
                      <tr key={s.id} onClick={() => setSelected(s.id)} className={`cursor-pointer border-t border-rim ${s.id === selected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}>
                        <td className="px-3 py-2">
                          <span className="text-bone">{s.name}</span> <span style={{ color: RARITIES[s.rarity].color }} className="font-mono text-[10px] uppercase">{RARITIES[s.rarity].label}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-vellum">
                          {l?.ticker} {l?.review && <span title={l.review} className="text-gilt">⚑</span>}
                        </td>
                        <td className="px-3 py-2 text-vellum">
                          {l?.latestSession ? `${l.latestSession} · ${l.latestClose}` : "—"} {l && !l.upToDate && <span className="text-gilt">behind</span>} {l?.state.lastErrorCode && <span className="text-gilt">{l.state.lastErrorCode}</span>}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-bone">{l?.growth ? `${l.growth.value} ${l.growth.label}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="min-w-0">
              <div className="rounded-2xl border border-rim bg-umbra/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-2xl text-bone">{species.name}</h2>
                  <div className="flex gap-1">
                    {STAGES.map((n, i) => (
                      <button key={n} onClick={() => setStage(i)} className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${stage === i ? "bg-white/10 text-bone" : "text-dust hover:text-bone"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mx-auto mt-3 aspect-square max-w-[260px]">
                  <CreatureArt species={species} stage={stage} animated={false} />
                </div>
                {link?.review && <p className="mt-3 text-xs text-gilt">Review: {link.review}</p>}
              </div>
              <CreatureMarketPanel key={selected} speciesId={selected} accent={species.palette.accent} fetchSnapshot={fetchSnapshot} className="mt-4" />

              <div className="mt-4 rounded-2xl border border-rim p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dust">Growth calculator (hypothetical, never stored)</p>
                <div className="mt-3 flex gap-2">
                  <input value={sim} onChange={(e) => setSim(e.target.value)} className="min-w-0 flex-1 rounded-full border border-rim bg-umbra px-4 py-2 text-sm text-bone" aria-label="Daily % changes, comma separated" />
                  <button onClick={runSim} className="rounded-full border border-rim-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">Run</button>
                </div>
                {simOut && (
                  <p className="mt-3 text-sm text-vellum">
                    {simOut.entries.map((e) => `${e.changePct}% → ${e.points > 0 ? "+" : ""}${e.points}`).join(" · ")} ⇒ vigour <span className="text-bone">{simOut.vigour.value}</span> ({simOut.vigour.label})
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
