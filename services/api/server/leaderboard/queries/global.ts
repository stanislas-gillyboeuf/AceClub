import { Context } from "hono";
import { desc, sql } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { userStreak } from "../../../db/schema/streak/schema";
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from "../../../lib/cache";

export const getGlobalLeaderboard = async (c: Context<HonoContext>) => {
  const page = Number(c.req.query("page") ?? "1");
  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 100);
  const offset = (page - 1) * limit;

  const cacheKey = CacheKeys.leaderboardGlobal(page, limit);
  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  const results = await db
    .select({
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      totalAces: sql<number>`coalesce(${userLevel.totalAces}, 0)`.as("total_aces"),
      currentLevel: sql<number>`coalesce(${userLevel.currentLevel}, 1)`.as("current_level"),
      currentStreak: sql<number>`coalesce(${userStreak.currentStreak}, 0)`.as("current_streak"),
    })
    .from(user)
    .leftJoin(userLevel, sql`${user.id} = ${userLevel.userId}`)
    .leftJoin(userStreak, sql`${user.id} = ${userStreak.userId}`)
    .orderBy(desc(sql`coalesce(${userLevel.totalAces}, 0)`))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(user);

  const response = {
    leaderboard: results.map((r, index) => ({
      rank: offset + index + 1,
      user: {
        id: r.userId,
        name: r.userName,
        image: r.userImage,
      },
      aces: Number(r.totalAces),
      level: Number(r.currentLevel),
      streak: Number(r.currentStreak),
    })),
    pagination: {
      page,
      limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
    },
  };

  await cacheSet(cacheKey, response, CacheTTL.MEDIUM);
  return c.json(response);
};
