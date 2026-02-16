import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchRequest, matchIntent, match, matchParticipant, user } from "../../../db/schema";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";

export const acceptRequest = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const requestId = c.req.param("id");

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
    const [intent] = await db
      .select()
      .from(matchIntent)
      .where(eq(matchIntent.id, request.matchIntentId))
      .limit(1);

    if (!intent) {
      return c.json({ error: "Match intent not found" }, 404);
    }

    // Chercher une conversation existante entre les deux joueurs
    let conversationId: string;
    const [existingConversation] = await db
      .select({ id: conversation.id })
      .from(conversation)
      .where(
        and(
          sql`EXISTS (SELECT 1 FROM conversation_participant WHERE conversation_id = ${conversation.id} AND user_id = ${intent.userId})`,
          sql`EXISTS (SELECT 1 FROM conversation_participant WHERE conversation_id = ${conversation.id} AND user_id = ${request.requesterId})`,
          sql`(SELECT COUNT(*) FROM conversation_participant WHERE conversation_id = ${conversation.id}) = 2`,
        ),
      )
      .limit(1);

    if (existingConversation) {
      // Réutiliser la conversation existante
      conversationId = existingConversation.id;
    } else {
      // Créer une nouvelle conversation (sans matchId)
      const [newConversation] = await db
        .insert(conversation)
        .values({
          type: "match",
        })
        .returning();

      conversationId = newConversation.id;

      // Ajouter les participants à la conversation
      await db.insert(conversationParticipant).values([
        {
          conversationId: conversationId,
          userId: intent.userId,
        },
        {
          conversationId: conversationId,
          userId: request.requesterId,
        },
      ]);
    }

    // Créer le vrai match avec conversationId
    const [newMatch] = await db
      .insert(match)
      .values({
        createdBy: intent.userId,
        conversationId: conversationId,
        status: "scheduled",
        type: intent.type ?? "match",
        scheduledAt: intent.date ?? undefined,
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

    // Marquer la demande courante comme acceptée
    const [updatedRequest] = await db
      .update(matchRequest)
      .set({
        status: "accepted",
        respondedAt: new Date(),
      })
      .where(eq(matchRequest.id, requestId))
      .returning();

    // Refuser automatiquement toutes les autres demandes encore en attente
    await db
      .update(matchRequest)
      .set({
        status: "rejected",
        respondedAt: new Date(),
      })
      .where(
        and(
          eq(matchRequest.matchIntentId, request.matchIntentId),
          ne(matchRequest.id, request.id),
          eq(matchRequest.status, "pending"),
        ),
      );

    await db
      .update(matchIntent)
      .set({ status: "accepted" })
      .where(eq(matchIntent.id, request.matchIntentId));

    const [requesterInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        phoneNumber: user.phoneNumber,
      })
      .from(user)
      .where(eq(user.id, request.requesterId))
      .limit(1);

    // Recuperer le nom de l'utilisateur qui accepte pour la notification
    const [receiverInfo] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Envoyer notification au demandeur (celui qui a fait la requete)
    console.log(`[ACCEPT REQUEST] Sending notification to requester: ${request.requesterId}`);
    sendNotificationToUser({
      userId: request.requesterId,
      type: "match_request_accepted",
      title: "Match confirmé ! 🎾",
      body: `Top ! ${receiverInfo?.name ?? "Un joueur"} a accepté ton match`,
      referenceId: newMatch.id,
      referenceType: "match",
      data: {
        matchId: newMatch.id,
      },
    }).catch((err) => console.error("[ACCEPT REQUEST] Failed to send notification:", err));

    return c.json({
      request: updatedRequest,
      match: newMatch,
      requester: requesterInfo ?? null,
      conversationId: conversationId,
      message: "Match created successfully!",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [ACCEPT REQUEST] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};
