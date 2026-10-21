"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hero section shell. Marks itself data-offscreen while scrolled away, so its CSS
 * animations pause, and data-awake once the Phoenix image has loaded, so the
 * awakening never plays over an empty frame. A 2.5 s failsafe wakes it regardless
 * (a failed image leaves the backdrop and copy, which still read well).
 */
export function HeroSection({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => el.toggleAttribute("data-offscreen", !entry.isIntersecting));
    io.observe(el);

    const wake = () => el.setAttribute("data-awake", "");
    const img = el.querySelector<HTMLImageElement>(".sl-phx img");
    const failsafe = window.setTimeout(wake, 2500);
    // `complete` is also true for an image that already failed: wake either way.
    if (!img || img.complete) wake();
    else {
      img.addEventListener("load", wake, { once: true });
      img.addEventListener("error", wake, { once: true });
    }
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
      img?.removeEventListener("load", wake);
      img?.removeEventListener("error", wake);
    };
  }, []);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
