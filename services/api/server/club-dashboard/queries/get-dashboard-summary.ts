import { Context } from "hono";
import { z } from "zod";
import { and, count, eq, gte, inArray, lt } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court, courtBooking, member } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { getCourtSettings } from "../../court/lib/settings";
import { getWeekBounds } from "../../court/lib/quota";
import { getDashboardSummaryValidator } from "../validators";

const WEEKS_TO_SHOW = 6;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function formatWeekLabel(weekStart: Date) {
  return weekStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export const getDashboardSummary = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getDashboardSummaryValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const currentWeek = getWeekBounds(new Date());
  const earliestWeekStart = new Date(currentWeek.weekStart.getTime() - (WEEKS_TO_SHOW - 1) * WEEK_MS);

  const [activeCourts, settings, memberCountResult] = await Promise.all([
    db
      .select({ id: court.id })
      .from(court)
      .where(and(eq(court.organizationId, validated.organizationId), eq(court.isActive, true))),
    getCourtSettings(validated.organizationId),
    db
      .select({ count: count() })
      .from(member)
      .where(eq(member.organizationId, validated.organizationId)),
  ]);

  const activeCourtIds = activeCourts.map((c) => c.id);
  const openHoursPerCourtPerWeek = Math.max(0, settings.closingHour - settings.openingHour) * 7;
  const openHoursPerWeek = activeCourtIds.length * openHoursPerCourtPerWeek;

  const bookedHoursByWeekIndex = new Array<number>(WEEKS_TO_SHOW).fill(0);

  if (activeCourtIds.length > 0) {
    const bookings = await db
      .select({ startAt: courtBooking.startAt, endAt: courtBooking.endAt })
      .from(courtBooking)
      .where(
        and(
          inArray(courtBooking.courtId, activeCourtIds),
          eq(courtBooking.status, "confirmed"),
          gte(courtBooking.startAt, earliestWeekStart),
          lt(courtBooking.startAt, currentWeek.weekEnd),
        ),
      );

    for (const booking of bookings) {
      const weekIndex = Math.floor(
        (booking.startAt.getTime() - earliestWeekStart.getTime()) / WEEK_MS,
      );
      if (weekIndex < 0 || weekIndex >= WEEKS_TO_SHOW) continue;
      const hours = (booking.endAt.getTime() - booking.startAt.getTime()) / (60 * 60 * 1000);
      bookedHoursByWeekIndex[weekIndex] += hours;
    }
  }

  const weeklyTrend = bookedHoursByWeekIndex.map((bookedHours, i) => {
    const weekStart = new Date(earliestWeekStart.getTime() + i * WEEK_MS);
    const percent = openHoursPerWeek > 0 ? Math.min(100, (bookedHours / openHoursPerWeek) * 100) : 0;
    return { weekLabel: formatWeekLabel(weekStart), percent: Math.round(percent * 10) / 10 };
  });

  const currentWeekPercent = weeklyTrend[weeklyTrend.length - 1]?.percent ?? 0;
  const previousWeekPercent = weeklyTrend[weeklyTrend.length - 2]?.percent ?? 0;

  return c.json({
    activeMembers: memberCountResult[0]?.count ?? 0,
    activeCourtsCount: activeCourtIds.length,
    occupancy: {
      currentWeekPercent,
      previousWeekPercent,
      deltaPercentPoints: Math.round((currentWeekPercent - previousWeekPercent) * 10) / 10,
      weeklyTrend,
    },
  });
};
