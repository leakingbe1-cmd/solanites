export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20,3 C29,3 35,16 35,25 C35,33 28.5,38 20,38 C11.5,38 5,33 5,25 C5,16 11,3 20,3 Z" fill="none" stroke="#ecedf3" strokeOpacity="0.85" strokeWidth="1.2" />
      <path d="M20,13 L24.5,21 L20,29 L15.5,21 Z" fill="#ecedf3" />
      <path d="M7.5,24 C14,27 26,27 32.5,24" fill="none" stroke="#ecedf3" strokeOpacity="0.45" strokeWidth="0.8" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      <span className="font-display text-[19px] font-semibold tracking-[0.3em] text-platinum">SOLANITES</span>
    </span>
  );
}
