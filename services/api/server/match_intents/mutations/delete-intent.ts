import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  matchIntent,
  matchIntentSwipe,
  matchRequest,
} from "../../../db/schema/match_intents/schema";
import { eq, and } from "drizzle-orm";

export const deleteMatchIntent = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Intent id required" }, 400);
    }

    const [intent] = await db
      .select({ userId: matchIntent.userId })
      .from(matchIntent)
      .where(eq(matchIntent.id, id))
      .limit(1);

    if (!intent) {
      return c.json({ error: "Match intent not found" }, 404);
    }
    if (intent.userId !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await db.delete(matchRequest).where(eq(matchRequest.matchIntentId, id));
    await db.delete(matchIntentSwipe).where(eq(matchIntentSwipe.matchIntentId, id));
    await db.delete(matchIntent).where(and(eq(matchIntent.id, id), eq(matchIntent.userId, userId)));

    return c.json({ success: true });
  } catch (error) {
    console.error("💥 [DELETE MATCH INTENT]", error);
    return c.json({ error: (error as Error).message }, 500);
  }
};
