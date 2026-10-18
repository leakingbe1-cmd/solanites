import { describe, expect, it } from "vitest";
import { gameConfig } from "@/config/gameConfig";
import { formatSpan } from "@/lib/format";
import { evolutionOf } from "@/lib/progression";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const evo = (ms: number) => evolutionOf(ms, gameConfig);

describe("evolution milestones (cumulative qualifying hold since hatching)", () => {
  it("uses exactly 5 min, 30 min and 2 h for the first three", () => {
    expect(gameConfig.evolution.thresholdsMs).toEqual([0, 5 * MIN, 30 * MIN, 2 * HOUR]);
    expect(gameConfig.evolution.names).toEqual(["Eggling", "Hatchling", "Evolved", "Ascended"]);
  });

  it.each([
    [0, "Eggling"],
    [5 * MIN - 1, "Eggling"],
    [5 * MIN, "Hatchling"],
    [30 * MIN - 1, "Hatchling"],
    [30 * MIN, "Evolved"],
    [2 * HOUR - 1, "Evolved"],
    [2 * HOUR, "Ascended"],
  ])("at %i ms the form is %s, never earlier", (ms, name) => {
    expect(evo(ms).name).toBe(name);
  });

  it("counts remaining time to each boundary exactly", () => {
    expect(evo(0)).toMatchObject({ nextName: "Hatchling", remainingMs: 5 * MIN, toNextMs: 5 * MIN, progress: 0 });
    expect(evo(5 * MIN)).toMatchObject({ nextName: "Evolved", remainingMs: 25 * MIN, progress: 0 });
    expect(evo(17.5 * MIN).progress).toBeCloseTo(0.5, 6);
    expect(evo(30 * MIN)).toMatchObject({ nextName: "Ascended", remainingMs: 90 * MIN });
    expect(evo(2 * HOUR)).toMatchObject({ isMax: true, progress: 1, remainingMs: 0, rank: 1, label: "Ascended", nextLabel: "Ascended II", toNextMs: 6 * HOUR });
  });

  it("continues with Ascension ranks whose gaps keep growing", () => {
    const marks = [2 * HOUR, ...gameConfig.evolution.ascensionRanksMs];
    expect(gameConfig.evolution.ascensionRanksMs).toEqual([8 * HOUR, 24 * HOUR, 3 * DAY, 7 * DAY, 30 * DAY]);
    for (let i = 2; i < marks.length; i++) expect(marks[i] - marks[i - 1]).toBeGreaterThan(marks[i - 1] - marks[i - 2]);
    expect(evo(8 * HOUR - 1).label).toBe("Ascended");
    expect(evo(8 * HOUR)).toMatchObject({ label: "Ascended II", rank: 2, nextLabel: "Ascended III" });
    expect(evo(30 * DAY)).toMatchObject({ label: "Ascended VI", rank: 6, isFinal: true, toNextMs: 0, toNextProgress: 1 });
    expect(evo(-5).name).toBe("Eggling");
  });

  it("formats milestone lengths readably", () => {
    expect([5 * MIN, 30 * MIN, 2 * HOUR, 8 * HOUR, 24 * HOUR, 3 * DAY, 7 * DAY, 30 * DAY].map(formatSpan)).toEqual(["5 min", "30 min", "2 h", "8 h", "24 h", "3 days", "7 days", "30 days"]);
  });
});
