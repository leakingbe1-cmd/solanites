import Link from "next/link";
import { ContractAddress } from "@/components/layout/ContractAddress";
import { trustFacts } from "@/lib/tokenomics";
import { CopyValue } from "./CopyValue";

/**
 * "Verify $SLNT": the facts a buyer checks first, each copyable. The contract address shows
 * "coming soon" until set; every other fact appears only once the owner sets it in
 * src/config/tokenomics.ts. With nothing else set, the compact form renders only the address line.
 */
export function VerifyPanel({ compact = false }: { compact?: boolean }) {
  const facts = trustFacts();
  return (
    <section className="sl-panel rounded-md p-5 sm:p-6" aria-labelledby="verify-slnt" data-testid="verify-panel">
      <h2 id="verify-slnt" className="font-mono text-[10px] uppercase tracking-[0.3em] text-gilt">
        Verify $SLNT
      </h2>
      <div className="mt-3">
        <ContractAddress />
      </div>
      {facts.length > 0 && (
        <dl className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {facts.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-baseline sm:gap-6">
              <dt className="w-40 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-mist/70">{f.label}</dt>
              <dd className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm text-bone/85">
                <span>{f.value}</span>
                {f.address && <CopyValue value={f.address} label={`${f.label} address`} />}
                {f.proofUrl && (
                  <a href={f.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-sol-green/90 underline-offset-4 hover:underline">
                    Lock proof ↗
                  </a>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {compact && facts.length > 0 && (
          <Link href="/how-it-works#tokenomics" className="text-sol-green/90 underline-offset-4 hover:underline">
            Full tokenomics →
          </Link>
        )}
        <Link href="/proof" className="text-sol-green/90 underline-offset-4 hover:underline">
          Check the tracker on the Proof page →
        </Link>
      </p>
    </section>
  );
}
