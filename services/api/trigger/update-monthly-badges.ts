import { schedules } from "@trigger.dev/sdk";
import { updateMonthlyBadgesForAllUsers } from "../server/reward/services/badge-service";

/**
 * Update monthly badges (joueur_regulier, en_forme) for all users
 * Runs every day at 00:00 Paris time (UTC+1/+2)
 */
export const updateMonthlyBadgesTask = schedules.task({
  id: "update-monthly-badges",
  cron: {
    pattern: "0 0 * * *", // Every day at midnight
    timezone: "Europe/Paris",
  },
  run: async (payload) => {
    console.log(
      `[TRIGGER] Starting update-monthly-badges at ${payload.timestamp.toISOString()}`
    );

    const result = await updateMonthlyBadgesForAllUsers();

    console.log(
      `[TRIGGER] Completed update-monthly-badges: ${result.processed} users processed, ${result.errors} errors`
    );

    return {
      success: true,
      timestamp: payload.timestamp,
      ...result,
    };
  },
});
