import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event } from "../../../db/schema/event/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { updateEventValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const updateEvent = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof updateEventValidator>;

  const [existing] = await db.select().from(event).where(eq(event.id, body.eventId)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, existing.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json({ error: "Forbidden", message: "Not authorized to update this event" }, 403);
  }

  if (existing.status === "cancelled") {
    return c.json({ error: "BadRequest", message: "Cannot update a cancelled event" }, 400);
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
  if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
  if (body.address !== undefined) updateData.address = body.address;
  if (body.latitude !== undefined) updateData.latitude = body.latitude;
  if (body.longitude !== undefined) updateData.longitude = body.longitude;
  if (body.maxParticipants !== undefined) updateData.maxParticipants = body.maxParticipants;
  if (body.isFree !== undefined) updateData.isFree = body.isFree;
  if (body.price !== undefined) updateData.price = body.price;
  if (body.paymentLink !== undefined) updateData.paymentLink = body.paymentLink;
  if (body.visibility !== undefined) updateData.visibility = body.visibility;

  const [updated] = await db
    .update(event)
    .set(updateData)
    .where(eq(event.id, body.eventId))
    .returning();

  return c.json(updated);
};
