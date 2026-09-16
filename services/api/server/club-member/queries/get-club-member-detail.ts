import { Context } from "hono";
import { z } from "zod";
import { and, count, desc, eq, lt } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, user, clubMemberProfile, courtBooking, court, userPreference } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { getClubMemberDetailValidator } from "../validators";

const BOOKING_HISTORY_LIMIT = 20;

export const getClubMemberDetail = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getClubMemberDetailValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const [memberRow] = await db
    .select({
      memberId: member.id,
      role: member.role,
      memberSince: member.createdAt,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
      userPhone: user.phoneNumber,
      dateOfBirth: user.date_of_birth,
      isGhost: user.is_ghost,
      licenseNumber: clubMemberProfile.licenseNumber,
      licenseValidUntil: clubMemberProfile.licenseValidUntil,
      medicalCertificateValidUntil: clubMemberProfile.medicalCertificateValidUntil,
      phoneOverride: clubMemberProfile.phoneOverride,
      notes: clubMemberProfile.notes,
      city: clubMemberProfile.city,
      isVip: clubMemberProfile.isVip,
      sport: userPreference.sport,
      skillLevel: userPreference.skillLevel,
      skillLevelVerified: userPreference.skillLevelVerified,
      secondarySport: userPreference.secondarySport,
      secondarySkillLevel: userPreference.secondarySkillLevel,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .leftJoin(
      clubMemberProfile,
      and(
        eq(clubMemberProfile.userId, member.userId),
        eq(clubMemberProfile.organizationId, member.organizationId),
      ),
    )
    .leftJoin(userPreference, eq(userPreference.userId, member.userId))
    .where(
      and(eq(member.organizationId, validated.organizationId), eq(member.userId, validated.userId)),
    )
    .limit(1);

  if (!memberRow) {
    return c.json({ error: "NotFound", message: "Member not found" }, 404);
  }

  const bookingScope = and(
    eq(courtBooking.userId, validated.userId),
    eq(court.organizationId, validated.organizationId),
  );

  const [bookings, [lastBooking], [cancelledResult]] = await Promise.all([
    db
      .select({
        id: courtBooking.id,
        courtName: court.name,
        sport: court.sport,
        startAt: courtBooking.startAt,
        endAt: courtBooking.endAt,
        status: courtBooking.status,
      })
      .from(courtBooking)
      .innerJoin(court, eq(courtBooking.courtId, court.id))
      .where(bookingScope)
      .orderBy(desc(courtBooking.startAt))
      .limit(BOOKING_HISTORY_LIMIT),
    db
      .select({ startAt: courtBooking.startAt })
      .from(courtBooking)
      .innerJoin(court, eq(courtBooking.courtId, court.id))
      .where(and(bookingScope, eq(courtBooking.status, "confirmed"), lt(courtBooking.startAt, new Date())))
      .orderBy(desc(courtBooking.startAt))
      .limit(1),
    db
      .select({ count: count() })
      .from(courtBooking)
      .innerJoin(court, eq(courtBooking.courtId, court.id))
      .where(and(bookingScope, eq(courtBooking.status, "cancelled"))),
  ]);

  return c.json({
    member: { ...memberRow, lastBookingAt: lastBooking?.startAt ?? null },
    bookings,
    cancelledBookingCount: cancelledResult?.count ?? 0,
  });
};
