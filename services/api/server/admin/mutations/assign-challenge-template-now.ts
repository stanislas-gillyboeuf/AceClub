import { Context } from "hono";
import { and, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { challengeTemplate, userChallenge } from "../../../db/schema/challenge/schema";
import { user } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import {
  getISOWeekInfo,
  getWeekEndDate,
} from "../../challenge/services/challenge-selector";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";

export const assignChallengeTemplateNow = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");

  const [template] = await db
    .select()
    .from(challengeTemplate)
    .where(eq(challengeTemplate.id, id))
    .limit(1);

  if (!template) {
    return c.json({ error: "NotFound", message: "Challenge template not found" }, 404);
  }

  if (!template.isActive) {
    return c.json(
      { error: "BadRequest", message: "Cannot distribute an inactive template" },
      400,
    );
  }

  const now = new Date();
  const { week, year } = getISOWeekInfo(now);
  const expiresAt = getWeekEndDate(now);

  const effectiveLevel = sql<number>`COALESCE(${userLevel.currentLevel}, 1)`;
  const levelConditions: SQL[] = [gte(effectiveLevel, template.minLevel)];
  if (template.maxLevel !== null) {
    levelConditions.push(lte(effectiveLevel, template.maxLevel));
  }

  const eligibleUsers = await db
    .select({ userId: user.id })
    .from(user)
    .leftJoin(userLevel, eq(user.id, userLevel.userId))
    .where(and(...levelConditions));

  if (eligibleUsers.length === 0) {
    return c.json({ assignedCount: 0, skippedCount: 0 });
  }

  const inserted = await db
    .insert(userChallenge)
    .values(
      eligibleUsers.map((u) => ({
        userId: u.userId,
        templateId: template.id,
        weekNumber: week,
        year,
        targetValue: template.targetValue,
        expiresAt,
      })),
    )
    .onConflictDoNothing({
      target: [
        userChallenge.userId,
        userChallenge.templateId,
        userChallenge.weekNumber,
        userChallenge.year,
      ],
    })
    .returning({ userId: userChallenge.userId });

  const assignedCount = inserted.length;
  const skippedCount = eligibleUsers.length - assignedCount;

  await Promise.allSettled(
    inserted.map((row) =>
      sendNotificationToUser({
        userId: row.userId,
        type: "challenge_assigned",
        title: "Nouveau défi disponible 🎯",
        body: `${template.titleFr} — relève-le pour gagner ${template.acesReward} Aces !`,
        referenceId: template.id,
        referenceType: "challenge_template",
      }).catch((err) => {
        console.error(`[assignChallengeTemplateNow] push failed for ${row.userId}`, err);
      }),
    ),
  );

  return c.json({ assignedCount, skippedCount });
};
