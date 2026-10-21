import Link from "next/link";
import { X_HANDLE, X_URL } from "@/config/social";
import { ContractAddress } from "./ContractAddress";
import { XIcon } from "./XIcon";

/** "Follow @Solanites_ · Contract: … · Verify", shared by the hero and the footer. */
export function SocialLine({ className = "" }: { className?: string }) {
  return (
    <p className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist ${className}`} data-testid="social-line">
      <a href={X_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-bone/85 underline-offset-4 hover:text-bone hover:underline">
        <XIcon className="h-3.5 w-3.5" />
        Follow {X_HANDLE}
      </a>
      <span aria-hidden className="text-bone/25 max-sm:hidden">·</span>
      <ContractAddress />
      <Link href="/how-it-works#tokenomics" className="font-mono text-[11px] uppercase tracking-[0.2em] text-sol-green/90 underline-offset-4 hover:underline" data-testid="verify-link">
        Verify →
      </Link>
    </p>
  );
}
