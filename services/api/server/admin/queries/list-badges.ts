import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { badge, userBadge } from "../../../db/schema/reward/schema";
import { eq, sql } from "drizzle-orm";

export const listBadges = async (c: Context<HonoContext>) => {
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
      requiredLevel: badge.requiredLevel,
      isActive: badge.isActive,
      displayOrder: badge.displayOrder,
      createdAt: badge.createdAt,
      unlockCount: sql<number>`count(${userBadge.id})`.as("unlock_count"),
    })
    .from(badge)
    .leftJoin(userBadge, eq(badge.id, userBadge.badgeId))
    .groupBy(badge.id)
    .orderBy(badge.displayOrder, badge.createdAt);

  return c.json({ badges });
};
