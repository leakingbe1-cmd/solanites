"use client";

import { useState } from "react";
import { X_LIMIT, xLength } from "@/studio/xText";

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(text: string, name: string, type = "text/markdown") {
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), name);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // clipboard API blocked (http, iframe): fall back to a hidden textarea
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        setState((await copyText(text)) ? "done" : "fail");
        setTimeout(() => setState("idle"), 1600);
      }}
      disabled={!text}
      className={`shrink-0 rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist transition hover:border-white/30 hover:text-white disabled:opacity-40 ${className}`}
    >
      {state === "done" ? "Copied ✓" : state === "fail" ? "Copy failed" : label}
    </button>
  );
}

export function XCount({ text }: { text: string }) {
  const n = xLength(text);
  return <span className={`font-mono text-[10px] tabular-nums ${n > X_LIMIT ? "text-rose-400" : "text-mist/60"}`}>{n}/{X_LIMIT}</span>;
}

export function Label({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">{children}</span>
      {hint && <span className="text-[11px] text-mist/60">{hint}</span>}
    </span>
  );
}

export const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-mist/40 focus:border-sol-purple/60 focus:outline-none";

export function Panel({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="sl-glass rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold tracking-wide text-white">{title}</h3>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
