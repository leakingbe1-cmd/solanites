export function SectionHeading({ eyebrow, title, children, align = "left" }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="sl-label">{eyebrow}</p>
      <h2 className="sl-display mt-5 text-4xl text-platinum sm:text-5xl md:text-6xl">{title}</h2>
      {children && <p className="mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-[17px]" style={align === "center" ? { marginInline: "auto" } : undefined}>{children}</p>}
    </div>
  );
}
