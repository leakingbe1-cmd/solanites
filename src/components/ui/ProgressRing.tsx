interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  colors?: [string, string];
  children?: React.ReactNode;
}

/** Thin engraved dial with tick marks — reads like an instrument, not a widget. */
export function ProgressRing({ value, size = 120, stroke = 1.5, colors = ["#9a8cff", "#ecedf3"], children }: ProgressRingProps) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const gid = `pr-${colors.join("").replace(/#/g, "")}`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colors[0]} />
            <stop offset="1" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const r1 = r + 4;
          const r2 = r + (i % 5 === 0 ? 7 : 5.5);
          return (
            <line
              key={i}
              x1={(size / 2 + Math.cos(a) * r1).toFixed(2)}
              y1={(size / 2 + Math.sin(a) * r1).toFixed(2)}
              x2={(size / 2 + Math.cos(a) * r2).toFixed(2)}
              y2={(size / 2 + Math.sin(a) * r2).toFixed(2)}
              stroke="#ecedf3"
              strokeOpacity={i / 60 <= v ? 0.55 : 0.12}
              strokeWidth="0.8"
            />
          );
        })}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: "stroke-dashoffset 0.4s linear" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
