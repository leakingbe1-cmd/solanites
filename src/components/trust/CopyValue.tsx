"use client";

import { useState } from "react";

/** A public value (address) with a copy button; the text stays selectable if the clipboard is blocked. */
export function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-2">
      <code className="min-w-0 break-all font-mono text-xs text-bone">{value}</code>
      <button
        type="button"
        onClick={() =>
          navigator.clipboard.writeText(value).then(
            () => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            },
            () => {},
          )
        }
        className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/85 transition hover:text-bone"
        aria-label={`Copy ${label}`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
