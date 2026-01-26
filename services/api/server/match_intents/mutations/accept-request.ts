import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchRequest, matchIntent, match, matchParticipant } from "../../../db/schema";
import { and, eq } from "drizzle-orm";

export const acceptRequest = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const requestId = c.req.param("id");

    // Récupérer la demande
    const [request] = await db
      .select()
      .from(matchRequest)
      .where(and(eq(matchRequest.id, requestId), eq(matchRequest.receiverId, userId)))
      .limit(1);

    if (!request) {
      return c.json({ error: "Request not found or unauthorized" }, 404);
    }

    if (request.status !== "pending") {
      return c.json({ error: "Request already responded to" }, 400);
    }

    // Récupérer l'intent
    const [intent] = await db.select().from(matchIntent).where(eq(matchIntent.id, request.matchIntentId)).limit(1);

    if (!intent) {
      return c.json({ error: "Match intent not found" }, 404);
    }

    // Créer le vrai match
    const [newMatch] = await db
      .insert(match)
      .values({
        createdBy: intent.userId,
        status: "scheduled",
      })
      .returning();

    // Ajouter les participants
    await db.insert(matchParticipant).values([
      {
        matchId: newMatch.id,
        userId: intent.userId,
        side: "home",
      },
      {
        matchId: newMatch.id,
        userId: request.requesterId,
        side: "away",
      },
    ]);

    // Marquer la demande comme acceptée
    const [updatedRequest] = await db
      .update(matchRequest)
      .set({
        status: "accepted",
        respondedAt: new Date(),
      })
      .where(eq(matchRequest.id, requestId))
      .returning();

    // Marquer l'intent comme accepted
    await db.update(matchIntent).set({ status: "accepted" }).where(eq(matchIntent.id, request.matchIntentId));

    return c.json({
      request: updatedRequest,
      match: newMatch,
      message: "Match created successfully!",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [ACCEPT REQUEST] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};
