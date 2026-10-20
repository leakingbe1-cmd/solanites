import { describe, expect, it } from "vitest";
import { gameConfig, type GameConfig } from "@/config/gameConfig";
import { rarityChances, rollRarity, rollSpecies, validateRarityConfig } from "@/lib/progression";
import { RARITY_ORDER } from "@/lib/rarity";
// The game's full catalogue (classified included), as the server rolls it.
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

describe("one catalogue for every roll", () => {
  it("a client-side (simulated) roll lands on exactly the species the server roll does, Mythic and Secret included", () => {
    const tiers = new Set<string>();
    for (let seed = 0; seed < 50_000; seed++) {
      const real = rollSpecies(seed, gameConfig, SPECIES);
      expect(rollSpecies(seed, gameConfig)).toBe(real);
      tiers.add(SPECIES_BY_ID[real].rarity);
    }
    expect(tiers.size).toBe(RARITY_ORDER.length);
  });

  it("keeps the catalogue order production rolls were issued with (reordering would change existing eggs)", () => {
    expect(SPECIES.map((s) => s.id)).toEqual([
      "mossling", "driftfin", "pallow", "glimmeray", "sproutwyrm", "frostkit",
      "abyssal-vael", "stormquill", "duskwing", "cryovant", "emberlisk",
      "neonyx", "aurorath", "zephrax", "prismara", "nyxara",
      "aurelion", "solvanth", "pyraurum", "aurelith", "velynx", "thalor",
      "astravex", "orbelith", "eventide", "helivane", "genesis", "nullborn",
    ]);
  });
});

describe("the configured rarity model", () => {
  it("is the agreed design: weights 40 / 30 / 17 / 8 / 3.5 / 1.5 and every tier has species", () => {
    expect(gameConfig.rarityWeights).toEqual({ common: 40, rare: 30, epic: 17, legendary: 8, mythic: 3.5, secret: 1.5 });
    expect(() => validateRarityConfig(gameConfig)).not.toThrow();
    expect(() => validateRarityConfig(gameConfig, SPECIES)).not.toThrow();
    for (const r of RARITY_ORDER) expect(SPECIES.some((s) => s.rarity === r)).toBe(true);
  });

  it("maps the random number onto cumulative weights exactly at each boundary", () => {
    // Cumulative shares: common [0, .40), rare [.40, .70), epic [.70, .87), legendary [.87, .95), mythic [.95, .985), secret [.985, 1)
    const at = (u: number) => rollRarity(seq(u), gameConfig);
    expect(at(0)).toBe("common");
    // Fractional shares aren't exact in binary, so test a hair either side of each boundary.
    expect(at(0.3999999)).toBe("common");
    expect(at(0.4000001)).toBe("rare");
    expect(at(0.6999999)).toBe("rare");
    expect(at(0.7000001)).toBe("epic");
    expect(at(0.8699999)).toBe("epic");
    expect(at(0.8700001)).toBe("legendary");
    expect(at(0.9499999)).toBe("legendary");
    expect(at(0.9500001)).toBe("mythic");
    expect(at(0.9849999)).toBe("mythic");
    expect(at(0.9850001)).toBe("secret");
    expect(at(0.9999999999)).toBe("secret");
  });

  it("respects other weights too, and never rolls a zero-weight tier", () => {
    expect(rollRarity(seq(0.99), withWeights({ legendary: 1 }))).toBe("legendary");
    const cfg = withWeights({ common: 1, secret: 1 });
    expect(rollRarity(seq(0.49), cfg)).toBe("common");
    expect(rollRarity(seq(0.5), cfg)).toBe("secret");
    for (let s = 0; s < 2000; s++) expect(["pallow", "mossling", "driftfin", "glimmeray", "sproutwyrm", "frostkit", "genesis", "nullborn"]).toContain(rollSpecies(s, cfg, SPECIES));
  });

  it("over 400,000 consecutive seeds, rarity shares match the weights and every species appears", () => {
    const N = 400_000;
    const byRarity: Record<string, number> = {};
    const bySpecies: Record<string, number> = {};
    for (let s = 0; s < N; s++) {
      const id = rollSpecies(s, gameConfig, SPECIES);
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
    const outcomes = Array.from({ length: 60 }, (_, s) => rollSpecies(s, gameConfig, SPECIES));
    expect(new Set(outcomes).size).toBeGreaterThan(5);
    expect(new Set(outcomes).size).toBeLessThan(outcomes.length); // duplicates happen
  });

  it("the same seed always gives the same species (so a stored egg can't be rerolled)", () => {
    for (const s of [0, 1, 99, 2 ** 31, 2 ** 32 - 1]) expect(rollSpecies(s, gameConfig, SPECIES)).toBe(rollSpecies(s, gameConfig, SPECIES));
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
