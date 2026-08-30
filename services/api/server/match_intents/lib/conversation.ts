import { and, sql } from "drizzle-orm";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { generateConversationKey } from "../../conversation/lib/generate-key";

export async function findOrCreateDirectConversation(userIdA: string, userIdB: string): Promise<string> {
  const [existingConversation] = await db
    .select({ id: conversation.id })
    .from(conversation)
    .where(
      and(
        sql`EXISTS (SELECT 1 FROM conversation_participant WHERE conversation_id = ${conversation.id} AND user_id = ${userIdA})`,
        sql`EXISTS (SELECT 1 FROM conversation_participant WHERE conversation_id = ${conversation.id} AND user_id = ${userIdB})`,
        sql`(SELECT COUNT(*) FROM conversation_participant WHERE conversation_id = ${conversation.id}) = 2`,
      ),
    )
    .limit(1);

  if (existingConversation) return existingConversation.id;

  const [newConversation] = await db
    .insert(conversation)
    .values({ type: "direct", encryptionKey: generateConversationKey() })
    .returning();
  await db.insert(conversationParticipant).values([
    { conversationId: newConversation.id, userId: userIdA },
    { conversationId: newConversation.id, userId: userIdB },
  ]);
  return newConversation.id;
}
