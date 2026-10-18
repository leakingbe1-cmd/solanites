import { describe, expect, it } from "vitest";
import { gameConfig, type GameConfig } from "@/config/gameConfig";
import { rarityChances, rollRarity, rollSpecies, validateRarityConfig } from "@/lib/progression";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES, SPECIES_BY_ID } from "@/lib/species";
import { DEMO_UNHATCHED, demoRecords } from "@/state/HatcheryProvider";

/**
 * Species selection. Statistical checks enumerate seeds 0..N-1 in order, so
 * they are deterministic, not a random sample.
 */

const withWeights = (w: Partial<GameConfig["rarityWeights"]>): GameConfig => ({
  ...gameConfig,
  rarityWeights: { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0, secret: 0, ...w },
});
const seq = (...xs: number[]) => {
  let i = 0;
  return () => xs[i++];
};

describe("the configured rarity model", () => {
  it("is the shipped design: weights 60 / 25 / 10 / 3.8 / 1 / 0.2 and every tier has species", () => {
    expect(gameConfig.rarityWeights).toEqual({ common: 60, rare: 25, epic: 10, legendary: 3.8, mythic: 1, secret: 0.2 });
    expect(() => validateRarityConfig(gameConfig)).not.toThrow();
    for (const r of RARITY_ORDER) expect(SPECIES.some((s) => s.rarity === r)).toBe(true);
  });

  it("maps the random number onto cumulative weights exactly at each boundary", () => {
    // Cumulative shares: common [0, .6), rare [.6, .85), epic [.85, .95), legendary [.95, .988), mythic [.988, .998), secret [.998, 1)
    const at = (u: number) => rollRarity(seq(u), gameConfig);
    expect(at(0)).toBe("common");
    expect(at(0.5999999)).toBe("common");
    expect(at(0.6)).toBe("rare");
    expect(at(0.8499999)).toBe("rare");
    expect(at(0.85)).toBe("epic");
    // 3.8 and 0.2 aren't exact in binary, so test a hair either side of those boundaries.
    expect(at(0.9499999)).toBe("epic");
    expect(at(0.9500001)).toBe("legendary");
    expect(at(0.9879999)).toBe("legendary");
    expect(at(0.9880001)).toBe("mythic");
    expect(at(0.9979999)).toBe("mythic");
    expect(at(0.9980001)).toBe("secret");
    expect(at(0.9999999999)).toBe("secret");
  });

  it("respects other weights too, and never rolls a zero-weight tier", () => {
    expect(rollRarity(seq(0.99), withWeights({ legendary: 1 }))).toBe("legendary");
    const cfg = withWeights({ common: 1, secret: 1 });
    expect(rollRarity(seq(0.49), cfg)).toBe("common");
    expect(rollRarity(seq(0.5), cfg)).toBe("secret");
    for (let s = 0; s < 2000; s++) expect(["pallow", "mossling", "driftfin", "glimmeray", "sproutwyrm", "frostkit", "genesis", "nullborn"]).toContain(rollSpecies(s, cfg));
  });

  it("over 400,000 consecutive seeds, rarity shares match the weights and every species appears", () => {
    const N = 400_000;
    const byRarity: Record<string, number> = {};
    const bySpecies: Record<string, number> = {};
    for (let s = 0; s < N; s++) {
      const id = rollSpecies(s, gameConfig);
      bySpecies[id] = (bySpecies[id] ?? 0) + 1;
      const r = SPECIES_BY_ID[id].rarity;
      byRarity[r] = (byRarity[r] ?? 0) + 1;
    }
    const expected = rarityChances(gameConfig);
    for (const r of RARITY_ORDER) expect(Math.abs((byRarity[r] ?? 0) / N - expected[r])).toBeLessThan(0.003);
    expect(Object.keys(bySpecies).sort()).toEqual(SPECIES.map((s) => s.id).sort());
    // Within a tier, species are picked evenly (each within ±15% of its fair share).
    for (const r of ["common", "rare", "epic", "legendary"] as const) {
      const pool = SPECIES.filter((s) => s.rarity === r);
      const fair = (byRarity[r] ?? 0) / pool.length;
      for (const sp of pool) expect(Math.abs(bySpecies[sp.id] - fair) / fair).toBeLessThan(0.15);
    }
  });

  it("different eggs can hatch different species, and the same species can hatch more than once", () => {
    const outcomes = Array.from({ length: 60 }, (_, s) => rollSpecies(s, gameConfig));
    expect(new Set(outcomes).size).toBeGreaterThan(5);
    expect(new Set(outcomes).size).toBeLessThan(outcomes.length); // duplicates happen
  });

  it("the same seed always gives the same species (so a stored egg can't be rerolled)", () => {
    for (const s of [0, 1, 99, 2 ** 31, 2 ** 32 - 1]) expect(rollSpecies(s, gameConfig)).toBe(rollSpecies(s, gameConfig));
  });
});

describe("invalid configuration fails safely instead of guessing", () => {
  it("refuses when no rarity has a positive weight", () => {
    const none = withWeights({});
    expect(() => validateRarityConfig(none)).toThrow(/positive weight/);
    expect(() => rollSpecies(1, none)).toThrow(/positive weight/);
    expect(() => rollSpecies(1, withWeights({ common: -5 }))).toThrow(/positive weight/);
  });

  it("refuses a tier that has weight but no species, rather than drawing from another tier", () => {
    const noSecrets = SPECIES.filter((s) => s.rarity !== "secret");
    const secretOnly = withWeights({ secret: 1 });
    expect(() => validateRarityConfig(secretOnly, noSecrets)).toThrow(/secret/);
    expect(() => rollSpecies(7, secretOnly, noSecrets)).toThrow(/secret/);
  });
});

describe("demo eggs", () => {
  const seedsFrom = (start: number) => Array.from({ length: DEMO_UNHATCHED }, (_, i) => start + i);

  it("roll their species from the seeds they are given, with the real roll", () => {
    const seeds = [11, 222, 3333];
    const eggs = demoRecords(0, gameConfig, seeds).filter((r) => r.hatchedAt === null);
    expect(eggs.map((r) => r.speciesId)).toEqual(seeds.map((s) => rollSpecies(s, gameConfig)));
  });

  it("differ between demo sessions instead of repeating a fixed sequence", () => {
    const sequences = new Set(Array.from({ length: 20 }, (_, k) => demoRecords(0, gameConfig, seedsFrom(1000 + k * 7)).filter((r) => r.hatchedAt === null).map((r) => r.speciesId).join(",")));
    expect(sequences.size).toBeGreaterThan(10);
  });

  it("keep their two grown creatures as a fixed, pre-grown sample", () => {
    const grown = demoRecords(0, gameConfig, seedsFrom(5)).filter((r) => r.hatchedAt !== null);
    expect(grown.map((r) => r.speciesId)).toEqual(["duskwing", "mossling"]);
  });
});
