import { Context } from "hono";
import { z } from "zod";
import { and, eq, gte, inArray, lt, or, asc, desc } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtBooking, court, courtBookingParticipant, organization } from "../../../db/schema";
import { listMyBookingsValidator } from "../validators";

export const listMyBookings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listMyBookingsValidator>;

  const now = new Date();

  const conditions =
    query.filter === "upcoming"
      ? and(
          eq(courtBooking.userId, currentUser.id),
          eq(courtBooking.status, "confirmed"),
          gte(courtBooking.startAt, now),
        )
      : query.filter === "past"
        ? and(
            eq(courtBooking.userId, currentUser.id),
            or(lt(courtBooking.startAt, now), eq(courtBooking.status, "cancelled")),
          )
        : eq(courtBooking.userId, currentUser.id);

  const rows = await db
    .select({
      id: courtBooking.id,
      courtId: courtBooking.courtId,
      startAt: courtBooking.startAt,
      endAt: courtBooking.endAt,
      status: courtBooking.status,
      purpose: courtBooking.purpose,
      bookedAsClub: courtBooking.bookedAsClub,
      createdAt: courtBooking.createdAt,
      courtName: court.name,
      sport: court.sport,
      organizationId: court.organizationId,
      organizationName: organization.name,
    })
    .from(courtBooking)
    .innerJoin(court, eq(courtBooking.courtId, court.id))
    .innerJoin(organization, eq(court.organizationId, organization.id))
    .where(conditions)
    .orderBy(query.filter === "upcoming" ? asc(courtBooking.startAt) : desc(courtBooking.startAt));

  const bookingIds = rows.map((r) => r.id);
  const participantRows = bookingIds.length
    ? await db
        .select({ bookingId: courtBookingParticipant.bookingId, guestName: courtBookingParticipant.guestName })
        .from(courtBookingParticipant)
        .where(inArray(courtBookingParticipant.bookingId, bookingIds))
    : [];

  const participantCountByBooking = new Map<string, number>();
  for (const p of participantRows) {
    participantCountByBooking.set(p.bookingId, (participantCountByBooking.get(p.bookingId) ?? 0) + 1);
  }

  return c.json(
    rows.map((row) => ({ ...row, participantCount: participantCountByBooking.get(row.id) ?? 0 })),
  );
};
