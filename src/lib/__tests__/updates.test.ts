import { describe, expect, it } from "vitest";
import { UPDATES } from "@/data/updates";

/** The shipping log: dated, newest first, and free of launch details or promises. */
describe("shipping log", () => {
  it("is dated, unique per day and newest first", () => {
    const dates = UPDATES.map((u) => u.date);
    for (const d of dates) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Set(dates).size).toBe(dates.length);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("never mentions a contract address, buy links, launch dates or returns", () => {
    const text = JSON.stringify(UPDATES);
    expect(text).not.toMatch(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
    expect(text).not.toMatch(/\b(buy|pump\.fun|dexscreener|launch(es|ing)? on|guarantee|profit|returns?|moon|x100)\b/i);
    expect(text).not.toMatch(/\b(mythic|secret)\b/i);
  });
});
