import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchIntent, matchIntentSwipe, matchRequest, user } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";

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

    // Enregistrer le swipe avec ON CONFLICT DO NOTHING pour gérer les race conditions
    const [swipeRecord] = await db
      .insert(matchIntentSwipe)
      .values({
        matchIntentId,
        swiperUserId: userId,
        action,
      })
      .onConflictDoNothing({
        target: [matchIntentSwipe.matchIntentId, matchIntentSwipe.swiperUserId],
      })
      .returning();

    // Si le swipe existait déjà, returning() retourne un tableau vide
    if (!swipeRecord) {
      return c.json({
        swipe: null,
        request: null,
        message: "Already swiped on this intent",
      });
    }

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

      // Envoyer une notification push au receveur (propriétaire de l'intent)
      if (request) {
        const [requesterInfo] = await db
          .select({ name: user.name })
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);

        sendNotificationToUser({
          userId: intent.userId,
          type: "new_match_request",
          title: "Nouvelle demande de match 🎾",
          body: `${requesterInfo?.name ?? "Un joueur"} veut jouer avec toi !`,
          referenceId: request.id,
          referenceType: "match_request",
          data: {
            matchRequestId: request.id,
            matchIntentId,
          },
        }).catch((err) =>
          console.error("[SWIPE] Failed to send notification:", err),
        );
      }
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
