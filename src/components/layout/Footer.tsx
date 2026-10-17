import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-void">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr] lg:px-10">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">Hold Solana. Hatch the extraordinary. An archive of creatures that only grow for those who wait.</p>
          <p className="mt-8 max-w-sm border-l border-ember/40 pl-4 text-xs leading-relaxed text-mist">
            Prototype build. Wallets, balances, timers and leaderboards shown here are simulated mock data. No tokens, NFTs or on-chain records are created.
          </p>
        </div>
        <div className="text-sm">
          <p className="sl-label">Explore</p>
          <ul className="mt-5 space-y-3 text-silver">
            <li><Link className="sl-link" href="/hatchery">Hatchery</Link></li>
            <li><Link className="sl-link" href="/collection">Collection</Link></li>
            <li><Link className="sl-link" href="/leaderboard">Leaderboard</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="sl-label">Learn</p>
          <ul className="mt-5 space-y-3 text-silver">
            <li><Link className="sl-link" href="/how-it-works">How It Works</Link></li>
            <li><Link className="sl-link" href="/how-it-works#rules">Gameplay Rules</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-6 text-center text-[10px] uppercase tracking-[0.4em] text-dim">Solanites · Built on conviction</div>
    </footer>
  );
}
