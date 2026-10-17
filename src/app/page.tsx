import Link from "next/link";
import { HeroEgg } from "@/components/landing/HeroEgg";
import { RarityShowcase } from "@/components/landing/RarityShowcase";
import { StageTimeline } from "@/components/landing/StageTimeline";
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
      <section className="sl-atmosphere relative overflow-hidden pt-24 lg:pt-28">
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-4 px-4 pb-20 sm:px-6 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1fr_1fr] lg:px-10">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="sl-label sl-fade-up" style={{ animationDelay: "0.1s" }}>
              Genesis Hatchery · Season 0
            </p>
            <h1 className="sl-display sl-fade-up mt-7 text-[3.1rem] text-platinum sm:text-7xl xl:text-[5.6rem]" style={{ animationDelay: "0.25s" }}>
              YOUR SOLANITE
              <br />
              <span className="italic text-silver">is waiting.</span>
            </h1>
            <p className="sl-fade-up mx-auto mt-8 max-w-md text-[17px] leading-relaxed text-mist lg:mx-0" style={{ animationDelay: "0.4s" }}>
              Hold Solana. Hatch the extraordinary. <span className="text-silver">The longer you hold, the stronger they grow.</span>
            </p>
            <div className="sl-fade-up mt-11 flex flex-col items-center gap-5 sm:flex-row sm:justify-center lg:justify-start" style={{ animationDelay: "0.55s" }}>
              <Link href="/hatchery" className="sl-btn sl-btn-primary group px-8 py-4">
                Enter the Hatchery
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/collection" className="sl-link text-[11px] uppercase tracking-[0.28em] text-silver">
                Explore the Collection
              </Link>
            </div>
            <dl className="sl-fade-up mx-auto mt-16 grid max-w-md grid-cols-3 border-t border-line pt-7 lg:mx-0" style={{ animationDelay: "0.7s" }}>
              {[
                [formatNumber(gameConfig.token.tokensPerEgg), "Tokens per egg"],
                [String(SPECIES.length), "Species to find"],
                ["6", "Rarity tiers"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sl-display text-3xl text-platinum sm:text-4xl">{v}</dt>
                  <dd className="mt-2 text-[10px] uppercase tracking-[0.24em] text-dim">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="order-1 lg:order-2">
            <HeroEgg />
          </div>
        </div>
      </section>

      <CreatureMarquee />

      {/* ── RARITIES ── */}
      <section id="rarities" className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <SectionHeading eyebrow="The Bloodlines" title={<>Six tiers of rarity. <span className="italic text-silver">One shared origin.</span></>}>
            Rarity is written into anatomy, not paint. A common Solanite is built from stone and water; the rarest are barely bodies at all.
          </SectionHeading>
          <RarityShowcase />
        </div>
      </section>

      {/* ── STAGES ── */}
      <section className="relative border-y border-line bg-abyss py-28 sm:py-36">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <SectionHeading eyebrow="Incubation" title={<>Watch it <span className="italic text-silver">come alive.</span></>} align="center">
            Your egg doesn&apos;t just sit there. It warms, fractures, stirs, and one day it opens.
          </SectionHeading>
          <StageTimeline />
        </div>
      </section>

      {/* ── HOW ── */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <SectionHeading eyebrow="How It Works" title={<>Three steps. <span className="italic text-silver">Infinite patience.</span></>}>
            Eligibility is simple: hold at least {formatNumber(gameConfig.token.tokensPerEgg)} tokens ({pctSupply.toFixed(2)}% of supply) for each egg. Progress depends entirely on the configured holding rules.
          </SectionHeading>
          <HowSteps />
          <div className="mt-14">
            <Link href="/how-it-works" className="sl-link text-[11px] uppercase tracking-[0.28em] text-silver">
              Read the full rules →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="sl-atmosphere relative overflow-hidden border-t border-line py-32 sm:py-44">
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="sl-display text-5xl text-platinum sm:text-7xl">
            Something is <span className="italic text-silver">stirring.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-md text-[17px] text-mist">Your egg is already warm. Step inside, check on it daily, and be there the moment it opens.</p>
          <Link href="/hatchery" className="sl-btn sl-btn-primary mt-12 px-9 py-4">
            Enter the Hatchery →
          </Link>
        </div>
      </section>
    </>
  );
}
