export function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) {
  return (
    <div className="sl-glass min-w-0 rounded-2xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">{label}</p>
      <p className="mt-2 break-words font-display text-xl text-white" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-xs text-mist">{sub}</p>
    </div>
  );
}

export function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-5 mt-14 flex items-center gap-4">
      <h2 className="font-display text-xl text-white sm:text-2xl">{title}</h2>
      <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-xs text-mist">{count}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}
