import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking, courtBookingParticipant } from "../../../db/schema";
import { joinBookingValidator } from "../validators";
import { canAccessCourt } from "../lib/access";
import { resolveFeatureFlag } from "../../../lib/feature-flags";
import { PADEL_TEAM_SIZE } from "../lib/padel";

export const joinBooking = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof joinBookingValidator>;

  const [booking] = await db
    .select()
    .from(courtBooking)
    .where(eq(courtBooking.id, validated.bookingId))
    .limit(1);

  if (!booking || booking.status !== "confirmed") {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }

  const [bookedCourt] = await db
    .select({ organizationId: court.organizationId, accessPolicy: court.accessPolicy, sport: court.sport })
    .from(court)
    .where(eq(court.id, booking.courtId))
    .limit(1);

  if (!bookedCourt || bookedCourt.sport !== "padel") {
    return c.json({ error: "BadRequest", message: "Only padel bookings support joining a team" }, 400);
  }

  const allowed = await canAccessCourt(currentUser.id, bookedCourt.organizationId, bookedCourt.accessPolicy);
  if (!allowed) {
    return c.json({ error: "Forbidden", message: "This court is reserved to club members" }, 403);
  }

  const bookingEnabled = await resolveFeatureFlag("court_booking", bookedCourt.organizationId);
  if (!bookingEnabled) {
    return c.json(
      { error: "Forbidden", message: "Court booking is not enabled for this club" },
      403,
    );
  }

  const existing = await db
    .select({ slotIndex: courtBookingParticipant.slotIndex })
    .from(courtBookingParticipant)
    .where(eq(courtBookingParticipant.bookingId, booking.id));

  const takenSlots = new Set(existing.map((row) => row.slotIndex));
  let nextSlot = -1;
  for (let i = 0; i < PADEL_TEAM_SIZE; i++) {
    if (!takenSlots.has(i)) {
      nextSlot = i;
      break;
    }
  }

  if (nextSlot === -1) {
    return c.json({ error: "Conflict", message: "L'équipe est déjà complète" }, 409);
  }

  const [created] = await db
    .insert(courtBookingParticipant)
    .values({
      bookingId: booking.id,
      slotIndex: nextSlot,
      userId: validated.userId ?? null,
      guestName: validated.guestName ?? null,
    })
    .returning();

  return c.json(created, 201);
};
