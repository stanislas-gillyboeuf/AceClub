import { Context } from "hono";
import { eq, lte } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { title, userTitle } from "../../../db/schema/reward/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { calculateLevelFromXp } from "../../level/services/xp-calculator";

export const getMyTitles = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const [levelData] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, authUser!.id))
    .limit(1);

  const currentLevel = levelData ? calculateLevelFromXp(levelData.totalXp).level : 1;

  const availableTitles = await db
    .select()
    .from(title)
    .where(lte(title.requiredLevel, currentLevel));

  const [equippedTitle] = await db
    .select({ titleId: userTitle.titleId })
    .from(userTitle)
    .where(eq(userTitle.userId, authUser!.id))
    .limit(1);

  return c.json({
    titles: availableTitles.map((t) => ({
      id: t.id,
      code: t.code,
      name: t.nameFr,
      requiredLevel: t.requiredLevel,
      isEquipped: equippedTitle?.titleId === t.id,
    })),
    equippedTitleId: equippedTitle?.titleId ?? null,
  });
};
