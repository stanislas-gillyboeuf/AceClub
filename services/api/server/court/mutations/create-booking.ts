import { Context } from "hono";
import { z } from "zod";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtBooking, court, organization } from "../../../db/schema";
import { createBookingValidator } from "../validators";
import { slotFromStartTime } from "../lib/slots";
import { BookingConflictError } from "../lib/errors";
import { canAccessCourt } from "../lib/access";
import { resolveFeatureFlag } from "../../../lib/feature-flags";

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
    })
    .from(court)
    .where(eq(court.id, validated.courtId))
    .limit(1);

  if (!targetCourt || !targetCourt.isActive) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
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

  const { start, end } = slotFromStartTime(validated.date, validated.startTime);

  if (start.getTime() < Date.now()) {
    return c.json({ error: "BadRequest", message: "Cannot book a slot in the past" }, 400);
  }

  try {
    const booking = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${validated.courtId}))`);

      const [overlapping] = await tx
        .select({ id: courtBooking.id })
        .from(courtBooking)
        .where(
          and(
            eq(courtBooking.courtId, validated.courtId),
            eq(courtBooking.status, "confirmed"),
            lt(courtBooking.startAt, end),
            gt(courtBooking.endAt, start),
          ),
        )
        .limit(1);

      if (overlapping) {
        throw new BookingConflictError();
      }

      const [created] = await tx
        .insert(courtBooking)
        .values({
          courtId: validated.courtId,
          userId: currentUser.id,
          startAt: start,
          endAt: end,
          status: "confirmed",
        })
        .returning();

      return created;
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
