import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event } from "../../../db/schema/event/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { updateEventStatusValidator } from "../validators";

export const adminUpdateStatus = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof updateEventStatusValidator>;

  const [existing] = await db
    .select()
    .from(event)
    .where(eq(event.id, body.eventId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  const [updated] = await db
    .update(event)
    .set({ status: body.status })
    .where(eq(event.id, body.eventId))
    .returning();

  return c.json(updated);
};
