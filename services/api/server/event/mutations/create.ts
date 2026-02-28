import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event } from "../../../db/schema/event/schema";
import { z } from "zod";
import { createEventValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const createEvent = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof createEventValidator>;

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, body.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json(
      { error: "Forbidden", message: "Not authorized to create events for this organization" },
      403,
    );
  }

  if (!body.isFree && !body.paymentLink) {
    return c.json(
      { error: "BadRequest", message: "Payment link is required for paid events" },
      400,
    );
  }

  const [created] = await db
    .insert(event)
    .values({
      name: body.name,
      description: body.description,
      coverImage: body.coverImage,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      maxParticipants: body.maxParticipants,
      isFree: body.isFree,
      price: body.isFree ? null : body.price,
      paymentLink: body.isFree ? null : body.paymentLink,
      visibility: body.visibility,
      status: "draft",
      userId: currentUser.id,
      organizationId: body.organizationId,
    })
    .returning();

  return c.json(created, 201);
};
