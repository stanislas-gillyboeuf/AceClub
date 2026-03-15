import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { match, matchParticipant, matchLike } from "../../../db/schema/match/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";

export const toggleLike = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");
    const currentUser = c.get("user");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if match exists
    const [foundMatch] = await db
      .select({ id: match.id })
      .from(match)
      .where(eq(match.id, matchId))
      .limit(1);

    if (!foundMatch) {
      return c.json({ error: "Match not found" }, 404);
    }

    // Check if already liked
    const [existingLike] = await db
      .select({ id: matchLike.id })
      .from(matchLike)
      .where(and(eq(matchLike.matchId, matchId), eq(matchLike.userId, currentUser.id)))
      .limit(1);

    if (existingLike) {
      // Unlike
      await db.delete(matchLike).where(eq(matchLike.id, existingLike.id));

      const [{ count }] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(matchLike)
        .where(eq(matchLike.matchId, matchId));

      return c.json({ liked: false, likesCount: count });
    }

    // Like
    await db.insert(matchLike).values({
      matchId,
      userId: currentUser.id,
    });

    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(matchLike)
      .where(eq(matchLike.matchId, matchId));

    // Send notification to match participants (except the liker)
    const participants = await db
      .select({ userId: matchParticipant.userId })
      .from(matchParticipant)
      .where(eq(matchParticipant.matchId, matchId));

    const [likerInfo] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    const likerName = likerInfo?.name ?? "Quelqu'un";

    for (const participant of participants) {
      if (participant.userId !== currentUser.id) {
        sendNotificationToUser({
          userId: participant.userId,
          type: "match_liked",
          title: "Nouveau like",
          body: `${likerName} a aimé votre match`,
          referenceId: matchId,
          referenceType: "match",
        }).catch((err) => {
          console.error(`[ToggleLike] Failed to send notification to ${participant.userId}:`, err);
        });
      }
    }

    return c.json({ liked: true, likesCount: count });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
