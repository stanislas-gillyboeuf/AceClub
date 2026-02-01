import { schedules } from "@trigger.dev/sdk";
import { db } from "../db";
import { userChallenge } from "../db/schema/challenge/schema";
import { eq, lt, and } from "drizzle-orm";

/**
 * Expire challenges that have passed their expiration date
 * Runs daily at 00:05 UTC
 */
export const expireChallengesTask = schedules.task({
  id: "expire-challenges",
  cron: {
    pattern: "5 0 * * *", // Daily 00:05 UTC
    timezone: "UTC",
  },
  run: async (payload) => {
    console.log(`[TRIGGER] Starting expire-challenges at ${payload.timestamp.toISOString()}`);

    const now = new Date();

    const result = await db
      .update(userChallenge)
      .set({ status: "expired" })
      .where(
        and(eq(userChallenge.status, "active"), lt(userChallenge.expiresAt, now))
      )
      .returning({ id: userChallenge.id });

    console.log(`[TRIGGER] Marked ${result.length} challenges as expired`);

    return {
      success: true,
      expiredCount: result.length,
      timestamp: payload.timestamp
    };
  },
});
