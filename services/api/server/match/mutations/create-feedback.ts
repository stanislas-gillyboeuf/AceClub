import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createFeedbackValidator } from "../validators";
import { db } from "../../../db";
import { match, matchParticipant, matchFeedback } from "../../../db/schema/match/schema";
import { eq, and } from "drizzle-orm";

export const createFeedback = async (c: Context<HonoContext>) => {
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
    const validated = c.req.valid("json") as z.infer<typeof createFeedbackValidator>;

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
      return c.json({ error: "Feedback can only be added to finished matches" }, 400);
    }

    // Check if user is a participant
    const [participant] = await db
      .select({ id: matchParticipant.id })
      .from(matchParticipant)
      .where(
        and(eq(matchParticipant.matchId, matchId), eq(matchParticipant.userId, currentUser.id)),
      )
      .limit(1);

    if (!participant) {
      return c.json({ error: "Only match participants can add feedback" }, 403);
    }

    // Check if user already has feedback
    const [existingFeedback] = await db
      .select({ id: matchFeedback.id })
      .from(matchFeedback)
      .where(and(eq(matchFeedback.matchId, matchId), eq(matchFeedback.userId, currentUser.id)))
      .limit(1);

    if (existingFeedback) {
      return c.json({ error: "You already have feedback on this match" }, 409);
    }

    // Create the feedback
    const [createdFeedback] = await db
      .insert(matchFeedback)
      .values({
        matchId,
        userId: currentUser.id,
        sensation: validated.sensation,
        comment: validated.comment,
        visibleToClub: validated.visibleToClub,
      })
      .returning();

    return c.json(createdFeedback, 201);
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes("unique constraint")) {
      return c.json({ error: "You already have feedback on this match" }, 409);
    }

    return c.json({ error: errorMessage }, 500);
  }
};
