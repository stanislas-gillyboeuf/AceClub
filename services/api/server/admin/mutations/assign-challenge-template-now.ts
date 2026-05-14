import { Context } from "hono";
import { eq } from "drizzle-orm";
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

  const allUsers = await db
    .select({
      userId: user.id,
      currentLevel: userLevel.currentLevel,
    })
    .from(user)
    .leftJoin(userLevel, eq(user.id, userLevel.userId));

  let assignedCount = 0;
  let skippedCount = 0;
  const notifiedUserIds: string[] = [];

  for (const u of allUsers) {
    const level = u.currentLevel ?? 1;
    if (level < template.minLevel) {
      skippedCount++;
      continue;
    }
    if (template.maxLevel !== null && level > template.maxLevel) {
      skippedCount++;
      continue;
    }

    const inserted = await db
      .insert(userChallenge)
      .values({
        userId: u.userId,
        templateId: template.id,
        weekNumber: week,
        year,
        targetValue: template.targetValue,
        expiresAt,
      })
      .onConflictDoNothing({
        target: [
          userChallenge.userId,
          userChallenge.templateId,
          userChallenge.weekNumber,
          userChallenge.year,
        ],
      })
      .returning({ id: userChallenge.id });

    if (inserted.length > 0) {
      assignedCount++;
      notifiedUserIds.push(u.userId);
    } else {
      skippedCount++;
    }
  }

  for (const userId of notifiedUserIds) {
    try {
      await sendNotificationToUser({
        userId,
        type: "challenge_assigned",
        title: "Nouveau défi disponible 🎯",
        body: `${template.titleFr} — relève-le pour gagner ${template.acesReward} Aces !`,
        referenceId: template.id,
        referenceType: "challenge_template",
      });
    } catch (err) {
      console.error(`[assignChallengeTemplateNow] push failed for ${userId}`, err);
    }
  }

  return c.json({ assignedCount, skippedCount });
};
