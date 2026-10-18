"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hero section shell. Publishes the pointer position as --hx / --hy (-1…1) for
 * CSS parallax layers, written once per frame so nothing re-renders, and marks
 * the section data-offscreen so its animations pause when scrolled away.
 * Parallax only runs for fine pointers without reduced motion.
 */
export function HeroStage({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => el.toggleAttribute("data-offscreen", !entry.isIntersecting));
    io.observe(el);

    const parallax = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    let raf = 0;
    let x = 0;
    let y = 0;
    const write = () => {
      raf = 0;
      el.style.setProperty("--hx", x.toFixed(3));
      el.style.setProperty("--hy", y.toFixed(3));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    const onMove = (e: PointerEvent) => {
      if (!parallax.matches || e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      queue();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      queue();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
