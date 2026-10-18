"use client";

import { useState } from "react";
import { SPEED_OPTIONS, useHatchery } from "@/state/HatcheryProvider";
import { TIME } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";

/** Prototype-only controls. Clearly labelled; removed when real data is wired. */
export function SimulationPanel() {
  const h = useHatchery();
  const [open, setOpen] = useState(true);
  // No cap on eggs, so the slider stops at a demo-sized ten eggs.
  const max = h.config.token.tokensPerEgg * ((h.config.eggs.maxEggsPerWallet ?? 9) + 1);

  return (
    <section className="rounded-3xl border border-dashed border-amber-300/25 bg-amber-300/[0.03] p-5 sm:p-6">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/90">Prototype simulation controls</span>
          <span className="mt-1 block text-sm text-mist">Mock data only — use these to explore how holding drives progression.</span>
        </span>
        <span className="text-mist">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-mist/70">Time speed</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SPEED_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => h.setSpeed(o.value)}
                  className={`rounded-xl border px-3 py-2 text-xs transition ${h.speed === o.value ? "border-sol-purple/60 bg-sol-purple/15 text-white" : "border-white/10 text-mist hover:text-white"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-mist/70">Skip ahead</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["+1 hour", TIME.HOUR],
                ["+1 day", TIME.DAY],
                ["+7 days", 7 * TIME.DAY],
              ].map(([l, ms]) => (
                <button key={l} disabled={!h.isDemo} onClick={() => h.warp(ms as number)} className="rounded-xl border border-white/10 px-2 py-2 text-xs text-mist transition hover:text-white disabled:opacity-40">
                  {l}
                </button>
              ))}
            </div>
            <button onClick={h.resetDemo} disabled={!h.isDemo} className="mt-2 w-full rounded-xl border border-white/10 py-2 text-xs text-mist transition hover:text-white disabled:opacity-40">
              Reset demo collection
            </button>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-widest text-mist/70">Mock balance</p>
              <p className="font-mono text-sm text-white">{formatNumber(h.balance)}</p>
            </div>
            <input
              type="range"
              min={0}
              max={max}
              step={h.config.token.tokensPerEgg / 100}
              value={h.balance}
              disabled={!h.isDemo}
              onChange={(e) => h.setDemoBalance(Number(e.target.value))}
              className="mt-4 w-full accent-[#9945ff]"
              aria-label="Mock token balance"
            />
            <p className="mt-2 text-xs leading-relaxed text-mist/70">Drop below {formatNumber(h.records.length * h.config.token.tokensPerEgg)} to see what happens to unbacked eggs (policy: <span className="text-white/80">{h.config.policies.belowThreshold}</span>).</p>
          </div>
        </div>
      )}
    </section>
  );
}
