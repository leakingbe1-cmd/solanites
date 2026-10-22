import { gameConfig } from "@/config/gameConfig";
import { SPECIES, type Species } from "@/lib/species";

/**
 * Small daily reasons to come back, none of them chance-based or paid: a species of the day, a
 * calendar reminder for the next milestone, and the cosmetic streak badges (computed on the server).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Common to Legendary only, so Mythic and Secret are never spotlighted. SPECIES order is kept as is. */
const SPOTLIGHT = SPECIES.filter((s) => s.rarity !== "mythic" && s.rarity !== "secret");

/** The same species for everyone on a UTC day; it changes at 00:00 UTC. */
export function speciesOfDay(now: number): Species {
  return SPOTLIGHT[Math.floor(now / DAY_MS) % SPOTLIGHT.length];
}

/** The next streak badge still to earn, and how long until it, or null when all are earned or not holding. */
export function nextStreakBadge(heldMs: number | null): { label: string; inMs: number } | null {
  if (heldMs === null) return null;
  const next = gameConfig.streakBadges.find((b) => heldMs < b.ms);
  return next ? { label: next.label, inMs: next.ms - heldMs } : null;
}

export const badgeLabel = (id: string) => gameConfig.streakBadges.find((b) => b.id === id)?.label ?? id;

const icsTime = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

/** A one-event calendar file for a milestone: a reminder the visitor saves themselves; nothing is sent anywhere. */
export function milestoneIcs({ title, at, url, now }: { title: string; at: number; url: string; now: number }): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Solanites//Hatchery reminder//EN",
    "BEGIN:VEVENT",
    `UID:${at}-${Math.abs(title.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7))}@solanites`,
    `DTSTAMP:${icsTime(now)}`,
    `DTSTART:${icsTime(at)}`,
    `DTEND:${icsTime(at + 15 * 60 * 1000)}`,
    `SUMMARY:${icsText(`Solanites: ${title}`)}`,
    `DESCRIPTION:${icsText(`Check your Hatchery: ${url}`)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
