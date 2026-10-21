import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RANK_RULES, SAMPLE_LABEL, SAMPLE_PODIUM, TABS } from "@/lib/leaderboard";
import { SPECIES_BY_ID } from "@/lib/species";

/** The pre-launch leaderboard: rules for every list and a sample podium that can't pass for real data. */
describe("pre-launch leaderboard", () => {
  it("explains what it takes to rank in every list", () => {
    for (const t of TABS) expect(RANK_RULES[t.id].length).toBeGreaterThan(20);
    expect(RANK_RULES.holders).toContain("1,000,000");
  });

  it("the sample podium is labelled, invented and never Mythic or Secret", () => {
    expect(SAMPLE_LABEL).toBe("Sample, not real holders");
    expect(SAMPLE_PODIUM.map((r) => r.rank)).toEqual([1, 2, 3]);
    for (const r of SAMPLE_PODIUM) {
      expect(r.keeper).toBe("Sample keeper");
      const s = SPECIES_BY_ID[r.creature!.speciesId];
      expect(s).toBeDefined();
      expect(["mythic", "secret"]).not.toContain(s.rarity);
      expect(r.rarity).toBe(s.rarity);
    }
  });

  it("the page shows it only when the server says NOT_CONFIGURED, with the label on screen", () => {
    const page = readFileSync(path.resolve(__dirname, "../../app/leaderboard/page.tsx"), "utf8");
    expect(page).toContain('body?.error?.code === "NOT_CONFIGURED"');
    expect(page).toContain("if (!board && notConfigured) return <PreLaunchLeaderboard />");
    expect(page).toContain("{SAMPLE_LABEL}");
    expect(page).toContain("Opens at launch");
  });
});
