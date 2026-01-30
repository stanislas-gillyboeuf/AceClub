import { Context } from "hono";
import { eq, desc, sql } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, member } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { userStreak } from "../../../db/schema/streak/schema";

export const getOrganizationLeaderboard = async (c: Context<HonoContext>) => {
  const orgId = c.req.param("orgId");
  const page = Number(c.req.query("page") ?? "1");
  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 100);
  const offset = (page - 1) * limit;

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
    .where(eq(member.organizationId, orgId))
    .orderBy(desc(sql`coalesce(${userLevel.totalAces}, 0)`))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(member)
    .where(eq(member.organizationId, orgId));

  return c.json({
    leaderboard: results.map((r, index) => ({
      rank: offset + index + 1,
      userId: r.userId,
      name: r.userName,
      image: r.userImage,
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
  });
};
