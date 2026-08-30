import { fromZonedTime } from "date-fns-tz";

export const CLUB_TIMEZONE = "Europe/Paris";

/** Builds the correct UTC instant for a wall-clock date+time in CLUB_TIMEZONE, DST-aware. */
export function zonedDateTime(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, CLUB_TIMEZONE);
}
