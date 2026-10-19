/**
 * US equity trading calendar (NYSE and Nasdaq share it): sessions, holidays, early closes and
 * the market's current state, all in exchange time (America/New_York).
 *
 * Used for labels and staleness only. Growth is computed from the sessions the data provider
 * actually reports, so a calendar mistake can never invent or skip a price move.
 *
 * Holidays and early closes are the exchanges' published schedules for 2025–2027. Beyond
 * 2027 the calendar falls back to weekdays and says so (`calendarKnown: false`); extend
 * HOLIDAYS when the exchanges publish the next year.
 */

const HOLIDAYS: Record<string, string> = {
  // 2025
  "2025-01-01": "New Year's Day", "2025-01-09": "National Day of Mourning", "2025-01-20": "Martin Luther King Jr. Day",
  "2025-02-17": "Washington's Birthday", "2025-04-18": "Good Friday", "2025-05-26": "Memorial Day", "2025-06-19": "Juneteenth",
  "2025-07-04": "Independence Day", "2025-09-01": "Labor Day", "2025-11-27": "Thanksgiving Day", "2025-12-25": "Christmas Day",
  // 2026
  "2026-01-01": "New Year's Day", "2026-01-19": "Martin Luther King Jr. Day", "2026-02-16": "Washington's Birthday",
  "2026-04-03": "Good Friday", "2026-05-25": "Memorial Day", "2026-06-19": "Juneteenth", "2026-07-03": "Independence Day (observed)",
  "2026-09-07": "Labor Day", "2026-11-26": "Thanksgiving Day", "2026-12-25": "Christmas Day",
  // 2027
  "2027-01-01": "New Year's Day", "2027-01-18": "Martin Luther King Jr. Day", "2027-02-15": "Washington's Birthday",
  "2027-03-26": "Good Friday", "2027-05-31": "Memorial Day", "2027-06-18": "Juneteenth (observed)", "2027-07-05": "Independence Day (observed)",
  "2027-09-06": "Labor Day", "2027-11-25": "Thanksgiving Day", "2027-12-24": "Christmas Day (observed)",
};

/** Sessions that close at 1:00 pm instead of 4:00 pm. */
const EARLY_CLOSES = new Set(["2025-07-03", "2025-11-28", "2025-12-24", "2026-11-27", "2026-12-24", "2027-11-26"]);

const KNOWN_FROM = "2025-01-01";
const KNOWN_TO = "2027-12-31";

const OPEN_MIN = 9 * 60 + 30;
const CLOSE_MIN = 16 * 60;
const EARLY_CLOSE_MIN = 13 * 60;

export const EXCHANGE_TIME_ZONE = "America/New_York";

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: EXCHANGE_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
});

/** The exchange-local date (YYYY-MM-DD), minute of the day and weekday for an instant. */
export function exchangeClock(ms: number): { date: string; minute: number; weekday: string } {
  const p = Object.fromEntries(fmt.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minute: Number(p.hour) * 60 + Number(p.minute), weekday: p.weekday };
}

const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay(); // 0 Sun … 6 Sat

export function calendarKnown(date: string): boolean {
  return date >= KNOWN_FROM && date <= KNOWN_TO;
}

export function holidayName(date: string): string | null {
  return HOLIDAYS[date] ?? null;
}

export function isTradingDay(date: string): boolean {
  const wd = weekdayOf(date);
  return wd !== 0 && wd !== 6 && !HOLIDAYS[date];
}

/** Minute of the day the session closes (exchange time). */
export function closeMinute(date: string): number {
  return EARLY_CLOSES.has(date) ? EARLY_CLOSE_MIN : CLOSE_MIN;
}

export function previousTradingDay(date: string): string {
  let d = addDays(date, -1);
  while (!isTradingDay(d)) d = addDays(d, -1);
  return d;
}

export type MarketState = "open" | "pre_market" | "after_hours" | "closed";

export interface MarketStatus {
  state: MarketState;
  /** Exchange-local date right now. */
  date: string;
  /** Why the market is closed today, when it is a holiday or weekend. */
  reason: "weekend" | "holiday" | null;
  holiday: string | null;
  earlyClose: boolean;
  calendarKnown: boolean;
}

export function marketStatus(nowMs: number): MarketStatus {
  const { date, minute } = exchangeClock(nowMs);
  const known = calendarKnown(date);
  const wd = weekdayOf(date);
  const base = { date, holiday: holidayName(date), earlyClose: EARLY_CLOSES.has(date), calendarKnown: known };
  if (wd === 0 || wd === 6) return { ...base, state: "closed", reason: "weekend" };
  if (HOLIDAYS[date]) return { ...base, state: "closed", reason: "holiday" };
  if (minute < OPEN_MIN) return { ...base, state: "pre_market", reason: null };
  if (minute < closeMinute(date)) return { ...base, state: "open", reason: null };
  return { ...base, state: "after_hours", reason: null };
}

/**
 * The newest session whose closing data should be published by `nowMs`. End-of-day data
 * appears some time after the close, so a session only counts once `publishLagMin` has passed.
 */
export function latestCompletedSession(nowMs: number, publishLagMin = 90): string {
  const { date, minute } = exchangeClock(nowMs);
  if (isTradingDay(date) && minute >= closeMinute(date) + publishLagMin) return date;
  return previousTradingDay(date);
}
