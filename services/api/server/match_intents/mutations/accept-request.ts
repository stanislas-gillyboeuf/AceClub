import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchRequest, matchIntent, matchIntentTeammate, match, matchParticipant, user } from "../../../db/schema";
import { conversation } from "../../../db/schema/conversation/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";
import { broadcastMatchRequestUpdate } from "../lib/broadcast";
import { findOrCreateDirectConversation } from "../lib/conversation";

const PADEL_TEAM_SIZE = 3;

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

    const [intent] = await db
      .select()
      .from(matchIntent)
      .where(eq(matchIntent.id, request.matchIntentId))
      .limit(1);

    if (!intent) {
      return c.json({ error: "Match intent not found" }, 404);
    }

    if (request.slotIndex != null) {
      return acceptPadelSlotRequest(c, request, intent, userId);
    }
    return acceptTennisRequest(c, request, intent, userId);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [ACCEPT REQUEST] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};

type RequestRow = typeof matchRequest.$inferSelect;
type IntentRow = typeof matchIntent.$inferSelect;

async function acceptTennisRequest(c: Context<HonoContext>, request: RequestRow, intent: IntentRow, userId: string) {
  const conversationId = await findOrCreateDirectConversation(intent.userId, request.requesterId);

  const [newMatch] = await db
    .insert(match)
    .values({
      createdBy: intent.userId,
      conversationId,
      status: "scheduled",
      type: intent.type ?? "match",
      scheduledAt: intent.date ?? undefined,
    })
    .returning();

  await db.insert(matchParticipant).values([
    { matchId: newMatch.id, userId: intent.userId, side: "home" },
    { matchId: newMatch.id, userId: request.requesterId, side: "away" },
  ]);

  const [updatedRequest] = await db
    .update(matchRequest)
    .set({ status: "accepted", respondedAt: new Date() })
    .where(eq(matchRequest.id, request.id))
    .returning();

  await db
    .update(matchRequest)
    .set({ status: "rejected", respondedAt: new Date() })
    .where(
      and(
        eq(matchRequest.matchIntentId, request.matchIntentId),
        ne(matchRequest.id, request.id),
        eq(matchRequest.status, "pending"),
      ),
    );

  await db.update(matchIntent).set({ status: "accepted" }).where(eq(matchIntent.id, request.matchIntentId));

  const [requesterInfo] = await db
    .select({ id: user.id, name: user.name, image: user.image, phoneNumber: user.phoneNumber })
    .from(user)
    .where(eq(user.id, request.requesterId))
    .limit(1);
  const [receiverInfo] = await db.select({ name: user.name }).from(user).where(eq(user.id, userId)).limit(1);

  sendNotificationToUser({
    userId: request.requesterId,
    type: "match_request_accepted",
    title: "Match confirmé ! 🎾",
    body: `Top ! ${receiverInfo?.name ?? "Un joueur"} a accepté ton match`,
    referenceId: newMatch.id,
    referenceType: "match",
    data: { matchId: newMatch.id, conversationId },
  }).catch((err) => console.error("[ACCEPT REQUEST] Failed to send notification:", err));

  broadcastMatchRequestUpdate(request.id, "accepted", [intent.userId, request.requesterId]);

  const [convDetails] = await db
    .select({
      id: conversation.id,
      type: conversation.type,
      createdAt: conversation.createdAt,
      encryptionKey: conversation.encryptionKey,
    })
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  return c.json({
    request: updatedRequest,
    match: newMatch,
    requester: requesterInfo ?? null,
    conversationId,
    conversation: convDetails
      ? {
          id: convDetails.id,
          type: convDetails.type,
          createdAt: convDetails.createdAt.toISOString(),
          encryptionKey: convDetails.encryptionKey || null,
          otherParticipant: requesterInfo
            ? { id: requesterInfo.id, name: requesterInfo.name, image: requesterInfo.image }
            : null,
        }
      : null,
    message: "Match created successfully!",
  });
}

async function acceptPadelSlotRequest(c: Context<HonoContext>, request: RequestRow, intent: IntentRow, userId: string) {
  const slotIndex = request.slotIndex!;

  const [inserted] = await db
    .insert(matchIntentTeammate)
    .values({ matchIntentId: intent.id, slotIndex, userId: request.requesterId })
    .onConflictDoNothing({ target: [matchIntentTeammate.matchIntentId, matchIntentTeammate.slotIndex] })
    .returning();

  if (!inserted) {
    await db
      .update(matchRequest)
      .set({ status: "rejected", respondedAt: new Date() })
      .where(eq(matchRequest.id, request.id));
    broadcastMatchRequestUpdate(request.id, "rejected", [intent.userId, request.requesterId]);
    return c.json({ error: "Conflict", message: "Ce slot vient d'être pris par un autre joueur" }, 409);
  }

  const [updatedRequest] = await db
    .update(matchRequest)
    .set({ status: "accepted", respondedAt: new Date() })
    .where(eq(matchRequest.id, request.id))
    .returning();

  // Auto-reject other pending requests targeting the same now-filled slot.
  await db
    .update(matchRequest)
    .set({ status: "rejected", respondedAt: new Date() })
    .where(
      and(
        eq(matchRequest.matchIntentId, request.matchIntentId),
        eq(matchRequest.slotIndex, slotIndex),
        ne(matchRequest.id, request.id),
        eq(matchRequest.status, "pending"),
      ),
    );

  const [{ count: filledSlots }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(matchIntentTeammate)
    .where(eq(matchIntentTeammate.matchIntentId, intent.id));

  if (filledSlots >= PADEL_TEAM_SIZE) {
    await db.update(matchIntent).set({ status: "accepted" }).where(eq(matchIntent.id, intent.id));
  }

  const conversationId = await findOrCreateDirectConversation(intent.userId, request.requesterId);
  const [receiverInfo] = await db.select({ name: user.name }).from(user).where(eq(user.id, userId)).limit(1);

  sendNotificationToUser({
    userId: request.requesterId,
    type: "new_message",
    title: receiverInfo?.name ?? "Padel",
    body: "Ta demande pour rejoindre l'équipe a été acceptée !",
    referenceId: conversationId,
    referenceType: "conversation",
    data: { conversationId },
  }).catch((err) => console.error("[ACCEPT REQUEST] Failed to send notification:", err));

  broadcastMatchRequestUpdate(request.id, "accepted", [intent.userId, request.requesterId]);

  return c.json({
    request: updatedRequest,
    teammate: inserted,
    teamComplete: filledSlots >= PADEL_TEAM_SIZE,
    conversationId,
    message: "Teammate slot filled",
  });
}

