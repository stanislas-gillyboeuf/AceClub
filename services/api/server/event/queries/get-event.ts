import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { organization } from "../../../db/schema/auth/schema";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import { getEventValidator } from "../validators";
import { canSeeEvent, notFound } from "../../../lib/club-access";

export const getEvent = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const { eventId } = c.req.valid("query") as z.infer<typeof getEventValidator>;

  const [result] = await db
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
      userId: event.userId,
      organizationId: event.organizationId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      organizationName: organization.name,
      organizationLogo: organization.logo,
      organizationSlug: organization.slug,
      organizationAddress: organization.address,
      organizationLatitude: organization.latitude,
      organizationLongitude: organization.longitude,
    })
    .from(event)
    .leftJoin(organization, eq(event.organizationId, organization.id))
    .where(eq(event.id, eventId))
    .limit(1);

  if (!result) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  // One rule for every event: club members only (drafts: club admins only). A refusal is a 404
  // so the existence of another club's event is never revealed.
  if (!(await canSeeEvent(currentUser, { organizationId: result.organizationId, status: result.status }))) {
    return notFound(c);
  }

  const [participantCount] = await db
    .select({ count: count() })
    .from(eventParticipant)
    .where(and(eq(eventParticipant.eventId, eventId), eq(eventParticipant.status, "registered")));

  const [waitlistCount] = await db
    .select({ count: count() })
    .from(eventParticipant)
    .where(and(eq(eventParticipant.eventId, eventId), eq(eventParticipant.status, "waitlisted")));

  const [userRegistration] = await db
    .select()
    .from(eventParticipant)
    .where(and(eq(eventParticipant.eventId, eventId), eq(eventParticipant.userId, currentUser.id)))
    .limit(1);

  return c.json({
    ...result,
    participantCount: participantCount.count,
    waitlistCount: waitlistCount.count,
    userRegistrationStatus: userRegistration?.status ?? null,
  });
};
