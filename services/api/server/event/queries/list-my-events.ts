import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { eq, and, SQL } from "drizzle-orm";
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

  const registrations = await db
    .select({
      registration: eventParticipant,
      event: event,
    })
    .from(eventParticipant)
    .innerJoin(event, eq(eventParticipant.eventId, event.id))
    .where(and(...conditions))
    .orderBy(event.startDate)
    .limit(query.limit)
    .offset(query.offset);

  return c.json(
    registrations.map((r) => ({
      ...r.event,
      registrationStatus: r.registration.status,
      registeredAt: r.registration.registeredAt,
    })),
  );
};
