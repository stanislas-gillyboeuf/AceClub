import { eq, and, sql } from "drizzle-orm";
import { db } from "../../../db";
import { userChallenge, challengeTemplate } from "../../../db/schema/challenge/schema";
import { userLevel, xpTransaction } from "../../../db/schema/level/schema";
import { calculateLevelFromXp } from "../../level/services/xp-calculator";

export async function updateChallengeProgress(
  userId: string,
  matchId: string,
  isWinner: boolean
): Promise<void> {
  const activeChallenges = await db
    .select({
      challenge: userChallenge,
      template: challengeTemplate,
    })
    .from(userChallenge)
    .innerJoin(challengeTemplate, eq(userChallenge.templateId, challengeTemplate.id))
    .where(
      and(
        eq(userChallenge.userId, userId),
        eq(userChallenge.status, "active")
      )
    );

  for (const { challenge, template } of activeChallenges) {
    let shouldIncrement = false;

    switch (template.code) {
      case "PLAY_3_MATCHES":
      case "PLAY_5_MATCHES":
      case "PLAY_10_MATCHES":
        shouldIncrement = true;
        break;
      case "WIN_3_MATCHES":
      case "WIN_5_MATCHES":
        shouldIncrement = isWinner;
        break;
      default:
        if (template.type === "quantitative" && template.code.startsWith("PLAY_")) {
          shouldIncrement = true;
        } else if (template.type === "quantitative" && template.code.startsWith("WIN_")) {
          shouldIncrement = isWinner;
        }
    }

    if (shouldIncrement) {
      const newProgress = challenge.currentProgress + 1;
      const isCompleted = newProgress >= challenge.targetValue;

      await db
        .update(userChallenge)
        .set({
          currentProgress: newProgress,
          status: isCompleted ? "completed" : "active",
          completedAt: isCompleted ? new Date() : null,
          xpAwarded: isCompleted ? template.xpReward : null,
        })
        .where(eq(userChallenge.id, challenge.id));

      if (isCompleted) {
        await db.insert(xpTransaction).values({
          userId,
          type: "challenge_completed",
          amount: template.xpReward,
          referenceId: challenge.id,
          referenceType: "challenge",
          description: template.titleFr,
        });

        await db
          .update(userLevel)
          .set({
            totalXp: sql`${userLevel.totalXp} + ${template.xpReward}`,
          })
          .where(eq(userLevel.userId, userId));
      }
    }
  }
}
