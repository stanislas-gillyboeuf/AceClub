import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { deleteEventValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const deleteEvent = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof deleteEventValidator>;

  const [existing] = await db.select().from(event).where(eq(event.id, body.eventId)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, existing.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json({ error: "Forbidden", message: "Not authorized to delete this event" }, 403);
  }

  if (existing.status !== "draft" && existing.status !== "cancelled") {
    return c.json(
      { error: "BadRequest", message: "Only draft or cancelled events can be deleted" },
      400,
    );
  }

  await db.delete(eventParticipant).where(eq(eventParticipant.eventId, body.eventId));
  await db.delete(event).where(eq(event.id, body.eventId));

  return c.json({ success: true });
};
