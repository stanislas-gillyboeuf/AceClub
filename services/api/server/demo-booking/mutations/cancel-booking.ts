import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoBooking } from "../../../db/schema";
import { getActiveGoogleConnection } from "../lib/google-connection";
import { deleteEvent } from "../../../lib/google-calendar";
import { sendCancellationEmail } from "../lib/emails";

export const cancelBooking = async (c: Context<HonoContext>) => {
  const cancelToken = c.req.param("cancelToken");

  const [booking] = await db
    .select()
    .from(demoBooking)
    .where(eq(demoBooking.cancelToken, cancelToken))
    .limit(1);

  if (!booking) {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }
  if (booking.status === "cancelled") {
    return c.json(booking);
  }

  const [updated] = await db
    .update(demoBooking)
    .set({ status: "cancelled" })
    .where(eq(demoBooking.id, booking.id))
    .returning();

  const connection = await getActiveGoogleConnection();
  if (connection && booking.googleEventId) {
    try {
      await deleteEvent(connection.refreshToken, connection.calendarId, booking.googleEventId);
    } catch {
      // Best-effort — the booking is cancelled in our system regardless of a transient Google error.
    }
  }

  await sendCancellationEmail(updated);

  return c.json(updated);
};
