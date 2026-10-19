import { Sigil } from "@/components/brand/Sigil";

/**
 * The horizontal lockup: the sigil emblem and the SOLANITES wordmark in Cormorant.
 * `narrowMarkOnly`: under 360px wide show the emblem alone (the header, where buttons share the row).
 */
export function Logo({ narrowMarkOnly = false }: { narrowMarkOnly?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Sigil variant="emblem" className="h-7 w-8 sm:h-8 sm:w-9" />
      <span className={`font-display text-[17px] font-semibold uppercase tracking-[0.32em] text-bone sm:text-[19px] ${narrowMarkOnly ? "max-[359px]:hidden" : ""}`}>Solanites</span>
    </span>
  );
}
