import { ClaimsPanel } from "@/components/claims/ClaimsPanel";
import { CLAIMS_OPEN_AFTER_MS } from "@/config/launch";

export const metadata = { title: "Launch Fee Claims — Solanites" };

export default function ClaimsPage() {
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">Launch fee claims</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">Claim a holding fee refund.</h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          Claims open {CLAIMS_OPEN_AFTER_MS / 3_600_000} hours after launch. This is the only part of Solanites that asks you to connect a wallet, to prove the claim is yours. Your eggs never
          need a connection: they are tracked automatically.
        </p>
        <ClaimsPanel />
      </div>
    </div>
  );
}
