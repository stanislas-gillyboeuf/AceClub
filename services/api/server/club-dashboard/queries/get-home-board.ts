import { Context } from "hono";
import { z } from "zod";
import { and, count, desc, eq, gte, inArray, lt } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, court, courtBooking, duesAssignment, duesType, member, user } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { getWeekBounds } from "../../court/lib/quota";
import { getCourtSettings } from "../../court/lib/settings";
import { getDashboardSummaryValidator } from "../validators";

const DUES_DUE_SOON_WINDOW_DAYS = 30;
const TOP_PLAYERS_WINDOW_DAYS = 90;
const TOP_PLAYERS_LIMIT = 5;
const OCCUPANCY_HISTORY_DAYS = 7;

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
  const activeCourtIds = activeCourts.map((cc) => cc.id);
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

  const openHoursPerCourtPerDay = Math.max(0, settings.closingHour - settings.openingHour);
  const openHoursPerDay = activeCourts.length * openHoursPerCourtPerDay;

  const { weekStart, weekEnd } = getWeekBounds(now);
  let occupancyPercent = 0;
  if (activeCourts.length > 0) {
    const weekBookings = await db
      .select({ startAt: courtBooking.startAt, endAt: courtBooking.endAt })
      .from(courtBooking)
      .where(
        and(
          inArray(courtBooking.courtId, activeCourtIds),
          eq(courtBooking.status, "confirmed"),
          gte(courtBooking.startAt, weekStart),
          lt(courtBooking.startAt, weekEnd),
        ),
      );
    const bookedHours = weekBookings.reduce(
      (sum, b) => sum + (b.endAt.getTime() - b.startAt.getTime()) / (60 * 60 * 1000),
      0,
    );
    const openHoursPerWeek = openHoursPerDay * 7;
    occupancyPercent = openHoursPerWeek > 0 ? Math.round(Math.min(100, (bookedHours / openHoursPerWeek) * 100)) : 0;
  }

  // --- Occupancy histogram (daily %, last 7 days including today) ---
  const historyStart = new Date(todayStart.getTime() - (OCCUPANCY_HISTORY_DAYS - 1) * 24 * 60 * 60 * 1000);
  const historyBookings =
    activeCourts.length === 0
      ? []
      : await db
          .select({ startAt: courtBooking.startAt, endAt: courtBooking.endAt })
          .from(courtBooking)
          .where(
            and(
              inArray(courtBooking.courtId, activeCourtIds),
              eq(courtBooking.status, "confirmed"),
              gte(courtBooking.startAt, historyStart),
              lt(courtBooking.startAt, todayEnd),
            ),
          );

  const occupancyByDay = Array.from({ length: OCCUPANCY_HISTORY_DAYS }, (_, i) => {
    const dayStart = new Date(historyStart.getTime() + i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const bookedHours = historyBookings
      .filter((b) => b.startAt >= dayStart && b.startAt < dayEnd)
      .reduce((sum, b) => sum + (b.endAt.getTime() - b.startAt.getTime()) / (60 * 60 * 1000), 0);
    const percent = openHoursPerDay > 0 ? Math.round(Math.min(100, (bookedHours / openHoursPerDay) * 100)) : 0;
    return {
      date: dateKey(dayStart),
      label: dayStart.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" }),
      percent,
    };
  });

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
              inArray(courtBooking.courtId, activeCourtIds),
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
    duesDueSoon,
    topPlayers,
    occupancyByDay,
  });
};
