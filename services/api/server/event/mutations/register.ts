import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { member } from "../../../db/schema/auth/schema";
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

  // Only presale or on_sale events accept registrations
  if (eventRecord.status !== "presale" && eventRecord.status !== "on_sale") {
    return c.json({ error: "BadRequest", message: "Event is not open for registration" }, 400);
  }

  // Check visibility: organization-only events require membership
  if (eventRecord.visibility === "organization" && eventRecord.organizationId) {
    const [memberRecord] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, eventRecord.organizationId),
          eq(member.userId, currentUser.id),
        ),
      )
      .limit(1);

    if (!memberRecord) {
      return c.json(
        { error: "Forbidden", message: "This event is restricted to organization members" },
        403,
      );
    }
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

  const isFull =
    eventRecord.maxParticipants && registeredCount.count >= eventRecord.maxParticipants;

  const participantStatus = isFull ? "waitlisted" : "registered";

  if (existingRegistration) {
    const [updated] = await db
      .update(eventParticipant)
      .set({ status: participantStatus, registeredAt: new Date() })
      .where(eq(eventParticipant.id, existingRegistration.id))
      .returning();

    if (participantStatus === "registered") {
      await checkAndUpdateFullStatus(body.eventId, eventRecord.maxParticipants);
    }

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

  if (participantStatus === "registered") {
    await checkAndUpdateFullStatus(body.eventId, eventRecord.maxParticipants);
  }

  return c.json(created, 201);
};

async function checkAndUpdateFullStatus(eventId: string, maxParticipants: number | null) {
  if (!maxParticipants) return;

  const [registeredCount] = await db
    .select({ count: count() })
    .from(eventParticipant)
    .where(and(eq(eventParticipant.eventId, eventId), eq(eventParticipant.status, "registered")));

  if (registeredCount.count >= maxParticipants) {
    await db.update(event).set({ status: "full" }).where(eq(event.id, eventId));
  }
}
