import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { challengeTemplate } from "../../../db/schema/challenge/schema";

export const getChallengeTemplates = async (c: Context<HonoContext>) => {
  const templates = await db
    .select()
    .from(challengeTemplate)
    .where(eq(challengeTemplate.isActive, true));

  return c.json({
    templates: templates.map((t) => ({
      id: t.id,
      code: t.code,
      type: t.type,
      difficulty: t.difficulty,
      titleFr: t.titleFr,
      titleEn: t.titleEn,
      descriptionFr: t.descriptionFr,
      descriptionEn: t.descriptionEn,
      targetValue: t.targetValue,
      xpReward: t.xpReward,
      minLevel: t.minLevel,
      maxLevel: t.maxLevel,
    })),
  });
};
