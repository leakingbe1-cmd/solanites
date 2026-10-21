import { describe, expect, it } from "vitest";
import { incubationMsFor } from "@/config/eggProgression";
import { gameConfig } from "@/config/gameConfig";
import { advance, eggsAllowed, phaseOf, rarityChances, rollSpecies, tokensToNextEgg, type SolaniteRecord } from "@/lib/progression";
import { SPECIES_BY_ID } from "@/lib/species";

const egg = (over: Partial<SolaniteRecord> = {}): SolaniteRecord => ({ id: "e", seed: 1, acquiredAt: 0, incubationMs: 0, speciesId: "mossling", hatchedAt: null, growthMs: 0, backed: true, ...over });

describe("existing hatch, rarity and collection rules still hold (test 15)", () => {
  it("keeps the rarity distribution unchanged", () => {
    expect(gameConfig.rarityWeights).toEqual({ common: 40, rare: 30, epic: 17, legendary: 8, mythic: 3.5, secret: 1.5 });
    const c = rarityChances(gameConfig);
    expect(c.common).toBeCloseTo(0.4, 6);
    expect(c.legendary).toBeCloseTo(0.08, 6);
  });

  it("rolls the same species for the same seed, always a real species", () => {
    for (let seed = 1; seed < 500; seed++) {
      expect(rollSpecies(seed, gameConfig)).toBe(rollSpecies(seed, gameConfig));
      expect(SPECIES_BY_ID[rollSpecies(seed, gameConfig)]).toBeDefined();
    }
  });

  it("uses each egg's own incubation length, falling back to the config default", () => {
    const first = egg({ durationMs: incubationMsFor(1) });
    expect(phaseOf({ ...first, incubationMs: incubationMsFor(1) - 1 }, gameConfig)).toBe("egg");
    expect(phaseOf({ ...first, incubationMs: incubationMsFor(1) }, gameConfig)).toBe("ready");
    expect(phaseOf(egg({ incubationMs: gameConfig.eggs.incubationMs }), gameConfig)).toBe("ready");
    expect(phaseOf(egg({ hatchedAt: 5 }), gameConfig)).toBe("creature");
  });

  it("advances demo eggs toward their own duration and never past it", () => {
    const [r] = advance([egg({ durationMs: 300_000 })], 10 * 60_000, gameConfig.token.tokensPerEgg, gameConfig);
    expect(r.incubationMs).toBe(300_000);
    expect(phaseOf(r, gameConfig)).toBe("ready");
  });

  it("counts one egg per 1,000,000 tokens with no cap", () => {
    expect(eggsAllowed(999_999, gameConfig)).toBe(0);
    expect(eggsAllowed(1_000_000, gameConfig)).toBe(1);
    expect(eggsAllowed(10_000_000, gameConfig)).toBe(10);
    expect(eggsAllowed(250_000_000, gameConfig)).toBe(250);
    expect(tokensToNextEgg(2_500_000, gameConfig)).toBe(500_000);
  });
});
