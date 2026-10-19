import { HOLDER_DISTRIBUTION, HOLDER_DISTRIBUTION_HOURS } from "@/config/holderDistribution";

export const metadata = { title: "Holder Rewards — Solanites" };

const HOURS_WORD = HOLDER_DISTRIBUTION_HOURS === 2 ? "Two" : String(HOLDER_DISTRIBUTION_HOURS);

/**
 * The planned holder distribution: the locked developer supply, divided equally among
 * eligible holders two hours after the official launch. Presentation only (see
 * src/config/holderDistribution.ts): nothing can be claimed, connected or signed here,
 * no launch time is shown, and every undecided term is marked pending. The dormant
 * launch-fee claim API (src/server/claims, /api/claims/*) is not used by this page.
 */
export default function ClaimsPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[700px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">Holder rewards</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
          Locked developer supply <span className="sl-gradient-text">returns to holders.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-mist">
          <span className="text-white">{HOURS_WORD} hours after launch</span>, the locked developer supply will be divided equally among eligible holders. Every eligible holder will receive an
          equal share of the total supply allocated for redistribution.
        </p>

        {/* When: launch, then the distribution two hours later. The clock is the launch, not the visit. */}
        <section aria-labelledby="sl-dist-when" className="sl-glass relative mt-10 overflow-hidden rounded-3xl p-6 sm:p-8" data-testid="distribution-timing">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sol-blue/10 blur-3xl" aria-hidden />
          <h2 id="sl-dist-when" className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist/80">When it happens</h2>
          <ol className="relative mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-5">
            <li className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-sol-purple/50 bg-sol-purple/15 shadow-[0_0_24px_rgba(153,69,255,0.35)]" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-sol-purple" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white">Launch</span>
            </li>
            <li className="relative flex h-14 flex-col items-center justify-center" aria-label={`${HOURS_WORD} hours later`}>
              <span className="h-px w-full bg-gradient-to-r from-sol-purple/70 via-sol-blue/70 to-sol-green/70" aria-hidden />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-[#0b0a14] px-3 py-1 sm:px-4">
                  <span className="sl-gradient-text font-display text-3xl font-bold leading-none sm:text-5xl">+{HOLDER_DISTRIBUTION_HOURS}h</span>
                </span>
              </span>
            </li>
            <li className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-sol-green/50 bg-sol-green/10 shadow-[0_0_24px_rgba(20,241,149,0.3)]" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-sol-green" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white">Distribution</span>
            </li>
          </ol>
          <p className="mt-7 font-display text-xl text-white sm:text-2xl">{HOURS_WORD} hours after the official launch.</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">
            The clock starts at the official launch time, the same moment for everyone. It does not depend on when you visit this page. The launch time will be announced.
          </p>
        </section>

        {/* The distribution itself: what is agreed, and what is still to be published. */}
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-sol-purple/25 bg-gradient-to-b from-sol-purple/[0.08] to-white/[0.02] p-6 sm:p-8" data-testid="holder-distribution">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sol-blue/60 to-transparent" aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-white sm:text-3xl">Holder distribution</h2>
            <p className="inline-flex items-center gap-2 rounded-full border border-sol-blue/30 bg-sol-blue/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-sol-blue">
              <span className="h-1.5 w-1.5 rounded-full bg-sol-blue shadow-[0_0_8px_#00c2ff]" aria-hidden />
              Scheduled after launch
            </p>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
            The distribution is scheduled to take place {HOURS_WORD.toLowerCase()} hours after launch. The locked developer supply allocated for redistribution will be split equally among eligible
            holders. Further details about eligibility, the final distribution amount and how distribution will be processed will be published here.
          </p>

          <dl className="mt-6 divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {[
              ...HOLDER_DISTRIBUTION.planned.map((t) => ({ ...t, pending: false })),
              ...HOLDER_DISTRIBUTION.pending.map((t) => ({ ...t, pending: true })),
            ].map(({ term, detail, pending }) => (
              <div key={term} className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-baseline sm:gap-6">
                <dt className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">{term}</dt>
                <dd className="flex flex-1 items-start justify-between gap-4 text-sm text-white/85">
                  <span className="min-w-0">{detail}</span>
                  {pending ? (
                    <span className="mt-0.5 shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/80">Pending</span>
                  ) : (
                    <span className="mt-0.5 shrink-0 rounded-full border border-sol-green/25 bg-sol-green/[0.06] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-sol-green/90">Planned</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-xs leading-relaxed text-mist/80">
            This is the planned distribution. There is nothing to claim, connect or sign here yet. Solanites will never ask for your seed phrase or private key.
          </p>
        </section>
      </div>
    </div>
  );
}
