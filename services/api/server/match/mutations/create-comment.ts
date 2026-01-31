import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createCommentValidator } from "../validators";
import { db } from "../../../db";
import { match, matchParticipant, matchComment } from "../../../db/schema/match/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and } from "drizzle-orm";

export const createComment = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");
    const currentUser = c.get("user");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof createCommentValidator>;

    // Check if match exists and is finished
    const [foundMatch] = await db
      .select({ id: match.id, status: match.status })
      .from(match)
      .where(eq(match.id, matchId))
      .limit(1);

    if (!foundMatch) {
      return c.json({ error: "Match not found" }, 404);
    }

    if (foundMatch.status !== "finished") {
      return c.json(
        { error: "Comments can only be added to finished matches" },
        400,
      );
    }

    // Check if user is a participant
    const [participant] = await db
      .select({ id: matchParticipant.id })
      .from(matchParticipant)
      .where(
        and(
          eq(matchParticipant.matchId, matchId),
          eq(matchParticipant.userId, currentUser.id),
        ),
      )
      .limit(1);

    if (!participant) {
      return c.json(
        { error: "Only match participants can add comments" },
        403,
      );
    }

    // Check if user already has a comment
    const [existingComment] = await db
      .select({ id: matchComment.id })
      .from(matchComment)
      .where(
        and(
          eq(matchComment.matchId, matchId),
          eq(matchComment.userId, currentUser.id),
        ),
      )
      .limit(1);

    if (existingComment) {
      return c.json(
        { error: "You already have a comment on this match" },
        409,
      );
    }

    // Get user info for denormalization
    const [userInfo] = await db
      .select({ name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    // Create the comment
    const [createdComment] = await db
      .insert(matchComment)
      .values({
        matchId,
        userId: currentUser.id,
        content: validated.content,
        userName: userInfo?.name || "Unknown",
        userImage: userInfo?.image,
      })
      .returning();

    return c.json(createdComment, 201);
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes("unique constraint")) {
      return c.json(
        { error: "You already have a comment on this match" },
        409,
      );
    }

    return c.json({ error: errorMessage }, 500);
  }
};
