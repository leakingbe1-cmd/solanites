import Link from "next/link";
import { Sigil } from "@/components/brand/Sigil";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-void">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">Discover your creature. Hatch the extraordinary. A creature-collecting universe where Solanites grow stronger through their evolution.</p>
          <p className="mt-6 max-w-sm rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-xs leading-relaxed text-amber-200/80">
            Once holder tracking is live, eggs are tracked automatically from public on-chain balances; no wallet connection is needed. The demo wallet and the leaderboard use simulated data. Solanites never asks for a seed phrase or private key.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">Explore</p>
          <ul className="mt-4 space-y-2.5 text-mist">
            <li><Link className="hover:text-bone" href="/hatchery">Hatchery</Link></li>
            <li><Link className="hover:text-bone" href="/collection">Collection</Link></li>
            <li><Link className="hover:text-bone" href="/leaderboard">Leaderboard</Link></li>
            <li><Link className="hover:text-bone" href="/claims">Holder Rewards</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">Learn</p>
          <ul className="mt-4 space-y-2.5 text-mist">
            <li><Link className="hover:text-bone" href="/how-it-works">How It Works</Link></li>
            <li><Link className="hover:text-bone" href="/how-it-works#rules">Gameplay Rules</Link></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 border-t border-white/5 py-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-bone/30">
        <Sigil className="h-10 w-10 opacity-80" />
        © Solanites · Built on conviction
      </div>
    </footer>
  );
}
