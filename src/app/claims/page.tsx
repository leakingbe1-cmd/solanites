import { ClaimsPanel } from "@/components/claims/ClaimsPanel";

export const metadata = { title: "Launch Fee Claims — Solanites" };

export default function ClaimsPage() {
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">Launch fee claims</p>
        {/* Pre-launch copy: update the heading and introduction when the refund programme is formally confirmed. */}
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">Launch fee refunds are coming soon.</h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          We&apos;re preparing the Solanites launch fee refund claims feature. Once the programme details are confirmed, eligible users will be able to check their claim status and follow the
          instructions provided here.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          Your eggs are tracked automatically through your public Solana address. A wallet connection will only be required if you need to submit a refund claim.
        </p>
        <ClaimsPanel />
      </div>
    </div>
  );
}
