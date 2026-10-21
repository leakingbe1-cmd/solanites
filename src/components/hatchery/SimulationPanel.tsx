"use client";

import { useState } from "react";
import { SPEED_OPTIONS, useHatchery } from "@/state/HatcheryProvider";
import { TIME } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";

/** Prototype-only controls. Clearly labelled; removed when real data is wired. Sits at the top of the demo: speed always visible, the rest folded. */
export function SimulationPanel() {
  const h = useHatchery();
  const [open, setOpen] = useState(false);
  // No cap on eggs, so the slider stops at a demo-sized ten eggs.
  const max = h.config.token.tokensPerEgg * ((h.config.eggs.maxEggsPerWallet ?? 9) + 1);

  return (
    <section className="rounded-md border border-dashed border-amber-300/25 bg-amber-300/[0.03] p-4 sm:p-5" data-testid="simulation-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/90">Demo controls · simulated</span>
          <span className="mt-1 block text-xs text-mist">Mock data only. Speed up time to watch eggs hatch and evolve.</span>
        </span>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Time speed">
          {SPEED_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => h.setSpeed(o.value)}
              aria-pressed={h.speed === o.value}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${h.speed === o.value ? "border-gilt/60 bg-gilt/10 text-bone" : "border-white/10 text-mist hover:text-bone"}`}
            >
              {o.label}
            </button>
          ))}
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="rounded-full px-2 py-1.5 text-xs text-mist underline-offset-4 hover:text-bone hover:underline">
            {open ? "Fewer controls −" : "More controls +"}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-mist/70">Skip ahead</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["+1 hour", TIME.HOUR],
                ["+1 day", TIME.DAY],
                ["+7 days", 7 * TIME.DAY],
              ].map(([l, ms]) => (
                <button key={l} disabled={!h.isDemo} onClick={() => h.warp(ms as number)} className="rounded-xl border border-white/10 px-2 py-2 text-xs text-mist transition hover:text-bone disabled:opacity-40">
                  {l}
                </button>
              ))}
            </div>
            <button onClick={h.resetDemo} disabled={!h.isDemo} className="mt-2 w-full rounded-xl border border-white/10 py-2 text-xs text-mist transition hover:text-bone disabled:opacity-40">
              Reset demo collection
            </button>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-widest text-mist/70">Mock balance</p>
              <p className="font-mono text-sm text-bone">{formatNumber(h.balance)}</p>
            </div>
            <input
              type="range"
              min={0}
              max={max}
              step={h.config.token.tokensPerEgg / 100}
              value={h.balance}
              disabled={!h.isDemo}
              onChange={(e) => h.setDemoBalance(Number(e.target.value))}
              className="mt-4 w-full accent-[#e8b75c]"
              aria-label="Mock token balance"
            />
            <p className="mt-2 text-xs leading-relaxed text-mist/70">Drop below {formatNumber(h.records.length * h.config.token.tokensPerEgg)} to see what happens to unbacked eggs (policy: <span className="text-bone/80">{h.config.policies.belowThreshold}</span>).</p>
          </div>
        </div>
      )}
    </section>
  );
}
