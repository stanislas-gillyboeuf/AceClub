import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoBooking } from "../../../db/schema";
import { buildIcsEvent } from "../lib/ics";

export const getBookingIcs = async (c: Context<HonoContext>) => {
  const cancelToken = c.req.param("cancelToken");

  const [booking] = await db
    .select()
    .from(demoBooking)
    .where(eq(demoBooking.cancelToken, cancelToken))
    .limit(1);

  if (!booking) {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }

  const ics = buildIcsEvent({
    uid: `demo-booking-${booking.id}@ace-club.app`,
    start: booking.startAt,
    end: booking.endAt,
    summary: `Démo Ace Club — ${booking.clubName}`,
    description: booking.googleMeetLink ? `Lien Google Meet : ${booking.googleMeetLink}` : "Démo Ace Club",
    location: booking.googleMeetLink ?? undefined,
  });

  c.header("Content-Type", "text/calendar; charset=utf-8");
  c.header("Content-Disposition", 'attachment; filename="demo-ace-club.ics"');
  return c.body(ics);
};
