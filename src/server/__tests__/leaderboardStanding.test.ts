import { describe, expect, it } from "vitest";
import { LEADERBOARD_SIZE } from "@/shared/leaderboard";
import { rankEvolved, rankHolders, standingsOf, type Keeper, type KeeperCreature } from "../leaderboard/rank";

const HOUR = 3_600_000;
const c = (speciesId: string, stage: number, hatchedAt = 0, readyAt = hatchedAt): KeeperCreature => ({ speciesId, stage, hatchedAt, readyAt });
const k = (address: string, creatures: KeeperCreature[], heldMs: number | null = null): Keeper => ({ address, creatures, heldMs });
/** A fixed-width address so the address tie-break is easy to read: K000, K001, … */
const addr = (i: number) => `K${String(i).padStart(3, "0")}`;

describe("standingsOf: a keeper's own place in each category", () => {
  it("ranks below the public top list, with the full count", () => {
    // 40 keepers, keeper i holds for (40 - i) hours: K000 is first, K039 last.
    const keepers = Array.from({ length: 40 }, (_, i) => k(addr(i), [c("mossling", 1)], (40 - i) * HOUR));
    const s = standingsOf(keepers, addr(32));
    expect(s.holders).toMatchObject({ of: 40, row: { rank: 33 } });
    expect(s.holders!.row.rank).toBeGreaterThan(LEADERBOARD_SIZE);
    // inside the top list it agrees with the public ranking
    const top = standingsOf(keepers, addr(4));
    expect(top.holders!.row).toEqual(rankHolders(keepers)[4]);
  });

  it("is null in a category the keeper doesn't qualify for, and for an unknown address", () => {
    const keepers = [k("A", [c("mossling", 2)], null), k("B", [], 5 * HOUR)];
    expect(standingsOf(keepers, "A")).toMatchObject({ holders: null, evolved: { of: 1, row: { rank: 1 } }, rarest: { of: 1 } });
    expect(standingsOf(keepers, "B")).toMatchObject({ evolved: null, rarest: null, holders: { of: 1, row: { rank: 1 } } });
    expect(standingsOf(keepers, "nobody")).toEqual({ evolved: null, holders: null, rarest: null });
  });

  it("breaks ties exactly like the public list (rule, then address)", () => {
    const keepers = [k("E", [c("mossling", 2, 0, 100)]), k("A", [c("mossling", 2, 0, 100)]), k("B", [c("mossling", 2, 0, 500)])];
    const publicOrder = rankEvolved(keepers).map((r) => r.keeper);
    expect(publicOrder).toEqual(["A", "E", "B"]);
    for (const [i, address] of publicOrder.entries()) expect(standingsOf(keepers, address).evolved!.row.rank).toBe(i + 1);
  });

  it("returns only the short address", () => {
    const long = "5ynCKp91fYufur9VHzDWN2Dd26Kdo8enx2m1Q59oG1N1";
    const row = standingsOf([k(long, [c("mossling", 1)], HOUR)], long).holders!.row;
    expect(row.keeper).toBe("5ynC…G1N1");
    expect(JSON.stringify(row)).not.toContain(long);
  });
});
