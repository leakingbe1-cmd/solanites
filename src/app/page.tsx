import Link from "next/link";
import { EggArt } from "@/components/egg/EggArt";
import { HeroSection } from "@/components/landing/HeroSection";
import { PhoenixHero } from "@/components/landing/PhoenixHero";
import { RarityShowcase } from "@/components/landing/RarityShowcase";
import { StageTimeline } from "@/components/landing/StageTimeline";
import { Sigil } from "@/components/brand/Sigil";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HowSteps } from "@/components/landing/HowSteps";
import { EvolutionShowcase } from "@/components/landing/EvolutionShowcase";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber, formatSpan } from "@/lib/format";
import { FIRST_MATURITY_MS } from "@/lib/progression";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, SPECIES_BY_ID } from "@/lib/species";

export default function Home() {
  const pctSupply = (gameConfig.token.tokensPerEgg / gameConfig.token.totalSupply) * 100;
  return (
    <>
      {/* ── HERO ── */}
      <HeroSection className="relative flex min-h-[100svh] items-end overflow-hidden bg-void pt-20 lg:items-center">
        <PhoenixHero />
        {/* phones: the Phoenix above, the copy beneath it; wide screens: the copy left, over the Phoenix's darkened wing */}
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-[30svh] sm:px-6 sm:pt-[33svh] lg:px-8 lg:pb-20 lg:pt-10">
          <div className="max-w-xl text-center lg:text-left">
            <div className="sl-awake-in flex items-center justify-center gap-3 lg:justify-start" style={{ animationDelay: "0.1s" }}>
              <Sigil draw className="h-11 w-11 sm:h-12 sm:w-12" />
              <p className="sl-eyebrow">Genesis Hatchery · Season 0</p>
            </div>
            <h1 className="sl-awake-in sl-display-xl mt-6 text-bone" style={{ animationDelay: "0.25s" }}>
              A world waiting to <span className="sl-phx-gold italic">awaken.</span>
            </h1>
            <p className="sl-awake-in mx-auto mt-6 max-w-lg text-lg leading-relaxed text-mist sm:text-xl lg:mx-0" style={{ animationDelay: "0.4s" }}>
              {SPECIES.length} creatures sleep in sealed eggs. <span className="text-bone">Hatch yours, raise it, and follow it from {gameConfig.evolution.names[0]} to {gameConfig.evolution.names[3]}.</span>
            </p>
            <div className="sl-awake-in mt-8 flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ animationDelay: "0.5s" }}>
              <Link href="/collection" className="sl-btn-gold group inline-flex items-center gap-3 whitespace-nowrap rounded-full px-8 py-4 font-sans text-sm font-semibold tracking-[0.2em]">
                EXPLORE SOLANITES
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
              <Link href="/hatchery" className="sl-btn-outline whitespace-nowrap rounded-full px-7 py-4 font-sans text-sm font-semibold tracking-[0.2em]">
                ENTER THE HATCHERY
              </Link>
            </div>
            {/* walletless exploration: nothing on the site asks for a wallet today */}
            <p className="sl-awake-in mt-6 inline-flex items-center gap-2.5 text-sm text-mist" style={{ animationDelay: "0.6s" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-sol-green shadow-[0_0_10px_#14f195]" aria-hidden />
              No wallet needed to explore.
            </p>
          </div>
        </div>
        <a href="#rarities" className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-mist/60 transition hover:text-bone md:flex">
          Scroll
          <span className="h-10 w-px bg-gradient-to-b from-mist/60 to-transparent" />
        </a>
      </HeroSection>

      {/* ── RARITIES ── */}
      <section id="rarities" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* the three facts, as a borderless stat strip (§2.6) */}
          <dl className="mb-20 grid grid-cols-3 divide-x divide-white/10 text-center">
            {[
              { value: formatNumber(gameConfig.token.tokensPerEgg), label: `${gameConfig.token.symbol} per egg` },
              { value: String(SPECIES.length), label: "Species" },
              { value: String(RARITY_ORDER.length), label: "Bloodlines" },
            ].map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-col px-1 sm:px-2">
                <dt className="sl-label order-last break-words mt-2 text-dust">{stat.label}</dt>
                <dd className="font-display text-2xl tabular-nums min-[400px]:text-3xl text-bone sm:text-5xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
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
            Every species grows into its own shape. A newly hatched Solanite is fully grown, its {gameConfig.evolution.names[1]} form, after {formatSpan(FIRST_MATURITY_MS)} for
            your first creature (later ones take longer). It becomes {gameConfig.evolution.names[2]} after {formatSpan(gameConfig.evolution.afterMaturityMs[0])} more of holding, and{" "}
            {gameConfig.evolution.names[3]} {formatSpan(gameConfig.evolution.afterMaturityMs[1])} after it grew up.
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
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          {/* a stirring egg with a classified silhouette inside; still under reduced motion (global rule) */}
          <div className="relative mx-auto mb-8 h-44 w-36 sm:h-56 sm:w-44" aria-hidden>
            <div className="absolute inset-x-2 bottom-3 top-6 rounded-full bg-sol-green/20 blur-3xl" />
            <EggArt stage={3} progress={0.9} seed={9} inside={SPECIES_BY_ID["genesis"]} className="relative h-full w-full" />
          </div>
          <h2 className="sl-display-l text-bone">
            Something is <span className="italic">stirring</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-mist">Your egg is already warm. Step inside, check on it daily, and be there the moment it opens.</p>
          <Link href="/hatchery" className="sl-btn-gold mt-10 inline-flex items-center gap-3 whitespace-nowrap rounded-full px-6 py-4 font-sans text-sm font-semibold tracking-[0.14em] sm:px-9 sm:tracking-[0.2em]">
            ENTER THE HATCHERY →
          </Link>
        </div>
      </section>
    </>
  );
}
