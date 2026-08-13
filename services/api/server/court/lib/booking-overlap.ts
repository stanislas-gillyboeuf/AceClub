import { and, eq, gt, lt, sql } from "drizzle-orm";
import { db } from "../../../db";
import { courtBooking, courtBookingParticipant } from "../../../db/schema";
import { BookingConflictError } from "./errors";

interface BookingParticipantInput {
  userId?: string;
  guestName?: string;
}

interface CreateLockedBookingParams {
  courtId: string;
  userId: string;
  start: Date;
  end: Date;
  purpose?: string | null;
  bookedAsClub?: boolean;
  participants?: BookingParticipantInput[];
}

/**
 * Creates a court booking inside a transaction guarded by a Postgres advisory
 * lock scoped to the court, so two concurrent requests for the same court can
 * never both pass the overlap check. Throws BookingConflictError if the slot
 * is already taken.
 */
export async function createLockedBooking(params: CreateLockedBookingParams) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${params.courtId}))`);

    const [overlapping] = await tx
      .select({ id: courtBooking.id })
      .from(courtBooking)
      .where(
        and(
          eq(courtBooking.courtId, params.courtId),
          eq(courtBooking.status, "confirmed"),
          lt(courtBooking.startAt, params.end),
          gt(courtBooking.endAt, params.start),
        ),
      )
      .limit(1);

    if (overlapping) {
      throw new BookingConflictError();
    }

    const [created] = await tx
      .insert(courtBooking)
      .values({
        courtId: params.courtId,
        userId: params.userId,
        startAt: params.start,
        endAt: params.end,
        status: "confirmed",
        purpose: params.purpose ?? null,
        bookedAsClub: params.bookedAsClub ?? false,
      })
      .returning();

    if (params.participants && params.participants.length > 0) {
      await tx.insert(courtBookingParticipant).values(
        params.participants.map((participant, slotIndex) => ({
          bookingId: created.id,
          slotIndex,
          userId: participant.userId ?? null,
          guestName: participant.guestName ?? null,
        })),
      );
    }

    return created;
  });
}
