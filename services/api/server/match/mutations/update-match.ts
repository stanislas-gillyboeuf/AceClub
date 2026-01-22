import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { updateMatchValidator } from "../validators";
import { db } from "../../../db";
import { match } from "../../../db/schema/match/schema";
import { eq } from "drizzle-orm";

export const updateMatch = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof updateMatchValidator>;

    // Update in transaction for consistency
    const result = await db.transaction(async (tx) => {
      // Check if match exists
      const existingMatch = await tx.select().from(match).where(eq(match.id, matchId)).limit(1);

      if (existingMatch.length === 0) {
        throw new Error("Match not found");
      }

      const currentMatch = existingMatch[0];

      // Build update data with validation
      const updateData: Partial<{
        status: "scheduled" | "ongoing" | "finished";
        startedAt: Date | null;
        finishedAt: Date | null;
      }> = {};

      // Validate status transitions
      if (validated.status !== undefined) {
        // Validate allowed status transitions
        const currentStatus = currentMatch.status;

        // Cannot go back from finished
        if (currentStatus === "finished" && validated.status !== "finished") {
          throw new Error("Cannot change status of a finished match");
        }

        // Cannot skip from scheduled to finished without going through ongoing
        if (currentStatus === "scheduled" && validated.status === "finished") {
          throw new Error("Match must be 'ongoing' before it can be 'finished'");
        }

        updateData.status = validated.status;
      }

      // Handle startedAt
      if (validated.startedAt !== undefined) {
        updateData.startedAt = validated.startedAt ? new Date(validated.startedAt) : null;

        // Business validation: startedAt must be after createdAt
        if (updateData.startedAt && updateData.startedAt < currentMatch.createdAt) {
          throw new Error("startedAt cannot be before match creation date");
        }
      }

      // Handle finishedAt
      if (validated.finishedAt !== undefined) {
        updateData.finishedAt = validated.finishedAt ? new Date(validated.finishedAt) : null;

        // Business validation: finishedAt must be after startedAt
        const startedAt = updateData.startedAt ?? currentMatch.startedAt;
        if (updateData.finishedAt && startedAt && updateData.finishedAt < startedAt) {
          throw new Error("finishedAt cannot be before startedAt");
        }
      }

      // Business validation: status must be consistent with timestamps
      const finalStatus = updateData.status ?? currentMatch.status;
      const finalStartedAt =
        updateData.startedAt !== undefined ? updateData.startedAt : currentMatch.startedAt;
      const finalFinishedAt =
        updateData.finishedAt !== undefined ? updateData.finishedAt : currentMatch.finishedAt;

      if (finalStatus === "scheduled" && (finalStartedAt || finalFinishedAt)) {
        throw new Error("Scheduled matches cannot have startedAt or finishedAt timestamps");
      }

      if (finalStatus === "ongoing" && (!finalStartedAt || finalFinishedAt)) {
        throw new Error("Ongoing matches must have startedAt but not finishedAt");
      }

      if (finalStatus === "finished" && (!finalStartedAt || !finalFinishedAt)) {
        throw new Error("Finished matches must have both startedAt and finishedAt timestamps");
      }

      // Update match
      const [updatedMatch] = await tx
        .update(match)
        .set(updateData)
        .where(eq(match.id, matchId))
        .returning();

      return updatedMatch;
    });

    return c.json({
      success: true,
      match: result,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Handle specific errors with appropriate status codes
    if (errorMessage.includes("not found")) {
      return c.json({ error: errorMessage }, 404);
    }

    if (
      errorMessage.includes("Cannot change status") ||
      errorMessage.includes("must be") ||
      errorMessage.includes("cannot be before")
    ) {
      return c.json({ error: errorMessage }, 400);
    }

    // Handle database constraint errors
    if (errorMessage.includes("foreign key constraint")) {
      return c.json(
        {
          error: "Invalid reference",
          message: "Referenced entity does not exist",
        },
        400,
      );
    }

    return c.json(
      {
        error: "Internal server error",
        message: errorMessage,
      },
      500,
    );
  }
};
