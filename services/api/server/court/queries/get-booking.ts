import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking, courtBookingParticipant, user } from "../../../db/schema";

export const getBooking = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  const bookingId = c.req.param("bookingId");

  const [row] = await db
    .select({
      id: courtBooking.id,
      courtId: courtBooking.courtId,
      userId: courtBooking.userId,
      startAt: courtBooking.startAt,
      endAt: courtBooking.endAt,
      status: courtBooking.status,
      purpose: courtBooking.purpose,
      bookedAsClub: courtBooking.bookedAsClub,
      createdAt: courtBooking.createdAt,
      courtName: court.name,
      organizationId: court.organizationId,
      sport: court.sport,
      surface: court.surface,
      indoor: court.indoor,
      cancellationPolicy: court.cancellationPolicy,
      cancellationWindowHours: court.cancellationWindowHours,
    })
    .from(courtBooking)
    .innerJoin(court, eq(courtBooking.courtId, court.id))
    .where(eq(courtBooking.id, bookingId))
    .limit(1);

  if (!row) {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }

  if (row.userId !== currentUser.id) {
    return c.json({ error: "Forbidden", message: "Not your booking" }, 403);
  }

  const participantRows = await db
    .select({
      slotIndex: courtBookingParticipant.slotIndex,
      userId: courtBookingParticipant.userId,
      guestName: courtBookingParticipant.guestName,
      userName: user.name,
    })
    .from(courtBookingParticipant)
    .leftJoin(user, eq(user.id, courtBookingParticipant.userId))
    .where(eq(courtBookingParticipant.bookingId, bookingId))
    .orderBy(courtBookingParticipant.slotIndex);

  const participants = participantRows.map((p) => ({
    slotIndex: p.slotIndex,
    userId: p.userId,
    name: p.guestName ?? p.userName ?? null,
  }));

  return c.json({ ...row, participants });
};
