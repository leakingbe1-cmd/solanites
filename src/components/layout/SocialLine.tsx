import { CONTRACT_LABEL, X_HANDLE, X_URL } from "@/config/social";

/** "Follow @Solanites_ · Contract: coming soon", shared by the hero and the footer. */
export function SocialLine({ className = "" }: { className?: string }) {
  return (
    <p className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist ${className}`} data-testid="social-line">
      <a href={X_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-bone/85 underline-offset-4 hover:text-bone hover:underline">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Follow {X_HANDLE}
      </a>
      <span aria-hidden className="text-bone/25 max-sm:hidden">·</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist/80">{CONTRACT_LABEL}</span>
    </p>
  );
}
