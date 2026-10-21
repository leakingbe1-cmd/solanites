import { describe, expect, it } from "vitest";
import { gameConfig } from "@/config/gameConfig";
import { badgeLabel, milestoneIcs, nextStreakBadge, speciesOfDay } from "@/lib/dailyLoop";

/** Daily return loop: deterministic, cosmetic and never chance-based or paid. */
const DAY = 24 * 60 * 60 * 1000;

describe("daily loop", () => {
  it("species of the day is the same all day, changes at midnight UTC, and is never Mythic or Secret", () => {
    const t = Date.UTC(2026, 9, 22, 0, 0, 0);
    expect(speciesOfDay(t).id).toBe(speciesOfDay(t + DAY - 1).id);
    expect(speciesOfDay(t).id).not.toBe(speciesOfDay(t + DAY).id);
    for (let d = 0; d < 60; d++) expect(["mythic", "secret"]).not.toContain(speciesOfDay(t + d * DAY).rarity);
  });

  it("streak badges come from gameConfig and point at the next one", () => {
    expect(gameConfig.streakBadges.map((b) => b.ms)).toEqual([...gameConfig.streakBadges.map((b) => b.ms)].sort((a, b) => a - b));
    expect(nextStreakBadge(null)).toBeNull();
    expect(nextStreakBadge(0)).toEqual({ label: gameConfig.streakBadges[0].label, inMs: gameConfig.streakBadges[0].ms });
    expect(nextStreakBadge(10_000 * DAY)).toBeNull();
    expect(badgeLabel("week")).toBe("7-day keeper");
  });

  it("the reminder is a valid one-event calendar file with no tracking", () => {
    const at = Date.UTC(2026, 9, 22, 14, 30, 0);
    const ics = milestoneIcs({ title: "Driftfin becomes Evolved", at, url: "https://example.test/hatchery", now: at - DAY });
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20261022T143000Z");
    expect(ics).toContain("SUMMARY:Solanites: Driftfin becomes Evolved");
    expect(ics.split("\r\n").filter((l) => l === "BEGIN:VEVENT")).toHaveLength(1);
  });
});
