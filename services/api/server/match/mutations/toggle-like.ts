import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { match, matchParticipant, matchLike } from "../../../db/schema/match/schema";
import { eq, and, ne, count } from "drizzle-orm";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";

export const toggleLike = async (c: Context<HonoContext>) => {
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

  const liked = !existingLike;

  if (existingLike) {
    await db.delete(matchLike).where(eq(matchLike.id, existingLike.id));
  } else {
    await db.insert(matchLike).values({
      matchId,
      userId: currentUser.id,
    });
  }

  const [{ likesCount }] = await db
    .select({ likesCount: count() })
    .from(matchLike)
    .where(eq(matchLike.matchId, matchId));

  // Send notification to match participants (except the liker) on like only
  if (liked) {
    const participants = await db
      .select({ userId: matchParticipant.userId })
      .from(matchParticipant)
      .where(
        and(eq(matchParticipant.matchId, matchId), ne(matchParticipant.userId, currentUser.id)),
      );

    const likerName = currentUser.name ?? "Quelqu'un";

    Promise.allSettled(
      participants.map((participant) =>
        sendNotificationToUser({
          userId: participant.userId,
          type: "match_liked",
          variables: { likerName },
          referenceId: matchId,
          referenceType: "match",
        }),
      ),
    ).catch((err) => {
      console.error("[ToggleLike] Failed to send notifications:", err);
    });
  }

  return c.json({ liked, likesCount });
};
