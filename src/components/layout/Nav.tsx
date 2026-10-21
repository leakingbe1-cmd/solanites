"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { ContractAddress } from "./ContractAddress";
import { WalletButton } from "./WalletButton";
import { useHatchery } from "@/state/HatcheryProvider";

const LINKS = [
  { href: "/hatchery", label: "Hatchery" },
  { href: "/collection", label: "Collection" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/claims", label: "Rewards" },
  { href: "/updates", label: "Updates" },
];

export function Nav() {
  const path = usePathname();
  const h = useHatchery();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const linksRef = useRef<HTMLDivElement>(null);
  // One indicator under the active link, sliding to the next one on navigation.
  const [indicator, setIndicator] = useState<{ x: number; w: number; on: boolean; ready: boolean }>({ x: 0, w: 0, on: false, ready: false });
  const activeHref = LINKS.find((l) => path.startsWith(l.href))?.href ?? null;

  useLayoutEffect(() => {
    const place = () => {
      const el = activeHref ? linksRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`) : null;
      setIndicator((prev) => (el ? { x: el.offsetLeft + el.offsetWidth / 2 - 2.5, w: 5, on: true, ready: prev.ready || prev.on } : { ...prev, on: false }));
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [activeHref]);

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
          <Logo narrowMarkOnly />
        </Link>
        <div ref={linksRef} className="relative hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = l.href === activeHref;
            return (
              <Link
                key={l.href}
                href={l.href}
                data-href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] tracking-wide transition-colors duration-200 ${active ? "text-bone" : "text-mist hover:text-bone"}`}
              >
                {l.label}
              </Link>
            );
          })}
          <span
            className="sl-nav-indicator"
            data-testid="nav-indicator"
            aria-hidden
            style={{ width: indicator.w, transform: `translateX(${indicator.x}px)`, opacity: indicator.on ? 1 : 0, transitionProperty: indicator.ready ? undefined : "opacity" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <ContractAddress variant="compact" className="mr-2 hidden xl:inline-flex" />
          <button
            onClick={h.toggleSound}
            aria-label={h.sound ? "Mute sound" : "Enable sound"}
            title={h.sound ? "Sound on" : "Sound off"}
            className="sl-glass hidden h-10 w-10 place-items-center rounded-full text-mist transition hover:text-bone sm:grid"
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
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.href === activeHref ? "page" : undefined}
              className={`flex items-center gap-3 border-b border-white/5 py-4 font-display text-lg transition-colors ${l.href === activeHref ? "text-bone" : "text-mist"}`}
            >
              <span className={`h-5 w-0.5 rounded-full bg-gradient-to-b from-sol-purple to-sol-blue transition-opacity ${l.href === activeHref ? "opacity-100" : "opacity-0"}`} aria-hidden />
              {l.label}
            </Link>
          ))}
          <ContractAddress variant="compact" className="mt-4 flex" />
          <button onClick={h.toggleSound} className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-mist sm:hidden">
            Sound: {h.sound ? "On" : "Off"}
          </button>
        </div>
      )}
    </header>
  );
}
