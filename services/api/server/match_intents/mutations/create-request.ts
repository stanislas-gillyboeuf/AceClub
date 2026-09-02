import { Context } from "hono";
import { z } from "zod";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchIntent, matchIntentTeammate, matchRequest, user, userPreference } from "../../../db/schema";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { member, organization } from "../../../db/schema/auth/schema";
import { and, eq, sql } from "drizzle-orm";
import { generateConversationKey } from "../../conversation/lib/generate-key";
import { insertSystemMessage } from "../../conversation/lib/insert-message";
import { createRequestValidator } from "../validators";

const PADEL_TEAM_SIZE = 3;

export const createRequest = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const matchIntentId = c.req.param("id");
    // @ts-ignore
    const { slotIndex } = c.req.valid("json") as z.infer<typeof createRequestValidator>;

    const [intent] = await db
      .select()
      .from(matchIntent)
      .where(and(eq(matchIntent.id, matchIntentId), eq(matchIntent.status, "pending")))
      .limit(1);

    if (!intent) {
      return c.json({ error: "NotFound", message: "Match intent not found or not available" }, 404);
    }
    if (intent.userId === userId) {
      return c.json({ error: "BadRequest", message: "Cannot request your own intent" }, 400);
    }

    let sport = intent.sport;
    if (!sport) {
      // Legacy row created before matchIntent.sport existed — fall back to the owner's
      // primary preference at the time.
      const [ownerPreference] = await db
        .select({ sport: userPreference.sport })
        .from(userPreference)
        .where(eq(userPreference.userId, intent.userId))
        .limit(1);
      sport = ownerPreference?.sport ?? "tennis";
    }

    if (sport === "tennis" && slotIndex != null) {
      return c.json({ error: "BadRequest", message: "Tennis requests don't target a slot" }, 400);
    }
    if (sport === "padel") {
      if (slotIndex == null || slotIndex < 0 || slotIndex >= PADEL_TEAM_SIZE) {
        return c.json({ error: "BadRequest", message: "A valid slotIndex is required for padel" }, 400);
      }
      const [taken] = await db
        .select({ id: matchIntentTeammate.id })
        .from(matchIntentTeammate)
        .where(and(eq(matchIntentTeammate.matchIntentId, matchIntentId), eq(matchIntentTeammate.slotIndex, slotIndex)))
        .limit(1);
      if (taken) {
        return c.json({ error: "Conflict", message: "Ce slot est déjà occupé" }, 409);
      }
    }

    // Avoid spamming duplicate requests if the user already asked for this same slot.
    const existingConditions = [
      eq(matchRequest.matchIntentId, matchIntentId),
      eq(matchRequest.requesterId, userId),
      eq(matchRequest.status, "pending"),
    ];
    if (slotIndex != null) existingConditions.push(eq(matchRequest.slotIndex, slotIndex));
    const [existingRequest] = await db
      .select()
      .from(matchRequest)
      .where(and(...existingConditions))
      .limit(1);

    let request = existingRequest;
    if (!request) {
      [request] = await db
        .insert(matchRequest)
        .values({
          matchIntentId,
          requesterId: userId,
          receiverId: intent.userId,
          slotIndex: slotIndex ?? null,
          status: "pending",
        })
        .returning();
    }

    // Find or create the 1:1 conversation between requester and intent owner.
    let conversationId: string;
    const [existingConversation] = await db
      .select({ id: conversation.id })
      .from(conversation)
      .where(
        and(
          sql`EXISTS (SELECT 1 FROM conversation_participant WHERE conversation_id = ${conversation.id} AND user_id = ${intent.userId})`,
          sql`EXISTS (SELECT 1 FROM conversation_participant WHERE conversation_id = ${conversation.id} AND user_id = ${userId})`,
          sql`(SELECT COUNT(*) FROM conversation_participant WHERE conversation_id = ${conversation.id}) = 2`,
        ),
      )
      .limit(1);

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const [newConversation] = await db
        .insert(conversation)
        .values({ type: "direct", encryptionKey: generateConversationKey() })
        .returning();
      conversationId = newConversation.id;
      await db.insert(conversationParticipant).values([
        { conversationId, userId: intent.userId },
        { conversationId, userId },
      ]);
    }

    const [requesterInfo] = await db.select({ name: user.name }).from(user).where(eq(user.id, userId)).limit(1);
    const requesterName = requesterInfo?.name ?? "Un joueur";

    const [requesterProfile] = await db
      .select({
        sport: userPreference.sport,
        skillLevel: userPreference.skillLevel,
        organizationName: organization.name,
      })
      .from(userPreference)
      .leftJoin(member, eq(userPreference.userId, member.userId))
      .leftJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(userPreference.userId, userId))
      .limit(1);

    const content =
      sport === "padel"
        ? `${requesterName} souhaite rejoindre en tant que Joueur ${(slotIndex ?? 0) + 2}`
        : `${requesterName} souhaite être ton partenaire`;

    const chatMessage = await insertSystemMessage({
      conversationId,
      senderId: userId,
      type: "match_request",
      content,
      matchRequestId: request.id,
      matchRequestInfo: {
        id: request.id,
        status: "pending",
        slotIndex: request.slotIndex ?? null,
        isReceiver: true,
        requesterSport: requesterProfile?.sport ?? null,
        requesterSkillLevel: requesterProfile?.skillLevel ?? null,
        requesterOrganizationName: requesterProfile?.organizationName ?? null,
      },
      notificationTitle: requesterName,
    });

    return c.json({ request, conversationId, message: chatMessage }, 201);
  } catch (error) {
    console.error("💥 [CREATE REQUEST] Error:", (error as Error).message);
    return c.json({ error: (error as Error).message }, 500);
  }
};
