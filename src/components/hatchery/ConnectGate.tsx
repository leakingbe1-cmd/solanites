"use client";

import { useEffect, useState } from "react";
import { EggArt } from "@/components/egg/EggArt";
import { ParticleField } from "@/components/ui/ParticleField";
import { describeSchedule } from "@/config/eggProgression";
import { DEMO_BALANCE, useHatchery } from "@/state/HatcheryProvider";
import { formatNumber } from "@/lib/format";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function ConnectGate() {
  const h = useHatchery();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<{ label: string; address: string }[]>([]);

  // Local fixture mode only: offers the fixture wallets. The endpoint is 404 everywhere else.
  useEffect(() => {
    fetch("/api/dev/fixtures")
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => b?.wallets && setFixtures(b.wallets))
      .catch(() => {});
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = address.trim();
    if (!BASE58.test(a)) return setError("That doesn't look like a Solana address. Paste the public address (32–44 characters).");
    setError(null);
    h.watch(a);
  }

  return (
    <section className="sl-atmosphere relative overflow-hidden pt-20">
      <ParticleField />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 md:grid-cols-2">
        <div className="mx-auto h-[340px] w-[260px] sm:h-[440px] sm:w-[340px]">
          <EggArt stage={1} seed={2} />
        </div>
        <div className="text-center md:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">The Hatchery</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">Your eggs find you.</h1>
          <p className="mt-5 text-lg leading-relaxed text-mist">
            Every {formatNumber(h.config.token.tokensPerEgg)} {h.config.token.symbol} you hold earns an egg, tracked automatically from Solana. There&apos;s nothing to connect. Paste your
            public address to see your eggs.
          </p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="track-address" className="sr-only">
              Your public Solana address
            </label>
            <input
              id="track-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your public address, e.g. 7xKX…9fQa"
              autoComplete="off"
              spellCheck={false}
              maxLength={60}
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 font-mono text-sm text-white outline-none placeholder:text-mist/50 focus:border-sol-purple"
            />
            <button type="submit" disabled={!address.trim()} className="sl-btn-primary rounded-2xl px-7 py-3.5 font-display text-xs font-semibold tracking-[0.2em] text-white disabled:opacity-50">
              FIND MY EGGS
            </button>
          </form>
          {error && (
            <p role="alert" className="mt-3 text-sm text-amber-200">
              {error}
            </p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-mist/70">
            Only your public address. Solanites never asks for a seed phrase, private key or signature to track eggs. Your first egg hatches {describeSchedule().split(",")[0]} after it appears.
          </p>

          {fixtures.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-4 text-left">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-300">Local fixture wallets · test data, not real holders</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {fixtures.map((f) => (
                  <button key={f.address} onClick={() => h.watch(f.address)} className="rounded-full border border-amber-300/30 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-300/10">
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/5 pt-6 sm:flex-row md:justify-start">
            <button onClick={() => h.connect("demo")} className="rounded-full border border-white/15 px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-mist transition hover:text-white">
              Explore the demo
            </button>
            <p className="max-w-xs text-xs leading-relaxed text-amber-200/70">
              Simulated: a mock balance of {formatNumber(DEMO_BALANCE)} tokens and a pre-grown collection. Nothing is read from Solana.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
