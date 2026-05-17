import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { user } from "../../../db/schema/auth/schema";
import { and, count, eq, SQL } from "drizzle-orm";
import { z } from "zod";
import { adminListParticipantsValidator } from "../validators";

export const adminListParticipants = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof adminListParticipantsValidator>;

  const conditions: SQL[] = [eq(eventParticipant.eventId, query.eventId)];

  if (query.status) {
    conditions.push(eq(eventParticipant.status, query.status));
  }

  const whereClause = and(...conditions);

  const [eventRows, participants, [totalResult]] = await Promise.all([
    db.select().from(event).where(eq(event.id, query.eventId)).limit(1),
    db
      .select({
        id: eventParticipant.id,
        userId: eventParticipant.userId,
        status: eventParticipant.status,
        registeredAt: eventParticipant.registeredAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(eventParticipant)
      .innerJoin(user, eq(eventParticipant.userId, user.id))
      .where(whereClause)
      .orderBy(eventParticipant.registeredAt)
      .limit(query.limit)
      .offset(query.offset),
    db.select({ count: count() }).from(eventParticipant).where(whereClause),
  ]);

  const [eventRecord] = eventRows;
  if (!eventRecord) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  return c.json({
    event: eventRecord,
    participants,
    total: totalResult.count,
  });
};
