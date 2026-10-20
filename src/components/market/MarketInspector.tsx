"use client";

import { useCallback, useEffect, useState } from "react";
import type { GrowthEntry } from "@/lib/market/growth";
import type { MarketRange } from "@/lib/market/types";
import { RARITIES } from "@/lib/rarity";
import { CreatureMarketPanel } from "./CreatureMarketPanel";

/**
 * Market links section of Developer Mode (/studio/dev). Read-only: every request goes to
 * /studio/dev/market, which the middleware and the route itself guard with the owner
 * credentials and the DEVELOPER_MODE=off switch. Species names, rarities and accents come
 * from that endpoint, so classified species never reach the public bundle through here.
 */

interface LinkDiag {
  speciesId: string;
  name: string;
  rarity: keyof typeof RARITIES | null;
  accent: string;
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
  /** Live provider only: what this server instance has seen for the ticker ("unverified" until a live answer). */
  coverage?: string;
}
interface Diag {
  provider: { name: string; plan: string } | null;
  links: LinkDiag[];
  /** Live provider: rows are fetched (and cost credits) only when selected, so none is preselected. */
  fetchOnSelect?: boolean;
}

const ENDPOINT = "/studio/dev/market";

export function MarketInspector() {
  const [diag, setDiag] = useState<Diag | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [sim, setSim] = useState("2.5, -1.8, 0.6");
  const [simOut, setSimOut] = useState<{ entries: GrowthEntry[]; vigour: { value: number; label: string } } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const r = await fetch(ENDPOINT, { cache: "no-store" }).catch(() => null);
    if (!r) return setError("The server couldn't be reached.");
    if (!r.ok) return setError((await r.json().catch(() => null))?.error?.message ?? `Market diagnostics unavailable (${r.status}).`);
    const d = (await r.json()) as Diag;
    setDiag(d);
    setSelected((s) => s ?? (d.fetchOnSelect ? null : (d.links[0]?.speciesId ?? null)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runSim = async () => {
    const r = await fetch(`${ENDPOINT}?simulate=${encodeURIComponent(sim)}`, { cache: "no-store" });
    if (r.ok) setSimOut(await r.json());
  };

  const link = diag?.links.find((l) => l.speciesId === selected);
  const fetchSnapshot = (range: MarketRange, signal: AbortSignal) => fetch(`${ENDPOINT}?species=${encodeURIComponent(selected ?? "")}&range=${range}`, { signal, cache: "no-store" });

  // The calculator needs no provider, so it works even when diagnostics fail to load.
  const calculator = (
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
  );

  return (
    <section aria-labelledby="dev-market" className="mt-16">
      <h2 id="dev-market" className="sl-label text-dust">Market links</h2>
      <p className="mt-2 max-w-2xl text-sm text-vellum">Every Solanite&apos;s linked stock, data status and growth calculation, including classified species. Read-only: nothing here changes game state, ownership, odds or rewards.</p>
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
                  {diag.links.map((l) => (
                    <tr key={l.speciesId} onClick={() => setSelected(l.speciesId)} className={`cursor-pointer border-t border-rim ${l.speciesId === selected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}>
                      <td className="px-3 py-2">
                        <span className="text-bone">{l.name}</span>{" "}
                        {l.rarity && (
                          <span style={{ color: RARITIES[l.rarity].color }} className="font-mono text-[10px] uppercase">
                            {RARITIES[l.rarity].label}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-vellum">
                        {l.ticker} {l.review && <span title={l.review} className="text-gilt">⚑</span>}
                      </td>
                      <td className="px-3 py-2 text-vellum">
                        {l.coverage ? `coverage: ${l.coverage}` : l.latestSession ? `${l.latestSession} · ${l.latestClose}` : "—"} {!l.upToDate && <span className="text-gilt">behind</span>} {l.state.lastErrorCode && <span className="text-gilt">{l.state.lastErrorCode}</span>}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-bone">{l.growth ? `${l.growth.value} ${l.growth.label}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="min-w-0">
              {link && (
                <>
                  {link.review && <p className="mb-3 text-xs text-gilt">Review: {link.review}</p>}
                  <CreatureMarketPanel key={link.speciesId} speciesId={link.speciesId} accent={link.accent} fetchSnapshot={fetchSnapshot} />
                </>
              )}
              {calculator}
            </div>
          </div>
        </>
      )}
      {!diag && <div className="max-w-xl">{calculator}</div>}
    </section>
  );
}
