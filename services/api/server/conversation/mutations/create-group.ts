import type { Context } from "hono";
import { z } from "zod";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { isOrgMember } from "../../../middleware/org-member";
import { generateConversationKey } from "../lib/generate-key";
import { createGroupValidator } from "../validators";

/** Any club member can create a manual group (v1: course groups stay exclusively automatic —
 * see course-group-sync.ts, never created from this route). */
export const createGroup = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createGroupValidator>;

  if (!(await isOrgMember(currentUser.id, validated.organizationId))) {
    return c.json({ error: "Forbidden", message: "Not a member of this club" }, 403);
  }

  const participantIds = [...new Set(validated.participantUserIds)].filter((id) => id !== currentUser.id);

  for (const userId of participantIds) {
    if (!(await isOrgMember(userId, validated.organizationId))) {
      return c.json(
        { error: "BadRequest", message: "Every participant must be a member of this club" },
        400,
      );
    }
  }

  const conversationId = ulid();
  const now = new Date();

  await db.insert(conversation).values({
    id: conversationId,
    type: "group",
    name: validated.name,
    organizationId: validated.organizationId,
    encryptionKey: generateConversationKey(),
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(conversationParticipant).values([
    { id: ulid(), conversationId, userId: currentUser.id, isAdmin: true, joinedAt: now },
    ...participantIds.map((userId) => ({
      id: ulid(),
      conversationId,
      userId,
      isAdmin: false,
      joinedAt: now,
    })),
  ]);

  return c.json({ conversationId }, 201);
};
