import Link from "next/link";

/** The body of a share page: the card itself, then the two ways in (try the demo, find your eggs). */
export function SharedCard({ src, alt, demo }: { src: string; alt: string; demo: boolean }) {
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-4xl px-4 pb-24 text-center sm:px-6">
        <p className="sl-eyebrow">{demo ? "From the Solanites demo · simulated" : "Hatched in Solanites"}</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- the card is a generated image route */}
        <img src={src} alt={alt} width={1200} height={630} className="mx-auto mt-6 w-full rounded-md border border-white/10" />
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/hatchery?demo=1" className="sl-btn-gold whitespace-nowrap rounded-full px-8 py-4 font-sans text-sm font-semibold tracking-[0.2em]">
            TRY THE DEMO →
          </Link>
          <Link href="/hatchery" className="sl-btn-outline whitespace-nowrap rounded-full px-7 py-4 font-sans text-sm font-semibold tracking-[0.2em]">
            FIND YOUR EGGS
          </Link>
        </div>
      </div>
    </div>
  );
}
