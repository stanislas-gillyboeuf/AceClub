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

  const [created] = await db
    .insert(event)
    .values({
      name: body.name,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      address: body.address,
      maxParticipants: body.maxParticipants,
      visibility: body.visibility,
      status: "open",
      userId: currentUser.id,
      organizationId: body.organizationId,
    })
    .returning();

  return c.json(created, 201);
};
