import { Hono } from "hono";
import { assignWeeklyChallenges } from "../challenge/services/challenge-selector";
import { cleanupExpiredMatchIntents } from "../match_intents/services/cleanup";
import { db } from "../../db";
import { userChallenge } from "../../db/schema/challenge/schema";
import { eq, lt, and } from "drizzle-orm";

export const cronRouter = new Hono();

// Middleware pour vérifier le secret cron
cronRouter.use("/*", async (c, next) => {
  const cronSecret = c.req.header("X-Cron-Secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.warn("[CRON] CRON_SECRET not configured");
    return c.json({ error: "Cron not configured" }, 500);
  }

  if (cronSecret !== expectedSecret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

// POST /cron/assign-weekly-challenges
// Schedule: "0 0 * * 1" (Lundi 00:00 UTC)
cronRouter.post("/assign-weekly-challenges", async (c) => {
  try {
    await assignWeeklyChallenges();
    return c.json({ success: true, message: "Weekly challenges assigned" });
  } catch (error) {
    console.error("[CRON] assign-weekly-challenges failed:", error);
    return c.json({ error: "Failed to assign challenges" }, 500);
  }
});

// POST /cron/expire-challenges
// Schedule: "5 0 * * *" (Quotidien 00:05 UTC)
cronRouter.post("/expire-challenges", async (c) => {
  try {
    const now = new Date();

    const result = await db
      .update(userChallenge)
      .set({ status: "expired" })
      .where(
        and(
          eq(userChallenge.status, "active"),
          lt(userChallenge.expiresAt, now)
        )
      );

    return c.json({
      success: true,
      message: "Expired challenges updated",
    });
  } catch (error) {
    console.error("[CRON] expire-challenges failed:", error);
    return c.json({ error: "Failed to expire challenges" }, 500);
  }
});

// POST /cron/streak-warning
// Schedule: "0 18 * * 5" (Vendredi 18:00 UTC)
cronRouter.post("/streak-warning", async (c) => {
  try {
    // TODO: Implémenter l'envoi de notifications
    // aux utilisateurs qui n'ont pas joué cette semaine
    return c.json({
      success: true,
      message: "Streak warnings sent",
    });
  } catch (error) {
    console.error("[CRON] streak-warning failed:", error);
    return c.json({ error: "Failed to send warnings" }, 500);
  }
});

// POST /cron/cleanup-expired-intents
// Schedule: "0 1 * * *" (Quotidien 01:00 UTC)
cronRouter.post("/cleanup-expired-intents", async (c) => {
  try {
    const result = await cleanupExpiredMatchIntents();
    return c.json({
      success: true,
      message: "Expired match intents cleaned up",
      ...result,
    });
  } catch (error) {
    console.error("[CRON] cleanup-expired-intents failed:", error);
    return c.json({ error: "Failed to cleanup expired intents" }, 500);
  }
});
