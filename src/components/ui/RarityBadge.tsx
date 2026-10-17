import type { RarityId } from "@/config/gameConfig";
import { RARITIES } from "@/lib/rarity";

export function RarityBadge({ rarity, size = "sm", hidden = false }: { rarity: RarityId; size?: "sm" | "md"; hidden?: boolean }) {
  const r = RARITIES[rarity];
  const style = hidden
    ? { color: "#a6a3c4", borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }
    : { color: r.color, borderColor: `${r.color}55`, background: `linear-gradient(90deg, ${r.color}1f, ${r.color2}12)`, boxShadow: `0 0 18px -6px ${r.glow}` };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-[0.18em] ${size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3.5 py-1 text-xs"}`}
      style={style}
    >
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: hidden ? "#555" : `linear-gradient(135deg, ${r.color}, ${r.color2})` }} />
      {hidden ? "Unknown" : r.label}
    </span>
  );
}
