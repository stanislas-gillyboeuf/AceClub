import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "../../../db";
import { court, courtBooking } from "../../../db/schema";

export function isWeekend(date: Date): boolean {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

/** Monday 00:00 (inclusive) to the following Monday 00:00 (exclusive) containing `date`. */
export function getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() + diffToMonday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return { weekStart, weekEnd };
}

export interface WeeklyUsage {
  weekday: number;
  weekend: number;
}

/**
 * Counts this user's own confirmed bookings (excludes bookedAsClub) across every
 * court of the organization, for the calendar week containing `referenceDate`.
 */
export async function countWeeklyBookings(
  userId: string,
  organizationId: string,
  referenceDate: Date,
): Promise<WeeklyUsage> {
  const { weekStart, weekEnd } = getWeekBounds(referenceDate);

  const orgCourts = await db
    .select({ id: court.id })
    .from(court)
    .where(eq(court.organizationId, organizationId));
  const courtIds = orgCourts.map((c) => c.id);

  if (courtIds.length === 0) {
    return { weekday: 0, weekend: 0 };
  }

  const bookings = await db
    .select({ startAt: courtBooking.startAt })
    .from(courtBooking)
    .where(
      and(
        inArray(courtBooking.courtId, courtIds),
        eq(courtBooking.userId, userId),
        eq(courtBooking.status, "confirmed"),
        eq(courtBooking.bookedAsClub, false),
        gte(courtBooking.startAt, weekStart),
        lt(courtBooking.startAt, weekEnd),
      ),
    );

  let weekday = 0;
  let weekend = 0;
  for (const b of bookings) {
    if (isWeekend(b.startAt)) weekend++;
    else weekday++;
  }

  return { weekday, weekend };
}
