import type { RarityId } from "@/config/gameConfig";
import { RARITIES } from "@/lib/rarity";

/** Understated rarity mark: a small diamond and a letterspaced label. */
export function RarityBadge({ rarity, size = "sm", hidden = false }: { rarity: RarityId; size?: "sm" | "md"; hidden?: boolean }) {
  const r = RARITIES[rarity];
  return (
    <span className={`inline-flex items-center gap-2 uppercase ${size === "sm" ? "text-[9.5px] tracking-[0.3em]" : "text-[11px] tracking-[0.34em]"}`} style={{ color: hidden ? "#8a8c9c" : r.color }}>
      <span className="h-[5px] w-[5px] rotate-45" style={{ background: hidden ? "#5c5e6c" : r.color }} />
      {hidden ? "Unknown" : r.label}
    </span>
  );
}
