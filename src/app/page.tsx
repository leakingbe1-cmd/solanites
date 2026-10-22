import Link from "next/link";
import { SocialLine } from "@/components/layout/SocialLine";
import { EvolutionTimeline } from "@/components/landing/EvolutionTimeline";
import { EggArt } from "@/components/egg/EggArt";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProofStrip } from "@/components/landing/ProofStrip";
import { WhatsNext } from "@/components/landing/WhatsNext";
import { PhoenixHero } from "@/components/landing/PhoenixHero";
import { Sigil } from "@/components/brand/Sigil";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EvolutionShowcase, HowSteps, RarityShowcase, StageTimeline, StockShowcase } from "@/components/landing/Deferred";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { VerifyPanel } from "@/components/trust/VerifyPanel";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";
import { RARITY_ORDER } from "@/lib/rarity";
import { CATALOGUE_SIZE, SPECIES_BY_ID } from "@/lib/species";

export default function Home() {
  const pctSupply = (gameConfig.token.tokensPerEgg / gameConfig.token.totalSupply) * 100;
  return (
    <>
      {/* ── HERO ── */}
      <HeroSection className="relative flex min-h-[100svh] items-end overflow-hidden bg-void pt-20 lg:items-center">
        <PhoenixHero />
        {/* phones: the Phoenix above, the copy beneath it; wide screens: the copy left, over the Phoenix's darkened wing */}
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-[14svh] sm:px-6 sm:pt-[33svh] lg:px-8 lg:pb-20 lg:pt-10">
          <div className="flex max-w-xl flex-col text-center lg:block lg:text-left">
            <div className="sl-awake-in flex items-center justify-center gap-3 lg:justify-start" style={{ animationDelay: "0.1s" }}>
              <Sigil draw className="h-11 w-11 sm:h-12 sm:w-12" />
              <p className="sl-eyebrow is-gilt max-lg:[text-shadow:0_1px_10px_rgba(0,0,0,0.95),0_0_2px_rgba(0,0,0,0.9)]">Genesis Hatchery · Season 0</p>
            </div>
            <h1 className="sl-awake-in sl-display-xl mt-6 text-bone" style={{ animationDelay: "0.25s" }}>
              A world waiting to <span className="sl-phx-gold italic">awaken.</span>
            </h1>
            {/* what the coin does, in one line: the hold mechanic, from config */}
            <p className="sl-awake-in mx-auto mt-6 max-w-lg text-lg leading-relaxed text-bone sm:text-xl lg:mx-0" style={{ animationDelay: "0.4s" }} data-testid="hero-pitch">
              Hold {gameConfig.token.symbol} on Solana. Every {formatNumber(gameConfig.token.tokensPerEgg)} earns an egg. Keep holding and it evolves.
            </p>
            {/* the live demo: a simulated egg and one big "Hatch it", above the fold on phones and desktop */}
            <div className="sl-awake-in mt-5 max-lg:order-1 lg:mt-7" style={{ animationDelay: "0.5s" }}>
              <HeroDemo />
            </div>
            {/* why hold, in product terms only: what grows while you keep holding */}
            <p className="sl-awake-in mx-auto mt-4 max-w-lg text-base leading-relaxed text-mist max-lg:order-1 lg:mx-0" style={{ animationDelay: "0.45s" }} data-testid="hero-why-hold">
              The longer you hold, the more you grow: new eggs keep arriving, your {CATALOGUE_SIZE}-species collection fills up, creatures evolve to {gameConfig.evolution.names[3]}, and your rank and daily holding streak climb.
            </p>
            <Link href="/collection" className="sl-awake-in mt-3 block text-sm text-bone/85 underline-offset-4 hover:underline max-lg:order-2" style={{ animationDelay: "0.55s" }}>
              Explore all {CATALOGUE_SIZE} Solanites →
            </Link>
            {/* walletless exploration: nothing on the site asks for a wallet today */}
            <p className="sl-awake-in mt-4 inline-flex sm:mt-6 items-center justify-center gap-2.5 text-sm text-mist max-lg:order-1" style={{ animationDelay: "0.6s" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-sol-green shadow-[0_0_10px_#14f195]" aria-hidden />
              No wallet needed. The demo is simulated.
            </p>
            <div className="sl-awake-in mt-3 max-lg:order-1" style={{ animationDelay: "0.65s" }}>
              <SocialLine className="justify-center lg:justify-start" />
            </div>
          </div>
        </div>
        <a href="#market" className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-mist/60 transition hover:text-bone md:flex lg:hidden">
          Scroll
          <span className="h-10 w-px bg-gradient-to-b from-mist/60 to-transparent" />
        </a>
      </HeroSection>

      {/* what is real today, then live numbers and a wallet lookup once tracking is on */}
      <ProofStrip />
      <WhatsNext className="py-8" />

      {/* ── MARKET BOND: every species' stock, the second headline feature ── */}
      <section id="market" className="relative overflow-hidden border-b border-white/5 py-24 sm:py-32">
        <div className="sl-atmosphere pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StockShowcase />
        </div>
      </section>

      {/* ── RARITIES ── */}
      <section id="rarities" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* the three facts, as a borderless stat strip (§2.6) */}
          <dl className="mb-20 grid grid-cols-3 divide-x divide-white/10 text-center">
            {[
              { value: formatNumber(gameConfig.token.tokensPerEgg), label: `${gameConfig.token.symbol} per egg` },
              { value: String(CATALOGUE_SIZE), label: "Species" },
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
            Every species grows into its own shape. Here is the whole journey of your first Solanite, from egg to {gameConfig.evolution.names[3]}.
          </SectionHeading>
          <EvolutionTimeline />
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

      {/* ── VERIFY: the buyer's checks, each fact shown only once the owner sets it ── */}
      <section className="relative pb-8 pt-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <VerifyPanel compact />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-28 sm:py-40">
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          {/* a stirring egg with a Secret Solanite's silhouette inside; still under reduced motion (global rule) */}
          <div className="relative mx-auto mb-8 h-44 w-36 sm:h-56 sm:w-44" aria-hidden>
            <EggArt stage={3} progress={0.9} seed={9} inside={SPECIES_BY_ID.nullborn} className="relative h-full w-full" />
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
