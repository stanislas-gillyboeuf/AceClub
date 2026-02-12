import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchFeedback } from "../../../db/schema/match/schema";
import { eq, and } from "drizzle-orm";

export const deleteFeedback = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");
    const currentUser = c.get("user");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Find and delete the user's feedback for this match
    const [deletedFeedback] = await db
      .delete(matchFeedback)
      .where(and(eq(matchFeedback.matchId, matchId), eq(matchFeedback.userId, currentUser.id)))
      .returning({ id: matchFeedback.id });

    if (!deletedFeedback) {
      return c.json({ error: "Feedback not found" }, 404);
    }

    return c.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return c.json({ error: errorMessage }, 500);
  }
};
