import { describe, expect, it } from "vitest";
import { GROWTH_RULES, dailyChangePct, growthEntries, growthPoints, vigourBand, vigourOf, type GrowthEntry } from "@/lib/market/growth";

const entry = (date: string, changePct: number): GrowthEntry => ({ date, previousDate: "", previousClose: 100, close: 100 + changePct, changePct, points: growthPoints(changePct) });

describe("Market Vigour formula (rules v1)", () => {
  it("documents the rules it implements", () => {
    expect(GROWTH_RULES).toMatchObject({ version: 1, pointsPerPercent: 4, dailyCap: 10, windowSessions: 20, neutral: 50, min: 0, max: 100 });
  });

  it("matches the brief's examples: +2.5% earns +10, −1.8% costs −7.2", () => {
    expect(growthPoints(2.5)).toBe(10);
    expect(growthPoints(-1.8)).toBe(-7.2);
  });

  it("is bounded: extreme moves are capped at ±10 points a day", () => {
    expect(growthPoints(40)).toBe(10);
    expect(growthPoints(-63)).toBe(-10);
    expect(growthPoints(0)).toBe(0);
  });

  it("is symmetric and rounds to 0.1", () => {
    for (const p of [0.01, 0.0125, 0.333, 1.2345, 2.4999]) expect(growthPoints(-p) + growthPoints(p)).toBe(0);
    expect(growthPoints(0.3333)).toBe(1.3);
  });

  it("never turns bad data into a move", () => {
    expect(growthPoints(NaN)).toBe(0);
    expect(growthPoints(Infinity)).toBe(0);
    expect(dailyChangePct(0, 10)).toBeNull();
    expect(dailyChangePct(10, -1)).toBeNull();
    expect(dailyChangePct(NaN, 10)).toBeNull();
  });

  it("computes daily change from consecutive closes, newest value winning for a repeated date", () => {
    const e = growthEntries([
      { date: "2026-10-16", close: 200 },
      { date: "2026-10-15", close: 190 },
      { date: "2026-10-16", close: 199.5 }, // corrected value for the same session
      { date: "bad", close: 1 },
    ]);
    expect(e).toHaveLength(1);
    expect(e[0]).toMatchObject({ date: "2026-10-16", previousDate: "2026-10-15", previousClose: 190, close: 199.5, changePct: 5, points: 10 });
  });

  it("skips sessions with unusable prices instead of inventing a move across them", () => {
    const e = growthEntries([
      { date: "2026-10-14", close: 100 },
      { date: "2026-10-15", close: 0 },
      { date: "2026-10-16", close: 102 },
    ]);
    // 14→15 and 15→16 both involve the bad close, so nothing is recorded.
    expect(e).toEqual([]);
  });

  it("vigour is 50 plus the last 20 sessions' points, clamped to 0–100, and deterministic", () => {
    const days = Array.from({ length: 30 }, (_, i) => entry(`2026-09-${String(i + 1).padStart(2, "0")}`, i < 10 ? -5 : 1));
    const v = vigourOf(days);
    // Only the newest 20 count: all +1% days, +4 points each.
    expect(v.window).toHaveLength(20);
    expect(v.value).toBe(100); // 50 + 80, clamped
    expect(vigourOf([...days].reverse())).toEqual(v); // order of input doesn't matter
    expect(vigourOf(days.map((d) => ({ ...d, changePct: -3, points: growthPoints(-3) }))).value).toBe(0);
  });

  it("a mixed month lands where the arithmetic says", () => {
    const moves = [2.5, -1.8, 0.6, -0.4, 1.1];
    const v = vigourOf(moves.map((m, i) => entry(`2026-10-0${i + 1}`, m)));
    // 10 − 7.2 + 2.4 − 1.6 + 4.4 = 8 → 58
    expect(v.value).toBe(58);
    expect(v.label).toBe("Stirring");
  });

  it("bands cover the whole scale", () => {
    expect(vigourBand(0).band).toBe("dormant");
    expect(vigourBand(30).band).toBe("subdued");
    expect(vigourBand(50).band).toBe("steady");
    expect(vigourBand(56).band).toBe("stirring");
    expect(vigourBand(70).band).toBe("surging");
    expect(vigourBand(100).band).toBe("surging");
  });
});
