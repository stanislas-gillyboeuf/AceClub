import { schedules } from "@trigger.dev/sdk";
import { db } from "../db";
import { court, courtBooking, courtBookingParticipant } from "../db/schema";
import { and, count, eq, inArray, lte } from "drizzle-orm";
import { PADEL_TEAM_COMPLETION_WINDOW_HOURS, PADEL_TEAM_SIZE } from "../server/court/lib/padel";

/**
 * Releases padel bookings whose team isn't complete (creator + up to 3 named
 * partners) once we're within PADEL_TEAM_COMPLETION_WINDOW_HOURS of the slot.
 * Runs every 10 minutes.
 */
export const releaseIncompletePadelBookingsTask = schedules.task({
  id: "release-incomplete-padel-bookings",
  cron: {
    pattern: "*/10 * * * *",
    timezone: "UTC",
  },
  run: async (payload) => {
    console.log(
      `[TRIGGER] Starting release-incomplete-padel-bookings at ${payload.timestamp.toISOString()}`,
    );

    const deadline = new Date(Date.now() + PADEL_TEAM_COMPLETION_WINDOW_HOURS * 60 * 60 * 1000);

    const candidates = await db
      .select({
        id: courtBooking.id,
        participantCount: count(courtBookingParticipant.id),
      })
      .from(courtBooking)
      .innerJoin(court, eq(courtBooking.courtId, court.id))
      .leftJoin(courtBookingParticipant, eq(courtBookingParticipant.bookingId, courtBooking.id))
      .where(
        and(
          eq(court.sport, "padel"),
          eq(courtBooking.status, "confirmed"),
          lte(courtBooking.startAt, deadline),
        ),
      )
      .groupBy(courtBooking.id);

    const incompleteIds = candidates
      .filter((row) => row.participantCount < PADEL_TEAM_SIZE)
      .map((row) => row.id);

    if (incompleteIds.length === 0) {
      console.log("[TRIGGER] No incomplete padel bookings to release");
      return { success: true, releasedCount: 0, timestamp: payload.timestamp };
    }

    await db
      .update(courtBooking)
      .set({ status: "cancelled" })
      .where(inArray(courtBooking.id, incompleteIds));

    console.log(`[TRIGGER] Released ${incompleteIds.length} incomplete padel bookings`);

    return {
      success: true,
      releasedCount: incompleteIds.length,
      timestamp: payload.timestamp,
    };
  },
});
