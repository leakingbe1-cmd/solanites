/** Hairline progress: a 1px track with a platinum (or tier-tinted) fill. */
export function ProgressBar({ value, colors = ["#9a8cff", "#ecedf3"], className = "" }: { value: number; colors?: [string, string]; className?: string; glow?: boolean }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={`relative h-px w-full bg-white/[0.1] ${className}`} role="progressbar" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="absolute inset-y-0 left-0" style={{ width: `${v * 100}%`, background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`, transition: "width 0.4s linear" }} />
      {v > 0 && v < 1 && <div className="absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rotate-45" style={{ left: `calc(${v * 100}% - 2.5px)`, background: colors[1] }} />}
    </div>
  );
}
