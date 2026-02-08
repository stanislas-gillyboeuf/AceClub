import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  matchIntent,
  matchIntentSwipe,
  user as userTable,
  member,
  organization,
  userPreference,
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

    const userLat = c.req.query("latitude") ? parseFloat(c.req.query("latitude")!) : null;
    const userLng = c.req.query("longitude") ? parseFloat(c.req.query("longitude")!) : null;
    const radius = c.req.query("radius") ? parseFloat(c.req.query("radius")!) : null;

    const hasLocation = userLat !== null && userLng !== null;

    const now = new Date();

    // Get current user's organization, level and sport for scoring and filtering
    const [currentUserData] = await db
      .select({
        level: sql<number>`coalesce(${userLevel.currentLevel}, 1)`,
        organizationId: member.organizationId,
        sport: userPreference.sport,
      })
      .from(userTable)
      .leftJoin(userLevel, eq(userTable.id, userLevel.userId))
      .leftJoin(member, eq(userTable.id, member.userId))
      .leftJoin(userPreference, eq(userTable.id, userPreference.userId))
      .where(eq(userTable.id, userId))
      .limit(1);

    const currentUserLevel = currentUserData?.level ?? 1;
    const currentUserOrgId = currentUserData?.organizationId;
    const currentUserSport = currentUserData?.sport;

    // Alias for intent owner's member table and preferences
    const intentOwnerMember = alias(member, "intent_owner_member");
    const intentOwnerPreference = alias(userPreference, "intent_owner_preference");

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

    // Filter by sport: only show intents from users with the same sport
    if (currentUserSport) {
      conditions.push(eq(intentOwnerPreference.sport, currentUserSport));
    }

    // Build scoring expression
    // +100 pts if same organization
    // +50 pts if level within ±3 (decreasing by 10 for each level difference)
    // +20 pts if created in last 24 hours
    // +80/60/40/20 pts based on distance (if location provided)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const distanceExpressionRaw = hasLocation
      ? sql<number>`
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(${userLat})) * cos(radians(${organization.latitude}))
            * cos(radians(${organization.longitude}) - radians(${userLng}))
            + sin(radians(${userLat})) * sin(radians(${organization.latitude}))
          ))
        )`
      : null;

    const distanceBonusExpression = hasLocation
      ? sql`
        CASE
          WHEN ${organization.latitude} IS NULL OR ${organization.longitude} IS NULL THEN 0
          WHEN (${distanceExpressionRaw}) <= 5 THEN 80
          WHEN (${distanceExpressionRaw}) <= 10 THEN 60
          WHEN (${distanceExpressionRaw}) <= 25 THEN 40
          WHEN (${distanceExpressionRaw}) <= 50 THEN 20
          ELSE 0
        END`
      : sql`0`;

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
      ) + (
        ${distanceBonusExpression}
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
            ) + (
              ${distanceBonusExpression}
            )
          `,
        })
        .from(matchIntent)
        .leftJoin(userLevel, eq(matchIntent.userId, userLevel.userId))
        .leftJoin(intentOwnerMember, eq(matchIntent.userId, intentOwnerMember.userId))
        .leftJoin(organization, eq(intentOwnerMember.organizationId, organization.id))
        .leftJoin(intentOwnerPreference, eq(matchIntent.userId, intentOwnerPreference.userId))
        .where(eq(matchIntent.id, cursor))
        .limit(1);

      if (cursorData) {
        cursorScore = cursorData.score;
        cursorCreatedAt = cursorData.createdAt;
      }
    }

    if (hasLocation && radius !== null && distanceExpressionRaw) {
      conditions.push(
        sql`${organization.latitude} IS NOT NULL AND ${organization.longitude} IS NOT NULL AND (${distanceExpressionRaw}) <= ${radius}`,
      );
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
        distance:
          hasLocation && distanceExpressionRaw
            ? sql<number>`CASE WHEN ${organization.latitude} IS NOT NULL AND ${organization.longitude} IS NOT NULL THEN ROUND((${distanceExpressionRaw})::numeric, 1) ELSE NULL END`.as(
                "distance",
              )
            : sql<number>`NULL`.as("distance"),
      })
      .from(matchIntent)
      .leftJoin(userTable, eq(matchIntent.userId, userTable.id))
      .leftJoin(userLevel, eq(matchIntent.userId, userLevel.userId))
      .leftJoin(intentOwnerMember, eq(matchIntent.userId, intentOwnerMember.userId))
      .leftJoin(organization, eq(intentOwnerMember.organizationId, organization.id))
      .leftJoin(intentOwnerPreference, eq(matchIntent.userId, intentOwnerPreference.userId))
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
      distance: row.distance != null ? Number(row.distance) : null,
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
