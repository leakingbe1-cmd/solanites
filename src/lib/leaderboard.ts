import { gameConfig } from "@/config/gameConfig";
import { RARITIES } from "@/lib/rarity";
import type { Leaderboard, LeaderboardCategory, LeaderRow } from "@/shared/leaderboard";
import { LEADERBOARD_POLL_MS } from "@/shared/leaderboard";
import { formatDuration, formatNumber } from "./format";
import { ago } from "./homeMetrics";

/** What /leaderboard shows for each tab, worked out from /api/leaderboard (no fetching, no timers). */
export const TABS: { id: LeaderboardCategory; label: string; column: string }[] = [
  { id: "evolved", label: "Most Evolved", column: "Stage total" },
  { id: "holders", label: "Longest Holders", column: "Held" },
  { id: "rarest", label: "Rarest Discoveries", column: "Rarest" },
];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The figure each tab ranks by, as shown under a podium creature and in the table. */
export function metricText(tab: LeaderboardCategory, r: LeaderRow): string {
  if (tab === "evolved") return `${plural(r.creatures, "creature")} · stage total ${r.stageSum}`;
  if (tab === "holders") return r.heldMs === null ? "—" : `${formatDuration(r.heldMs)} held`;
  return r.rarity ? `${RARITIES[r.rarity].label}${r.rarityCount > 1 ? ` ×${r.rarityCount}` : ""}` : "—";
}

export function columnText(tab: LeaderboardCategory, r: LeaderRow): string {
  if (tab === "evolved") return String(r.stageSum);
  if (tab === "holders") return r.heldMs === null ? "—" : formatDuration(r.heldMs);
  return r.rarity ? RARITIES[r.rarity].label : "—";
}

export const formName = (r: LeaderRow) => (r.creature ? gameConfig.evolution.names[r.creature.stage] ?? "—" : "Egg");

export const HOLDERS_NOTE =
  "Continuous holding at or above one egg's worth, from the first verified on-chain record. Holding before tracking began isn't counted, and a drop below restarts it.";

/** Older than this and the shown ranking is flagged as out of date. */
export const STALE_AFTER_MS = 3 * LEADERBOARD_POLL_MS;

export type SourceBadge = { kind: "live" | "fixture"; text: string };

/** The badge under the title. Only real chain data reads as live; fixture data says what it is. */
export function sourceBadge(board: Leaderboard): SourceBadge {
  return board.source === "chain" ? { kind: "live", text: "Live · on-chain holders" } : { kind: "fixture", text: "Fixture data · local test holders" };
}

/** "Updated 2m ago · refreshes every 30 s", or the out-of-date / failed-refresh variant. */
export function freshness(board: Leaderboard, now: number, refreshFailed: boolean): { text: string; stale: boolean } {
  const stale = refreshFailed || now - board.generatedAt > STALE_AFTER_MS;
  const base = `Updated ${ago(board.generatedAt, now)}`;
  if (refreshFailed) return { text: `${base} · couldn't refresh, retrying`, stale };
  return { text: stale ? `${base} · may be out of date` : `${base} · refreshes every 30 s`, stale };
}

/** Before launch (/api/leaderboard answers NOT_CONFIGURED): what it takes to rank in each list. */
export const RANK_RULES: Record<LeaderboardCategory, string> = {
  evolved: "Hatch Solanites and keep holding: ranked by the total of their evolution stages, then the best single form.",
  holders: `Hold at least ${formatNumber(gameConfig.token.tokensPerEgg)} ${gameConfig.token.symbol} without dropping below it: ranked by verified continuous holding.`,
  rarest: "Ranked by the rarest Solanite you have hatched, then how many you have at that rarity.",
};

/**
 * A sample podium for the pre-launch leaderboard, always shown labelled "Sample, not real holders".
 * Invented rows, never real keepers; common to legendary species only (no Mythic or Secret).
 */
export const SAMPLE_PODIUM: LeaderRow[] = [
  { rank: 1, keeper: "Sample keeper", creature: { speciesId: "solvanth", stage: 3 }, creatures: 3, stageSum: 8, bestStage: 3, heldMs: null, rarity: "legendary", rarityCount: 1 },
  { rank: 2, keeper: "Sample keeper", creature: { speciesId: "neonyx", stage: 3 }, creatures: 2, stageSum: 6, bestStage: 3, heldMs: null, rarity: "epic", rarityCount: 1 },
  { rank: 3, keeper: "Sample keeper", creature: { speciesId: "driftfin", stage: 2 }, creatures: 2, stageSum: 4, bestStage: 2, heldMs: null, rarity: "common", rarityCount: 2 },
];
export const SAMPLE_LABEL = "Sample, not real holders";
