import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking, courtBookingParticipant } from "../../../db/schema";
import { joinBookingValidator } from "../validators";
import { assertCanViewOrg, isMemberOfOrg, notFound } from "../../../lib/club-access";
import { validateJoinTarget } from "../lib/booking-rules";
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
    .select({ organizationId: court.organizationId, sport: court.sport })
    .from(court)
    .where(eq(court.id, booking.courtId))
    .limit(1);

  if (!bookedCourt) {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }

  // The caller must belong to the club of the booking ("open" courts included); a booking of
  // another club is reported as not found.
  if (!(await assertCanViewOrg(currentUser, bookedCourt.organizationId))) return notFound(c);

  if (bookedCourt.sport !== "padel") {
    return c.json({ error: "BadRequest", message: "Only padel bookings support joining a team" }, 400);
  }

  const bookingEnabled = await resolveFeatureFlag("court_booking", bookedCourt.organizationId);
  if (!bookingEnabled) {
    return c.json(
      { error: "Forbidden", message: "Court booking is not enabled for this club" },
      403,
    );
  }

  const existing = await db
    .select({ slotIndex: courtBookingParticipant.slotIndex, userId: courtBookingParticipant.userId })
    .from(courtBookingParticipant)
    .where(eq(courtBookingParticipant.bookingId, booking.id));

  // Only the caller himself or a member of the club can be added, and nobody twice (owner included).
  const joinError = validateJoinTarget({
    callerId: currentUser.id,
    targetUserId: validated.userId,
    bookingOwnerId: booking.userId,
    existingParticipantUserIds: existing.map((row) => row.userId),
    targetIsClubMember:
      !!validated.userId && (await isMemberOfOrg(validated.userId, bookedCourt.organizationId)),
  });
  if (joinError === "not_self_or_member") {
    return c.json({ error: "BadRequest", message: "Participants must be members of this club" }, 400);
  }
  if (joinError === "already_in_booking") {
    return c.json({ error: "Conflict", message: "Already part of this booking" }, 409);
  }

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
