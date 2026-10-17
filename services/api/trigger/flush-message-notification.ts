import { task } from "@trigger.dev/sdk";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { conversation, conversationParticipant } from "../db/schema/conversation/schema";
import { user } from "../db/schema/auth/schema";
import { sendNotificationToUser } from "../services/expo-push/notification-service";
import { resolvePrimaryOrganizationId } from "../lib/notification-gate";
import { isUserConnectedWs } from "../server/ws/bun-chat-handler";

interface FlushMessageNotificationPayload {
  conversationId: string;
  participantUserId: string;
}

/**
 * One push per conversation burst, not one per message: send-message.ts schedules this with a
 * delay and a stable idempotency key per (conversation, participant) — Trigger.dev collapses
 * every message sent during that window into the single run that was already scheduled, so
 * this always fires at most once per burst. `conversationParticipant.unreadCount` (already
 * incremented per message, reset on read) IS the "how many since last check" count — no separate
 * counter needed.
 */
export const flushMessageNotification = task({
  id: "flush-message-notification",
  run: async ({ conversationId, participantUserId }: FlushMessageNotificationPayload) => {
    const [participant] = await db
      .select()
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, participantUserId),
        ),
      )
      .limit(1);

    if (!participant || participant.isDeleted || participant.isMuted || participant.unreadCount === 0) {
      return;
    }

    // Seeing it live over the WebSocket is enough — checked here (at flush time), not at
    // schedule time, so closing the app during the debounce window still gets notified.
    if (isUserConnectedWs(participantUserId)) return;

    const [conv] = await db.select().from(conversation).where(eq(conversation.id, conversationId)).limit(1);
    if (!conv) return;

    const [sender] = conv.lastMessageSenderId
      ? await db.select({ name: user.name }).from(user).where(eq(user.id, conv.lastMessageSenderId)).limit(1)
      : [];

    const isGroup = conv.type === "group";
    const title = isGroup ? conv.name ?? "Groupe" : sender?.name ?? "Nouveau message";
    const body =
      participant.unreadCount > 1
        ? `${participant.unreadCount} nouveaux messages${isGroup && sender?.name ? ` · dernier de ${sender.name}` : ""}`
        : conv.lastMessagePreview ?? "Nouveau message";

    await sendNotificationToUser({
      userId: participantUserId,
      type: "new_message",
      title,
      body,
      referenceId: conversationId,
      referenceType: "conversation",
      data: { conversationId },
      organizationId: conv.organizationId ?? (await resolvePrimaryOrganizationId(participantUserId)),
    });
  },
});
