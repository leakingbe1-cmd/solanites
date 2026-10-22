"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";

/**
 * Homepage sections below the fold load their code (and art) only as they approach the viewport,
 * so the first screen (the live demo) is interactive sooner on phones. A placeholder keeps their
 * height, so nothing jumps when they arrive.
 */
function deferred(load: () => Promise<ComponentType>, minHeight: string): ComponentType {
  const Inner = dynamic(load, { ssr: false, loading: () => <div style={{ minHeight }} aria-hidden /> });
  function Deferred() {
    const ref = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el || near) return;
      const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { rootMargin: "800px 0px" });
      io.observe(el);
      return () => io.disconnect();
    }, [near]);
    return <div ref={ref} style={near ? undefined : { minHeight }}>{near && <Inner />}</div>;
  }
  return Deferred;
}

export const StockShowcase = deferred(() => import("./StockShowcase").then((m) => m.StockShowcase), "52rem");
export const RarityShowcase = deferred(() => import("./RarityShowcase").then((m) => m.RarityShowcase), "40rem");
export const StageTimeline = deferred(() => import("./StageTimeline").then((m) => m.StageTimeline), "28rem");
export const EvolutionShowcase = deferred(() => import("./EvolutionShowcase").then((m) => m.EvolutionShowcase), "36rem");
export const HowSteps = deferred(() => import("./HowSteps").then((m) => m.HowSteps), "24rem");
