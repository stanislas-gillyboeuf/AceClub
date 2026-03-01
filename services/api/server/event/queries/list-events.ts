import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { organization, member } from "../../../db/schema/auth/schema";
import { eq, and, gte, lte, gt, lt, ne, count, sql, SQL, asc, desc } from "drizzle-orm";
import { z } from "zod";
import { listEventsValidator } from "../validators";

export const listEvents = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listEventsValidator>;

  // Only show visible events (not draft, not cancelled)
  const conditions: SQL[] = [
    ne(event.status, "draft"),
    ne(event.status, "cancelled"),
  ];

  // Visibility: public events are always visible, organization events only for members
  if (query.visibility === "organization") {
    // If filtering by organization visibility, user must be a member
    if (!query.organizationId) {
      return c.json(
        { error: "BadRequest", message: "organizationId required for organization visibility" },
        400,
      );
    }
    conditions.push(eq(event.visibility, "organization"));
    conditions.push(eq(event.organizationId, query.organizationId));
  } else {
    // Default: show public events + organization events where user is a member
    const userMemberships = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, currentUser.id));

    const memberOrgIds = userMemberships.map((m) => m.organizationId);

    if (memberOrgIds.length > 0) {
      conditions.push(
        sql`(${event.visibility} = 'public' OR (${event.visibility} = 'organization' AND ${event.organizationId} IN (${sql.join(memberOrgIds.map((id) => sql`${id}`), sql`, `)})))`,
      );
    } else {
      conditions.push(eq(event.visibility, "public"));
    }
  }

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

  // Cursor-based pagination
  if (query.cursor) {
    if (query.sortBy === "upcoming") {
      const cursorDate = new Date(query.cursor);
      conditions.push(gt(event.startDate, cursorDate));
    } else if (query.sortBy === "recent") {
      conditions.push(lt(event.createdAt, new Date(query.cursor)));
    }
    // For "nearest", cursor is handled differently (distance-based, using offset fallback)
  }

  // Build order clause
  let orderClause;
  if (query.sortBy === "nearest" && query.latitude != null && query.longitude != null) {
    const distanceExpr = sql`(
      6371 * acos(
        cos(radians(${query.latitude})) * cos(radians(${event.latitude}))
        * cos(radians(${event.longitude}) - radians(${query.longitude}))
        + sin(radians(${query.latitude})) * sin(radians(${event.latitude}))
      )
    )`;
    // Only events with coordinates
    conditions.push(sql`${event.latitude} IS NOT NULL AND ${event.longitude} IS NOT NULL`);
    orderClause = asc(distanceExpr);
  } else if (query.sortBy === "recent") {
    orderClause = desc(event.createdAt);
  } else {
    // Default: upcoming (soonest first), only future events
    conditions.push(gte(event.startDate, new Date()));
    orderClause = asc(event.startDate);
  }

  const fetchLimit = query.limit + 1; // Fetch one extra to determine if there are more

  const events = await db
    .select({
      id: event.id,
      name: event.name,
      description: event.description,
      coverImage: event.coverImage,
      startDate: event.startDate,
      endDate: event.endDate,
      address: event.address,
      latitude: event.latitude,
      longitude: event.longitude,
      maxParticipants: event.maxParticipants,
      isFree: event.isFree,
      price: event.price,
      paymentLink: event.paymentLink,
      visibility: event.visibility,
      status: event.status,
      organizationId: event.organizationId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      organizationName: organization.name,
      organizationLogo: organization.logo,
      organizationSlug: organization.slug,
    })
    .from(event)
    .leftJoin(organization, eq(event.organizationId, organization.id))
    .where(and(...conditions))
    .orderBy(orderClause)
    .limit(fetchLimit);

  const hasMore = events.length > query.limit;
  const results = hasMore ? events.slice(0, query.limit) : events;

  // Get participant counts in batch
  const eventsWithCounts = await Promise.all(
    results.map(async (e) => {
      const [participantCount] = await db
        .select({ count: count() })
        .from(eventParticipant)
        .where(and(eq(eventParticipant.eventId, e.id), eq(eventParticipant.status, "registered")));
      return { ...e, participantCount: participantCount.count };
    }),
  );

  // Build next cursor
  let nextCursor: string | null = null;
  if (hasMore && results.length > 0) {
    const lastEvent = results[results.length - 1];
    if (query.sortBy === "recent") {
      nextCursor = lastEvent.createdAt.toISOString();
    } else {
      nextCursor = lastEvent.startDate.toISOString();
    }
  }

  return c.json({
    data: eventsWithCounts,
    nextCursor,
    hasMore,
  });
};
