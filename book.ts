import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking } from "../../../db/schema/court/schema";
import { eq, and, lt, gt } from "drizzle-orm";
import { z } from "zod";
import { bookCourtValidator } from "../validators";

export const bookCourt = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof bookCourtValidator>;

  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);

  if (endTime <= startTime) {
    return c.json({ error: "BadRequest", message: "endTime must be after startTime" }, 400);
  }

  const [courtRecord] = await db.select().from(court).where(eq(court.id, body.courtId)).limit(1);

  if (!courtRecord || !courtRecord.isActive) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  // Run the overlap-check + insert inside a transaction so two simultaneous
  // requests for the same slot can't both succeed (race condition safety).
  const result = await db.transaction(async (tx) => {
    const overlapping = await tx
      .select()
      .from(courtBooking)
      .where(
        and(
          eq(courtBooking.courtId, body.courtId),
          eq(courtBooking.status, "confirmed"),
          lt(courtBooking.startTime, endTime),
          gt(courtBooking.endTime, startTime),
        ),
      )
      .limit(1);

    if (overlapping.length > 0) {
      return { conflict: true as const };
    }

    const [created] = await tx
      .insert(courtBooking)
      .values({
        courtId: body.courtId,
        userId: currentUser.id,
        startTime,
        endTime,
        status: "confirmed",
      })
      .returning();

    return { conflict: false as const, booking: created };
  });

  if (result.conflict) {
    return c.json({ error: "Conflict", message: "This slot was just booked by someone else" }, 409);
  }

  return c.json({ data: { ...result.booking, court: courtRecord } }, 201);
};
