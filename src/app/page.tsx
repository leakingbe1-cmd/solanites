import Link from "next/link";
import { HeroEgg } from "@/components/landing/HeroEgg";
import { RarityShowcase } from "@/components/landing/RarityShowcase";
import { StageTimeline } from "@/components/landing/StageTimeline";
import { ParticleField } from "@/components/ui/ParticleField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HowSteps } from "@/components/landing/HowSteps";
import { CreatureMarquee } from "@/components/landing/CreatureMarquee";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";
import { SPECIES } from "@/lib/species";

export default function Home() {
  const pctSupply = (gameConfig.token.tokensPerEgg / gameConfig.token.totalSupply) * 100;
  return (
    <>
      {/* ── HERO ── */}
      <section className="sl-atmosphere relative flex min-h-[100svh] items-center overflow-hidden pt-20">
        <div className="sl-grid absolute inset-0" />
        <ParticleField density={0.00016} />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="sl-fade-up font-mono text-[11px] uppercase tracking-[0.4em] text-sol-green/80" style={{ animationDelay: "0.1s" }}>
              ◇ Genesis Hatchery · Season 0
            </p>
            <h1 className="sl-fade-up mt-6 font-display text-[2.6rem] font-bold leading-[0.98] tracking-tight text-white sm:text-6xl xl:text-7xl" style={{ animationDelay: "0.25s" }}>
              YOUR <span className="sl-gradient-text">SOLANITE</span>
              <br />
              IS WAITING.
            </h1>
            <p className="sl-fade-up mx-auto mt-7 max-w-lg text-lg leading-relaxed text-mist sm:text-xl lg:mx-0" style={{ animationDelay: "0.4s" }}>
              Hold Solana. Hatch the extraordinary. <span className="text-white">The longer you hold, the stronger they grow.</span>
            </p>
            <div className="sl-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ animationDelay: "0.55s" }}>
              <Link href="/hatchery" className="sl-btn-primary group inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-sm font-semibold tracking-[0.2em] text-white">
                ENTER THE HATCHERY
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/collection" className="rounded-full border border-white/10 px-7 py-4 text-sm tracking-wider text-mist transition hover:border-white/25 hover:text-white">
                Explore the Collection
              </Link>
            </div>
            <dl className="sl-fade-up mx-auto mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/5 pt-8 lg:mx-0" style={{ animationDelay: "0.7s" }}>
              {[
                [formatNumber(gameConfig.token.tokensPerEgg), "tokens per egg"],
                [String(SPECIES.length), "species to find"],
                ["6", "rarity tiers"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-semibold text-white sm:text-3xl">{v}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-widest text-mist/70">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="order-1 lg:order-2">
            <HeroEgg />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
        <a href="#rarities" className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-mist/60 transition hover:text-white md:flex">
          Scroll
          <span className="h-10 w-px bg-gradient-to-b from-mist/60 to-transparent" />
        </a>
      </section>

      <CreatureMarquee />

      {/* ── RARITIES ── */}
      <section id="rarities" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="The Bloodlines" title={<>Six tiers of rarity.<br className="hidden sm:block" /> One shared origin.</>}>
            Every Solanite carries a Solgem — a fragment of the chain that birthed it. What surrounds that gem is up to fate, and to how long you hold.
          </SectionHeading>
          <RarityShowcase />
        </div>
      </section>

      {/* ── STAGES ── */}
      <section className="relative overflow-hidden border-y border-white/5 bg-abyss/60 py-24 sm:py-32">
        <div className="sl-atmosphere absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Incubation" title="Watch it come alive." align="center">
            Your egg doesn&apos;t just sit there. It glows, cracks, stirs — and one day, it opens.
          </SectionHeading>
          <StageTimeline />
        </div>
      </section>

      {/* ── HOW ── */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How It Works" title="Three steps. Infinite patience.">
            Eligibility is simple: hold at least {formatNumber(gameConfig.token.tokensPerEgg)} tokens ({pctSupply.toFixed(2)}% of supply) for each egg. Progress depends entirely on the configured holding rules.
          </SectionHeading>
          <HowSteps />
          <div className="mt-12 text-center">
            <Link href="/how-it-works" className="text-sm tracking-wider text-sol-green/90 underline-offset-8 hover:underline">
              Read the full rules →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-28 sm:py-40">
        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sol-purple/15 blur-[120px]" />
        <ParticleField density={0.0001} />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Something is <span className="sl-gradient-text">stirring</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-mist">Your egg is already warm. Step inside, check on it daily, and be there the moment it opens.</p>
          <Link href="/hatchery" className="sl-btn-primary mt-10 inline-flex items-center gap-3 rounded-full px-9 py-4 font-display text-sm font-semibold tracking-[0.2em] text-white">
            ENTER THE HATCHERY →
          </Link>
        </div>
      </section>
    </>
  );
}
