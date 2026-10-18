import { ClaimsPanel } from "@/components/claims/ClaimsPanel";
import { CLAIMS_OPEN_AFTER_MS } from "@/config/launch";

export const metadata = { title: "Launch Fee Claims — Solanites" };

export default function ClaimsPage() {
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">Launch fee claims</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">Launch fee refund claims.</h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          No refund programme has been confirmed yet, so nothing can be claimed and no payout is promised. If one is confirmed, claims open {CLAIMS_OPEN_AFTER_MS / 3_600_000} hours after launch,
          and this page is the only part of Solanites that asks you to connect a wallet, to prove a claim is yours. Your eggs never need a connection: they are tracked automatically.
        </p>
        <ClaimsPanel />
      </div>
    </div>
  );
}
