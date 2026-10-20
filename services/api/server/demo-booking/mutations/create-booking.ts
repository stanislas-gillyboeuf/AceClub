import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoBooking } from "../../../db/schema";
import { createDemoBookingValidator } from "../validators";
import { loadSlotComputationContext } from "../lib/load-context";
import { computeAvailableSlots } from "../lib/slot-calculator";
import { createLockedDemoBooking } from "../lib/booking-lock";
import { DemoBookingConflictError } from "../lib/errors";
import { checkDemoBookingWriteRateLimit, demoBookingClientIp } from "../lib/rate-limit";
import { getActiveGoogleConnection } from "../lib/google-connection";
import { createEvent, GoogleCalendarAuthError } from "../../../lib/google-calendar";
import { getOwnerEmail } from "../lib/owner";
import { sendOwnerNewBookingEmail, sendProspectConfirmationEmail } from "../lib/emails";

export const createBooking = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof createDemoBookingValidator>;

  // Honeypot: a bot fills every field, including this hidden one — pretend success, do nothing.
  if (body.website) {
    return c.json({ ok: true }, 201);
  }

  const ip = demoBookingClientIp(c.req.header("x-forwarded-for"), c.req.header("x-real-ip"));
  const rateLimit = checkDemoBookingWriteRateLimit(ip);
  if (!rateLimit.allowed) {
    return c.json(
      { error: "TooManyRequests", message: "Trop de tentatives, réessaie dans un instant" },
      429,
    );
  }

  const requestedStart = new Date(body.startAt);

  const context = await loadSlotComputationContext();
  const availableSlots = computeAvailableSlots(context);
  const matchingSlot = availableSlots.find((s) => s.start.getTime() === requestedStart.getTime());

  if (!matchingSlot) {
    return c.json(
      { error: "Conflict", message: "Ce créneau n'est plus disponible" },
      409,
    );
  }

  let booking;
  try {
    booking = await createLockedDemoBooking({
      start: matchingSlot.start,
      end: matchingSlot.end,
      bufferBeforeMinutes: context.settings.bufferBeforeMinutes,
      bufferAfterMinutes: context.settings.bufferAfterMinutes,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      clubName: body.clubName,
      phone: body.phone ?? null,
      role: body.role,
      note: body.note ?? null,
      utmSource: body.utmSource ?? null,
    });
  } catch (error) {
    if (error instanceof DemoBookingConflictError) {
      return c.json({ error: "Conflict", message: error.message }, 409);
    }
    throw error;
  }

  const connection = await getActiveGoogleConnection();
  if (!connection) {
    await db.delete(demoBooking).where(eq(demoBooking.id, booking.id));
    return c.json(
      { error: "InternalError", message: "La connexion à l'agenda n'est pas disponible" },
      500,
    );
  }

  try {
    const event = await createEvent(connection.refreshToken, connection.calendarId, {
      startAt: matchingSlot.start,
      endAt: matchingSlot.end,
      attendeeEmail: body.email,
      attendeeName: `${body.firstName} ${body.lastName}`,
      summary: `Démo Ace Club — ${body.clubName}`,
      description: `Club : ${body.clubName}\nRôle : ${body.role}\nTéléphone : ${body.phone ?? "—"}\nNote : ${body.note ?? "—"}\nSource : ${body.utmSource ?? "—"}`,
    });

    const [updated] = await db
      .update(demoBooking)
      .set({ googleEventId: event.eventId, googleMeetLink: event.meetLink })
      .where(eq(demoBooking.id, booking.id))
      .returning();

    const ownerEmail = await getOwnerEmail();
    await Promise.all([
      sendProspectConfirmationEmail(updated),
      ownerEmail ? sendOwnerNewBookingEmail(ownerEmail, updated) : Promise.resolve(),
    ]);

    return c.json(updated, 201);
  } catch (error) {
    await db.delete(demoBooking).where(eq(demoBooking.id, booking.id));
    if (error instanceof GoogleCalendarAuthError) {
      return c.json(
        { error: "InternalError", message: "La connexion à l'agenda a été refusée" },
        500,
      );
    }
    return c.json({ error: "InternalError", message: "Impossible de créer l'événement" }, 500);
  }
};
