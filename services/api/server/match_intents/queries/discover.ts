import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  matchIntent,
  matchIntentSwipe,
  user as userTable,
  member,
  organization,
} from "../../../db/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { and, desc, eq, gte, lt, ne, notExists, or, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const discover = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const cursor = c.req.query("cursor");
    const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);

    const now = new Date();

    // Get current user's organization and level for scoring
    const [currentUserData] = await db
      .select({
        level: sql<number>`coalesce(${userLevel.currentLevel}, 1)`,
        organizationId: member.organizationId,
      })
      .from(userTable)
      .leftJoin(userLevel, eq(userTable.id, userLevel.userId))
      .leftJoin(member, eq(userTable.id, member.userId))
      .where(eq(userTable.id, userId))
      .limit(1);

    const currentUserLevel = currentUserData?.level ?? 1;
    const currentUserOrgId = currentUserData?.organizationId;

    // Alias for intent owner's member table
    const intentOwnerMember = alias(member, "intent_owner_member");

    const conditions = [
      eq(matchIntent.status, "pending"),
      ne(matchIntent.userId, userId),
      or(isNull(matchIntent.date), gte(matchIntent.date, now)),
      notExists(
        db
          .select()
          .from(matchIntentSwipe)
          .where(
            and(
              eq(matchIntentSwipe.matchIntentId, matchIntent.id),
              eq(matchIntentSwipe.swiperUserId, userId),
            ),
          ),
      ),
    ];

    // Build scoring expression
    // +100 pts if same organization
    // +50 pts if level within ±3 (decreasing by 10 for each level difference)
    // +20 pts if created in last 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Raw score SQL without alias - use this in WHERE clauses
    const scoreExpressionRaw = sql<number>`
      (
        CASE WHEN ${currentUserOrgId ? sql`${intentOwnerMember.organizationId} = ${currentUserOrgId}` : sql`FALSE`} THEN 100 ELSE 0 END
      ) + (
        CASE
          WHEN ABS(COALESCE(${userLevel.currentLevel}, 1) - ${currentUserLevel}) <= 3
          THEN 50 - (ABS(COALESCE(${userLevel.currentLevel}, 1) - ${currentUserLevel}) * 10)
          ELSE 0
        END
      ) + (
        CASE WHEN ${matchIntent.createdAt} > ${oneDayAgo} THEN 20 ELSE 0 END
      )
    `;

    // Aliased version for SELECT
    const scoreExpression = scoreExpressionRaw.as("score");

    // For cursor-based pagination with score, we need to handle it differently
    // We'll use score + createdAt as the ordering key
    let cursorScore: number | null = null;
    let cursorCreatedAt: Date | null = null;

    if (cursor) {
      // Get the cursor item's score and createdAt
      const [cursorData] = await db
        .select({
          createdAt: matchIntent.createdAt,
          score: sql<number>`
            (
              CASE WHEN ${currentUserOrgId ? sql`${intentOwnerMember.organizationId} = ${currentUserOrgId}` : sql`FALSE`} THEN 100 ELSE 0 END
            ) + (
              CASE
                WHEN ABS(COALESCE(${userLevel.currentLevel}, 1) - ${currentUserLevel}) <= 3
                THEN 50 - (ABS(COALESCE(${userLevel.currentLevel}, 1) - ${currentUserLevel}) * 10)
                ELSE 0
              END
            ) + (
              CASE WHEN ${matchIntent.createdAt} > ${oneDayAgo} THEN 20 ELSE 0 END
            )
          `,
        })
        .from(matchIntent)
        .leftJoin(userLevel, eq(matchIntent.userId, userLevel.userId))
        .leftJoin(intentOwnerMember, eq(matchIntent.userId, intentOwnerMember.userId))
        .where(eq(matchIntent.id, cursor))
        .limit(1);

      if (cursorData) {
        cursorScore = cursorData.score;
        cursorCreatedAt = cursorData.createdAt;
      }
    }

    // Add cursor condition if we have cursor data
    // Use scoreExpressionRaw (without alias) in WHERE clause - SQL doesn't allow aliases in WHERE
    if (cursorScore !== null && cursorCreatedAt !== null) {
      conditions.push(
        or(
          sql`(${scoreExpressionRaw}) < ${cursorScore}`,
          and(
            sql`(${scoreExpressionRaw}) = ${cursorScore}`,
            lt(matchIntent.createdAt, cursorCreatedAt),
          ),
        )!,
      );
    }

    const rows = await db
      .select({
        id: matchIntent.id,
        type: matchIntent.type,
        userId: matchIntent.userId,
        date: matchIntent.date,
        time: matchIntent.time,
        duration: matchIntent.duration,
        description: matchIntent.description,
        status: matchIntent.status,
        createdAt: matchIntent.createdAt,
        user_id: userTable.id,
        user_name: userTable.name,
        user_email: userTable.email,
        user_image: userTable.image,
        user_level: sql<number>`coalesce(${userLevel.currentLevel}, 1)`.as("user_level"),
        org_id: organization.id,
        org_name: organization.name,
        org_logo: organization.logo,
        score: scoreExpression,
      })
      .from(matchIntent)
      .leftJoin(userTable, eq(matchIntent.userId, userTable.id))
      .leftJoin(userLevel, eq(matchIntent.userId, userLevel.userId))
      .leftJoin(intentOwnerMember, eq(matchIntent.userId, intentOwnerMember.userId))
      .leftJoin(organization, eq(intentOwnerMember.organizationId, organization.id))
      .where(and(...conditions))
      .orderBy(desc(scoreExpressionRaw), desc(matchIntent.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore && slice.length > 0 ? slice[slice.length - 1].id : null;

    const data = slice.map((row) => ({
      id: row.id,
      type: row.type,
      userId: row.userId,
      date: row.date,
      time: row.time,
      duration: row.duration,
      description: row.description,
      status: row.status,
      createdAt: row.createdAt,
      user:
        row.user_id != null && row.user_name != null && row.user_email != null
          ? {
              id: row.user_id,
              name: row.user_name,
              email: row.user_email,
              image: row.user_image,
              level: Number(row.user_level) || 1,
              organization:
                row.org_id != null && row.org_name != null
                  ? {
                      id: row.org_id,
                      name: row.org_name,
                      logo: row.org_logo,
                    }
                  : null,
            }
          : null,
    }));

    return c.json({
      data,
      pagination: {
        nextCursor,
        hasMore,
        limit,
      },
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [DISCOVER INTENTS] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};
