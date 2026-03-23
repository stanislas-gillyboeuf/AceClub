import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { deleteEventValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const cancelEvent = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof deleteEventValidator>;

  const [existing] = await db.select().from(event).where(eq(event.id, body.eventId)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  const isOrgAdmin = existing.organizationId
    ? await assertOrgAdmin(currentUser.id, existing.organizationId)
    : false;
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json({ error: "Forbidden", message: "Not authorized to cancel this event" }, 403);
  }

  if (existing.status === "cancelled") {
    return c.json({ error: "BadRequest", message: "Event is already cancelled" }, 400);
  }

  if (existing.status === "completed") {
    return c.json({ error: "BadRequest", message: "Cannot cancel a completed event" }, 400);
  }

  // Cancel all active registrations
  await db
    .update(eventParticipant)
    .set({ status: "cancelled" })
    .where(
      and(eq(eventParticipant.eventId, body.eventId), eq(eventParticipant.status, "registered")),
    );

  await db
    .update(eventParticipant)
    .set({ status: "cancelled" })
    .where(
      and(eq(eventParticipant.eventId, body.eventId), eq(eventParticipant.status, "waitlisted")),
    );

  const [updated] = await db
    .update(event)
    .set({ status: "cancelled" })
    .where(eq(event.id, body.eventId))
    .returning();

  return c.json(updated);
};
