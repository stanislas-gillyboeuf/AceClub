import { eq, and, sql } from "drizzle-orm";
import { db } from "../../../db";
import { userChallenge, challengeTemplate } from "../../../db/schema/challenge/schema";
import { userLevel, acesTransaction } from "../../../db/schema/level/schema";
import { calculateLevelFromAces } from "../../level/services/xp-calculator";

export async function updateChallengeProgress(
  userId: string,
  matchId: string,
  isWinner: boolean,
): Promise<void> {
  const activeChallenges = await db
    .select({
      challenge: userChallenge,
      template: challengeTemplate,
    })
    .from(userChallenge)
    .innerJoin(challengeTemplate, eq(userChallenge.templateId, challengeTemplate.id))
    .where(and(eq(userChallenge.userId, userId), eq(userChallenge.status, "active")));

  for (const { challenge, template } of activeChallenges) {
    let shouldIncrement = false;

    // Quantitative challenges: play_X_matches
    if (template.type === "quantitative" && template.code.startsWith("play_")) {
      shouldIncrement = true;
    }
    // Performance challenges: win_X_matches, win_X_consecutive
    else if (template.type === "performance" && template.code.startsWith("win_")) {
      shouldIncrement = isWinner;
    }
    // Social challenges: play_with_new_player, play_with_X_new_players
    // Note: Social challenges need more complex logic (tracking unique opponents)
    // For now, we increment on any match for social challenges
    else if (template.type === "social") {
      shouldIncrement = true;
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
          acesAwarded: isCompleted ? template.acesReward : null,
        })
        .where(eq(userChallenge.id, challenge.id));

      if (isCompleted) {
        await db.insert(acesTransaction).values({
          userId,
          type: "challenge_completed",
          amount: template.acesReward,
          referenceId: challenge.id,
          referenceType: "challenge",
          description: template.titleFr,
        });

        await db
          .update(userLevel)
          .set({
            totalAces: sql`${userLevel.totalAces} + ${template.acesReward}`,
          })
          .where(eq(userLevel.userId, userId));
      }
    }
  }
}
