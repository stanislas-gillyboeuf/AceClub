import { schedules } from "@trigger.dev/sdk";
import { assignWeeklyChallenges } from "../server/challenge/services/challenge-selector";

/**
 * Assign weekly challenges to all users
 * Runs every Monday at 09:00 UTC
 */
export const assignWeeklyChallengesTask = schedules.task({
  id: "assign-weekly-challenges",
  cron: {
    pattern: "0 9 * * 1", // Monday 09:00 UTC
    timezone: "UTC",
  },
  run: async (payload) => {
    console.log(
      `[TRIGGER] Starting assign-weekly-challenges at ${payload.timestamp.toISOString()}`,
    );

    await assignWeeklyChallenges();

    console.log(`[TRIGGER] Completed assign-weekly-challenges`);
    return { success: true, timestamp: payload.timestamp };
  },
});
