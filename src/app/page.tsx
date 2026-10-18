import Link from "next/link";
import { EggArt } from "@/components/egg/EggArt";
import { HeroLifecycle } from "@/components/landing/HeroLifecycle";
import { RarityShowcase } from "@/components/landing/RarityShowcase";
import { StageTimeline } from "@/components/landing/StageTimeline";
import { ParticleField } from "@/components/ui/ParticleField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HowSteps } from "@/components/landing/HowSteps";
import { CreatureMarquee } from "@/components/landing/CreatureMarquee";
import { EvolutionShowcase } from "@/components/landing/EvolutionShowcase";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber, formatSpan } from "@/lib/format";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, SPECIES_BY_ID } from "@/lib/species";

export default function Home() {
  const pctSupply = (gameConfig.token.tokensPerEgg / gameConfig.token.totalSupply) * 100;
  return (
    <>
      {/* ── HERO ── */}
      <section className="sl-atmosphere relative flex min-h-[100svh] items-center overflow-hidden pt-20">
        <div className="sl-grid absolute inset-0" />
        <ParticleField density={0.00016} />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-x-6 gap-y-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-y-0 lg:px-8">
          <div className="text-center lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left">
            <p className="sl-fade-up font-mono text-[11px] uppercase tracking-[0.4em] text-sol-green/80" style={{ animationDelay: "0.1s" }}>
              ◇ Genesis Hatchery · Season 0
            </p>
            <h1 className="sl-fade-up mt-6 font-display text-[2.6rem] font-bold leading-[0.98] tracking-tight text-white sm:text-6xl xl:text-7xl" style={{ animationDelay: "0.25s" }}>
              YOUR <span className="sl-gradient-text">SOLANITE</span>
              <br />
              IS WAITING.
            </h1>
            <p className="sl-fade-up mx-auto mt-7 max-w-lg text-lg leading-relaxed text-mist sm:text-xl lg:mx-0" style={{ animationDelay: "0.4s" }}>
              Discover your creature. Hatch the extraordinary. <span className="text-white">Watch your Solanite grow stronger through its evolution.</span>
            </p>
            {/* walletless exploration: true for everything except launch fee claims (the only wallet sign-in on the site) */}
            <div className="sl-fade-up mx-auto mt-7 max-w-lg lg:mx-0" style={{ animationDelay: "0.48s" }}>
              <p className="sl-glass inline-flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-sm font-medium text-white">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sol-green opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sol-green shadow-[0_0_10px_#14f195]" />
                </span>
                No wallet needed to explore.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mist/90">
                Discover creatures, watch them evolve, and explore the Solanites universe. Connect your wallet only when a feature requires it.
              </p>
            </div>
            <div className="sl-fade-up mt-8 flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ animationDelay: "0.55s" }}>
              <Link href="/hatchery" className="sl-btn-primary group inline-flex items-center gap-3 whitespace-nowrap rounded-full px-8 py-4 font-display text-sm font-semibold tracking-[0.2em] text-white">
                ENTER THE HATCHERY
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/collection" className="whitespace-nowrap rounded-full border border-white/10 px-7 py-4 text-sm tracking-wider text-mist transition hover:border-white/25 hover:text-white">
                Explore the Collection
              </Link>
            </div>
          </div>
          {/* phones and tablets: copy and CTAs, then the showcase, then the stats; desktop: copy and stats left, showcase right */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-4">
            <HeroLifecycle />
          </div>
          {/* Each stat has its own box; the token figure gets the widest column (full row on phones) so long numbers never collide. */}
          <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
            <dl
              className="sl-fade-up mx-auto grid w-full max-w-xl grid-cols-2 gap-3 border-t border-white/5 pt-8 sm:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,1fr)] lg:mx-0 lg:mt-4"
              style={{ animationDelay: "0.7s" }}
            >
              {[
                { value: formatNumber(gameConfig.token.tokensPerEgg), label: `${gameConfig.token.symbol} per egg` },
                { value: String(SPECIES.length), label: "species to find" },
                { value: String(RARITY_ORDER.length), label: "rarity tiers" },
              ].map((stat, i) => (
                <div key={stat.label} className={`flex min-w-0 flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-center lg:text-left ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
                  <dt className="mt-1 text-[10px] uppercase leading-snug tracking-[0.18em] text-mist/70">{stat.label}</dt>
                  <dd className="order-first whitespace-nowrap font-display text-2xl font-semibold tabular-nums text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
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

      {/* ── EVOLUTION ── */}
      <section id="evolution" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Evolution" title={<>One creature.<br className="hidden sm:block" /> Four forms.</>}>
            Every species grows into its own shape. After hatching, a Solanite becomes a {gameConfig.evolution.names[1]} after{" "}
            {formatSpan(gameConfig.evolution.thresholdsMs[1])} of holding, {gameConfig.evolution.names[2]} after {formatSpan(gameConfig.evolution.thresholdsMs[2])}, and{" "}
            {gameConfig.evolution.names[3]} after {formatSpan(gameConfig.evolution.thresholdsMs[3])}.
          </SectionHeading>
          <EvolutionShowcase />
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
          {/* a stirring egg with a classified silhouette inside; still under reduced motion (global rule) */}
          <div className="relative mx-auto mb-8 h-44 w-36 sm:h-56 sm:w-44" aria-hidden>
            <div className="absolute inset-x-2 bottom-3 top-6 rounded-full bg-sol-green/20 blur-3xl" />
            <EggArt stage={3} progress={0.9} seed={9} inside={SPECIES_BY_ID["genesis"]} className="relative h-full w-full" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Something is <span className="sl-gradient-text">stirring</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-mist">Your egg is already warm. Step inside, check on it daily, and be there the moment it opens.</p>
          <Link href="/hatchery" className="sl-btn-primary mt-10 inline-flex items-center gap-3 whitespace-nowrap rounded-full px-6 py-4 font-display text-sm font-semibold tracking-[0.14em] text-white sm:px-9 sm:tracking-[0.2em]">
            ENTER THE HATCHERY →
          </Link>
        </div>
      </section>
    </>
  );
}
