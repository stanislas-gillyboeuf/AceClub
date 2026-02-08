import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchComment } from "../../../db/schema/match/schema";
import { eq, and } from "drizzle-orm";

export const deleteComment = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");
    const currentUser = c.get("user");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Find and delete the user's comment for this match
    const [deletedComment] = await db
      .delete(matchComment)
      .where(and(eq(matchComment.matchId, matchId), eq(matchComment.userId, currentUser.id)))
      .returning({ id: matchComment.id });

    if (!deletedComment) {
      return c.json({ error: "Comment not found" }, 404);
    }

    return c.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return c.json({ error: errorMessage }, 500);
  }
};
