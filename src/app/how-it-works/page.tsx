import Link from "next/link";
import { HowSteps } from "@/components/landing/HowSteps";
import { StageTimeline } from "@/components/landing/StageTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { describeSchedule, eggProgression } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { CLAIMS_OPEN_AFTER_MS } from "@/config/launch";
import { formatDays, formatNumber } from "@/lib/format";
import { rarityChances } from "@/lib/progression";
import { RARITIES, RARITY_ORDER } from "@/lib/rarity";

export const metadata = { title: "How It Works — Solanites" };

export default function HowItWorksPage() {
  const cfg = gameConfig;
  const chances = rarityChances(cfg);

  const prog = eggProgression;
  const rules: [string, string, string][] = [
    ["Tokens required per egg", `${formatNumber(cfg.token.tokensPerEgg)} ${cfg.token.symbol}`, `${((cfg.token.tokensPerEgg / cfg.token.totalSupply) * 100).toFixed(2)}% of the ${formatNumber(cfg.token.totalSupply)} supply. Eggs = verified balance ÷ ${formatNumber(cfg.token.tokensPerEgg)}, rounded down`],
    ["How holdings are tracked", "Automatically, from Solana", "No wallet connection or sign-up. All of a wallet's token accounts are counted once, at finalized commitment"],
    ["Maximum eggs per wallet", prog.maxEggsPerWallet === null ? "No cap" : String(prog.maxEggsPerWallet), "One egg for every full million held"],
    ["Incubation", describeSchedule(prog), prog.incubationMode === "sequential" ? "One egg incubates at a time. Timers run on the server clock, including while you are offline" : "Every egg starts incubating when earned, on the server clock"],
    ["If your balance drops", "Earned eggs are kept", "They keep incubating. New eggs need tokens that have not already earned one"],
    ["Moving tokens to another wallet", "No new egg for the same tokens", "Tokens that already earned an egg carry that with them, so a transfer can't earn the same egg twice"],
    ["Evolution schedule", cfg.evolution.names.map((n, i) => (i ? `${n} ${formatDays(cfg.evolution.thresholdsMs[i])}` : n)).join(" · "), "Time after hatching"],
    ["Hatching", cfg.policies.manualHatch ? "Manual: you trigger the reveal" : "Automatic at full incubation", "The outcome is sealed when the egg is earned"],
    ["Launch fee claims", `Open ${CLAIMS_OPEN_AFTER_MS / 3_600_000} hours after launch`, "Separate from eggs: only claims ask you to connect a wallet"],
  ];

  return (
    <div className="relative pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">The Rules of the Hatchery</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          Sustained holding is the only thing that <span className="sl-gradient-text">makes them grow.</span>
        </h1>
        <HowSteps />

        <div className="mt-28">
          <SectionHeading eyebrow="Lifecycle" title="From shell to Apex.">
            Eggs are earned by holding, not by clicking or paying. Each one incubates on the server clock from the moment it is earned.
          </SectionHeading>
          <StageTimeline />
        </div>

        <div id="rules" className="mt-28 scroll-mt-28">
          <SectionHeading eyebrow="Current configuration" title="Gameplay rules.">
            Every value is configurable in <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-white/80">src/config/eggProgression.ts</code> and <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-white/80">src/config/gameConfig.ts</code>, and is enforced on the server.
          </SectionHeading>
          <div className="mt-10 overflow-hidden rounded-3xl border border-white/[0.07]">
            {rules.map(([k, v, note]) => (
              <div key={k} className="grid gap-1 border-b border-white/[0.05] px-5 py-4 last:border-0 sm:grid-cols-[1fr_1.4fr] sm:gap-6 sm:px-7">
                <p className="text-sm text-mist">{k}</p>
                <div>
                  <p className="text-sm text-white">{v}</p>
                  {note && <p className="mt-1 text-xs text-mist/60">{note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
            <h3 className="font-display text-xl text-white">Hatch probabilities</h3>
            <p className="mt-2 text-sm text-mist">Rarity is sealed when the egg is granted and revealed when it hatches.</p>
            <div className="mt-6 space-y-3">
              {RARITY_ORDER.map((r) => (
                <div key={r} className="grid grid-cols-[90px_1fr_56px] items-center gap-3 text-sm">
                  <span style={{ color: RARITIES[r].color }}>{RARITIES[r].label}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(1.5, chances[r] * 100)}%`, background: `linear-gradient(90deg, ${RARITIES[r].color2}, ${RARITIES[r].color})` }} />
                  </div>
                  <span className="text-right font-mono text-xs text-white/70">{(chances[r] * 100).toFixed(chances[r] < 0.01 ? 1 : 0)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-sol-purple/20 bg-sol-purple/[0.04] p-6 sm:p-8">
            <h3 className="font-display text-xl text-white">Fair &amp; verifiable — by design</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-mist">
              <li>◇ This prototype runs on <span className="text-white">simulated wallets, balances and timers</span>. Nothing shown is on-chain.</li>
              <li>◇ In production, eligibility and progression are computed by a server that snapshots on-chain balances — never by browser timers or user-supplied data.</li>
              <li>◇ Wallet ownership is proven by signing a one-time message, not just by connecting.</li>
              <li>◇ Rarity is rolled with a commit-reveal scheme so outcomes can&apos;t be predicted or rerolled.</li>
              <li>◇ Claims are capped server-side at the number of eggs your balance backs.</li>
            </ul>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link href="/hatchery" className="sl-btn-primary inline-flex items-center gap-3 rounded-full px-9 py-4 font-display text-sm font-semibold tracking-[0.2em] text-white">
            ENTER THE HATCHERY →
          </Link>
        </div>
      </div>
    </div>
  );
}
