import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchIntent, matchIntentSwipe } from "../../../db/schema";
import { and, desc, eq, lt, ne, notExists } from "drizzle-orm";

export const discover = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const cursor = c.req.query("cursor");
    const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);

    // Construire les conditions
    const conditions = [
      eq(matchIntent.status, "pending"),
      ne(matchIntent.userId, userId), // Pas mes propres intents
      // Exclure les intents déjà swipées
      notExists(
        db
          .select()
          .from(matchIntentSwipe)
          .where(
            and(
              eq(matchIntentSwipe.matchIntentId, matchIntent.id),
              eq(matchIntentSwipe.swiperUserId, userId)
            )
          )
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

    // Fetch avec user info via query builder
    const intents = await db.query.matchIntent.findMany({
      where: and(...conditions),
      orderBy: [desc(matchIntent.createdAt)],
      limit: limit + 1,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const hasMore = intents.length > limit;
    const data = hasMore ? intents.slice(0, limit) : intents;
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
    console.error("💥 [DISCOVER INTENTS] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};
