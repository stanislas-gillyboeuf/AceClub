import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchIntent } from "../../../db/schema/match_intents/schema";
import { and, desc, eq, gte, lt, or, isNull } from "drizzle-orm";

export const listMatchIntents = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const cursor = c.req.query("cursor");
    const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);
    const includeExpired = c.req.query("includeExpired") === "true";
    const now = new Date();

    const conditions = [eq(matchIntent.userId, userId)];

    // Par défaut, ne pas afficher les intents expirés
    if (!includeExpired) {
      conditions.push(or(isNull(matchIntent.date), gte(matchIntent.date, now))!);
    }

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

    const matchIntents = await db
      .select()
      .from(matchIntent)
      .where(and(...conditions))
      .orderBy(desc(matchIntent.createdAt))
      .limit(limit + 1);

    const hasMore = matchIntents.length > limit;
    const data = hasMore ? matchIntents.slice(0, limit) : matchIntents;

    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

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
    console.error("💥 [LIST MATCH INTENTS] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};
