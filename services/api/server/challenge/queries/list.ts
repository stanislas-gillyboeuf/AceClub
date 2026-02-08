import { Context } from "hono";
import { eq, and } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userChallenge, challengeTemplate } from "../../../db/schema/challenge/schema";

export const getMyChallenges = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const challenges = await db
    .select({
      id: userChallenge.id,
      currentProgress: userChallenge.currentProgress,
      targetValue: userChallenge.targetValue,
      status: userChallenge.status,
      expiresAt: userChallenge.expiresAt,
      completedAt: userChallenge.completedAt,
      acesAwarded: userChallenge.acesAwarded,
      template: {
        code: challengeTemplate.code,
        type: challengeTemplate.type,
        difficulty: challengeTemplate.difficulty,
        titleFr: challengeTemplate.titleFr,
        titleEn: challengeTemplate.titleEn,
        descriptionFr: challengeTemplate.descriptionFr,
        descriptionEn: challengeTemplate.descriptionEn,
        acesReward: challengeTemplate.acesReward,
      },
    })
    .from(userChallenge)
    .innerJoin(challengeTemplate, eq(userChallenge.templateId, challengeTemplate.id))
    .where(and(eq(userChallenge.userId, authUser!.id), eq(userChallenge.status, "active")));

  return c.json({
    challenges: challenges.map((ch) => ({
      id: ch.id,
      code: ch.template.code,
      type: ch.template.type,
      difficulty: ch.template.difficulty,
      title: ch.template.titleFr,
      description: ch.template.descriptionFr,
      currentProgress: ch.currentProgress,
      targetValue: ch.targetValue,
      acesReward: ch.template.acesReward,
      status: ch.status,
      expiresAt: ch.expiresAt,
    })),
  });
};
