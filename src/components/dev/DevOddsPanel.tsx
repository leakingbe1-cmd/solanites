"use client";

import { useMemo, useState } from "react";
import { gameConfig, type RarityId } from "@/config/gameConfig";
import {
  DEFAULT_DEV_ODDS,
  DEV_MULTIPLIER_MAX,
  DEV_MULTIPLIER_MIN,
  baseWeights,
  chancesOf,
  effectiveWeights,
  percentLabels,
  type DevOddsSettings,
} from "@/lib/devOdds";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";

export interface SimulationResult {
  count: number;
  firstSeed: number;
  tally: Record<RarityId, number>;
  results: { seed: number; speciesId: string; rarity: RarityId }[];
}

const QUICK = [1, 10, 25, 50, 100];

/**
 * Developer Hatch Odds. Test settings live in this component's memory only: they are
 * never stored, never sent to the public hatch endpoint, and reset to 1× when Developer
 * Mode is left. Displayed odds come from the same functions the simulation uses.
 */
export function DevOddsPanel({ settings, onChange, onHatch }: { settings: DevOddsSettings; onChange(s: DevOddsSettings): void; onHatch(speciesId: string, seed: number): void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<SimulationResult | null>(null);

  const base = useMemo(() => baseWeights(gameConfig), []);
  const baseChance = useMemo(() => chancesOf(base), [base]);
  const testWeights = useMemo(() => effectiveWeights(gameConfig, settings), [settings]);
  const testChance = useMemo(() => chancesOf(testWeights), [testWeights]);
  const basePct = percentLabels(baseChance);
  const testPct = percentLabels(testChance);
  const zeroTiers = RARITY_ORDER.filter((r) => base[r] === 0);
  const isDefault = settings.multiplier === 1 && !settings.force && !settings.includeZeroWeight;

  const set = (patch: Partial<DevOddsSettings>) => {
    setRun(null);
    onChange({ ...settings, ...patch });
  };

  async function simulate(count: number) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/studio/dev/simulate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ settings, count }), credentials: "same-origin", cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? `Simulation failed (${res.status}).`);
      setRun(data as SimulationResult);
      if (count === 1) onHatch(data.results[0].speciesId, data.results[0].seed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="dev-odds-title" className="sl-plate relative p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="dev-odds-title" className="sl-display-m text-bone">Developer Hatch Odds</h2>
        <span className="rounded-full border border-amber-300/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200" data-testid="simulated-badge">
          Simulated · not public odds
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-mist">
        Test settings for simulated hatches only. Public hatches roll on the server with the published weights when an egg is issued; nothing here can reach them, and nothing is stored.
      </p>

      {/* multiplier */}
      <div className="mt-6 grid gap-3">
        <label htmlFor="dev-multiplier" className="sl-label text-dust">
          Multiplier for the ticked tiers
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <input
            id="dev-multiplier"
            type="range"
            min={DEV_MULTIPLIER_MIN}
            max={DEV_MULTIPLIER_MAX}
            step={1}
            value={settings.multiplier}
            onChange={(e) => set({ multiplier: Number(e.target.value) })}
            className="w-full max-w-md accent-[#e8b75c]"
            aria-valuetext={`${settings.multiplier}×`}
          />
          <output htmlFor="dev-multiplier" className="font-display text-3xl tabular-nums text-bone" data-testid="multiplier-value">
            {settings.multiplier}×
          </output>
          <button type="button" onClick={() => set({ ...DEFAULT_DEV_ODDS })} className="sl-btn-outline rounded-full px-5 py-2 text-xs uppercase tracking-[0.2em]" data-testid="reset-odds">
            Reset to 1×
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button key={q} type="button" onClick={() => set({ multiplier: q })} aria-pressed={settings.multiplier === q} className={`rounded-full border px-3 py-1 font-mono text-xs ${settings.multiplier === q ? "border-gilt/60 text-bone" : "border-white/10 text-mist hover:text-bone"}`}>
              {q}×
            </button>
          ))}
        </div>
      </div>

      {/* which tiers and overrides */}
      <fieldset className="mt-6">
        <legend className="sl-label text-dust">Boosted tiers</legend>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {RARITY_ORDER.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm text-bone">
              <input
                type="checkbox"
                checked={settings.boosted.includes(r)}
                onChange={(e) => set({ boosted: e.target.checked ? [...settings.boosted, r] : settings.boosted.filter((x) => x !== r) })}
                className="accent-[#e8b75c]"
              />
              {RARITIES[r].label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
        <legend className="sl-label text-dust">Explicit developer overrides</legend>
        <label className="flex items-start gap-2 text-sm text-bone">
          <input type="checkbox" checked={settings.includeZeroWeight} onChange={(e) => set({ includeZeroWeight: e.target.checked })} className="mt-1 accent-[#e8b75c]" />
          <span>
            Include boosted tiers whose base weight is 0
            <span className="block text-xs text-mist">{zeroTiers.length ? `Currently excluded publicly: ${zeroTiers.map((r) => RARITIES[r].label).join(", ")}.` : "Not needed now: every tier, Mythic and Secret included, has a positive base weight."}</span>
          </span>
        </label>
        <label className="grid gap-1 text-sm text-bone">
          Force every simulated hatch to one tier
          <select value={settings.force ?? ""} onChange={(e) => set({ force: (e.target.value || null) as RarityId | null })} className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-bone" data-testid="force-rarity">
            <option value="">Off (use the odds below)</option>
            {RARITY_ORDER.map((r) => (
              <option key={r} value={r}>
                {RARITIES[r].label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      {/* odds table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm" data-testid="odds-table">
          <thead className="font-mono text-[10px] uppercase tracking-[0.15em] text-dust">
            <tr>
              <th className="py-2 pr-3 font-normal">Rarity</th>
              <th className="py-2 pr-3 font-normal">Base weight</th>
              <th className="py-2 pr-3 font-normal">Public odds</th>
              <th className="py-2 pr-3 font-normal">Test weight</th>
              <th className="py-2 pr-3 font-normal">Test odds</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {RARITY_ORDER.map((r) => (
              <tr key={r} className="border-t border-white/[0.06]" data-rarity={r}>
                <td className="py-2 pr-3" style={{ color: RARITIES[r].color }}>{RARITIES[r].label}</td>
                <td className="py-2 pr-3 text-mist">{base[r]}</td>
                <td className="py-2 pr-3 text-mist" data-col="public">{basePct[r].toFixed(2)}%</td>
                <td className="py-2 pr-3 text-mist">{+testWeights[r].toFixed(4)}</td>
                <td className="py-2 pr-3 text-bone" data-col="test">{testPct[r].toFixed(2)}%</td>
              </tr>
            ))}
            <tr className="border-t border-white/10 text-dust">
              <td className="py-2 pr-3">Total</td>
              <td className="py-2 pr-3">{+RARITY_ORDER.reduce((s, r) => s + base[r], 0).toFixed(4)}</td>
              <td className="py-2 pr-3">100.00%</td>
              <td className="py-2 pr-3">{+RARITY_ORDER.reduce((s, r) => s + testWeights[r], 0).toFixed(4)}</td>
              <td className="py-2 pr-3" data-testid="test-total">{RARITY_ORDER.reduce((s, r) => s + testPct[r], 0).toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-mist">
        The multiplier scales the weights of the ticked tiers; every weight is then divided by the new total so the odds add up to 100%. A tier does not become exactly that many times more likely, because the total grows too, and unticked tiers lose share. Ticking many tiers spreads the boost: with every tier above Common at 100×, Rare absorbs most of it. A tier with a base weight of 0 stays excluded unless the override above is on.
        {isDefault && " At 1× with no overrides, the test odds equal the public odds."}
      </p>

      {/* simulation */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => simulate(1)} className="sl-btn-gold rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em]" data-testid="simulate-one">
          Simulate one hatch
        </button>
        <button type="button" disabled={busy} onClick={() => simulate(10_000)} className="sl-btn-outline rounded-full px-6 py-3 text-xs uppercase tracking-[0.2em]" data-testid="simulate-many">
          Simulate 10,000 hatches
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-amber-200">{error}</p>}
      {run && run.count > 1 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm tabular-nums" data-testid="simulation-tally">
            <caption className="pb-2 text-left text-xs text-mist">
              {run.count.toLocaleString("en-GB")} simulated hatches, seeds {run.firstSeed}–{run.firstSeed + run.count - 1}. Nothing was stored.
            </caption>
            <thead className="font-mono text-[10px] uppercase tracking-[0.15em] text-dust">
              <tr>
                <th className="py-1 pr-3 font-normal">Rarity</th>
                <th className="py-1 pr-3 font-normal">Hatched</th>
                <th className="py-1 pr-3 font-normal">Observed</th>
                <th className="py-1 pr-3 font-normal">Expected</th>
              </tr>
            </thead>
            <tbody>
              {RARITY_ORDER.map((r) => (
                <tr key={r} className="border-t border-white/[0.06]">
                  <td className="py-1 pr-3" style={{ color: RARITIES[r].color }}>{RARITIES[r].label}</td>
                  <td className="py-1 pr-3">{run.tally[r].toLocaleString("en-GB")}</td>
                  <td className="py-1 pr-3">{((run.tally[r] / run.count) * 100).toFixed(2)}%</td>
                  <td className="py-1 pr-3 text-mist">{testPct[r].toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {run && run.count === 1 && (
        <p className="mt-4 text-sm text-bone" data-testid="simulated-outcome">
          Simulated hatch (seed {run.results[0].seed}): <strong>{SPECIES_BY_ID[run.results[0].speciesId].name}</strong>, {RARITIES[run.results[0].rarity].label}. Not added to any collection.
        </p>
      )}
    </section>
  );
}
