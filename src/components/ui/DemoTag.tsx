/** The "Demo · simulated" pill on anything showing a simulated result, so a screenshot can't pass for a real hatch. */
export function DemoTag({ className = "", testId }: { className?: string; testId?: string }) {
  return (
    <span className={`rounded-full border border-amber-300/40 bg-black/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200 ${className}`} data-testid={testId}>
      Demo · simulated
    </span>
  );
}
