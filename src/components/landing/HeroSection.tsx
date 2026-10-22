"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hero section shell. Marks itself data-offscreen while scrolled away, so its CSS
 * animations pause, and data-awake once the Phoenix image has loaded, so the
 * awakening never plays over an empty frame. A 2.5 s failsafe wakes it regardless
 * (a failed image leaves the backdrop and copy, which still read well).
 */
const EARLY_WAKE = `(function(){var s=document.currentScript&&document.currentScript.parentElement;if(!s)return;var i=s.querySelector(".sl-phx img");function w(){s.setAttribute("data-awake","")}if(!i||i.complete)w();else{i.addEventListener("load",w,{once:true});i.addEventListener("error",w,{once:true})}setTimeout(w,2500)})();`;

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

  // The same wake-up, run while the HTML is still parsing: the Phoenix can show the moment its image
  // arrives instead of after the page's JavaScript has loaded (which on a slow phone is seconds later).
  return (
    <section ref={ref} className={className} suppressHydrationWarning>
      {children}
      <script dangerouslySetInnerHTML={{ __html: EARLY_WAKE }} />
    </section>
  );
}
