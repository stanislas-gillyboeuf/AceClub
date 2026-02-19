import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import { registerEventValidator } from "../validators";

export const registerEvent = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof registerEventValidator>;

  const [eventRecord] = await db.select().from(event).where(eq(event.id, body.eventId)).limit(1);

  if (!eventRecord) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  if (eventRecord.status !== "open") {
    return c.json({ error: "BadRequest", message: "Event is not open for registration" }, 400);
  }

  const [existingRegistration] = await db
    .select()
    .from(eventParticipant)
    .where(
      and(eq(eventParticipant.eventId, body.eventId), eq(eventParticipant.userId, currentUser.id)),
    )
    .limit(1);

  if (existingRegistration && existingRegistration.status !== "cancelled") {
    return c.json({ error: "Conflict", message: "Already registered for this event" }, 409);
  }

  const [registeredCount] = await db
    .select({ count: count() })
    .from(eventParticipant)
    .where(
      and(eq(eventParticipant.eventId, body.eventId), eq(eventParticipant.status, "registered")),
    );

  const participantStatus =
    eventRecord.maxParticipants && registeredCount.count >= eventRecord.maxParticipants
      ? "waitlisted"
      : "registered";

  if (existingRegistration) {
    const [updated] = await db
      .update(eventParticipant)
      .set({ status: participantStatus, registeredAt: new Date() })
      .where(eq(eventParticipant.id, existingRegistration.id))
      .returning();
    return c.json(updated, 201);
  }

  const [created] = await db
    .insert(eventParticipant)
    .values({
      eventId: body.eventId,
      userId: currentUser.id,
      status: participantStatus,
    })
    .returning();

  return c.json(created, 201);
};
