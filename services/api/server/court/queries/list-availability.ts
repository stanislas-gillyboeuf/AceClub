import { Context } from "hono";
import { z } from "zod";
import { and, eq, gte, lt } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking } from "../../../db/schema";
import { listAvailabilityValidator } from "../validators";
import { buildDaySlots } from "../lib/slots";
import { canAccessCourt } from "../lib/access";
import { getCourtSettings } from "../lib/settings";

export const listAvailability = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listAvailabilityValidator>;

  const [targetCourt] = await db
    .select({
      organizationId: court.organizationId,
      accessPolicy: court.accessPolicy,
      slotDurationMinutes: court.slotDurationMinutes,
    })
    .from(court)
    .where(eq(court.id, query.courtId))
    .limit(1);

  if (!targetCourt) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  const allowed = await canAccessCourt(
    currentUser.id,
    targetCourt.organizationId,
    targetCourt.accessPolicy,
  );
  if (!allowed) {
    return c.json({ error: "Forbidden", message: "This court is reserved to club members" }, 403);
  }

  const settings = await getCourtSettings(targetCourt.organizationId);

  const dayStart = new Date(`${query.date}T00:00:00`);
  const dayEnd = new Date(`${query.date}T23:59:59`);

  const bookings = await db
    .select({
      startAt: courtBooking.startAt,
      endAt: courtBooking.endAt,
      purpose: courtBooking.purpose,
      bookedAsClub: courtBooking.bookedAsClub,
    })
    .from(courtBooking)
    .where(
      and(
        eq(courtBooking.courtId, query.courtId),
        eq(courtBooking.status, "confirmed"),
        gte(courtBooking.startAt, dayStart),
        lt(courtBooking.startAt, dayEnd),
      ),
    );

  const slots = buildDaySlots(query.date, {
    openingHour: settings.openingHour,
    closingHour: settings.closingHour,
    slotDurationMinutes: targetCourt.slotDurationMinutes,
  }).map((slot) => {
    const taken = bookings.find((b) => slot.start < b.endAt && slot.end > b.startAt);
    return {
      startTime: slot.startTime,
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      available: !taken,
      bookedAsClub: taken?.bookedAsClub ?? false,
      purpose: taken?.purpose ?? null,
    };
  });

  return c.json({ courtId: query.courtId, date: query.date, slots });
};
