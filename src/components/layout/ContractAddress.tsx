"use client";

import { useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_LABEL, isContractAddress, solscanTokenUrl } from "@/config/social";
import { shortAddress } from "@/lib/format";

/**
 * The one place the contract address is shown: hero and footer ("full") and the nav ("compact").
 * "Coming soon" until the owner sets CONTRACT_ADDRESS; then the address, a copy button, a Solscan
 * link and a reminder to trust only this address. An invalid value is never shown.
 */
export function ContractAddress({ variant = "full", address = CONTRACT_ADDRESS, className = "" }: { variant?: "full" | "compact"; address?: string | null; className?: string }) {
  const [copied, setCopied] = useState(false);
  if (!isContractAddress(address))
    return (
      <span className={`font-mono text-[11px] uppercase tracking-[0.2em] text-mist/80 ${className}`} data-testid="contract-address" data-state="soon">
        {variant === "compact" ? "CA: soon" : CONTRACT_LABEL}
      </span>
    );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the address is still selectable */
    }
  };
  const copyButton = (
    <button type="button" onClick={copy} className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/85 transition hover:text-bone" aria-label="Copy contract address">
      {copied ? "Copied" : "Copy"}
    </button>
  );

  if (variant === "compact")
    return (
      <span className={`inline-flex items-center gap-2 font-mono text-[11px] text-mist ${className}`} data-testid="contract-address" data-state="live" title={address}>
        CA {shortAddress(address)}
        {copyButton}
      </span>
    );

  return (
    <span className={`inline-flex min-w-0 max-w-full flex-col gap-1.5 ${className}`} data-testid="contract-address" data-state="live">
      <span className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist/80">Contract</span>
        <code className="min-w-0 break-all font-mono text-xs text-bone">{address}</code>
        {copyButton}
        <a href={solscanTokenUrl(address)} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] uppercase tracking-[0.18em] text-sol-green/90 underline-offset-4 hover:underline">
          Solscan ↗
        </a>
      </span>
      <span className="text-[11px] leading-snug text-amber-200/80">Only trust this address. Solanites never DMs first and never asks for a seed phrase.</span>
    </span>
  );
}
