import { Context } from "hono";
import { z } from "zod";
import { and, count, desc, eq, gte, inArray, lt } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  clubMemberProfile,
  course,
  courseEnrollment,
  court,
  courtBooking,
  duesAssignment,
  duesType,
  member,
  user,
} from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { getWeekBounds } from "../../court/lib/quota";
import { getCourtSettings } from "../../court/lib/settings";
import { zonedDateTime } from "../../court/lib/timezone";
import { computeMemberAlerts } from "../lib/member-alerts";
import { getDashboardSummaryValidator } from "../validators";

const NEW_MEMBER_WINDOW_DAYS = 30;
const DUES_DUE_SOON_WINDOW_DAYS = 30;
const SLOTS_TO_FILL_LIMIT = 8;
const SLOTS_TO_FILL_HORIZON_DAYS = 2;
const TOP_PLAYERS_WINDOW_DAYS = 90;
const TOP_PLAYERS_LIMIT = 5;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const getHomeBoard = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getDashboardSummaryValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const now = new Date();
  const todayStart = new Date(`${dateKey(now)}T00:00:00Z`);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [activeCourts, settings] = await Promise.all([
    db
      .select({ id: court.id, name: court.name })
      .from(court)
      .where(and(eq(court.organizationId, validated.organizationId), eq(court.isActive, true))),
    getCourtSettings(validated.organizationId),
  ]);
  const courtNameById = new Map(activeCourts.map((cc) => [cc.id, cc.name]));

  // --- Courses today (+ coach badge row) ---
  const coursesTodayRows =
    activeCourts.length === 0
      ? []
      : await db
          .select({
            id: courtBooking.id,
            courseId: courtBooking.courseId,
            startAt: courtBooking.startAt,
            endAt: courtBooking.endAt,
            courtId: courtBooking.courtId,
            coachUserId: course.coachUserId,
            coachName: user.name,
            coachImage: user.image,
            courseName: course.name,
          })
          .from(courtBooking)
          .innerJoin(course, eq(courtBooking.courseId, course.id))
          .innerJoin(user, eq(course.coachUserId, user.id))
          .where(
            and(
              eq(courtBooking.kind, "course"),
              eq(courtBooking.status, "confirmed"),
              gte(courtBooking.startAt, todayStart),
              lt(courtBooking.startAt, todayEnd),
            ),
          );

  const coursesToday = coursesTodayRows
    .filter((r) => courtNameById.has(r.courtId))
    .map((r) => ({
      occurrenceId: r.id,
      courseId: r.courseId,
      courseName: r.courseName,
      coachName: r.coachName,
      courtName: courtNameById.get(r.courtId)!,
      startAt: r.startAt,
      endAt: r.endAt,
    }));

  const coachBadgeCounts = new Map<string, { userId: string; name: string; image: string | null; coursesToday: number }>();
  for (const row of coursesTodayRows) {
    const existing = coachBadgeCounts.get(row.coachUserId);
    if (existing) existing.coursesToday++;
    else
      coachBadgeCounts.set(row.coachUserId, {
        userId: row.coachUserId,
        name: row.coachName,
        image: row.coachImage,
        coursesToday: 1,
      });
  }

  // --- Slots to fill (next 48h, any free slot — no historical fill-rate data yet) ---
  const slotsToFill: { courtId: string; courtName: string; date: string; hour: number }[] = [];
  if (activeCourts.length > 0) {
    const horizonEnd = new Date(now.getTime() + SLOTS_TO_FILL_HORIZON_DAYS * 24 * 60 * 60 * 1000);
    const busy = await db
      .select({ courtId: courtBooking.courtId, startAt: courtBooking.startAt, endAt: courtBooking.endAt })
      .from(courtBooking)
      .where(
        and(
          eq(courtBooking.status, "confirmed"),
          gte(courtBooking.startAt, now),
          lt(courtBooking.startAt, horizonEnd),
        ),
      );

    outer: for (let dayOffset = 0; dayOffset < SLOTS_TO_FILL_HORIZON_DAYS; dayOffset++) {
      const date = dateKey(new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000));
      for (let hour = settings.openingHour; hour < settings.closingHour; hour++) {
        const slotStart = zonedDateTime(date, `${String(hour).padStart(2, "0")}:00`);
        if (slotStart.getTime() < now.getTime()) continue;
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

        for (const cc of activeCourts) {
          const taken = busy.some(
            (b) => b.courtId === cc.id && slotStart < b.endAt && slotEnd > b.startAt,
          );
          if (!taken) {
            slotsToFill.push({ courtId: cc.id, courtName: cc.name, date, hour });
            if (slotsToFill.length >= SLOTS_TO_FILL_LIMIT) break outer;
          }
        }
      }
    }
  }

  // --- Member alerts (shared with the daily email digest) ---
  const memberAlerts = await computeMemberAlerts(validated.organizationId);

  // --- New members + onboarding checklist ---
  const newMemberSince = new Date(now.getTime() - NEW_MEMBER_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recentMembers = await db
    .select({
      userId: user.id,
      name: user.name,
      image: user.image,
      memberSince: member.createdAt,
      licenseNumber: clubMemberProfile.licenseNumber,
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
    .where(and(eq(member.organizationId, validated.organizationId), gte(member.createdAt, newMemberSince)));

  const newMembers = await Promise.all(
    recentMembers.map(async (m) => {
      const [bookingCountResult] = await db
        .select({ count: count() })
        .from(courtBooking)
        .where(eq(courtBooking.userId, m.userId));
      return {
        userId: m.userId,
        name: m.name,
        image: m.image,
        memberSince: m.memberSince,
        hasLicense: !!m.licenseNumber,
        hasBooked: (bookingCountResult?.count ?? 0) > 0,
      };
    }),
  );

  // --- Dues due within 30 days (including already-overdue pending ones) ---
  const duesDueSoonWindow = new Date(now.getTime() + DUES_DUE_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const duesDueSoon = await db
    .select({
      assignmentId: duesAssignment.id,
      userName: user.name,
      duesTypeName: duesType.name,
      amountCents: duesType.amountCents,
      dueDate: duesType.dueDate,
      status: duesAssignment.status,
    })
    .from(duesAssignment)
    .innerJoin(user, eq(duesAssignment.userId, user.id))
    .innerJoin(duesType, eq(duesAssignment.duesTypeId, duesType.id))
    .where(
      and(
        eq(duesAssignment.organizationId, validated.organizationId),
        eq(duesAssignment.status, "pending"),
        lt(duesType.dueDate, duesDueSoonWindow),
      ),
    );

  // --- Lightweight stats strip (members, active courts, occupancy this week) ---
  const [activeMembersResult] = await db
    .select({ count: count() })
    .from(member)
    .where(eq(member.organizationId, validated.organizationId));

  const { weekStart, weekEnd } = getWeekBounds(now);
  const openHoursPerCourtPerWeek = Math.max(0, settings.closingHour - settings.openingHour) * 7;
  const openHoursPerWeek = activeCourts.length * openHoursPerCourtPerWeek;
  let occupancyPercent = 0;
  if (activeCourts.length > 0) {
    const weekBookings = await db
      .select({ startAt: courtBooking.startAt, endAt: courtBooking.endAt })
      .from(courtBooking)
      .where(
        and(
          inArray(courtBooking.courtId, activeCourts.map((cc) => cc.id)),
          eq(courtBooking.status, "confirmed"),
          gte(courtBooking.startAt, weekStart),
          lt(courtBooking.startAt, weekEnd),
        ),
      );
    const bookedHours = weekBookings.reduce(
      (sum, b) => sum + (b.endAt.getTime() - b.startAt.getTime()) / (60 * 60 * 1000),
      0,
    );
    occupancyPercent = openHoursPerWeek > 0 ? Math.round(Math.min(100, (bookedHours / openHoursPerWeek) * 100)) : 0;
  }

  // --- Top players (most confirmed member bookings in the last 90 days) ---
  const topPlayersWindowStart = new Date(now.getTime() - TOP_PLAYERS_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const topPlayersRows =
    activeCourts.length === 0
      ? []
      : await db
          .select({ userId: courtBooking.userId, bookingCount: count() })
          .from(courtBooking)
          .where(
            and(
              inArray(courtBooking.courtId, activeCourts.map((cc) => cc.id)),
              eq(courtBooking.kind, "member"),
              eq(courtBooking.status, "confirmed"),
              gte(courtBooking.startAt, topPlayersWindowStart),
            ),
          )
          .groupBy(courtBooking.userId)
          .orderBy(desc(count()))
          .limit(TOP_PLAYERS_LIMIT);

  const topPlayerUserIds = topPlayersRows.map((r) => r.userId);
  const topPlayerUsers = topPlayerUserIds.length
    ? await db
        .select({ id: user.id, name: user.name, image: user.image })
        .from(user)
        .where(inArray(user.id, topPlayerUserIds))
    : [];
  const topPlayerUserById = new Map(topPlayerUsers.map((u) => [u.id, u]));
  const topPlayers = topPlayersRows
    .map((r) => {
      const u = topPlayerUserById.get(r.userId);
      return u ? { userId: u.id, name: u.name, image: u.image, bookingCount: r.bookingCount } : null;
    })
    .filter((r): r is { userId: string; name: string; image: string | null; bookingCount: number } => !!r);

  return c.json({
    stats: {
      activeMembers: activeMembersResult?.count ?? 0,
      activeCourts: activeCourts.length,
      occupancyPercent,
    },
    coachBadges: Array.from(coachBadgeCounts.values()),
    coursesToday,
    slotsToFill,
    memberAlerts,
    newMembers,
    duesDueSoon,
    topPlayers,
  });
};
