import { Context } from "hono";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, member } from "../../../db/schema/auth/schema";
import { acesTransaction } from "../../../db/schema/level/schema";
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from "../../../lib/cache";
import { isMemberOfOrg, forbidden } from "../../../lib/club-access";
import { rankableUserSql, resolveLeaderboardScope } from "../lib/scope";

export const getWeeklyLeaderboard = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  const page = Number(c.req.query("page") ?? "1");
  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 100);
  const offset = (page - 1) * limit;

  // The weekly ranking is a club's (members only); the platform-wide one is super-admin only.
  const organizationId = c.req.query("organizationId");
  const scope = resolveLeaderboardScope({
    organizationId,
    user: currentUser,
    isMember: organizationId ? await isMemberOfOrg(currentUser.id, organizationId) : false,
  });
  if (scope.kind === "forbidden") return forbidden(c);
  const orgId = scope.kind === "club" ? scope.organizationId : null;
  const clubFilter = orgId
    ? sql`${user.id} in (select ${member.userId} from ${member} where ${member.organizationId} = ${orgId})`
    : sql`true`;

  const cacheKey = CacheKeys.leaderboardWeekly(page, limit, orgId);
  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

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
      and(eq(user.id, acesTransaction.userId), gte(acesTransaction.createdAt, startOfWeek)),
    )
    .where(and(rankableUserSql, clubFilter))
    .groupBy(user.id, user.name, user.image)
    .orderBy(desc(sql`coalesce(sum(${acesTransaction.amount}), 0)`))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(distinct ${user.id})` })
    .from(user)
    .leftJoin(
      acesTransaction,
      and(eq(user.id, acesTransaction.userId), gte(acesTransaction.createdAt, startOfWeek)),
    )
    .where(and(rankableUserSql, clubFilter));

  const response = {
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
  };

  await cacheSet(cacheKey, response, CacheTTL.MEDIUM);
  return c.json(response);
};
