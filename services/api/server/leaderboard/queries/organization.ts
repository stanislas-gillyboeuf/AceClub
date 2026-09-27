import { Context } from "hono";
import { and, eq, desc, sql } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, member } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { userStreak } from "../../../db/schema/streak/schema";
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from "../../../lib/cache";
import { assertCanViewOrg, forbidden } from "../../../lib/club-access";
import { rankableUserSql } from "../lib/scope";

/** A club's ranking: its members only, without ghosts and banned accounts. */
export async function buildOrganizationLeaderboard(orgId: string, page: number, limit: number) {
  const offset = (page - 1) * limit;

  const cacheKey = CacheKeys.leaderboardOrg(orgId, page, limit);
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const results = await db
    .select({
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      totalAces: sql<number>`coalesce(${userLevel.totalAces}, 0)`.as("total_aces"),
      currentLevel: sql<number>`coalesce(${userLevel.currentLevel}, 1)`.as("current_level"),
      currentStreak: sql<number>`coalesce(${userStreak.currentStreak}, 0)`.as("current_streak"),
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .leftJoin(userLevel, eq(user.id, userLevel.userId))
    .leftJoin(userStreak, eq(user.id, userStreak.userId))
    .where(and(eq(member.organizationId, orgId), rankableUserSql))
    .orderBy(desc(sql`coalesce(${userLevel.totalAces}, 0)`))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(and(eq(member.organizationId, orgId), rankableUserSql));

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
  return response;
}

export const getOrganizationLeaderboard = async (c: Context<HonoContext>) => {
  const orgId = c.req.param("orgId");
  const currentUser = c.get("user")!;
  if (!(await assertCanViewOrg(currentUser, orgId))) return forbidden(c);

  const page = Number(c.req.query("page") ?? "1");
  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 100);
  return c.json(await buildOrganizationLeaderboard(orgId, page, limit));
};
