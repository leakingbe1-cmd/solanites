import { UPDATES } from "@/data/updates";

export const metadata = { title: "Updates — Solanites" };

const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function UpdatesPage() {
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <p className="sl-eyebrow">Shipping log</p>
        <h1 className="mt-3 sl-display-l text-bone">Updates</h1>
        <p className="mt-4 max-w-xl text-mist">What changed on Solanites, newest first. Rule changes are announced here.</p>
        <ol className="mt-12 space-y-10 border-l border-white/10 pl-6 sm:pl-8">
          {UPDATES.map((u) => (
            <li key={u.date} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-sol-green/80 sm:-left-[37px]" aria-hidden />
              <time dateTime={u.date} className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist/80">
                {formatDate(u.date)}
              </time>
              <h2 className="mt-1 font-display text-2xl text-bone">{u.title}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mist">
                {u.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mist/50" aria-hidden />
                    {it}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
