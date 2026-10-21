import { describe, expect, it } from "vitest";
import { eggProgression, fastTrackAfterMaturityMs, initialGrowthMsFor } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { formatSpan } from "@/lib/format";
import { evolutionOf, FIRST_MATURITY_MS, formThresholdsMs, formUnlockText } from "@/lib/progression";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
/** The first creature (initial growth 1 min). */
const evo = (ms: number) => evolutionOf(ms, gameConfig);

describe("initial growth, evolution and Ascension are separate milestones", () => {
  it("is configured centrally: growth per creature, then evolution counted from maturity", () => {
    expect(eggProgression.initialGrowthScheduleMs).toEqual([1 * MIN, 5 * MIN, 15 * MIN, 1 * HOUR, 3 * HOUR, 6 * HOUR]);
    expect(gameConfig.evolution.names).toEqual(["Eggling", "Hatchling", "Evolved", "Ascended"]);
    expect(gameConfig.evolution.afterMaturityMs).toEqual([30 * MIN, 2 * HOUR]);
    expect(FIRST_MATURITY_MS).toBe(1 * MIN);
    // The first five creatures are on the fast track (1 min); later ones use the long-term schedule.
    expect([1, 2, 3, 4, 5, 6, 7, 20].map((n) => initialGrowthMsFor(n))).toEqual([1 * MIN, 1 * MIN, 1 * MIN, 1 * MIN, 1 * MIN, 6 * HOUR, 6 * HOUR, 6 * HOUR]);
    expect(eggProgression.fastTrack).toEqual({ eggs: 5, hatchMs: 1 * MIN, stageMs: 1 * MIN });
  });

  it("first creature: growing, fully grown at exactly 1 min, Evolved 30 min later, Ascended 2 h after maturity", () => {
    expect(formThresholdsMs(FIRST_MATURITY_MS, gameConfig)).toEqual([0, 1 * MIN, 31 * MIN, 121 * MIN]);
    const at = (ms: number) => {
      const e = evo(ms);
      return [e.name, e.phase, e.matured];
    };
    expect(at(0)).toEqual(["Eggling", "growing", false]);
    expect(at(1 * MIN - 1)).toEqual(["Eggling", "growing", false]);
    expect(at(1 * MIN)).toEqual(["Hatchling", "mature", true]);
    expect(at(31 * MIN - 1)).toEqual(["Hatchling", "mature", true]);
    expect(at(31 * MIN)).toEqual(["Evolved", "evolved", true]);
    expect(at(121 * MIN - 1)).toEqual(["Evolved", "evolved", true]);
    expect(at(121 * MIN)).toEqual(["Ascended", "ascended", true]);
  });

  it("later creatures use their own initial growth, and evolution still follows maturity", () => {
    const slow = { ...eggProgression, fastTrack: { ...eggProgression.fastTrack, eggs: 0 } };
    const second = (ms: number) => evolutionOf(ms, gameConfig, initialGrowthMsFor(2, slow));
    expect(second(5 * MIN - 1).phase).toBe("growing");
    expect(second(5 * MIN).phase).toBe("mature");
    expect(second(35 * MIN).phase).toBe("evolved");
    const fourth = (ms: number) => evolutionOf(ms, gameConfig, initialGrowthMsFor(4, slow));
    // Maturity (1 h) is never overtaken by evolution, whatever the creature's growth time.
    expect(fourth(59 * MIN).phase).toBe("growing");
    expect(fourth(1 * HOUR).phase).toBe("mature");
    expect(fourth(1 * HOUR + 30 * MIN).phase).toBe("evolved");
  });

  it("fast-track creatures take exactly one minute per evolution stage; Ascension ranks keep their timings", () => {
    const after = fastTrackAfterMaturityMs(gameConfig.evolution.afterMaturityMs.length);
    expect(after).toEqual([1 * MIN, 2 * MIN]);
    const fast = (ms: number) => evolutionOf(ms, gameConfig, initialGrowthMsFor(1), after);
    expect([0, 1 * MIN - 1, 1 * MIN, 2 * MIN - 1, 2 * MIN, 3 * MIN - 1, 3 * MIN].map((ms) => fast(ms).name)).toEqual([
      "Eggling", "Eggling", "Hatchling", "Hatchling", "Evolved", "Evolved", "Ascended",
    ]);
    expect(fast(3 * MIN)).toMatchObject({ label: "Ascended", nextLabel: "Ascended II", toNextMs: 1 * MIN + 8 * HOUR - 3 * MIN });
    // A normal creature with the same maturity still takes 30 min to evolve.
    expect(evolutionOf(2 * MIN, gameConfig, initialGrowthMsFor(1)).name).toBe("Hatchling");
  });

  it("counts remaining time to each milestone exactly", () => {
    expect(evo(0)).toMatchObject({ nextName: "Hatchling", remainingMs: 1 * MIN, toNextMs: 1 * MIN, progress: 0 });
    expect(evo(30_000).toNextProgress).toBeCloseTo(0.5, 6);
    expect(evo(1 * MIN)).toMatchObject({ nextName: "Evolved", remainingMs: 30 * MIN, progress: 0 });
    expect(evo(31 * MIN)).toMatchObject({ nextName: "Ascended", remainingMs: 90 * MIN });
    expect(evo(121 * MIN)).toMatchObject({ isMax: true, progress: 1, remainingMs: 0, rank: 1, label: "Ascended", nextLabel: "Ascended II", toNextMs: 6 * HOUR });
  });

  it("continues with Ascension ranks counted from maturity, whose gaps keep growing", () => {
    expect(gameConfig.evolution.ascensionRanksMs).toEqual([8 * HOUR, 24 * HOUR, 3 * DAY, 7 * DAY, 30 * DAY]);
    const marks = [2 * HOUR, ...gameConfig.evolution.ascensionRanksMs];
    for (let i = 2; i < marks.length; i++) expect(marks[i] - marks[i - 1]).toBeGreaterThan(marks[i - 1] - marks[i - 2]);
    const M = FIRST_MATURITY_MS;
    expect(evo(M + 8 * HOUR - 1).label).toBe("Ascended");
    expect(evo(M + 8 * HOUR)).toMatchObject({ label: "Ascended II", rank: 2, nextLabel: "Ascended III" });
    expect(evo(M + 30 * DAY)).toMatchObject({ label: "Ascended VI", rank: 6, isFinal: true, toNextMs: 0, toNextProgress: 1 });
    expect(evo(-5).name).toBe("Eggling");
  });

  it("describes each milestone in words", () => {
    expect([0, 1, 2, 3].map((i) => formUnlockText(i, gameConfig, 5 * MIN))).toEqual(["At hatch", "After 5 min of growth", "30 min of holding after maturity", "2 h of holding after maturity"]);
    expect(formUnlockText(1, gameConfig)).toBe("When initial growth completes (1 min for a first creature)");
    // A fast-track creature's locked forms quote its own one-minute stages, not the standard timings.
    expect([2, 3].map((i) => formUnlockText(i, gameConfig, 1 * MIN, [1 * MIN, 2 * MIN]))).toEqual(["1 min of holding after maturity", "2 min of holding after maturity"]);
  });

  it("formats milestone lengths readably", () => {
    expect([1 * MIN, 5 * MIN, 15 * MIN, 30 * MIN, 1 * HOUR, 2 * HOUR, 12 * HOUR, 3 * DAY, 30 * DAY].map(formatSpan)).toEqual(["1 min", "5 min", "15 min", "30 min", "1 h", "2 h", "12 h", "3 days", "30 days"]);
  });
});
