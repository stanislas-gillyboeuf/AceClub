import { Context } from "hono";
import { z } from "zod";
import { and, count, eq, gte, ilike, inArray, or } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, user, clubMemberProfile, courtBooking } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { listClubMembersValidator } from "../validators";

const RECENT_BOOKING_WINDOW_DAYS = 90;

export const listClubMembers = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listClubMembersValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const profileJoin = and(
    eq(clubMemberProfile.userId, member.userId),
    eq(clubMemberProfile.organizationId, member.organizationId),
  );

  const baseWhere = eq(member.organizationId, validated.organizationId);
  const whereClause = validated.search
    ? and(
        baseWhere,
        or(
          ilike(user.name, `%${validated.search}%`),
          ilike(user.email, `%${validated.search}%`),
          ilike(clubMemberProfile.licenseNumber, `%${validated.search}%`),
        ),
      )
    : baseWhere;

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        memberId: member.id,
        role: member.role,
        restrictedDashboardAccess: member.restrictedDashboardAccess,
        memberSince: member.createdAt,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
        isGhost: user.is_ghost,
        licenseNumber: clubMemberProfile.licenseNumber,
        licenseValidUntil: clubMemberProfile.licenseValidUntil,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .leftJoin(clubMemberProfile, profileJoin)
      .where(whereClause)
      .orderBy(user.name)
      .limit(validated.limit)
      .offset(validated.offset),
    db
      .select({ count: count() })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .leftJoin(clubMemberProfile, profileJoin)
      .where(whereClause),
  ]);

  const userIds = rows.map((row) => row.userId);
  const since = new Date(Date.now() - RECENT_BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const bookingCounts = userIds.length
    ? await db
        .select({ userId: courtBooking.userId, count: count() })
        .from(courtBooking)
        .where(
          and(
            inArray(courtBooking.userId, userIds),
            gte(courtBooking.startAt, since),
            eq(courtBooking.status, "confirmed"),
          ),
        )
        .groupBy(courtBooking.userId)
    : [];

  const bookingCountByUserId = new Map(bookingCounts.map((row) => [row.userId, row.count]));

  return c.json({
    members: rows.map((row) => ({
      ...row,
      recentBookingCount: bookingCountByUserId.get(row.userId) ?? 0,
    })),
    total: totalResult[0]?.count ?? 0,
  });
};
