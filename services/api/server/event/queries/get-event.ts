import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, eventParticipant } from "../../../db/schema/event/schema";
import { organization, member } from "../../../db/schema/auth/schema";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import { getEventValidator } from "../validators";

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
    })
    .from(event)
    .innerJoin(organization, eq(event.organizationId, organization.id))
    .where(eq(event.id, eventId))
    .limit(1);

  if (!result) {
    return c.json({ error: "NotFound", message: "Event not found" }, 404);
  }

  // Draft events only visible to org admins
  if (result.status === "draft") {
    const [memberRecord] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, result.organizationId),
          eq(member.userId, currentUser.id),
        ),
      )
      .limit(1);

    if (!memberRecord || !["owner", "admin"].includes(memberRecord.role ?? "")) {
      if (currentUser.role !== "admin") {
        return c.json({ error: "NotFound", message: "Event not found" }, 404);
      }
    }
  }

  // Organization-only events require membership
  if (result.visibility === "organization") {
    const [memberRecord] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, result.organizationId),
          eq(member.userId, currentUser.id),
        ),
      )
      .limit(1);

    if (!memberRecord && currentUser.role !== "admin") {
      return c.json(
        { error: "Forbidden", message: "This event is restricted to organization members" },
        403,
      );
    }
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
