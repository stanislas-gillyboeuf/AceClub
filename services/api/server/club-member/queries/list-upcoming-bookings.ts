import { Context } from "hono";
import { z } from "zod";
import { and, asc, count, eq, gte } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtBooking, court } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { listUpcomingBookingsValidator } from "../validators";

const UPCOMING_LIMIT = 5;

export const listUpcomingBookings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listUpcomingBookingsValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const now = new Date();

  const [upcoming, totalResult] = await Promise.all([
    db
      .select({
        id: courtBooking.id,
        courtName: court.name,
        sport: court.sport,
        startAt: courtBooking.startAt,
        endAt: courtBooking.endAt,
      })
      .from(courtBooking)
      .innerJoin(court, eq(courtBooking.courtId, court.id))
      .where(
        and(
          eq(courtBooking.userId, validated.userId),
          eq(court.organizationId, validated.organizationId),
          eq(courtBooking.status, "confirmed"),
          gte(courtBooking.startAt, now),
        ),
      )
      .orderBy(asc(courtBooking.startAt))
      .limit(UPCOMING_LIMIT),
    db
      .select({ count: count() })
      .from(courtBooking)
      .innerJoin(court, eq(courtBooking.courtId, court.id))
      .where(
        and(
          eq(courtBooking.userId, validated.userId),
          eq(court.organizationId, validated.organizationId),
          eq(courtBooking.status, "confirmed"),
        ),
      ),
  ]);

  return c.json({ upcoming, totalCount: totalResult[0]?.count ?? 0 });
};
