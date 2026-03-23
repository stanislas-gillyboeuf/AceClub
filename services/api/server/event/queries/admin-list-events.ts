import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq, and, count, sql, SQL } from "drizzle-orm";
import { z } from "zod";
import { adminListEventsValidator } from "../validators";

export const adminListEvents = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof adminListEventsValidator>;

  const conditions: SQL[] = [];

  if (query.status) {
    conditions.push(sql`${event.status} = ${query.status}`);
  }
  if (query.organizationId) {
    conditions.push(eq(event.organizationId, query.organizationId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [events, [totalResult]] = await Promise.all([
    db
      .select()
      .from(event)
      .where(whereClause)
      .orderBy(event.createdAt)
      .limit(query.limit)
      .offset(query.offset),
    db.select({ count: count() }).from(event).where(whereClause),
  ]);

  const eventsWithCounts = await Promise.all(
    events.map(async (e) => {
      const [participantCount] = await db
        .select({ count: count() })
        .from(eventParticipant)
        .where(and(eq(eventParticipant.eventId, e.id), eq(eventParticipant.status, "registered")));
      return { ...e, participantCount: participantCount.count };
    }),
  );

  return c.json({ events: eventsWithCounts, total: totalResult.count });
};
