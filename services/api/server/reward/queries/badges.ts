import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { badge, userBadge } from "../../../db/schema/reward/schema";

export const getMyBadges = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const badges = await db
    .select({
      id: badge.id,
      code: badge.code,
      category: badge.category,
      nameFr: badge.nameFr,
      nameEn: badge.nameEn,
      descriptionFr: badge.descriptionFr,
      descriptionEn: badge.descriptionEn,
      imageUrl: badge.imageUrl,
      unlockedAt: userBadge.unlockedAt,
    })
    .from(userBadge)
    .innerJoin(badge, eq(userBadge.badgeId, badge.id))
    .where(eq(userBadge.userId, authUser!.id));

  return c.json({
    badges: badges.map((b) => ({
      id: b.id,
      code: b.code,
      category: b.category,
      name: b.nameFr,
      description: b.descriptionFr,
      imageUrl: b.imageUrl,
      unlockedAt: b.unlockedAt,
    })),
  });
};

export const getAllBadges = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const allBadges = await db.select().from(badge).where(eq(badge.isActive, true));

  const userBadges = await db
    .select({ badgeId: userBadge.badgeId, unlockedAt: userBadge.unlockedAt })
    .from(userBadge)
    .where(eq(userBadge.userId, authUser!.id));

  const unlockedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.unlockedAt]));

  return c.json({
    badges: allBadges.map((b) => ({
      id: b.id,
      code: b.code,
      category: b.category,
      name: b.nameFr,
      description: b.descriptionFr,
      imageUrl: b.imageUrl,
      requiredLevel: b.requiredLevel,
      isUnlocked: unlockedMap.has(b.id),
      unlockedAt: unlockedMap.get(b.id) ?? null,
    })),
  });
};
