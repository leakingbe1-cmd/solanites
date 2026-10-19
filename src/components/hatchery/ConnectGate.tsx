"use client";

import { useEffect, useState } from "react";
import { EggArt } from "@/components/egg/EggArt";
import { HatcheryGuide } from "@/components/hatchery/HatcheryGuide";
import { HatcheryTour, type TourStep } from "@/components/hatchery/HatcheryTour";
import { HatcheryChamber } from "@/components/hatchery/HatcheryChamber";
import { incubationMsFor, initialGrowthMsFor } from "@/config/eggProgression";
import { DEMO_BALANCE, useHatchery } from "@/state/HatcheryProvider";
import { formatNumber, formatSpan } from "@/lib/format";
import { ReplayIntroButton } from "@/components/intro/ReplayIntroButton";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function ConnectGate() {
  const h = useHatchery();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<{ label: string; address: string }[]>([]);
  const [touring, setTouring] = useState(false);

  // Local fixture mode only: offers the fixture wallets. Never requested in production builds.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    fetch("/api/dev/fixtures")
      .then(async (r) => ({ ok: r.ok, body: await r.json().catch(() => null) }))
      .then(({ ok, body }) => ok && body?.wallets && setFixtures(body.wallets))
      .catch(() => {});
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = address.trim();
    if (!BASE58.test(a)) return setError("That doesn't look like a Solana address. Paste the public address (32–44 characters).");
    setError(null);
    h.watch(a);
  }

  const tour: TourStep[] = [
    { target: "address", title: "Find your eggs", body: "Paste any public Solana address to see the eggs it has earned. It is read-only: no wallet connection, signature or key." },
    { target: "demo", title: "Or try the demo", body: "The demo uses a simulated balance and a fast clock so you can see incubation, hatching and evolution. Nothing in it is real or read from Solana." },
    { target: "guide", title: "The rules at a glance", body: "How eggs are earned, how long they incubate, when creatures evolve, and the one place a wallet is ever needed." },
  ];

  return (
    <>
      <section className="relative overflow-hidden pt-20">
        <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 pb-20 pt-6 sm:px-6 md:grid-cols-2 md:gap-10 md:pt-12">
          <HatcheryChamber className="mx-auto">
            <EggArt stage={1} seed={2} />
          </HatcheryChamber>
          <div className="text-center md:text-left">
            <p className="sl-eyebrow">The Hatchery</p>
            <h1 className="mt-4 sl-display-l text-bone">Your eggs find you.</h1>
            <p className="mt-5 text-lg leading-relaxed text-mist">
              Every {formatNumber(h.config.token.tokensPerEgg)} {h.config.token.symbol} you hold earns an egg, tracked automatically from Solana once holder tracking is live. There&apos;s nothing to connect. Paste your
              public address to see your eggs.
            </p>

            <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row" data-tour="address">
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
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-4 py-3.5 font-mono text-sm text-bone outline-none placeholder:text-mist/50 focus:border-gilt"
              />
              <button type="submit" disabled={!address.trim()} className="sl-btn-gold rounded-full px-7 py-3.5 font-sans text-xs font-semibold tracking-[0.2em] disabled:opacity-50">
                FIND MY EGGS
              </button>
            </form>
            {error && (
              <p role="alert" className="mt-3 text-sm text-amber-200">
                {error}
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-mist/70">
              Only your public address. Solanites never asks for a seed phrase, private key or signature to track eggs. Your first egg hatches {formatSpan(incubationMsFor(1))} after it appears and is fully grown {formatSpan(initialGrowthMsFor(1))} later.
            </p>

            {fixtures.length > 0 && (
              <div className="mt-6 rounded-md border border-amber-400/30 bg-amber-400/[0.06] p-4 text-left">
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

            <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/5 pt-6 sm:flex-row md:justify-start" data-tour="demo">
              <button onClick={() => h.connect("demo")} className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-mist transition hover:text-bone">
                Explore the demo
              </button>
              <p className="max-w-xs text-xs leading-relaxed text-amber-200/70">
                Simulated: a mock balance of {formatNumber(DEMO_BALANCE)} tokens and a pre-grown collection. Nothing is read from Solana.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-mist md:justify-start">
              <button type="button" onClick={() => setTouring(true)} className="underline-offset-4 transition hover:text-bone hover:underline">
                New here? Take the 3-step tour
              </button>
              <span className="text-white/15" aria-hidden>·</span>
              <ReplayIntroButton className="underline-offset-4 transition hover:text-bone hover:underline" />
            </div>
          </div>
        </div>
      </section>
      <HatcheryGuide />
      {touring && <HatcheryTour steps={tour} onClose={() => setTouring(false)} />}
    </>
  );
}
