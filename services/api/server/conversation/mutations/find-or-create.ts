import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  conversation,
  conversationParticipant,
} from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and } from "drizzle-orm";
import { ulid } from "ulid";

export const findOrCreateConversation = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { participantId } = await c.req.json();

  if (participantId === currentUser.id) {
    return c.json(
      { error: "BadRequest", message: "Cannot create a conversation with yourself" },
      400,
    );
  }

  // Verify participant exists
  const [participant] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, participantId))
    .limit(1);

  if (!participant) {
    return c.json(
      { error: "NotFound", message: "Participant not found" },
      404,
    );
  }

  // Look for an existing direct conversation between these two users
  const myConversations = await db
    .select({ conversationId: conversationParticipant.conversationId })
    .from(conversationParticipant)
    .where(eq(conversationParticipant.userId, currentUser.id));

  for (const mc of myConversations) {
    const [otherParticipation] = await db
      .select({ userId: conversationParticipant.userId })
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, mc.conversationId),
          eq(conversationParticipant.userId, participantId),
        ),
      )
      .limit(1);

    if (otherParticipation) {
      // Check if this is a direct conversation
      const [conv] = await db
        .select({ type: conversation.type })
        .from(conversation)
        .where(eq(conversation.id, mc.conversationId))
        .limit(1);

      if (conv && conv.type === "direct") {
        // Restore if deleted by current user
        await db
          .update(conversationParticipant)
          .set({ isDeleted: false, deletedAt: null })
          .where(
            and(
              eq(conversationParticipant.conversationId, mc.conversationId),
              eq(conversationParticipant.userId, currentUser.id),
            ),
          );

        return c.json(
          { conversationId: mc.conversationId, created: false },
          200,
        );
      }
    }
  }

  // No existing direct conversation found — create one
  const conversationId = ulid();
  const now = new Date();

  await db.insert(conversation).values({
    id: conversationId,
    type: "direct",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(conversationParticipant).values([
    {
      id: ulid(),
      conversationId,
      userId: currentUser.id,
      joinedAt: now,
    },
    {
      id: ulid(),
      conversationId,
      userId: participantId,
      joinedAt: now,
    },
  ]);

  return c.json({ conversationId, created: true }, 201);
};
