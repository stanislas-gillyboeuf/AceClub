import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import { addParticipantValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";
import { assertCoach } from "../../../middleware/club-admin";

// Organizer-only counterpart to register.ts: lets an admin/coach enroll any member directly,
// at any time — skips the "event must be presale/on_sale" and "organization visibility
// requires membership" gates that apply to self-registration, since the organizer is making
// this call deliberately on someone else's behalf.
export const addParticipant = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof addParticipantValidator>;

  const [eventRecord] = await db.select().from(event).where(eq(event.id, body.eventId)).limit(1);

  if (!eventRecord) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  const isAuthorized = eventRecord.organizationId
    ? (await assertOrgAdmin(currentUser.id, eventRecord.organizationId)) ||
      (await assertCoach(currentUser.id, eventRecord.organizationId))
    : false;
  if (!isAuthorized && currentUser.role !== "admin") {
    return c.json({ error: "Forbidden", message: "Not authorized to add participants" }, 403);
  }

  const [existingRegistration] = await db
    .select()
    .from(eventParticipant)
    .where(
      and(eq(eventParticipant.eventId, body.eventId), eq(eventParticipant.userId, body.userId)),
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

  let created;
  if (existingRegistration) {
    [created] = await db
      .update(eventParticipant)
      .set({ status: participantStatus, registeredAt: new Date() })
      .where(eq(eventParticipant.id, existingRegistration.id))
      .returning();
  } else {
    [created] = await db
      .insert(eventParticipant)
      .values({ eventId: body.eventId, userId: body.userId, status: participantStatus })
      .returning();
  }

  if (participantStatus === "registered" && eventRecord.maxParticipants) {
    const [updatedCount] = await db
      .select({ count: count() })
      .from(eventParticipant)
      .where(
        and(eq(eventParticipant.eventId, body.eventId), eq(eventParticipant.status, "registered")),
      );
    if (updatedCount.count >= eventRecord.maxParticipants) {
      await db.update(event).set({ status: "full" }).where(eq(event.id, body.eventId));
    }
  }

  return c.json(created, 201);
};
