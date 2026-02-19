import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { z } from "zod";
import { getEventValidator } from "../validators";

export const getEvent = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const { eventId } = c.req.valid("query") as z.infer<typeof getEventValidator>;

  const [eventRecord] = await db.select().from(event).where(eq(event.id, eventId)).limit(1);

  if (!eventRecord) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  const [participantCount] = await db
    .select({ count: count() })
    .from(eventParticipant)
    .where(and(eq(eventParticipant.eventId, eventId), eq(eventParticipant.status, "registered")));

  const [userRegistration] = await db
    .select()
    .from(eventParticipant)
    .where(and(eq(eventParticipant.eventId, eventId), eq(eventParticipant.userId, currentUser.id)))
    .limit(1);

  return c.json({
    ...eventRecord,
    participantCount: participantCount.count,
    userRegistrationStatus: userRegistration?.status ?? null,
  });
};
