import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq, and, count, sql, SQL, desc } from "drizzle-orm";
import { z } from "zod";
import { listOrganizationEventsValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const listOrganizationEvents = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listOrganizationEventsValidator>;

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, query.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json(
      { error: "Forbidden", message: "Not authorized to view organization events" },
      403,
    );
  }

  const conditions: SQL[] = [eq(event.organizationId, query.organizationId)];

  if (query.status) {
    conditions.push(sql`${event.status} = ${query.status}`);
  }

  const events = await db
    .select()
    .from(event)
    .where(and(...conditions))
    .orderBy(desc(event.createdAt))
    .limit(query.limit)
    .offset(query.offset);

  const eventsWithCounts = await Promise.all(
    events.map(async (e) => {
      const [participantCount] = await db
        .select({ count: count() })
        .from(eventParticipant)
        .where(and(eq(eventParticipant.eventId, e.id), eq(eventParticipant.status, "registered")));
      const [waitlistCount] = await db
        .select({ count: count() })
        .from(eventParticipant)
        .where(
          and(eq(eventParticipant.eventId, e.id), eq(eventParticipant.status, "waitlisted")),
        );
      return {
        ...e,
        participantCount: participantCount.count,
        waitlistCount: waitlistCount.count,
      };
    }),
  );

  return c.json(eventsWithCounts);
};
