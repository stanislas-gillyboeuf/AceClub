import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "../../../db";
import { court, courseEnrollment, courtBooking, courtBookingParticipant } from "../../../db/schema";
import { sendBatchNotifications } from "../../../services/expo-push/broadcast-service";

const REMINDER_WINDOW_MIN_MS = 90 * 60 * 1000;
const REMINDER_WINDOW_MAX_MS = 150 * 60 * 1000;

/** Sends a ~2h-before push reminder to everyone concerned by an upcoming confirmed booking or
 * course session — idempotent via `reminderSentAt`, safe to run as often as every few minutes. */
export async function sendBookingReminders(): Promise<{ sent: number }> {
  const now = Date.now();
  const windowStart = new Date(now + REMINDER_WINDOW_MIN_MS);
  const windowEnd = new Date(now + REMINDER_WINDOW_MAX_MS);

  const dueBookings = await db
    .select({
      id: courtBooking.id,
      userId: courtBooking.userId,
      startAt: courtBooking.startAt,
      kind: courtBooking.kind,
      courseId: courtBooking.courseId,
      courtName: court.name,
    })
    .from(courtBooking)
    .innerJoin(court, eq(courtBooking.courtId, court.id))
    .where(
      and(
        eq(courtBooking.status, "confirmed"),
        isNull(courtBooking.reminderSentAt),
        gte(courtBooking.startAt, windowStart),
        lte(courtBooking.startAt, windowEnd),
      ),
    );

  let sent = 0;

  for (const booking of dueBookings) {
    let recipientIds: string[] = [];

    if (booking.kind === "course" && booking.courseId) {
      const roster = await db
        .select({ userId: courseEnrollment.userId })
        .from(courseEnrollment)
        .where(eq(courseEnrollment.courseId, booking.courseId));
      recipientIds = roster.map((r) => r.userId);
    } else if (booking.kind === "member") {
      const participants = await db
        .select({ userId: courtBookingParticipant.userId })
        .from(courtBookingParticipant)
        .where(eq(courtBookingParticipant.bookingId, booking.id));
      recipientIds = [
        booking.userId,
        ...participants.map((p) => p.userId).filter((id): id is string => !!id),
      ];
    }

    if (recipientIds.length > 0) {
      const time = booking.startAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      await sendBatchNotifications([...new Set(recipientIds)], {
        type: booking.kind === "course" ? "class_reminder" : "booking_reminder",
        title: booking.kind === "course" ? "Cours dans 2h" : "Réservation dans 2h",
        body: `${booking.courtName} à ${time}`,
        data: { referenceId: booking.id },
      });
      sent++;
    }

    await db
      .update(courtBooking)
      .set({ reminderSentAt: new Date() })
      .where(eq(courtBooking.id, booking.id));
  }

  return { sent };
}
