import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { organization } from "../../../db/schema/auth/schema";
import { eq, and, gte, lt, asc, desc, SQL, count } from "drizzle-orm";
import { z } from "zod";
import { listMyEventsValidator } from "../validators";

export const listMyEvents = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listMyEventsValidator>;

  const conditions: SQL[] = [eq(eventParticipant.userId, currentUser.id)];

  if (query.status) {
    conditions.push(eq(eventParticipant.status, query.status));
  }

  const now = new Date();
  if (query.timeFilter === "past") {
    conditions.push(lt(event.endDate, now));
  } else {
    conditions.push(gte(event.endDate, now));
  }

  const orderBy = query.timeFilter === "past" ? desc(event.startDate) : asc(event.startDate);

  const registrations = await db
    .select({
      registration: eventParticipant,
      event: event,
      organizationName: organization.name,
      organizationLogo: organization.logo,
      organizationSlug: organization.slug,
    })
    .from(eventParticipant)
    .innerJoin(event, eq(eventParticipant.eventId, event.id))
    .innerJoin(organization, eq(event.organizationId, organization.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(query.limit)
    .offset(query.offset);

  const results = await Promise.all(
    registrations.map(async (r) => {
      const [participantCount] = await db
        .select({ count: count() })
        .from(eventParticipant)
        .where(
          and(eq(eventParticipant.eventId, r.event.id), eq(eventParticipant.status, "registered")),
        );
      return {
        ...r.event,
        organizationName: r.organizationName,
        organizationLogo: r.organizationLogo,
        organizationSlug: r.organizationSlug,
        registrationStatus: r.registration.status,
        registeredAt: r.registration.registeredAt,
        participantCount: participantCount.count,
      };
    }),
  );

  return c.json(results);
};
