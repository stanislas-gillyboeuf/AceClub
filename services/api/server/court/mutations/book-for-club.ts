import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, organization } from "../../../db/schema";
import { bookForClubValidator } from "../validators";
import { BookingConflictError } from "../lib/errors";
import { resolveFeatureFlag } from "../../../lib/feature-flags";
import { createLockedBooking } from "../lib/booking-overlap";
import { assertOrgAdmin, isOrgMember } from "../../../middleware/org-member";

export const bookForClub = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof bookForClubValidator>;

  const [targetCourt] = await db
    .select({
      id: court.id,
      isActive: court.isActive,
      organizationId: court.organizationId,
    })
    .from(court)
    .where(eq(court.id, validated.courtId))
    .limit(1);

  if (!targetCourt || !targetCourt.isActive) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, targetCourt.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json(
      { error: "Forbidden", message: "Only club admins can book on behalf of the club" },
      403,
    );
  }

  if (validated.userId) {
    const memberExists = await isOrgMember(validated.userId, targetCourt.organizationId);
    if (!memberExists) {
      return c.json(
        { error: "BadRequest", message: "This user is not a member of this club" },
        400,
      );
    }
  }

  const bookingEnabled = await resolveFeatureFlag("court_booking", targetCourt.organizationId);
  if (!bookingEnabled) {
    return c.json(
      { error: "Forbidden", message: "Court booking is not enabled for this club" },
      403,
    );
  }

  const start = new Date(validated.startAt);
  const end = new Date(validated.endAt);

  if (end.getTime() <= start.getTime()) {
    return c.json({ error: "BadRequest", message: "endAt must be after startAt" }, 400);
  }

  if (start.getTime() < Date.now()) {
    return c.json({ error: "BadRequest", message: "Cannot book a slot in the past" }, 400);
  }

  try {
    const booking = await createLockedBooking({
      courtId: validated.courtId,
      userId: validated.userId ?? currentUser.id,
      start,
      end,
      purpose: validated.purpose,
      // A slot booked for a specific member is that member's booking (shows their name on
      // the board); with no member specified it's a generic club-owned slot ("Le club").
      bookedAsClub: !validated.userId,
    });

    const [enriched] = await db
      .select({ courtName: court.name, organizationName: organization.name })
      .from(court)
      .innerJoin(organization, eq(court.organizationId, organization.id))
      .where(eq(court.id, booking.courtId))
      .limit(1);

    return c.json({ ...booking, ...enriched }, 201);
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return c.json({ error: "Conflict", message: error.message }, 409);
    }
    return c.json({ error: "InternalError", message: (error as Error).message }, 500);
  }
};
