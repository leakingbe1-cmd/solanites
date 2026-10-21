export function SectionHeading({ eyebrow, title, children, align = "left" }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="sl-eyebrow">{eyebrow}</p>
      <h2 className="mt-4 sl-display-m text-bone">{title}</h2>
      {children && <p className="mt-5 text-base leading-relaxed text-mist sm:text-lg">{children}</p>}
    </div>
  );
}
