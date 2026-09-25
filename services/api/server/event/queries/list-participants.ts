import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, SQL } from "drizzle-orm";
import { z } from "zod";
import { listParticipantsValidator } from "../validators";
import { canSeeEvent, notFound } from "../../../lib/club-access";

export const listParticipants = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listParticipantsValidator>;

  const [eventRecord] = await db
    .select({ organizationId: event.organizationId, status: event.status })
    .from(event)
    .where(eq(event.id, query.eventId))
    .limit(1);
  if (!eventRecord || !(await canSeeEvent(currentUser, eventRecord))) return notFound(c);

  const conditions: SQL[] = [eq(eventParticipant.eventId, query.eventId)];

  if (query.status) {
    conditions.push(eq(eventParticipant.status, query.status));
  }

  const participants = await db
    .select({
      id: eventParticipant.id,
      userId: eventParticipant.userId,
      status: eventParticipant.status,
      registeredAt: eventParticipant.registeredAt,
      userName: user.name,
      userImage: user.image,
    })
    .from(eventParticipant)
    .innerJoin(user, eq(eventParticipant.userId, user.id))
    .where(and(...conditions))
    .orderBy(eventParticipant.registeredAt)
    .limit(query.limit)
    .offset(query.offset);

  return c.json(participants);
};
