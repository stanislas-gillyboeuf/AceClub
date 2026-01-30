import { Context } from "hono";
import { eq, lte, and } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { title, userTitle } from "../../../db/schema/reward/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { calculateLevelFromAces } from "../../level/services/xp-calculator";

export const equipTitle = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");
  const { titleId } = await c.req.json<{ titleId: string }>();

  const [levelData] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, authUser!.id))
    .limit(1);

  const currentLevel = levelData ? calculateLevelFromAces(levelData.totalAces).level : 1;

  const [titleRecord] = await db
    .select()
    .from(title)
    .where(and(eq(title.id, titleId), lte(title.requiredLevel, currentLevel)))
    .limit(1);

  if (!titleRecord) {
    return c.json({ error: "Title not available or level requirement not met" }, 400);
  }

  const [existingUserTitle] = await db
    .select()
    .from(userTitle)
    .where(eq(userTitle.userId, authUser!.id))
    .limit(1);

  if (existingUserTitle) {
    await db
      .update(userTitle)
      .set({ titleId, equippedAt: new Date() })
      .where(eq(userTitle.userId, authUser!.id));
  } else {
    await db.insert(userTitle).values({
      userId: authUser!.id,
      titleId,
    });
  }

  return c.json({ success: true, titleId });
};
