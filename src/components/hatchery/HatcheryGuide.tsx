import Link from "next/link";
import { REWARDS_PAGE_LIVE } from "@/config/holderDistribution";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { describeGrowthSchedule, describeSchedule } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber, formatSpan } from "@/lib/format";
import { SPECIES_BY_ID } from "@/lib/species";

/**
 * What the Hatchery does, in three cards, using the live rules from config:
 * eggs and incubation, hatching and evolution, and what (doesn't) need a wallet.
 */
export function HatcheryGuide() {
  const names = gameConfig.evolution.names;
  const after = gameConfig.evolution.afterMaturityMs;
  const cards = [
    {
      key: "eggs",
      eyebrow: "Eggs & incubation",
      title: "Holding earns eggs",
      body: `Every ${formatNumber(gameConfig.token.tokensPerEgg)} ${gameConfig.token.symbol} at an address earns one egg, detected from Solana. Eggs incubate one after another on the server clock: ${describeSchedule()}.`,
      art: <EggArt stage={2} progress={0.6} seed={2} />,
    },
    {
      key: "evolve",
      eyebrow: "Hatching & evolution",
      title: "Hatch, then keep holding",
      body: `An egg hatches when its incubation ends; tap to reveal the species, sealed when the egg was earned. With continued holding it grows up into its ${names[1]} form (${describeGrowthSchedule()}), becomes ${names[2]} ${formatSpan(after[0])} later and ${names[3]} ${formatSpan(after[1])} after growing up.`,
      art: <CreatureArt species={SPECIES_BY_ID["aurelion"]} stage={2} />,
    },
    {
      key: "wallet",
      eyebrow: "Wallets",
      title: "No wallet needed for eggs",
      body: "Viewing and hatching eggs only needs a public address. Nothing here asks for a signature, seed phrase or private key.",
      art: (
        <svg viewBox="0 0 64 64" className="h-full w-full text-sol-green/80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 6l20 9v15c0 13-9 22-20 27C21 52 12 43 12 30V15l20-9z" />
          <path d="M23 32l6 6 12-13" />
        </svg>
      ),
      link: REWARDS_PAGE_LIVE ? { href: "/rewards", label: "Holder rewards" } : undefined,
    },
  ];
  return (
    <section aria-labelledby="hatchery-guide" className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <h2 id="hatchery-guide" className="sl-eyebrow">
        How the Hatchery works
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3" data-tour="guide">
        {cards.map((c) => (
          <div key={c.key} className="sl-gradient-border relative flex flex-col rounded-md bg-white/[0.02] p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">{c.eyebrow}</p>
              <div className="-mr-1 -mt-2 h-16 w-16 shrink-0" aria-hidden>
                {c.art}
              </div>
            </div>
            <h3 className="mt-1 font-display text-lg text-bone">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">{c.body}</p>
            {c.link && (
              <Link href={c.link.href} className="mt-4 text-sm text-sol-green/90 underline-offset-4 hover:underline">
                {c.link.label} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
