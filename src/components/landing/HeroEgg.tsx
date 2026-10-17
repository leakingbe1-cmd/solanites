"use client";

import { useEffect, useRef, useState } from "react";
import { EggArt } from "@/components/egg/EggArt";
import { SPECIES_BY_ID } from "@/lib/species";

/** The hero specimen: a single egg under a single light, with a quiet readout. */
export function HeroEgg() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pct, setPct] = useState(71.42);

  useEffect(() => {
    const t = setInterval(() => setPct((p) => (p >= 99.99 ? 71.42 : +(p + 0.01).toFixed(2))), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-[4/5] w-full max-w-[min(86vw,520px)]"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {/* single overhead light */}
      <div className="pointer-events-none absolute left-1/2 top-[-8%] h-[62%] w-[56%] -translate-x-1/2 rounded-full bg-[#b9b6ff]/[0.07] blur-3xl" />
      <div className="sl-spotlight pointer-events-none absolute inset-x-[8%] top-[14%] bottom-[18%]" />
      {/* plinth */}
      <div className="absolute inset-x-[14%] bottom-[9%] h-[7%]">
        <div className="sl-plinth h-full w-full" />
        <div className="absolute inset-x-[18%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      <div
        className="absolute inset-x-[12%] top-[6%] bottom-[10%] transition-transform duration-700 ease-out"
        style={{ transform: `perspective(1200px) rotateY(${tilt.x * 5}deg) rotateX(${-tilt.y * 4}deg)` }}
      >
        <EggArt stage={3} progress={0.4} seed={0} cracks={3} inside={SPECIES_BY_ID["aurelion"]} />
      </div>

      {/* instrument readout */}
      <div className="sl-fade-up absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.28em] text-mist" style={{ animationDelay: "1s" }}>
        <span>
          Incubation <span className="sl-num ml-2 text-platinum">{pct.toFixed(2)}%</span>
        </span>
        <span className="h-3 w-px bg-white/15" />
        <span>
          Rarity <span className="ml-2 text-platinum">Sealed</span>
        </span>
      </div>
    </div>
  );
}
