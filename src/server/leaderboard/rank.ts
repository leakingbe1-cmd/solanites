import type { RarityId } from "@/config/gameConfig";
import { shortAddress } from "@/lib/format";
import { RARITIES } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";
import { LEADERBOARD_SIZE, type LeaderRow } from "@/shared/leaderboard";

/** A hatched creature as the tracker sees it (stage from the same server logic as holderView). */
export interface KeeperCreature {
  speciesId: string;
  stage: number;
  hatchedAt: number;
  /** When its incubation completed and growth began. */
  readyAt: number;
}

export interface Keeper {
  address: string;
  creatures: KeeperCreature[];
  /** Verified continuous qualifying holding as of now (ms); null when not currently qualifying. */
  heldMs: number | null;
}

/** A balance change from recorded history: time of the transaction and the balance before and after. */
export interface HoldingChange {
  at: number;
  preBase: bigint;
  postBase: bigint;
}

/**
 * Verified continuous qualifying holding: from the earliest verified point the wallet was at or above
 * one egg's worth, which is either a recorded transaction that took it over the threshold or the
 * tracker's first observation of it there (first_qualified_ms), restarted by any recorded drop below.
 * Built only from recorded history and the recorded balance; holding before tracking began is
 * never counted, and a current balance alone never counts.
 */
export function continuousHoldingMs(firstQualifiedAt: number | null, currentBase: bigint, unitBase: bigint, changes: HoldingChange[], now: number): number | null {
  if (currentBase < unitBase) return null;
  type Event = { at: number; crossesUp: boolean; below: boolean };
  const events: Event[] = changes.map((c) => ({ at: c.at, crossesUp: c.preBase < unitBase && c.postBase >= unitBase, below: c.postBase < unitBase }));
  if (firstQualifiedAt !== null) events.push({ at: firstQualifiedAt, crossesUp: false, below: false });
  let since: number | null = null;
  for (const e of events.sort((a, b) => a.at - b.at)) {
    if (e.below) since = null;
    else if (e.crossesUp) since = e.at;
    else if (since === null && e.at === firstQualifiedAt) since = e.at;
  }
  // Ends below in the recorded history, or never verified above it: don't trust a newer balance alone.
  return since === null ? null : Math.max(0, now - since);
}

const rarityOrder = (speciesId: string): number => RARITIES[SPECIES_BY_ID[speciesId]?.rarity ?? "common"].order;
const rarityOf = (speciesId: string): RarityId | null => SPECIES_BY_ID[speciesId]?.rarity ?? null;
const byAddress = (a: Keeper, b: Keeper) => (a.address < b.address ? -1 : a.address > b.address ? 1 : 0);

/** The best creature by stage, then earliest hatch; null when there are none. */
function bestByStage(cs: KeeperCreature[]): KeeperCreature | null {
  return [...cs].sort((a, b) => b.stage - a.stage || a.readyAt - b.readyAt || a.hatchedAt - b.hatchedAt)[0] ?? null;
}

/** The rarest creature, then the highest stage, then earliest hatch. */
function bestByRarity(cs: KeeperCreature[]): KeeperCreature | null {
  return [...cs].sort((a, b) => rarityOrder(b.speciesId) - rarityOrder(a.speciesId) || b.stage - a.stage || a.hatchedAt - b.hatchedAt)[0] ?? null;
}

function row(k: Keeper, rank: number, shown: KeeperCreature | null): LeaderRow {
  const best = bestByStage(k.creatures);
  const rarest = bestByRarity(k.creatures);
  const topRarity = rarest ? rarityOrder(rarest.speciesId) : -1;
  return {
    rank,
    keeper: shortAddress(k.address),
    creature: shown ? { speciesId: shown.speciesId, stage: shown.stage } : null,
    creatures: k.creatures.length,
    stageSum: k.creatures.reduce((s, c) => s + c.stage, 0),
    bestStage: best?.stage ?? 0,
    heldMs: k.heldMs,
    rarity: rarest ? rarityOf(rarest.speciesId) : null,
    rarityCount: k.creatures.filter((c) => rarityOrder(c.speciesId) === topRarity).length,
  };
}

const ranked = (list: Keeper[], cmp: (a: Keeper, b: Keeper) => number, shown: (k: Keeper) => KeeperCreature | null) =>
  [...list]
    .sort((a, b) => cmp(a, b) || byAddress(a, b))
    .slice(0, LEADERBOARD_SIZE)
    .map((k, i) => row(k, i + 1, shown(k)));

export function rankEvolved(keepers: Keeper[]): LeaderRow[] {
  const sum = (k: Keeper) => k.creatures.reduce((s, c) => s + c.stage, 0);
  const best = (k: Keeper) => bestByStage(k.creatures)!;
  return ranked(
    keepers.filter((k) => k.creatures.length),
    (a, b) => sum(b) - sum(a) || best(b).stage - best(a).stage || best(a).readyAt - best(b).readyAt,
    (k) => bestByStage(k.creatures),
  );
}

export function rankHolders(keepers: Keeper[]): LeaderRow[] {
  return ranked(
    keepers.filter((k) => k.heldMs !== null),
    (a, b) => b.heldMs! - a.heldMs!,
    (k) => bestByStage(k.creatures),
  );
}

export function rankRarest(keepers: Keeper[]): LeaderRow[] {
  const top = (k: Keeper) => bestByRarity(k.creatures)!;
  const order = (k: Keeper) => rarityOrder(top(k).speciesId);
  const count = (k: Keeper) => k.creatures.filter((c) => rarityOrder(c.speciesId) === order(k)).length;
  const firstAt = (k: Keeper) => Math.min(...k.creatures.filter((c) => rarityOrder(c.speciesId) === order(k)).map((c) => c.hatchedAt));
  return ranked(
    keepers.filter((k) => k.creatures.length),
    (a, b) => order(b) - order(a) || count(b) - count(a) || firstAt(a) - firstAt(b),
    (k) => bestByRarity(k.creatures),
  );
}
