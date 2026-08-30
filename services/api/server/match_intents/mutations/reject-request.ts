import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchRequest, user } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";
import { findOrCreateDirectConversation } from "../lib/conversation";
import { broadcastMatchRequestUpdate } from "../lib/broadcast";

export const rejectRequest = async (c: Context<HonoContext>) => {
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

    const [updatedRequest] = await db
      .update(matchRequest)
      .set({ status: "rejected", respondedAt: new Date() })
      .where(eq(matchRequest.id, requestId))
      .returning();

    const [receiverInfo] = await db.select({ name: user.name }).from(user).where(eq(user.id, userId)).limit(1);
    const conversationId = await findOrCreateDirectConversation(userId, request.requesterId);

    sendNotificationToUser({
      userId: request.requesterId,
      type: "new_message",
      title: receiverInfo?.name ?? "Réponse",
      body: "Ta demande a été déclinée.",
      referenceId: conversationId,
      referenceType: "conversation",
      data: { conversationId },
    }).catch((err) => console.error("[REJECT REQUEST] Failed to send notification:", err));

    broadcastMatchRequestUpdate(request.id, "rejected", [userId, request.requesterId]);

    return c.json({
      request: updatedRequest,
      message: "Request rejected",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [REJECT REQUEST] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};
