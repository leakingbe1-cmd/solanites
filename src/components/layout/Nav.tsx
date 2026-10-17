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
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${scrolled || menu ? "border-b border-line bg-void/85 backdrop-blur-md" : "border-b border-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-10">
        <Link href="/" aria-label="Solanites home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => {
            const active = path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`relative py-2 text-[11px] uppercase tracking-[0.26em] transition-colors ${active ? "text-platinum" : "text-mist hover:text-platinum"}`}>
                {l.label}
                {active && <span className="absolute inset-x-0 -bottom-0.5 h-px bg-platinum/70" />}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={h.toggleSound}
            aria-label={h.sound ? "Mute sound" : "Enable sound"}
            title={h.sound ? "Sound on" : "Sound off"}
            className="hidden h-9 w-9 place-items-center text-mist transition-colors hover:text-platinum sm:grid"
          >
            {h.sound ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l5 6M22 9l-5 6" strokeLinecap="round" /></svg>
            )}
          </button>
          <WalletButton compact />
          <button onClick={() => setMenu((m) => !m)} className="grid h-9 w-9 place-items-center text-platinum md:hidden" aria-label="Menu">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
              {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 9h16M4 15h16" />}
            </svg>
          </button>
        </div>
      </nav>
      {menu && (
        <div className="sl-fade-in border-t border-line px-4 pb-8 pt-2 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`block border-b border-line py-5 font-display text-3xl ${path.startsWith(l.href) ? "text-platinum" : "text-mist"}`}>
              {l.label}
            </Link>
          ))}
          <button onClick={h.toggleSound} className="sl-label mt-6 sm:hidden">
            Sound · {h.sound ? "On" : "Off"}
          </button>
        </div>
      )}
    </header>
  );
}
