import { Context } from "hono";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user } from "../../../db/schema/auth/schema";
import { acesTransaction } from "../../../db/schema/level/schema";

export const getWeeklyLeaderboard = async (c: Context<HonoContext>) => {
  const page = Number(c.req.query("page") ?? "1");
  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 100);
  const offset = (page - 1) * limit;

  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const results = await db
    .select({
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      weeklyAces: sql<number>`coalesce(sum(${acesTransaction.amount}), 0)`.as("weekly_aces"),
    })
    .from(user)
    .leftJoin(
      acesTransaction,
      and(
        eq(user.id, acesTransaction.userId),
        gte(acesTransaction.createdAt, startOfWeek)
      )
    )
    .groupBy(user.id, user.name, user.image)
    .orderBy(desc(sql`coalesce(sum(${acesTransaction.amount}), 0)`))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(distinct ${user.id})` })
    .from(user)
    .leftJoin(
      acesTransaction,
      and(
        eq(user.id, acesTransaction.userId),
        gte(acesTransaction.createdAt, startOfWeek)
      )
    );

  return c.json({
    leaderboard: results.map((r, index) => ({
      rank: offset + index + 1,
      user: {
        id: r.userId,
        name: r.userName,
        image: r.userImage,
      },
      weeklyAces: Number(r.weeklyAces),
    })),
    pagination: {
      page,
      limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
    },
    weekStartDate: startOfWeek.toISOString(),
  });
};
