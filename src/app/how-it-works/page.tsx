import Link from "next/link";
import { VerifyPanel } from "@/components/trust/VerifyPanel";
import { HowSteps } from "@/components/landing/HowSteps";
import { StageTimeline } from "@/components/landing/StageTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { describeGrowthSchedule, describeSchedule, eggProgression } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber, formatSpan } from "@/lib/format";
import { formUnlockText, rarityChances } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";
import { HOLDER_DISTRIBUTION_HOURS, REWARDS_PAGE_LIVE } from "@/config/holderDistribution";

export const metadata = { title: "How It Works — Solanites" };

export default function HowItWorksPage() {
  const cfg = gameConfig;
  const chances = rarityChances(cfg);

  const prog = eggProgression;
  const rules: [string, string, string][] = [
    ["Tokens required per egg", `${formatNumber(cfg.token.tokensPerEgg)} ${cfg.token.symbol}`, `${((cfg.token.tokensPerEgg / cfg.token.totalSupply) * 100).toFixed(2)}% of the ${formatNumber(cfg.token.totalSupply)} supply. Eggs = verified balance ÷ ${formatNumber(cfg.token.tokensPerEgg)}, rounded down`],
    ["How holdings are tracked", "Automatically, from Solana", "Once holder tracking is live. No wallet connection or sign-up. All of a wallet's token accounts are counted once, at finalized commitment"],
    ["Maximum eggs per wallet", prog.maxEggsPerWallet === null ? "No cap" : String(prog.maxEggsPerWallet), "One egg for every full million held"],
    ["Incubation", describeSchedule(prog), prog.incubationMode === "sequential" ? "One egg incubates at a time. Timers run on the server clock, including while you are offline" : "Every egg starts incubating when earned, on the server clock"],
    ["If your balance drops", "Earned eggs are kept", "They keep incubating. New eggs need tokens that have not already earned one"],
    ["Moving tokens to another wallet", "No new egg for the same tokens", "Tokens that already earned an egg carry that with them, so a transfer can't earn the same egg twice"],
    ["Growing up", describeGrowthSchedule(prog), `A newly hatched ${cfg.evolution.names[0]} becomes a fully grown ${cfg.evolution.names[1]} after this much qualifying holding. Your first creature is grown ${formatSpan(prog.initialGrowthScheduleMs[0])} after it hatches`],
    ["Evolution schedule", cfg.evolution.names.map((n, i) => `${n} ${formUnlockText(i, cfg).toLowerCase()}`).join(" · "), "Growth and evolution count qualifying holding from when the egg hatched (its incubation ended; fast-track creatures from when you reveal them), paused while the balance no longer backs the creature"],
    [
      "After Ascended",
      cfg.evolution.ascensionRanksMs.map((ms, i) => `${["II", "III", "IV", "V", "VI", "VII"][i] ?? i + 2} at ${formatSpan(ms)}`).join(" · "),
      "Ascension ranks, counted from maturity: each milestone takes longer than the one before",
    ],
    ["Hatching", cfg.policies.manualHatch ? "Manual: you trigger the reveal" : "Automatic at full incubation", "The outcome is sealed when the egg is earned"],
    // Hidden with the rewards page until launch (REWARDS_PAGE_LIVE).
    ...(REWARDS_PAGE_LIVE
      ? [["Holder distribution", `Planned: ${HOLDER_DISTRIBUTION_HOURS} hours after launch`, "The developer supply allocated for redistribution, divided equally among eligible holders. Its terms are on the Rewards page as they are published"] as [string, string, string]]
      : []),
  ];

  return (
    <div className="relative pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <p className="sl-eyebrow">The Rules of the Hatchery</p>
        <h1 className="mt-3 max-w-3xl sl-display-l text-bone">
          Sustained holding is the only thing that <span className="italic">makes them grow.</span>
        </h1>
        <HowSteps />

        <div className="mt-28">
          <SectionHeading eyebrow="Lifecycle" title="From Eggling to Ascended.">
            Eggs are earned by holding, not by clicking or paying. Each one incubates on the server clock from the moment it is earned.
          </SectionHeading>
          <StageTimeline />
        </div>

        <div id="rules" className="mt-28 scroll-mt-28">
          <SectionHeading eyebrow="Current configuration" title="Gameplay rules.">
            The rules are fixed in code and enforced on the server. Any change is announced in the{" "}
            <Link href="/updates" className="text-bone underline-offset-4 hover:underline">
              shipping log
            </Link>
            .
          </SectionHeading>
          <div className="sl-panel mt-10 overflow-hidden rounded-md">
            {rules.map(([k, v, note]) => (
              <div key={k} className="grid gap-1 border-b border-white/[0.05] px-5 py-4 last:border-0 sm:grid-cols-[1fr_1.4fr] sm:gap-6 sm:px-7">
                <p className="text-sm text-mist">{k}</p>
                <div>
                  <p className="text-sm text-bone">{v}</p>
                  {note && <p className="mt-1 text-xs text-mist/60">{note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-md border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
            <h3 className="font-display text-xl text-bone">Hatch probabilities</h3>
            <p className="mt-2 text-sm text-mist">Rarity is sealed when the egg is granted and revealed when it hatches.</p>
            <div className="mt-6 space-y-3">
              {RARITY_ORDER.map((r) => (
                <div key={r} className="grid grid-cols-[90px_1fr_56px] items-center gap-3 text-sm">
                  <span style={{ color: RARITIES[r].color }}>{RARITIES[r].label}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(1.5, chances[r] * 100)}%`, background: `linear-gradient(90deg, ${RARITIES[r].color2}, ${RARITIES[r].color})` }} />
                  </div>
                  <span className="text-right font-mono text-xs text-bone/70">{Number((chances[r] * 100).toFixed(1))}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-sol-purple/20 bg-sol-purple/[0.04] p-6 sm:p-8">
            <h3 className="font-display text-xl text-bone">How the rules are kept</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-mist">
              <li>◇ Eggs and evolution come from a server that reads public Solana balances, never from browser timers or anything you type in.</li>
              <li>◇ The demo wallet is <span className="text-bone">simulated</span>: its balance, eggs and fast-forward clock never count toward real eggs or rewards.</li>
              <li>◇ Rarity is rolled on the server with a random seed when an egg is earned and sealed until it hatches, so pressing hatch can&apos;t change it. It is not independently verifiable yet.</li>
              {REWARDS_PAGE_LIVE && <li>◇ The planned holder distribution starts from the official launch time, not from anyone&apos;s visit. Its terms are published on the Rewards page before it happens.</li>}
            </ul>
          </div>
        </div>

        {/* tokenomics and trust facts: only what the owner has set (src/config/tokenomics.ts) */}
        <div id="tokenomics" className="mt-20 scroll-mt-28">
          <VerifyPanel />
        </div>

        <div className="mt-20 text-center">
          <Link href="/hatchery" className="sl-btn-gold inline-flex items-center gap-3 whitespace-nowrap rounded-full px-6 py-4 font-sans text-sm font-semibold tracking-[0.14em] sm:px-9 sm:tracking-[0.2em]">
            ENTER THE HATCHERY →
          </Link>
        </div>
      </div>
    </div>
  );
}
