import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { updateCommentValidator } from "../validators";
import { db } from "../../../db";
import { matchComment } from "../../../db/schema/match/schema";
import { eq, and } from "drizzle-orm";

export const updateComment = async (c: Context<HonoContext>) => {
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
    const validated = c.req.valid("json") as z.infer<typeof updateCommentValidator>;

    // Find the user's comment for this match
    const [existingComment] = await db
      .select()
      .from(matchComment)
      .where(
        and(
          eq(matchComment.matchId, matchId),
          eq(matchComment.userId, currentUser.id),
        ),
      )
      .limit(1);

    if (!existingComment) {
      return c.json({ error: "Comment not found" }, 404);
    }

    // Update the comment
    const [updatedComment] = await db
      .update(matchComment)
      .set({
        content: validated.content,
        updatedAt: new Date(),
      })
      .where(eq(matchComment.id, existingComment.id))
      .returning();

    // Return with nested user structure
    return c.json({
      id: updatedComment.id,
      matchId: updatedComment.matchId,
      userId: updatedComment.userId,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
      user: {
        id: updatedComment.userId,
        name: updatedComment.userName,
        image: updatedComment.userImage,
      },
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return c.json({ error: errorMessage }, 500);
  }
};
