import type { ReactNode } from "react";

/**
 * The Hatchery chamber: an ancient arch framing the egg, which floats in it. Nothing
 * stands under the egg: no floor, platform, light shaft, reflection or motes (approved
 * art canon W1–W2, docs/canon/solanites-art-canon.md). SVG and CSS only.
 * `children` is the egg (or whatever the chamber presents).
 */
export function HatcheryChamber({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`sl-chamber relative ${className}`}>
      {/* the arch: a thin gold outline of an ancient gateway behind the egg */}
      <svg className="sl-chamber-arch absolute inset-x-0 top-0 mx-auto h-full w-full" viewBox="0 0 400 520" preserveAspectRatio="xMidYMax meet" aria-hidden>
        <path d="M28 500 L28 230 C28 120 110 40 200 18 C290 40 372 120 372 230 L372 500" fill="none" stroke="url(#sl-chamber-arch)" strokeWidth="1.1" />
        <path d="M50 500 L50 234 C50 136 124 64 200 42 C276 64 350 136 350 234 L350 500" fill="none" stroke="url(#sl-chamber-arch)" strokeWidth="0.5" opacity="0.6" />
        <circle cx="200" cy="18" r="3" fill="#f6d488" opacity="0.8" />
        <defs>
          <linearGradient id="sl-chamber-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6d488" stopOpacity="0.7" />
            <stop offset="0.7" stopColor="#a8692a" stopOpacity="0.25" />
            <stop offset="1" stopColor="#a8692a" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* the egg, suspended */}
      <div className="sl-chamber-egg relative z-10 mx-auto">{children}</div>
    </div>
  );
}
