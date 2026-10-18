import { HOLDER_DISTRIBUTION_AFTER_LAUNCH_MS } from "@/config/launch";
import { gameConfig } from "@/config/gameConfig";

export const metadata = { title: "Holder Rewards — Solanites" };

const HOURS = HOLDER_DISTRIBUTION_AFTER_LAUNCH_MS / 3_600_000;

/**
 * Planned holder distribution. Presentation only: there is no distribution
 * trigger, snapshot or payout yet, so nothing here can be claimed and every
 * unconfirmed term is marked as pending. The dormant launch-fee claim backend
 * (src/server/claims, /api/claims/*) is left in place and is not shown.
 */
const TERMS: [string, string][] = [
  ["Start", `${HOURS} hours after the confirmed launch time. The launch time has not been announced yet.`],
  ["Allocation", "A designated portion of the developer token supply. Amount to be published."],
  ["Eligibility", "Rules to be published."],
  ["Calculation", "Method to be published. Holding duration is intended to increase an allocation."],
];

export default function ClaimsPage() {
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">Holder rewards</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">Holder rewards begin {HOURS} hours after launch.</h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          {HOURS === 2 ? "Two" : HOURS} hours after launch, the planned holder distribution will begin. A designated portion of the developer token supply will be allocated across eligible holders,
          rewarding those who have held for longer.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          Your {gameConfig.token.symbol} holdings are tracked through your public Solana address. The distribution mechanism is being prepared, with the final allocation, eligibility rules and
          calculation method to be published before activation.
        </p>

        <section className="relative mt-10 overflow-hidden rounded-3xl border border-sol-purple/25 bg-gradient-to-b from-sol-purple/[0.08] to-white/[0.02] p-6 sm:p-8" data-testid="holder-distribution">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sol-blue/60 to-transparent" aria-hidden />
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-sol-blue/90">
            <span className="h-1.5 w-1.5 rounded-full bg-sol-blue shadow-[0_0_8px_#00c2ff]" aria-hidden />
            Portal
          </p>
          <h2 className="mt-3 font-display text-2xl text-white sm:text-3xl">Holder distribution</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">Distribution details and eligibility information will appear here before the programme goes live.</p>
          <dl className="mt-6 divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {TERMS.map(([term, detail]) => (
              <div key={term} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6">
                <dt className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">{term}</dt>
                <dd className="flex flex-1 items-start justify-between gap-4 text-sm text-white/85">
                  <span className="min-w-0">{detail}</span>
                  <span className="mt-0.5 shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/80">Pending</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
