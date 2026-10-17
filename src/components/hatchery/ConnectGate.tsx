"use client";

import { EggArt } from "@/components/egg/EggArt";
import { useHatchery } from "@/state/HatcheryProvider";
import { formatNumber } from "@/lib/format";

export function ConnectGate() {
  const h = useHatchery();
  return (
    <section className="sl-atmosphere relative overflow-hidden pt-24 lg:pt-28">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-24 pt-8 sm:px-6 md:grid-cols-2 lg:min-h-[calc(100svh-7rem)]">
        <div className="relative mx-auto h-[360px] w-[280px] sm:h-[460px] sm:w-[360px]">
          <div className="pointer-events-none absolute left-1/2 top-[-12%] h-[70%] w-[90%] -translate-x-1/2 rounded-full bg-[#b9b6ff]/[0.06] blur-3xl" />
          <EggArt stage={1} seed={2} />
        </div>
        <div className="text-center md:text-left">
          <p className="sl-label">The Hatchery</p>
          <h1 className="sl-display mt-6 text-5xl text-platinum sm:text-6xl">
            Your eggs are sealed <span className="italic text-silver">until you arrive.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md leading-relaxed text-mist md:mx-0">
            Connect a wallet to see eligibility, claim eggs and watch them incubate. Each {formatNumber(h.config.token.tokensPerEgg)} {h.config.token.symbol} backs one egg.
          </p>
          <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row md:justify-start">
            <button onClick={() => h.connect("demo")} className="sl-btn sl-btn-primary px-8 py-4">
              Enter with demo wallet
            </button>
            <button
              disabled={!h.injectedAvailable}
              onClick={() => h.connect("injected").catch(() => {})}
              className="sl-btn text-mist transition-colors enabled:hover:text-platinum disabled:opacity-40"
            >
              Solana wallet · experimental
            </button>
          </div>
          <p className="mx-auto mt-10 max-w-md border-l border-ember/60 pl-4 text-left text-xs leading-relaxed text-mist md:mx-0">
            The demo wallet is simulated: it has a mock balance of 52,000 tokens and a pre-grown collection so you can explore every stage. Nothing is read from or written to Solana.
          </p>
        </div>
      </div>
    </section>
  );
}
