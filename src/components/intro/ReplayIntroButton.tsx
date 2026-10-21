"use client";

import { FIRST_VISIT_INTRO } from "@/config/intro";
import { replayIntro } from "./introState";

/** Renders nothing while the first-visit intro is switched off (src/config/intro.ts). */
export function ReplayIntroButton({ className = "", children = "Replay intro" }: { className?: string; children?: React.ReactNode }) {
  if (!FIRST_VISIT_INTRO.enabled) return null;
  return (
    <button type="button" onClick={replayIntro} className={className}>
      {children}
    </button>
  );
}
