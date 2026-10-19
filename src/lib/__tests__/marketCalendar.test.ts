import { describe, expect, it } from "vitest";
import { calendarKnown, closeMinute, exchangeClock, holidayName, isTradingDay, latestCompletedSession, marketStatus, previousTradingDay } from "@/lib/market/calendar";

const at = (iso: string) => Date.parse(iso);

describe("US equity trading calendar", () => {
  it("knows weekends and 2026 holidays, including observed ones", () => {
    expect(isTradingDay("2026-10-17")).toBe(false); // Saturday
    expect(isTradingDay("2026-10-19")).toBe(true);
    expect(isTradingDay("2026-11-26")).toBe(false);
    expect(holidayName("2026-07-03")).toBe("Independence Day (observed)");
    expect(isTradingDay("2027-06-18")).toBe(false);
  });

  it("early closes end at 1:00 pm", () => {
    expect(closeMinute("2026-11-27")).toBe(13 * 60);
    expect(closeMinute("2026-10-19")).toBe(16 * 60);
  });

  it("previous session skips weekends and holidays", () => {
    expect(previousTradingDay("2026-10-19")).toBe("2026-10-16");
    expect(previousTradingDay("2026-11-27")).toBe("2026-11-25");
    expect(previousTradingDay("2026-01-02")).toBe("2025-12-31");
  });

  it("reads exchange time across daylight saving", () => {
    expect(exchangeClock(at("2026-10-19T13:30:00Z"))).toMatchObject({ date: "2026-10-19", minute: 9 * 60 + 30 }); // EDT
    expect(exchangeClock(at("2026-12-01T14:30:00Z"))).toMatchObject({ date: "2026-12-01", minute: 9 * 60 + 30 }); // EST
    expect(exchangeClock(at("2026-10-20T02:00:00Z")).date).toBe("2026-10-19"); // still Monday evening in New York
  });

  it("market state: pre-market, open, after hours, weekend and holiday", () => {
    expect(marketStatus(at("2026-10-19T12:00:00Z")).state).toBe("pre_market");
    expect(marketStatus(at("2026-10-19T15:00:00Z")).state).toBe("open");
    expect(marketStatus(at("2026-10-19T21:00:00Z")).state).toBe("after_hours");
    expect(marketStatus(at("2026-10-18T15:00:00Z"))).toMatchObject({ state: "closed", reason: "weekend" });
    expect(marketStatus(at("2026-11-26T15:00:00Z"))).toMatchObject({ state: "closed", reason: "holiday", holiday: "Thanksgiving Day" });
    expect(marketStatus(at("2026-11-27T18:30:00Z"))).toMatchObject({ state: "after_hours", earlyClose: true });
  });

  it("a session only counts as complete once its end-of-day data can have been published", () => {
    expect(latestCompletedSession(at("2026-10-19T20:30:00Z"))).toBe("2026-10-16"); // 4:30 pm: too early
    expect(latestCompletedSession(at("2026-10-19T22:00:00Z"))).toBe("2026-10-19"); // 6:00 pm
    expect(latestCompletedSession(at("2026-10-18T15:00:00Z"))).toBe("2026-10-16"); // Sunday
    expect(latestCompletedSession(at("2026-11-26T23:00:00Z"))).toBe("2026-11-25"); // Thanksgiving
  });

  it("says when it is outside the published calendar", () => {
    expect(calendarKnown("2026-06-01")).toBe(true);
    expect(calendarKnown("2028-06-01")).toBe(false);
    expect(marketStatus(at("2028-06-01T15:00:00Z")).calendarKnown).toBe(false);
  });
});
