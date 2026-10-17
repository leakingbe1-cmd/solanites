"use client";

import { EggArt } from "@/components/egg/EggArt";
import { ParticleField } from "@/components/ui/ParticleField";
import { useHatchery } from "@/state/HatcheryProvider";
import { formatNumber } from "@/lib/format";
import { WalletLookup } from "./WalletLookup";

export function ConnectGate() {
  const h = useHatchery();
  return (
    <section className="sl-atmosphere relative overflow-hidden pt-20">
      <ParticleField />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-10 pt-12 sm:px-6 md:grid-cols-2">
        <div className="mx-auto h-[340px] w-[260px] sm:h-[440px] sm:w-[340px]">
          <EggArt stage={1} seed={2} />
        </div>
        <div className="text-center md:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">The Hatchery</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">Your eggs are sealed until you arrive.</h1>
          <p className="mt-5 text-lg leading-relaxed text-mist">
            Each {formatNumber(h.config.token.tokensPerEgg)} tokens held backs one egg. Check any public wallet address below, or explore every stage with the demo wallet.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row md:justify-start">
            <button onClick={() => h.connect("demo")} className="sl-btn-primary rounded-full px-8 py-4 font-display text-xs font-semibold tracking-[0.2em] text-white">
              ENTER WITH DEMO WALLET
            </button>
            <button
              disabled={!h.injectedAvailable}
              onClick={() => h.connect("injected").catch(() => {})}
              className="rounded-full border border-white/15 px-7 py-4 text-xs uppercase tracking-[0.2em] text-mist transition enabled:hover:text-white disabled:opacity-40"
            >
              Solana Wallet (experimental)
            </button>
          </div>
          <p className="mt-6 max-w-md text-xs leading-relaxed text-amber-200/70 md:mx-0 mx-auto">
            The demo wallet is simulated: it has a mock balance of 52,000 tokens and a pre-grown collection so you can explore every stage. Nothing is read from or written to Solana.
          </p>
        </div>
      </div>
      <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <WalletLookup />
      </div>
    </section>
  );
}
