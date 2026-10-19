"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";
import { useHatchery } from "@/state/HatcheryProvider";

const LINKS = [
  { href: "/hatchery", label: "Hatchery" },
  { href: "/collection", label: "Collection" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/claims", label: "Rewards" },
];

export function Nav() {
  const path = usePathname();
  const h = useHatchery();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMenu(false), [path]);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled || menu ? "border-b border-white/5 bg-void/75 backdrop-blur-xl" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" aria-label="Solanites home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] tracking-wide transition ${active ? "text-white" : "text-mist hover:text-white"}`}>
                {l.label}
                {active && <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-sol-purple via-sol-blue to-sol-green" />}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={h.toggleSound}
            aria-label={h.sound ? "Mute sound" : "Enable sound"}
            title={h.sound ? "Sound on" : "Sound off"}
            className="sl-glass hidden h-10 w-10 place-items-center rounded-full text-mist transition hover:text-white sm:grid"
          >
            {h.sound ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l5 6M22 9l-5 6" strokeLinecap="round" /></svg>
            )}
          </button>
          <WalletButton compact />
          <button onClick={() => setMenu((m) => !m)} className="sl-glass grid h-10 w-10 place-items-center rounded-full lg:hidden" aria-label="Menu">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </nav>
      {menu && (
        <div className="sl-fade-in border-t border-white/5 px-4 pb-6 pt-2 lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`block border-b border-white/5 py-4 font-display text-lg ${path.startsWith(l.href) ? "text-white" : "text-mist"}`}>
              {l.label}
            </Link>
          ))}
          <button onClick={h.toggleSound} className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-mist sm:hidden">
            Sound: {h.sound ? "On" : "Off"}
          </button>
        </div>
      )}
    </header>
  );
}
