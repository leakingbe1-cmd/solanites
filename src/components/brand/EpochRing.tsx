/**
 * The Solanites Epoch Ring: the glyph that replaces any third-party chain mark on
 * creatures and on-chain details. Three arcs of one ring, the epochs a Solgem passes
 * through, waxing in weight around the cut gem itself.
 *
 * Drawn on a 48-unit grid. Checked at 12, 16, 24, 32 and 64 px on obsidian and on bone:
 * the thinnest arc is kept at 3.4 units so it survives 12 px. An earlier version with
 * a tick in a top gap read as a power button and was dropped.
 */
const EPOCHS: [number, number][] = [
  [72, 3.4],
  [192, 4.8],
  [312, 6.2],
];

function arc(start: number, r = 18) {
  const a0 = ((start - 90) * Math.PI) / 180;
  const a1 = ((start + 96 - 90) * Math.PI) / 180;
  const p = (a: number) => `${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(a0)} A${r} ${r} 0 0 1 ${p(a1)}`;
}

export function EpochRing({ className = "h-6 w-6", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g fill="none" stroke="currentColor">
        {EPOCHS.map(([start, w]) => (
          <path key={start} d={arc(start)} strokeWidth={w} />
        ))}
      </g>
      <path d="M24 15.5 29.5 24 24 32.5 18.5 24Z" fill="currentColor" />
    </svg>
  );
}
