import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  conversation,
  conversationParticipant,
} from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, sql } from "drizzle-orm";
import { ulid } from "ulid";
import { generateConversationKey } from "../lib/generate-key";

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

  // Single query: find existing direct conversation between these two users
  // Replaces previous N+1 loop that ran 2 queries per user conversation
  const [existing] = await db
    .select({ conversationId: conversationParticipant.conversationId })
    .from(conversationParticipant)
    .innerJoin(conversation, eq(conversationParticipant.conversationId, conversation.id))
    .where(
      and(
        eq(conversationParticipant.userId, currentUser.id),
        eq(conversation.type, "direct"),
        sql`EXISTS (
          SELECT 1 FROM conversation_participant cp2
          WHERE cp2.conversation_id = ${conversation.id}
            AND cp2.user_id = ${participantId}
        )`,
      ),
    )
    .limit(1);

  if (existing) {
    // Restore if deleted by current user
    await db
      .update(conversationParticipant)
      .set({ isDeleted: false, deletedAt: null })
      .where(
        and(
          eq(conversationParticipant.conversationId, existing.conversationId),
          eq(conversationParticipant.userId, currentUser.id),
        ),
      );

    return c.json(
      { conversationId: existing.conversationId, created: false },
      200,
    );
  }

  // No existing direct conversation found — create one
  const conversationId = ulid();
  const now = new Date();

  await db.insert(conversation).values({
    id: conversationId,
    type: "direct",
    encryptionKey: generateConversationKey(),
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
