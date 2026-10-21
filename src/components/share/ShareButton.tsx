"use client";

import { XIcon } from "@/components/layout/XIcon";
import { sharePagePath, shareText, xIntentUrl, type ShareTarget } from "@/lib/share";

/** "Share on X": opens a prefilled post linking to the card's share page. Nothing is posted for you. */
export function ShareButton({ target, speciesId, className = "" }: { target: ShareTarget; speciesId: string; className?: string }) {
  const open = () => {
    const url = new URL(sharePagePath(target), window.location.origin).toString();
    window.open(xIntentUrl(shareText(speciesId, target.kind === "demo"), url), "_blank", "noopener,noreferrer");
  };
  return (
    <button type="button" onClick={open} className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 px-6 py-3 font-sans text-xs font-semibold tracking-[0.2em] text-bone transition hover:bg-white/5 ${className}`} data-testid="share-button">
      <XIcon className="h-3.5 w-3.5" />
      SHARE{target.kind === "demo" ? " DEMO CARD" : ""}
    </button>
  );
}
