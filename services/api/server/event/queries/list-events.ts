import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq, and, gte, lte, count, sql, SQL } from "drizzle-orm";
import { z } from "zod";
import { listEventsValidator } from "../validators";

export const listEvents = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listEventsValidator>;

  const conditions: SQL[] = [eq(event.visibility, "public")];

  if (query.organizationId) {
    conditions.push(eq(event.organizationId, query.organizationId));
  }
  if (query.status) {
    conditions.push(sql`${event.status} = ${query.status}`);
  }
  if (query.fromDate) {
    conditions.push(gte(event.startDate, new Date(query.fromDate)));
  }
  if (query.toDate) {
    conditions.push(lte(event.startDate, new Date(query.toDate)));
  }

  const events = await db
    .select()
    .from(event)
    .where(and(...conditions))
    .orderBy(event.startDate)
    .limit(query.limit)
    .offset(query.offset);

  const eventsWithCounts = await Promise.all(
    events.map(async (e) => {
      const [participantCount] = await db
        .select({ count: count() })
        .from(eventParticipant)
        .where(
          and(
            eq(eventParticipant.eventId, e.id),
            eq(eventParticipant.status, "registered"),
          ),
        );
      return { ...e, participantCount: participantCount.count };
    }),
  );

  return c.json(eventsWithCounts);
};
