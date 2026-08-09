import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking } from "../../../db/schema/court/schema";
import { organization } from "../../../db/schema/auth/schema";
import { eq, and, gte, lt, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { listMyBookingsValidator } from "../validators";

export const listMyBookings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listMyBookingsValidator>;

  const now = new Date();
  const conditions = [
    eq(courtBooking.userId, currentUser.id),
    eq(courtBooking.status, "confirmed"),
  ];

  if (query.timeFilter === "past") {
    conditions.push(lt(courtBooking.startTime, now));
  } else {
    conditions.push(gte(courtBooking.startTime, now));
  }

  const bookings = await db
    .select({
      id: courtBooking.id,
      startTime: courtBooking.startTime,
      endTime: courtBooking.endTime,
      status: courtBooking.status,
      createdAt: courtBooking.createdAt,
      courtId: court.id,
      courtName: court.name,
      courtSurface: court.surface,
      courtLocation: court.location,
      pricePerHour: court.pricePerHour,
      organizationId: organization.id,
      organizationName: organization.name,
      organizationLogo: organization.logo,
    })
    .from(courtBooking)
    .innerJoin(court, eq(courtBooking.courtId, court.id))
    .innerJoin(organization, eq(court.organizationId, organization.id))
    .where(and(...conditions))
    .orderBy(query.timeFilter === "past" ? desc(courtBooking.startTime) : asc(courtBooking.startTime))
    .limit(query.limit)
    .offset(query.offset);

  return c.json({ data: bookings });
};
