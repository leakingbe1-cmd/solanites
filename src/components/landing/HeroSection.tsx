"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Hero section shell: marks itself data-offscreen while scrolled away, so its CSS animations pause. */
export function HeroSection({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => el.toggleAttribute("data-offscreen", !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
