import { fromZonedTime } from "date-fns-tz";

/** Builds the correct UTC instant for a wall-clock "YYYY-MM-DD" date + "HH:mm" time in `timeZone`, DST-aware. */
export function zonedDateTime(date: string, time: string, timeZone: string): Date {
  return fromZonedTime(`${date}T${time}:00`, timeZone);
}

/** "YYYY-MM-DD" of `instant` as seen from `timeZone` — a pure calendar date, not a UTC slice. */
export function dateStringInTimeZone(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Adds `days` to a "YYYY-MM-DD" calendar date — weekday-safe, timezone-agnostic (a calendar date has one weekday everywhere). */
export function addDaysToDateString(dateString: string, days: number): string {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 (Sunday) .. 6 (Saturday) for a "YYYY-MM-DD" calendar date. */
export function weekdayOfDateString(dateString: string): number {
  return new Date(`${dateString}T00:00:00Z`).getUTCDay();
}
