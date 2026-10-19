"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/**
 * A short fade and rise when the route changes. The wrapper is never remounted (the
 * page tree, the navigation and the cosmic backdrop stay as they are); the animation
 * is played on it with the Web Animations API after the new page renders, before it
 * paints. Not on the first load (the intro or pre-paint cover is showing then), and
 * not with reduced motion.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.transitions = String(Number(el.dataset.transitions ?? 0) + 1);
    const anim = el.animate(
      [
        { opacity: 0, transform: "translate3d(0, 10px, 0)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
    return () => anim.cancel();
  }, [path]);

  return (
    <div ref={ref} data-page-transition>
      {children}
    </div>
  );
}
