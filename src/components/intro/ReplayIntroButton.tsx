"use client";

import { replayIntro } from "./introState";

export function ReplayIntroButton({ className = "", children = "Replay intro" }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" onClick={replayIntro} className={className}>
      {children}
    </button>
  );
}
