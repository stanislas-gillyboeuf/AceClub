/**
 * Cron Jobs Handler pour Railway
 *
 * Sur Railway, crée 4 services cron séparés avec ces configurations :
 *
 * 1. Service: cron-assign-challenges
 *    - Cron Schedule: 0 0 * * 1 (Lundi 00:00 UTC)
 *    - Start Command: npm run cron:assign-challenges
 *
 * 2. Service: cron-expire-challenges
 *    - Cron Schedule: 5 0 * * * (Quotidien 00:05 UTC)
 *    - Start Command: npm run cron:expire-challenges
 *
 * 3. Service: cron-streak-warning
 *    - Cron Schedule: 0 18 * * 5 (Vendredi 18:00 UTC)
 *    - Start Command: npm run cron:streak-warning
 *
 * 4. Service: cron-cleanup-expired-intents
 *    - Cron Schedule: 0 1 * * * (Quotidien 01:00 UTC)
 *    - Start Command: npm run cron:cleanup-expired-intents
 */

// Load environment variables (tsx doesn't auto-load .env like bun does)
import "dotenv/config";

import { assignWeeklyChallenges } from "../challenge/services/challenge-selector";
import { cleanupExpiredMatchIntents } from "../match_intents/services/cleanup";
import { db } from "../../db";
import { userChallenge } from "../../db/schema/challenge/schema";
import { userStreak } from "../../db/schema/streak/schema";
import { eq, lt, and, ne, isNull, or } from "drizzle-orm";
import { sendPushNotification } from "../../services/apns";
import { sendNotificationToUser } from "../../services/apns/notification-service";

type CronTask =
  | "assign-weekly-challenges"
  | "expire-challenges"
  | "streak-warning"
  | "cleanup-expired-intents";

function getCurrentWeekAndYear(): { week: number; year: number } {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return { week: weekNumber, year: now.getFullYear() };
}

async function expireChallenges() {
  const now = new Date();

  const result = await db
    .update(userChallenge)
    .set({ status: "expired" })
    .where(
      and(eq(userChallenge.status, "active"), lt(userChallenge.expiresAt, now))
    )
    .returning({ id: userChallenge.id });

  console.log(
    `[CRON] Marked ${result.length} challenges as expired at ${now.toISOString()}`
  );
}

async function sendStreakWarnings() {
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
          ne(userStreak.lastActiveYear, currentYear)
        )
      )
    );

  console.log(
    `[CRON] Found ${usersWithStreak.length} users at risk of losing streak`
  );

  // TODO: Envoyer des notifications push à ces utilisateurs
  // Pour chaque utilisateur, créer une notification "streak_warning"
  // Utiliser le système de notification existant

  for (const userStreak of usersWithStreak) {
    console.log(
      `[CRON] User ${userStreak.userId} has ${userStreak.currentStreak} week streak at risk`
    );
    await sendNotificationToUser({ userId: userStreak.userId, type: "streak_warning", title: "Streak Warning", body: `Your streak is at risk. You have ${userStreak.currentStreak} weeks of consecutive matches.`, referenceId: userStreak.userId, referenceType: "user" });
  }

  console.log(`[CRON] Streak warnings processed at ${new Date().toISOString()}`);
}
async function runTask(task: CronTask) {
  console.log(`[CRON] ========================================`);
  console.log(`[CRON] Starting task: ${task}`);
  console.log(`[CRON] Time: ${new Date().toISOString()}`);
  console.log(`[CRON] ========================================`);

  const start = Date.now();

  try {
    switch (task) {
      case "assign-weekly-challenges":
        await assignWeeklyChallenges();
        break;
      case "expire-challenges":
        await expireChallenges();
        break;
      case "streak-warning":
        await sendStreakWarnings();
        break;
      case "cleanup-expired-intents":
        await cleanupExpiredMatchIntents();
        break;
      default:
        throw new Error(`Unknown task: ${task}`);
    }

    const duration = Date.now() - start;
    console.log(`[CRON] ========================================`);
    console.log(`[CRON] Task ${task} completed successfully`);
    console.log(`[CRON] Duration: ${duration}ms`);
    console.log(`[CRON] ========================================`);
  } catch (error) {
    console.error(`[CRON] ========================================`);
    console.error(`[CRON] Task ${task} FAILED`);
    console.error(`[CRON] Error:`, error);
    console.error(`[CRON] ========================================`);
    process.exit(1);
  }
}

// Point d'entrée
const task = (process.argv[2] || process.env.CRON_TASK) as CronTask;

if (!task) {
  console.error("Usage: npm run cron:<task-name>");
  console.error("  or:  npx tsx server/cron/index.ts <task>");
  console.error("");
  console.error("Available tasks:");
  console.error("  - assign-weekly-challenges");
  console.error("  - expire-challenges");
  console.error("  - streak-warning");
  console.error("  - cleanup-expired-intents");
  process.exit(1);
}

runTask(task)
  .then(() => {
    console.log("[CRON] Process exiting with code 0");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[CRON] Unhandled error:", error);
    process.exit(1);
  });
