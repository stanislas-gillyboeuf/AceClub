import { schedules } from "@trigger.dev/sdk";
import { cleanupExpiredMatchIntents } from "../server/match_intents/services/cleanup";

/**
 * Cleanup expired match intents and their associated data
 * Runs daily at 01:00 UTC
 */
export const cleanupExpiredIntentsTask = schedules.task({
  id: "cleanup-expired-intents",
  cron: {
    pattern: "0 1 * * *", // Daily 01:00 UTC
    timezone: "UTC",
  },
  run: async (payload) => {
    console.log(`[TRIGGER] Starting cleanup-expired-intents at ${payload.timestamp.toISOString()}`);

    const result = await cleanupExpiredMatchIntents();

    console.log(`[TRIGGER] Cleanup completed: ${result.deletedIntents} intents, ${result.deletedSwipes} swipes, ${result.deletedRequests} requests`);

    return {
      success: true,
      ...result,
      timestamp: payload.timestamp
    };
  },
});
