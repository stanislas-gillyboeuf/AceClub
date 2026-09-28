import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { matchParticipant } from "../../../db/schema/match/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import { generateConversationKey } from "../lib/generate-key";
import { z } from "zod";
import { findOrCreateConversationValidator } from "../validators";
import { getUserClubIds } from "../../../lib/club-access";
import { initialConversationStatus } from "../lib/request-link";
import { isBlockedEitherWay } from "../../../lib/block";

export const findOrCreateConversation = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // @ts-ignore
  const { participantId } = c.req.valid("json") as z.infer<typeof findOrCreateConversationValidator>;

  if (participantId === currentUser.id) {
    return c.json(
      { error: "BadRequest", message: "Cannot create a conversation with yourself" },
      400,
    );
  }

  // Verify participant exists
  const [participant] = await db
    .select({ id: user.id, banned: user.banned })
    .from(user)
    .where(eq(user.id, participantId))
    .limit(1);

  if (!participant || participant.banned) {
    return c.json({ error: "NotFound", message: "Participant not found" }, 404);
  }

  if (await isBlockedEitherWay(currentUser.id, participantId)) {
    return c.json({ error: "Forbidden", message: "Action impossible" }, 403);
  }

  // Single query: find existing direct conversation between these two users
  // Replaces previous N+1 loop that ran 2 queries per user conversation
  const [existing] = await db
    .select({ conversationId: conversationParticipant.conversationId, status: conversation.status })
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
      { conversationId: existing.conversationId, created: false, status: existing.status },
      200,
    );
  }

  // No existing direct conversation found — decide whether these two users already have a
  // link (same club, a shared match, or — checked above — an existing direct conversation).
  // Without one, the conversation starts as a request the recipient must accept.
  const [myClubIds, sharedMatchRows] = await Promise.all([
    getUserClubIds(currentUser.id),
    db
      .select({ matchId: matchParticipant.matchId })
      .from(matchParticipant)
      .where(inArray(matchParticipant.userId, [currentUser.id, participantId])),
  ]);
  const theirClubIds = myClubIds.length > 0 ? await getUserClubIds(participantId) : [];
  const sameClub = myClubIds.some((id) => theirClubIds.includes(id));

  const matchCounts = new Map<string, number>();
  for (const row of sharedMatchRows) {
    matchCounts.set(row.matchId, (matchCounts.get(row.matchId) ?? 0) + 1);
  }
  const sharedMatch = [...matchCounts.values()].some((count) => count > 1);

  const status = initialConversationStatus({
    sameClub,
    sharedMatch,
    existingActiveConversation: false, // already handled above via `existing`
  });

  // No existing direct conversation found — create one
  const conversationId = ulid();
  const now = new Date();

  await db.insert(conversation).values({
    id: conversationId,
    type: "direct",
    status,
    initiatedByUserId: status === "pending_request" ? currentUser.id : null,
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

  return c.json({ conversationId, created: true, status }, 201);
};
