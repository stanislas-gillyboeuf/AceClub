import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { updateFeedbackValidator } from "../validators";
import { db } from "../../../db";
import { matchFeedback } from "../../../db/schema/match/schema";
import { eq, and } from "drizzle-orm";

export const updateFeedback = async (c: Context<HonoContext>) => {
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
    const validated = c.req.valid("json") as z.infer<typeof updateFeedbackValidator>;

    // Find the user's feedback for this match
    const [existingFeedback] = await db
      .select()
      .from(matchFeedback)
      .where(and(eq(matchFeedback.matchId, matchId), eq(matchFeedback.userId, currentUser.id)))
      .limit(1);

    if (!existingFeedback) {
      return c.json({ error: "Feedback not found" }, 404);
    }

    // Build update data
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.sensation !== undefined) updateData.sensation = validated.sensation;
    if (validated.comment !== undefined) updateData.comment = validated.comment;
    if (validated.visibleToClub !== undefined) updateData.visibleToClub = validated.visibleToClub;

    // Update the feedback
    const [updatedFeedback] = await db
      .update(matchFeedback)
      .set(updateData)
      .where(eq(matchFeedback.id, existingFeedback.id))
      .returning();

    return c.json(updatedFeedback);
  } catch (error) {
    const errorMessage = (error as Error).message;
    return c.json({ error: errorMessage }, 500);
  }
};
