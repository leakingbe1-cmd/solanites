import type { ReactNode } from "react";

/**
 * The Hatchery chamber: an ancient arch, a shaft of light from above, and an engraved
 * platform (the sigil's celestial ring of twelve marks, seen in perspective) with the
 * egg suspended over it. A few motes rise from the platform towards the egg, and the
 * egg's light falls back onto the floor. SVG and CSS only; still under reduced motion.
 * `children` is the egg (or whatever the chamber presents).
 */

// Motes rising from the platform: [x % across the platform, delay s, duration s].
const MOTES: [number, number, number][] = [
  [30, 0, 6.5], [42, 2.4, 7.5], [55, 1.1, 6], [64, 3.6, 8], [72, 0.6, 7], [48, 4.8, 6.8],
];

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
            <stop offset="0.7" stopColor="#9945ff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#9945ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* light falling from above onto the egg */}
      <div className="sl-chamber-shaft absolute inset-x-0 top-0 mx-auto" aria-hidden />

      {/* the egg, suspended */}
      <div className="sl-chamber-egg relative z-10 mx-auto">{children}</div>

      {/* the platform: engraved rings and twelve marks, in perspective */}
      <div className="sl-chamber-floor relative mx-auto" aria-hidden>
        <div className="sl-chamber-reflection absolute inset-0" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 200">
          <g fill="none" stroke="#f6d488">
            <circle cx="100" cy="100" r="96" strokeWidth="0.8" opacity="0.55" />
            <circle cx="100" cy="100" r="80" strokeWidth="0.5" opacity="0.35" />
            <circle cx="100" cy="100" r="54" strokeWidth="0.6" opacity="0.4" strokeDasharray="2 4" />
            {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
              <line key={a} x1="100" y1={a % 90 === 0 ? 2 : 6} x2="100" y2="18" strokeWidth={a % 90 === 0 ? 1.4 : 0.9} opacity="0.65" transform={`rotate(${a} 100 100)`} />
            ))}
          </g>
        </svg>
      </div>
      {/* motes rising from the platform towards the egg */}
      <div className="sl-chamber-motes absolute inset-x-0 mx-auto" aria-hidden>
        {MOTES.map(([x, delay, dur], i) => (
          <span key={i} style={{ left: `${x}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s` }} />
        ))}
      </div>
    </div>
  );
}
