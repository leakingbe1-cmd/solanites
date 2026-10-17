export function ProgressBar({ value, colors = ["#9945ff", "#14f195"], className = "", glow = true }: { value: number; colors?: [string, string]; className?: string; glow?: boolean }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={`relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] ${className}`}>
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${v * 100}%`,
          background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
          boxShadow: glow ? `0 0 12px ${colors[1]}99` : undefined,
          transition: "width 0.4s linear",
        }}
      />
      <div className="sl-shimmer absolute inset-0 opacity-40" />
    </div>
  );
}
