"use client";

import { useEffect, useRef, useState } from "react";
import { useHatchery } from "@/state/HatcheryProvider";
import { formatNumber, shortAddress } from "@/lib/format";

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const h = useHatchery();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!h.hydrated) return <div className="h-10 w-36 animate-pulse rounded-full bg-white/5" />;

  if (h.wallet) {
    return (
      <div ref={ref} className="relative">
        <button onClick={() => setOpen((o) => !o)} className="sl-glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm transition hover:border-white/20">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-sol-purple to-sol-green text-[10px] font-bold text-black">{h.isDemo ? "D" : "◎"}</span>
          <span className="font-mono text-xs text-white/90">{shortAddress(h.wallet.address)}</span>
          {h.isDemo && !compact && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-300">Demo</span>}
        </button>
        {open && (
          <div className="sl-glass sl-fade-in absolute right-0 top-12 z-50 w-72 rounded-2xl bg-abyss/90 p-4 text-sm shadow-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">{h.wallet.label}</p>
            <p className="mt-1 break-all font-mono text-xs text-white/80">{h.wallet.address}</p>
            <div className="mt-3 flex items-baseline justify-between border-t border-white/5 pt-3">
              <span className="text-mist">Balance</span>
              <span className="font-mono text-white">
                {formatNumber(h.balance)} {h.config.token.symbol}
              </span>
            </div>
            {h.isDemo && <p className="mt-3 rounded-lg bg-amber-400/10 p-2.5 text-xs leading-relaxed text-amber-200/90">Simulated wallet. Balances and timers are mock data for the prototype — nothing here touches a blockchain.</p>}
            {h.balanceError && <p className="mt-3 rounded-lg bg-red-500/10 p-2.5 text-xs text-red-300">{h.balanceError}</p>}
            <button
              onClick={() => {
                h.disconnect();
                setOpen(false);
              }}
              className="mt-3 w-full rounded-xl border border-white/10 py-2 text-xs uppercase tracking-widest text-mist transition hover:border-white/25 hover:text-white"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="sl-btn-primary rounded-full px-4 py-2.5 text-xs sm:px-5 font-semibold uppercase tracking-[0.18em] text-white">
        Connect
      </button>
      {open && (
        <div className="sl-glass sl-fade-in absolute right-0 top-12 z-50 w-80 rounded-2xl bg-abyss/95 p-3 shadow-2xl">
          <button
            onClick={async () => {
              await h.connect("demo");
              setOpen(false);
            }}
            className="group flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-white/5"
          >
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sol-purple to-sol-green text-sm font-bold text-black">D</span>
            <span>
              <span className="block text-sm font-medium text-white">Demo Wallet</span>
              <span className="block text-xs leading-relaxed text-mist">Simulated wallet with mock balance and pre-grown eggs. Recommended for this prototype.</span>
            </span>
          </button>
          <button
            disabled={!h.injectedAvailable}
            onClick={async () => {
              try {
                setError(null);
                await h.connect("injected");
                setOpen(false);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
            className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition enabled:hover:bg-white/5 disabled:opacity-45"
          >
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-sm text-white">◎</span>
            <span>
              <span className="block text-sm font-medium text-white">
                Solana Wallet <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-mist">Experimental</span>
              </span>
              <span className="block text-xs leading-relaxed text-mist">
                {!h.injectedAvailable
                  ? "No wallet extension detected."
                  : h.liveChainConfigured
                    ? "Reads your real balance via RPC. Progress is tracked locally and is not authoritative."
                    : "Token mint not configured yet — balance will read as 0."}
              </span>
            </span>
          </button>
          {error && <p className="px-3 pb-2 text-xs text-red-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
