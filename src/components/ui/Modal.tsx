"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Modal({ open, onClose, children, wide = false, xl = false, label }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean; xl?: boolean; label: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="sl-fade-in absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div
        className={`sl-fade-up relative max-h-[92svh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-gradient-to-b from-[#12101f] to-[#08070f] shadow-[0_40px_120px_-20px_rgba(153,69,255,0.35)] sm:rounded-3xl ${xl ? "max-w-6xl" : wide ? "max-w-5xl" : "max-w-3xl"}`}
        style={{ animationDuration: "0.5s" }}
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/40 text-mist transition hover:text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
