export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9945ff" />
          <stop offset="0.55" stopColor="#00c2ff" />
          <stop offset="1" stopColor="#14f195" />
        </linearGradient>
      </defs>
      <path d="M20,3 C29,3 35,16 35,25 C35,33 28.5,38 20,38 C11.5,38 5,33 5,25 C5,16 11,3 20,3 Z" fill="none" stroke="url(#logo-g)" strokeWidth="2" />
      <path d="M20,14 L25,21 L20,29 L15,21 Z" fill="url(#logo-g)" />
      <path d="M9,24 L14,22 L16,26 M31,24 L26,22 L24,26" fill="none" stroke="url(#logo-g)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** `narrowMarkOnly`: under 360px wide show the mark alone (the header, where buttons share the row). */
export function Logo({ narrowMarkOnly = false }: { narrowMarkOnly?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-7 w-7 sm:h-8 sm:w-8" />
      <span className={`font-display text-[13px] font-semibold tracking-[0.16em] text-white sm:text-[15px] sm:tracking-[0.22em] ${narrowMarkOnly ? "max-[359px]:hidden" : ""}`}>SOLANITES</span>
    </span>
  );
}
