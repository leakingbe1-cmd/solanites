export function SectionHeading({ eyebrow, title, children, align = "left" }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#f6d488]/80">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h2>
      {children && <p className="mt-5 text-base leading-relaxed text-mist sm:text-lg">{children}</p>}
    </div>
  );
}
