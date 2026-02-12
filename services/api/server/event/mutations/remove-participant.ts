import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { removeParticipantValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const removeParticipant = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof removeParticipantValidator>;

  const [eventRecord] = await db
    .select()
    .from(event)
    .where(eq(event.id, body.eventId))
    .limit(1);

  if (!eventRecord) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, eventRecord.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json({ error: "Forbidden", message: "Not authorized to remove participants" }, 403);
  }

  const [registration] = await db
    .select()
    .from(eventParticipant)
    .where(
      and(
        eq(eventParticipant.eventId, body.eventId),
        eq(eventParticipant.userId, body.userId),
      ),
    )
    .limit(1);

  if (!registration || registration.status === "cancelled") {
    return c.json({ error: "NotFound", message: "Active registration not found" }, 404);
  }

  const wasRegistered = registration.status === "registered";

  await db
    .update(eventParticipant)
    .set({ status: "cancelled" })
    .where(eq(eventParticipant.id, registration.id));

  if (wasRegistered) {
    const [nextWaitlisted] = await db
      .select()
      .from(eventParticipant)
      .where(
        and(
          eq(eventParticipant.eventId, body.eventId),
          eq(eventParticipant.status, "waitlisted"),
        ),
      )
      .orderBy(asc(eventParticipant.registeredAt))
      .limit(1);

    if (nextWaitlisted) {
      await db
        .update(eventParticipant)
        .set({ status: "registered" })
        .where(eq(eventParticipant.id, nextWaitlisted.id));
    }
  }

  return c.json({ success: true });
};
