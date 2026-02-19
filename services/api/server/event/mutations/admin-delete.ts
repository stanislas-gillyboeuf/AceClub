import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { deleteEventValidator } from "../validators";

export const adminDeleteEvent = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof deleteEventValidator>;

  const [existing] = await db.select().from(event).where(eq(event.id, body.eventId)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  await db.delete(eventParticipant).where(eq(eventParticipant.eventId, body.eventId));

  await db.delete(event).where(eq(event.id, body.eventId));

  return c.json({ success: true });
};
