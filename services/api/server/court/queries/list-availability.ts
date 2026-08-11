import { Context } from "hono";
import { z } from "zod";
import { and, eq, gte, lt } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtBooking } from "../../../db/schema";
import { listAvailabilityValidator } from "../validators";
import { buildDaySlots } from "../lib/slots";

export const listAvailability = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listAvailabilityValidator>;

  const dayStart = new Date(`${query.date}T00:00:00`);
  const dayEnd = new Date(`${query.date}T23:59:59`);

  const bookings = await db
    .select({ startAt: courtBooking.startAt, endAt: courtBooking.endAt })
    .from(courtBooking)
    .where(
      and(
        eq(courtBooking.courtId, query.courtId),
        eq(courtBooking.status, "confirmed"),
        gte(courtBooking.startAt, dayStart),
        lt(courtBooking.startAt, dayEnd),
      ),
    );

  const slots = buildDaySlots(query.date).map((slot) => {
    const isTaken = bookings.some(
      (b) => slot.start < b.endAt && slot.end > b.startAt,
    );
    return {
      startTime: slot.startTime,
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      available: !isTaken,
    };
  });

  return c.json({ courtId: query.courtId, date: query.date, slots });
};
