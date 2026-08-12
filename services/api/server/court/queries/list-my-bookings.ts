import { Context } from "hono";
import { z } from "zod";
import { and, eq, gte, lt, or, asc, desc } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtBooking, court, organization } from "../../../db/schema";
import { listMyBookingsValidator } from "../validators";

export const listMyBookings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listMyBookingsValidator>;

  const now = new Date();

  const conditions =
    query.filter === "upcoming"
      ? and(
          eq(courtBooking.userId, currentUser.id),
          eq(courtBooking.status, "confirmed"),
          gte(courtBooking.startAt, now),
        )
      : and(
          eq(courtBooking.userId, currentUser.id),
          or(lt(courtBooking.startAt, now), eq(courtBooking.status, "cancelled")),
        );

  const rows = await db
    .select({
      id: courtBooking.id,
      courtId: courtBooking.courtId,
      startAt: courtBooking.startAt,
      endAt: courtBooking.endAt,
      status: courtBooking.status,
      purpose: courtBooking.purpose,
      bookedAsClub: courtBooking.bookedAsClub,
      createdAt: courtBooking.createdAt,
      courtName: court.name,
      organizationId: court.organizationId,
      organizationName: organization.name,
    })
    .from(courtBooking)
    .innerJoin(court, eq(courtBooking.courtId, court.id))
    .innerJoin(organization, eq(court.organizationId, organization.id))
    .where(conditions)
    .orderBy(query.filter === "upcoming" ? asc(courtBooking.startAt) : desc(courtBooking.startAt));

  return c.json(rows);
};
