import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-void">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">Hold Solana. Hatch the extraordinary. A creature-collection universe where conviction is the only currency that matters.</p>
          <p className="mt-6 max-w-sm rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-xs leading-relaxed text-amber-200/80">
            Prototype build. Wallets, balances, timers and leaderboards shown here are simulated mock data. No tokens, NFTs or on-chain records are created.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Explore</p>
          <ul className="mt-4 space-y-2.5 text-mist">
            <li><Link className="hover:text-white" href="/hatchery">Hatchery</Link></li>
            <li><Link className="hover:text-white" href="/collection">Collection</Link></li>
            <li><Link className="hover:text-white" href="/leaderboard">Leaderboard</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Learn</p>
          <ul className="mt-4 space-y-2.5 text-mist">
            <li><Link className="hover:text-white" href="/how-it-works">How It Works</Link></li>
            <li><Link className="hover:text-white" href="/how-it-works#rules">Gameplay Rules</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">© Solanites · Built on conviction</div>
    </footer>
  );
}
