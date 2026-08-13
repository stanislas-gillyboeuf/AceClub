import { Context } from "hono";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, organization, user } from "../../../db/schema";
import { createBookingValidator } from "../validators";
import { slotFromStartTime } from "../lib/slots";
import { BookingConflictError } from "../lib/errors";
import { canAccessCourt } from "../lib/access";
import { resolveFeatureFlag } from "../../../lib/feature-flags";
import { createLockedBooking } from "../lib/booking-overlap";
import { getCourtSettings } from "../lib/settings";
import { countWeeklyBookings, isWeekend } from "../lib/quota";
import { PADEL_TEAM_SIZE } from "../lib/padel";

export const createBooking = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createBookingValidator>;

  const [targetCourt] = await db
    .select({
      id: court.id,
      isActive: court.isActive,
      organizationId: court.organizationId,
      accessPolicy: court.accessPolicy,
      slotDurationMinutes: court.slotDurationMinutes,
      sport: court.sport,
    })
    .from(court)
    .where(eq(court.id, validated.courtId))
    .limit(1);

  if (!targetCourt || !targetCourt.isActive) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  if (targetCourt.sport === "tennis" && validated.participants.length !== 1) {
    return c.json(
      { error: "BadRequest", message: "Un partenaire est requis pour réserver un court de tennis" },
      400,
    );
  }
  if (targetCourt.sport === "padel" && validated.participants.length > PADEL_TEAM_SIZE) {
    return c.json(
      { error: "BadRequest", message: `Maximum ${PADEL_TEAM_SIZE} coéquipiers en padel` },
      400,
    );
  }

  const allowed = await canAccessCourt(
    currentUser.id,
    targetCourt.organizationId,
    targetCourt.accessPolicy,
  );
  if (!allowed) {
    return c.json({ error: "Forbidden", message: "This court is reserved to club members" }, 403);
  }

  const bookingEnabled = await resolveFeatureFlag("court_booking", targetCourt.organizationId);
  if (!bookingEnabled) {
    return c.json(
      { error: "Forbidden", message: "Court booking is not enabled for this club" },
      403,
    );
  }

  const { start, end } = slotFromStartTime(
    validated.date,
    validated.startTime,
    targetCourt.slotDurationMinutes,
  );

  if (start.getTime() < Date.now()) {
    return c.json({ error: "BadRequest", message: "Cannot book a slot in the past" }, 400);
  }

  const settings = await getCourtSettings(targetCourt.organizationId);
  const usage = await countWeeklyBookings(currentUser.id, targetCourt.organizationId, start);
  const requestIsWeekend = isWeekend(start);
  const limit = requestIsWeekend
    ? settings.maxBookingsPerWeekWeekend
    : settings.maxBookingsPerWeekWeekday;
  const used = requestIsWeekend ? usage.weekend : usage.weekday;

  if (limit !== null && used >= limit) {
    const label = requestIsWeekend ? "en week-end" : "en semaine";
    return c.json(
      {
        error: "Forbidden",
        message: `Tu as déjà atteint ta limite de ${limit} réservation${limit > 1 ? "s" : ""} ${label} pour cette semaine`,
      },
      403,
    );
  }

  try {
    const booking = await createLockedBooking({
      courtId: validated.courtId,
      userId: currentUser.id,
      start,
      end,
      participants: validated.participants,
    });

    const [enriched] = await db
      .select({ courtName: court.name, organizationName: organization.name })
      .from(court)
      .innerJoin(organization, eq(court.organizationId, organization.id))
      .where(eq(court.id, booking.courtId))
      .limit(1);

    const participantUserIds = validated.participants
      .map((p) => p.userId)
      .filter((id): id is string => Boolean(id));
    const participantUsers = participantUserIds.length
      ? await db
          .select({ id: user.id, name: user.name })
          .from(user)
          .where(inArray(user.id, participantUserIds))
      : [];
    const participants = validated.participants.map((p) => ({
      userId: p.userId ?? null,
      name: p.guestName ?? participantUsers.find((u) => u.id === p.userId)?.name ?? null,
    }));

    return c.json({ ...booking, ...enriched, participants }, 201);
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return c.json({ error: "Conflict", message: error.message }, 409);
    }
    return c.json({ error: "InternalError", message: (error as Error).message }, 500);
  }
};
