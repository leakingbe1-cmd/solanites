"use client";

import { useState } from "react";
import { SPEED_OPTIONS, useHatchery } from "@/state/HatcheryProvider";
import { TIME } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";

/** Prototype-only controls. Clearly labelled; removed when real data is wired. */
export function SimulationPanel() {
  const h = useHatchery();
  const [open, setOpen] = useState(true);
  const max = h.config.token.tokensPerEgg * (h.config.eggs.maxEggsPerWallet + 1);

  return (
    <section className="border border-dashed border-white/15 p-6 sm:p-8">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span>
          <span className="text-[10px] uppercase tracking-[0.32em] text-ember">Prototype simulation controls</span>
          <span className="mt-2 block text-sm text-mist">Mock data only. Use these to explore how holding drives progression.</span>
        </span>
        <span className="font-display text-2xl text-mist">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div>
            <p className="sl-label">Time speed</p>
            <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
              {SPEED_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => h.setSpeed(o.value)}
                  className={`px-3 py-2.5 text-xs transition-colors ${h.speed === o.value ? "bg-panel text-platinum" : "bg-void text-mist hover:text-platinum"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="sl-label">Skip ahead</p>
            <div className="mt-4 grid grid-cols-3 gap-px border border-line bg-line">
              {[
                ["+1 hour", TIME.HOUR],
                ["+1 day", TIME.DAY],
                ["+7 days", 7 * TIME.DAY],
              ].map(([l, ms]) => (
                <button key={l} disabled={!h.isDemo} onClick={() => h.warp(ms as number)} className="bg-void px-2 py-2.5 text-xs text-mist transition-colors hover:text-platinum disabled:opacity-40">
                  {l}
                </button>
              ))}
            </div>
            <button onClick={h.resetDemo} disabled={!h.isDemo} className="sl-link mt-4 text-xs text-mist transition-colors hover:text-platinum disabled:opacity-40">
              Reset demo collection
            </button>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <p className="sl-label">Mock balance</p>
              <p className="sl-num text-sm text-platinum">{formatNumber(h.balance)}</p>
            </div>
            <input
              type="range"
              min={0}
              max={max}
              step={1000}
              value={h.balance}
              disabled={!h.isDemo}
              onChange={(e) => h.setDemoBalance(Number(e.target.value))}
              className="mt-5 w-full accent-[#ecedf3]"
              id="sl-mock-balance" aria-label="Mock token balance"
            />
            <p className="mt-3 text-xs leading-relaxed text-dim">Drop below {formatNumber(h.records.length * h.config.token.tokensPerEgg)} to see what happens to unbacked eggs (policy: <span className="text-silver">{h.config.policies.belowThreshold}</span>).</p>
          </div>
        </div>
      )}
    </section>
  );
}
