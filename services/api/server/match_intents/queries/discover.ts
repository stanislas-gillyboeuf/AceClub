import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchIntent, matchIntentSwipe, user as userTable } from "../../../db/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { and, desc, eq, gte, lt, ne, notExists, or, isNull, sql } from "drizzle-orm";

export const discover = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const cursor = c.req.query("cursor");
    const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);

    const now = new Date();

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

    if (cursor) {
      const [cursorIntent] = await db
        .select({ createdAt: matchIntent.createdAt })
        .from(matchIntent)
        .where(eq(matchIntent.id, cursor))
        .limit(1);

      if (cursorIntent?.createdAt) {
        conditions.push(lt(matchIntent.createdAt, cursorIntent.createdAt));
      }
    }

    const rows = await db
      .select({
        id: matchIntent.id,
        userId: matchIntent.userId,
        date: matchIntent.date,
        time: matchIntent.time,
        duration: matchIntent.duration,
        status: matchIntent.status,
        createdAt: matchIntent.createdAt,
        user_id: userTable.id,
        user_name: userTable.name,
        user_email: userTable.email,
        user_level: sql<number>`coalesce(${userLevel.currentLevel}, 1)`.as("user_level"),
      })
      .from(matchIntent)
      .leftJoin(userTable, eq(matchIntent.userId, userTable.id))
      .leftJoin(userLevel, eq(matchIntent.userId, userLevel.userId))
      .where(and(...conditions))
      .orderBy(desc(matchIntent.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore && slice.length > 0 ? slice[slice.length - 1].id : null;

    const data = slice.map((row) => ({
      id: row.id,
      userId: row.userId,
      date: row.date,
      time: row.time,
      duration: row.duration,
      status: row.status,
      createdAt: row.createdAt,
      user:
        row.user_id != null && row.user_name != null && row.user_email != null
          ? { id: row.user_id, name: row.user_name, email: row.user_email, level: Number(row.user_level) || 1 }
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
