"use client";

import { useEffect, useRef, useState } from "react";
import { useHatchery } from "@/state/HatcheryProvider";
import { formatNumber, shortAddress } from "@/lib/format";

export function WalletButton(_props: { compact?: boolean }) {
  const h = useHatchery();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!h.hydrated) return <div className="h-9 w-28 animate-pulse bg-white/5" />;

  if (h.wallet) {
    return (
      <div ref={ref} className="relative">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 border border-line px-3.5 py-2 text-sm transition-colors hover:border-white/25">
          <span className="h-1.5 w-1.5 rounded-full bg-platinum" />
          <span className="sl-num text-[11px] text-platinum">{shortAddress(h.wallet.address)}</span>
          {h.isDemo && <span className="hidden text-[9px] uppercase tracking-[0.25em] text-ember sm:inline">Demo</span>}
        </button>
        {open && (
          <div className="sl-fade-in absolute right-0 top-12 z-50 w-72 border border-line bg-panel p-5 text-sm shadow-2xl">
            <p className="sl-label">{h.wallet.label}</p>
            <p className="sl-num mt-2 break-all text-[11px] text-silver">{h.wallet.address}</p>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-mist">Balance</span>
              <span className="sl-num text-platinum">
                {formatNumber(h.balance)} {h.config.token.symbol}
              </span>
            </div>
            {h.isDemo && <p className="mt-4 border-l border-ember/50 pl-3 text-xs leading-relaxed text-mist">Simulated wallet. Balances and timers are mock data for the prototype — nothing here touches a blockchain.</p>}
            {h.balanceError && <p className="mt-3 border-l border-red-400/50 pl-3 text-xs text-red-300">{h.balanceError}</p>}
            <button
              onClick={() => {
                h.disconnect();
                setOpen(false);
              }}
              className="sl-btn sl-btn-ghost mt-5 w-full py-2.5"
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
      <button onClick={() => setOpen((o) => !o)} className="sl-btn sl-btn-ghost px-4 py-2.5 sm:px-5">
        Connect
      </button>
      {open && (
        <div className="sl-fade-in absolute right-0 top-12 z-50 w-80 border border-line bg-panel p-2 shadow-2xl">
          <button
            onClick={async () => {
              await h.connect("demo");
              setOpen(false);
            }}
            className="group flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-white/[0.03]"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-platinum" />
            <span>
              <span className="block text-sm text-platinum">Demo Wallet <span className="ml-1 text-[9px] uppercase tracking-[0.2em] text-ember">Simulated</span></span>
              <span className="mt-1 block text-xs leading-relaxed text-mist">Simulated wallet with mock balance and pre-grown eggs. Recommended for this prototype.</span>
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
            className="flex w-full items-start gap-3 border-t border-line p-4 text-left transition-colors enabled:hover:bg-white/[0.03] disabled:opacity-45"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-silver" />
            <span>
              <span className="block text-sm text-platinum">
                Solana Wallet <span className="ml-1 text-[9px] uppercase tracking-[0.2em] text-mist">Experimental</span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-mist">
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
