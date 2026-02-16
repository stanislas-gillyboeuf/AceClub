import { schedules } from "@trigger.dev/sdk";
import { db } from "../db";
import { userStreak } from "../db/schema/streak/schema";
import { eq, ne, and, or, isNull } from "drizzle-orm";
import { sendNotificationToUser } from "../services/expo-push/notification-service";

function getCurrentWeekAndYear(): { week: number; year: number } {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return { week: weekNumber, year: now.getFullYear() };
}

/**
 * Send streak warnings to users who haven't been active this week
 * Runs every Friday at 18:00 UTC
 */
export const streakWarningTask = schedules.task({
  id: "streak-warning",
  cron: {
    pattern: "0 18 * * 5", // Friday 18:00 UTC
    timezone: "UTC",
  },
  run: async (payload) => {
    console.log(`[TRIGGER] Starting streak-warning at ${payload.timestamp.toISOString()}`);

    const { week: currentWeek, year: currentYear } = getCurrentWeekAndYear();

    const usersWithStreak = await db
      .select({
        userId: userStreak.userId,
        currentStreak: userStreak.currentStreak,
        lastActiveWeek: userStreak.lastActiveWeek,
        lastActiveYear: userStreak.lastActiveYear,
      })
      .from(userStreak)
      .where(
        and(
          ne(userStreak.currentStreak, 0),
          or(
            isNull(userStreak.lastActiveWeek),
            isNull(userStreak.lastActiveYear),
            ne(userStreak.lastActiveWeek, currentWeek),
            ne(userStreak.lastActiveYear, currentYear),
          ),
        ),
      );

    console.log(`[TRIGGER] Found ${usersWithStreak.length} users at risk of losing streak`);

    let notificationsSent = 0;

    for (const streak of usersWithStreak) {
      try {
        await sendNotificationToUser({
          userId: streak.userId,
          type: "streak_warning",
          title: "Ton streak est en danger 🔥",
          body: `Psss, t'as pas encore joué cette semaine ! Tu risques de perdre ta série de ${streak.currentStreak} semaines`,
          referenceId: streak.userId,
          referenceType: "user",
        });
        notificationsSent++;
      } catch (error) {
        console.error(`[TRIGGER] Failed to send notification to user ${streak.userId}:`, error);
      }
    }

    console.log(`[TRIGGER] Sent ${notificationsSent} streak warnings`);

    return {
      success: true,
      usersAtRisk: usersWithStreak.length,
      notificationsSent,
      timestamp: payload.timestamp,
    };
  },
});
