"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface TourStep {
  /** `data-tour` value of the element to point at. */
  target: string;
  title: string;
  body: string;
}

/**
 * Optional, non-blocking walkthrough that points at the real interface. It
 * dims the page around the current element; Back / Next / Close and Escape
 * work at every step, and nothing is required to continue using the page.
 */
export function HatcheryTour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const step = steps[i];

  const measure = useCallback(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step.target]);

  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    measure();
    const t = window.setTimeout(measure, reduced ? 0 : 450);
    return () => window.clearTimeout(t);
  }, [step.target, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      document.removeEventListener("keydown", onKey);
    };
  }, [measure, onClose]);

  useEffect(() => card.current?.focus({ preventScroll: true }), [i]);

  const pad = 10;
  const last = i === steps.length - 1;

  return (
    <>
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[60] rounded-md ring-2 ring-sol-green/80 transition-all duration-300"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: "0 0 0 9999px rgba(3,2,8,0.62), 0 0 40px rgba(20,241,149,0.25)" }}
        />
      )}
      <div
        ref={card}
        tabIndex={-1}
        role="dialog"
        aria-label={`Hatchery tour, step ${i + 1} of ${steps.length}`}
        className="fixed inset-x-4 z-[61] mx-auto max-w-md rounded-md border border-white/10 bg-[#100e1c] p-5 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)] outline-none sm:inset-x-auto sm:w-[26rem]"
        style={cardPosition(rect, pad)}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-sol-green/80">
          Step {i + 1} of {steps.length}
        </p>
        <h2 className="mt-2 font-display text-lg text-bone">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={onClose} className="text-xs uppercase tracking-[0.2em] text-mist transition hover:text-bone">
            Close
          </button>
          <div className="flex gap-2">
            {i > 0 && (
              <button type="button" onClick={() => setI(i - 1)} className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.15em] text-mist transition hover:text-bone">
                Back
              </button>
            )}
            <button type="button" onClick={() => (last ? onClose() : setI(i + 1))} className="sl-btn-outline rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-bone">
              {last ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const CARD_H = 210;
const CARD_W = 416;

/** Below the target when there is room, otherwise above it; aligned to it from the sm breakpoint (phones use the full width). */
function cardPosition(rect: DOMRect | null, pad: number): React.CSSProperties {
  if (!rect) return { top: "40%" };
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const top = rect.bottom + CARD_H + 24 < vh ? Math.min(vh - CARD_H, rect.bottom + pad + 12) : Math.max(16, rect.top - pad - 12 - CARD_H);
  return vw >= 640 ? { top, left: Math.max(16, Math.min(vw - CARD_W - 16, rect.left)) } : { top };
}
