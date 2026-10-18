"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useHatchery } from "@/state/HatcheryProvider";
import { formatNumber, shortAddress } from "@/lib/format";

/**
 * Nav entry to the Hatchery. Eggs never need a wallet connection, so this
 * links to address tracking (or the demo) rather than asking to connect.
 * Wallet connection exists only on the fee-claims page.
 */
export function WalletButton({ compact = false }: { compact?: boolean }) {
  const h = useHatchery();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!h.hydrated) return <div className="h-10 w-36 animate-pulse rounded-full bg-white/5" />;

  if (!h.wallet) {
    return (
      <Link href="/hatchery" className="sl-btn-primary rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white sm:px-5">
        Find my eggs
      </Link>
    );
  }

  const watch = h.wallet.kind === "watch";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="sl-glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm transition hover:border-white/20">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-sol-purple to-sol-green text-[10px] font-bold text-black">{h.isDemo ? "D" : "◎"}</span>
        <span className="font-mono text-xs text-white/90">{shortAddress(h.wallet.address)}</span>
        {!compact && (h.isDemo || watch) && (
          <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${h.isDemo ? "bg-amber-400/15 text-amber-300" : "bg-sol-green/15 text-sol-green"}`}>{h.isDemo ? "Demo" : "Tracked"}</span>
        )}
      </button>
      {open && (
        <div className="sl-glass sl-fade-in absolute right-0 top-12 z-50 w-72 rounded-2xl bg-abyss/90 p-4 text-sm shadow-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">{h.wallet.label}</p>
          <p className="mt-1 break-all font-mono text-xs text-white/80">{h.wallet.address}</p>
          {h.isDemo ? (
            <>
              <div className="mt-3 flex items-baseline justify-between border-t border-white/5 pt-3">
                <span className="text-mist">Balance</span>
                <span className="font-mono text-white">
                  {formatNumber(h.balance)} {h.config.token.symbol}
                </span>
              </div>
              <p className="mt-3 rounded-lg bg-amber-400/10 p-2.5 text-xs leading-relaxed text-amber-200/90">Simulated wallet. Balances and timers are mock data; nothing here touches a blockchain.</p>
            </>
          ) : (
            <p className="mt-3 rounded-lg bg-white/5 p-2.5 text-xs leading-relaxed text-mist">Eggs for this address are tracked automatically from Solana. No wallet is connected.</p>
          )}
          <Link href="/hatchery" onClick={() => setOpen(false)} className="mt-3 block w-full rounded-xl border border-white/10 py-2 text-center text-xs uppercase tracking-widest text-mist transition hover:border-white/25 hover:text-white">
            Open Hatchery
          </Link>
          <button
            onClick={() => {
              h.disconnect();
              setOpen(false);
            }}
            className="mt-2 w-full rounded-xl border border-white/10 py-2 text-xs uppercase tracking-widest text-mist transition hover:border-white/25 hover:text-white"
          >
            {watch ? "Stop tracking" : "Leave demo"}
          </button>
        </div>
      )}
    </div>
  );
}
