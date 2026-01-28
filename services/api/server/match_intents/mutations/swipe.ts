import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchIntent, matchIntentSwipe, matchRequest } from "../../../db/schema";
import { and, eq } from "drizzle-orm";

export const swipe = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const { matchIntentId, action } = await c.req.json();

    if (!matchIntentId || !action) {
      return c.json({ error: "matchIntentId and action are required" }, 400);
    }

    if (action !== "like" && action !== "pass") {
      return c.json({ error: "action must be 'like' or 'pass'" }, 400);
    }

    // Vérifier que l'intent existe et est pending
    const [intent] = await db
      .select()
      .from(matchIntent)
      .where(and(eq(matchIntent.id, matchIntentId), eq(matchIntent.status, "pending")))
      .limit(1);

    if (!intent) {
      return c.json({ error: "Match intent not found or not available" }, 404);
    }

    // Ne pas swiper sur sa propre intent
    if (intent.userId === userId) {
      return c.json({ error: "Cannot swipe on your own intent" }, 400);
    }

    // Vérifier qu'on n'a pas déjà swipé
    const [existingSwipe] = await db
      .select()
      .from(matchIntentSwipe)
      .where(
        and(
          eq(matchIntentSwipe.matchIntentId, matchIntentId),
          eq(matchIntentSwipe.swiperUserId, userId),
        ),
      )
      .limit(1);

    if (existingSwipe) {
      return c.json({ error: "Already swiped on this intent" }, 400);
    }

    // Enregistrer le swipe
    const [swipeRecord] = await db
      .insert(matchIntentSwipe)
      .values({
        matchIntentId,
        swiperUserId: userId,
        action,
      })
      .returning();

    // Si c'est un "like", créer une match request
    let request = null;
    if (action === "like") {
      [request] = await db
        .insert(matchRequest)
        .values({
          matchIntentId,
          requesterId: userId,
          receiverId: intent.userId,
          status: "pending",
        })
        .returning();
    }

    return c.json({
      swipe: swipeRecord,
      request,
      message: action === "like" ? "Match request sent!" : "Intent passed",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [SWIPE] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};
