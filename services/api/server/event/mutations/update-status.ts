import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event } from "../../../db/schema/event/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { updateEventStatusValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";
import type { EventStatus } from "../../../db/schema/event/type";

const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ["presale", "on_sale", "cancelled"],
  presale: ["on_sale", "cancelled"],
  on_sale: ["full", "completed", "cancelled"],
  full: ["on_sale", "completed", "cancelled"],
  completed: ["archived"],
  cancelled: [],
  archived: [],
};

export const updateEventStatus = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof updateEventStatusValidator>;

  const [existing] = await db.select().from(event).where(eq(event.id, body.eventId)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  const isOrgAdmin = existing.organizationId
    ? await assertOrgAdmin(currentUser.id, existing.organizationId)
    : false;
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json(
      { error: "Forbidden", message: "Not authorized to update this event status" },
      403,
    );
  }

  const currentStatus = existing.status as EventStatus;
  const allowedNextStatuses = VALID_TRANSITIONS[currentStatus];

  if (!allowedNextStatuses.includes(body.status as EventStatus)) {
    return c.json(
      {
        error: "BadRequest",
        message: `Cannot transition from '${currentStatus}' to '${body.status}'. Allowed: ${allowedNextStatuses.join(", ") || "none"}`,
      },
      400,
    );
  }

  const [updated] = await db
    .update(event)
    .set({ status: body.status })
    .where(eq(event.id, body.eventId))
    .returning();

  return c.json(updated);
};
