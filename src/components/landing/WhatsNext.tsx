/** Owner-approved copy (22 Oct): no dates, returns or price talk. */
export const WHATS_NEXT = "Creator fees fund the next version of Solanites: a living world where your creatures have a purpose.";

/** "What's next", under the proof strip on the homepage and on How It Works. */
export function WhatsNext({ className = "" }: { className?: string }) {
  return (
    <p className={`mx-auto max-w-2xl px-4 text-center text-sm leading-relaxed text-mist ${className}`} data-testid="whats-next">
      <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gilt">What&apos;s next</span>
      {WHATS_NEXT}
    </p>
  );
}
