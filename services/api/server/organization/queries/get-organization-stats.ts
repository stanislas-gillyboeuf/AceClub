import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member } from "../../../db/schema/auth/schema";
import { match, matchParticipant } from "../../../db/schema/match/schema";
import { eq, and, gte, inArray, sql, count, countDistinct } from "drizzle-orm";
import type { z } from "zod";
import type { getOrganizationStatsValidator } from "../validators";

export const getOrganizationStats = async (c: Context<HonoContext>) => {
  const { organizationId } = c.req.valid("query") as z.infer<typeof getOrganizationStatsValidator>;

  // Get members of the organization
  const members = await db
    .select({ userId: member.userId })
    .from(member)
    .where(eq(member.organizationId, organizationId));

  if (members.length === 0) {
    return c.json({
      totalMembers: 0,
      matchesThisMonth: 0,
      activeMembers: 0,
      activityRate: 0,
    });
  }

  const memberUserIds = members.map((m) => m.userId);

  // Get the start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Count matches this month where organization members participated
  const matchesThisMonthResult = await db
    .select({ count: countDistinct(matchParticipant.matchId) })
    .from(matchParticipant)
    .innerJoin(match, eq(matchParticipant.matchId, match.id))
    .where(
      and(
        inArray(matchParticipant.userId, memberUserIds),
        gte(match.createdAt, startOfMonth),
        eq(match.status, "finished"),
      ),
    );

  const matchesThisMonth = matchesThisMonthResult[0]?.count ?? 0;

  // Count active members (members who played at least one match this month)
  const activeMembersResult = await db
    .select({ count: countDistinct(matchParticipant.userId) })
    .from(matchParticipant)
    .innerJoin(match, eq(matchParticipant.matchId, match.id))
    .where(
      and(
        inArray(matchParticipant.userId, memberUserIds),
        gte(match.createdAt, startOfMonth),
        eq(match.status, "finished"),
      ),
    );

  const activeMembers = activeMembersResult[0]?.count ?? 0;

  // Calculate activity rate (percentage of members who played this month)
  const activityRate = members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0;

  return c.json({
    totalMembers: members.length,
    matchesThisMonth,
    activeMembers,
    activityRate,
  });
};
