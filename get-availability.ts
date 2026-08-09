import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking } from "../../../db/schema/court/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { z } from "zod";
import { getAvailabilityValidator } from "../validators";

// Club opening hours for slot generation. Adjust here if a club has different hours.
const OPENING_HOUR = 8;
const CLOSING_HOUR = 22;

export const getAvailability = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof getAvailabilityValidator>;

  const [courtRecord] = await db.select().from(court).where(eq(court.id, query.courtId)).limit(1);

  if (!courtRecord) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  const dayStart = new Date(`${query.date}T00:00:00.000Z`);
  if (Number.isNaN(dayStart.getTime())) {
    return c.json({ error: "BadRequest", message: "Invalid date, expected YYYY-MM-DD" }, 400);
  }
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const existingBookings = await db
    .select()
    .from(courtBooking)
    .where(
      and(
        eq(courtBooking.courtId, query.courtId),
        eq(courtBooking.status, "confirmed"),
        gte(courtBooking.startTime, dayStart),
        lt(courtBooking.startTime, dayEnd),
      ),
    );

  const takenStartTimes = new Set(existingBookings.map((b) => b.startTime.toISOString()));

  const slots = [];
  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    const slotStart = new Date(dayStart);
    slotStart.setUTCHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setUTCHours(hour + 1, 0, 0, 0);

    slots.push({
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      available: !takenStartTimes.has(slotStart.toISOString()),
    });
  }

  return c.json({
    data: {
      court: courtRecord,
      date: query.date,
      slots,
    },
  });
};
