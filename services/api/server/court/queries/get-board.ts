import { Context } from "hono";
import { z } from "zod";
import { and, eq, gte, inArray, lt } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking, user } from "../../../db/schema";
import { boardQueryValidator } from "../validators";
import { canAccessCourt } from "../lib/access";
import { getCourtSettings } from "../lib/settings";
import { zonedDateTime } from "../lib/timezone";

function bookedByLabel(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

export const getBoard = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof boardQueryValidator>;

  const settings = await getCourtSettings(query.organizationId);

  const orgCourts = await db
    .select()
    .from(court)
    .where(
      and(
        eq(court.organizationId, query.organizationId),
        eq(court.sport, query.sport),
        eq(court.isActive, true),
      ),
    );

  const accessibleCourts = (
    await Promise.all(
      orgCourts.map(async (row) => ({
        court: row,
        allowed: await canAccessCourt(currentUser.id, query.organizationId, row.accessPolicy),
      })),
    )
  )
    .filter((row) => row.allowed)
    .map((row) => row.court);

  const courtIds = accessibleCourts.map((c) => c.id);
  const dayStart = zonedDateTime(query.date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const bookings =
    courtIds.length === 0
      ? []
      : await db
          .select({
            courtId: courtBooking.courtId,
            userId: courtBooking.userId,
            startAt: courtBooking.startAt,
            endAt: courtBooking.endAt,
            purpose: courtBooking.purpose,
            bookedAsClub: courtBooking.bookedAsClub,
            bookerName: user.name,
          })
          .from(courtBooking)
          .innerJoin(user, eq(courtBooking.userId, user.id))
          .where(
            and(
              inArray(courtBooking.courtId, courtIds),
              eq(courtBooking.status, "confirmed"),
              gte(courtBooking.startAt, dayStart),
              lt(courtBooking.startAt, dayEnd),
            ),
          );

  const now = new Date();
  const hourList: number[] = [];
  for (let h = settings.openingHour; h < settings.closingHour; h++) hourList.push(h);

  const courts = accessibleCourts.map((c) => {
    const hours = hourList.map((hour) => {
      const slotStart = zonedDateTime(query.date, `${String(hour).padStart(2, "0")}:00`);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

      if (slotStart.getTime() < now.getTime()) {
        return { hour, status: "past" as const };
      }

      const taken = bookings.find(
        (b) => b.courtId === c.id && slotStart < b.endAt && slotEnd > b.startAt,
      );
      if (!taken) return { hour, status: "free" as const };

      if (taken.userId === currentUser.id) {
        return { hour, status: "mine" as const, purpose: taken.purpose, bookedAsClub: taken.bookedAsClub };
      }
      return {
        hour,
        status: "booked" as const,
        bookedByLabel: taken.bookedAsClub ? "Le club" : bookedByLabel(taken.bookerName),
        bookedAsClub: taken.bookedAsClub,
        purpose: taken.purpose,
      };
    });

    return {
      id: c.id,
      name: c.name,
      surface: c.surface,
      indoor: c.indoor,
      accessPolicy: c.accessPolicy,
      cancellationPolicy: c.cancellationPolicy,
      cancellationWindowHours: c.cancellationWindowHours,
      pricePerHour: c.pricePerHour,
      slotDurationMinutes: c.slotDurationMinutes,
      hours,
    };
  });

  return c.json({ date: query.date, sport: query.sport, courts });
};
