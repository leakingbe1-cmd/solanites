"use client";

import { useEffect, useRef, useState } from "react";
import { EggArt } from "@/components/egg/EggArt";
import { SPECIES_BY_ID } from "@/lib/species";

/** The floating hero egg with pointer parallax and HUD readouts. */
export function HeroEgg() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pct, setPct] = useState(71.42);

  useEffect(() => {
    const t = setInterval(() => setPct((p) => (p >= 99.99 ? 71.42 : +(p + 0.01).toFixed(2))), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-square w-full max-w-[min(92vw,560px)]"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {/* light column */}
      <div className="absolute left-1/2 top-[-20%] h-[140%] w-40 -translate-x-1/2 bg-gradient-to-b from-sol-purple/0 via-sol-purple/15 to-sol-green/0 blur-2xl" />
      <div className="absolute inset-[12%] rounded-full bg-sol-purple/20 blur-[90px]" />
      <div className="absolute inset-[28%] rounded-full bg-sol-green/10 blur-[70px]" />

      {/* orbit rings */}
      <svg viewBox="0 0 500 500" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9945ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#9945ff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#14f195" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: "250px 250px", animation: "sl-spin 40s linear infinite" }}>
          <circle cx="250" cy="250" r="232" fill="none" stroke="url(#hero-ring)" strokeWidth="1" />
          <circle cx="250" cy="18" r="3" fill="#14f195" />
        </g>
        <g style={{ transformOrigin: "250px 250px", animation: "sl-spin 70s linear infinite reverse" }}>
          <circle cx="250" cy="250" r="205" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 10" />
          <circle cx="45" cy="250" r="2" fill="#9945ff" />
        </g>
        <ellipse cx="250" cy="430" rx="150" ry="22" fill="none" stroke="rgba(153,69,255,0.35)" />
        <ellipse cx="250" cy="430" rx="100" ry="13" fill="none" stroke="rgba(20,241,149,0.3)" />
      </svg>

      <div
        className="absolute inset-[5%] transition-transform duration-300 ease-out"
        style={{ transform: `perspective(900px) rotateY(${tilt.x * 10}deg) rotateX(${-tilt.y * 8}deg) translate(${tilt.x * 8}px, ${tilt.y * 8}px)` }}
      >
        <EggArt stage={3} progress={0.6} seed={0} cracks={3} inside={SPECIES_BY_ID["aurelion"]} />
      </div>

      {/* HUD chips */}
      <div className="sl-glass sl-fade-up absolute left-0 top-[18%] hidden rounded-2xl px-4 py-3 sm:block" style={{ animationDelay: "0.9s" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">Incubation</p>
        <p className="mt-1 font-mono text-lg text-white">{pct.toFixed(2)}%</p>
      </div>
      <div className="sl-glass sl-fade-up absolute bottom-[20%] right-0 hidden rounded-2xl px-4 py-3 sm:block" style={{ animationDelay: "1.1s" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">Signature</p>
        <p className="mt-1 flex items-center gap-2 font-mono text-sm text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-sol-green shadow-[0_0_10px_#14f195]" /> Stirring · Rarity ???
        </p>
      </div>
    </div>
  );
}
