"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/**
 * The signature page transition (creative direction §4.3): a 1px line of gilt light crosses
 * the world under the header whenever the route changes. Not on first load, not with reduced motion.
 */
export function HorizonLine() {
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
    const anim = el.animate(
      [
        { transform: "scaleX(0)", opacity: 1, offset: 0 },
        { transform: "scaleX(1)", opacity: 1, offset: 0.62 },
        { transform: "scaleX(1)", opacity: 0, offset: 1 },
      ],
      { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    return () => anim.cancel();
  }, [path]);

  return <div ref={ref} className="sl-horizon pointer-events-none fixed inset-x-0 top-16 z-50 h-px lg:top-20" data-testid="horizon-line" aria-hidden />;
}
