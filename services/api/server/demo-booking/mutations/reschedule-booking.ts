import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoBooking } from "../../../db/schema";
import { rescheduleDemoBookingValidator } from "../validators";
import { loadSlotComputationContext } from "../lib/load-context";
import { computeAvailableSlots } from "../lib/slot-calculator";
import { rescheduleLockedDemoBooking } from "../lib/booking-lock";
import { DemoBookingConflictError } from "../lib/errors";
import { checkDemoBookingWriteRateLimit, demoBookingClientIp } from "../lib/rate-limit";
import { getActiveGoogleConnection } from "../lib/google-connection";
import { updateEvent } from "../../../lib/google-calendar";
import { sendRescheduleConfirmationEmail } from "../lib/emails";

export const rescheduleBooking = async (c: Context<HonoContext>) => {
  const cancelToken = c.req.param("cancelToken");
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof rescheduleDemoBookingValidator>;

  const ip = demoBookingClientIp(c.req.header("x-forwarded-for"), c.req.header("x-real-ip"));
  const rateLimit = checkDemoBookingWriteRateLimit(ip);
  if (!rateLimit.allowed) {
    return c.json(
      { error: "TooManyRequests", message: "Trop de tentatives, réessaie dans un instant" },
      429,
    );
  }

  const [booking] = await db
    .select()
    .from(demoBooking)
    .where(eq(demoBooking.cancelToken, cancelToken))
    .limit(1);

  if (!booking || booking.status === "cancelled") {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }

  const requestedStart = new Date(body.startAt);

  const context = await loadSlotComputationContext(booking.id);
  const availableSlots = computeAvailableSlots(context);
  const matchingSlot = availableSlots.find((s) => s.start.getTime() === requestedStart.getTime());

  if (!matchingSlot) {
    return c.json({ error: "Conflict", message: "Ce créneau n'est plus disponible" }, 409);
  }

  let updated;
  try {
    updated = await rescheduleLockedDemoBooking({
      bookingId: booking.id,
      start: matchingSlot.start,
      end: matchingSlot.end,
      bufferBeforeMinutes: context.settings.bufferBeforeMinutes,
      bufferAfterMinutes: context.settings.bufferAfterMinutes,
    });
  } catch (error) {
    if (error instanceof DemoBookingConflictError) {
      return c.json({ error: "Conflict", message: error.message }, 409);
    }
    throw error;
  }

  const connection = await getActiveGoogleConnection();
  if (connection && booking.googleEventId) {
    try {
      await updateEvent(connection.refreshToken, connection.calendarId, booking.googleEventId, {
        startAt: matchingSlot.start,
        endAt: matchingSlot.end,
      });
    } catch {
      // Best-effort — our own record is the source of truth; a stale Google event is surfaced
      // separately if the connection later fails outright.
    }
  }

  await sendRescheduleConfirmationEmail(updated);

  return c.json(updated);
};
