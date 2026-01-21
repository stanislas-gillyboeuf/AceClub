import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { match, matchParticipant, set, setScore } from "../../../db/schema/match/schema";
import { eq } from "drizzle-orm";

export const deleteMatch = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    // Delete match and all related data in an optimized transaction
    const result = await db.transaction(async (tx) => {
      // Check if match exists
      const existingMatch = await tx
        .select({ id: match.id })
        .from(match)
        .where(eq(match.id, matchId))
        .limit(1);

      if (existingMatch.length === 0) {
        throw new Error("Match not found");
      }

      // Get all sets for this match (single query)
      const matchSets = await tx
        .select({ id: set.id })
        .from(set)
        .where(eq(set.matchId, matchId));

      const setIds = matchSets.map(s => s.id);

      // Delete in correct order (respecting foreign key constraints)
      // 1. Delete set scores first (depends on sets)
      let deletedScoresCount = 0;
      if (setIds.length > 0) {
        // Use SQL for more efficient bulk delete
        const deletedScores = await tx
          .delete(setScore)
          .where(eq(setScore.setId, setIds[0]))
          .returning({ id: setScore.id });

        // If multiple sets, delete their scores too
        for (let i = 1; i < setIds.length; i++) {
          const moreDeleted = await tx
            .delete(setScore)
            .where(eq(setScore.setId, setIds[i]))
            .returning({ id: setScore.id });
          deletedScoresCount += moreDeleted.length;
        }
        deletedScoresCount += deletedScores.length;
      }

      // 2. Delete sets
      const deletedSets = await tx
        .delete(set)
        .where(eq(set.matchId, matchId))
        .returning({ id: set.id });

      // 3. Delete participants
      const deletedParticipants = await tx
        .delete(matchParticipant)
        .where(eq(matchParticipant.matchId, matchId))
        .returning({ id: matchParticipant.id });

      // 4. Delete match
      const deletedMatch = await tx
        .delete(match)
        .where(eq(match.id, matchId))
        .returning({ id: match.id });

      return {
        deletedMatch: deletedMatch[0],
        deletedCounts: {
          participants: deletedParticipants.length,
          sets: deletedSets.length,
          scores: deletedScoresCount,
        },
      };
    });

    return c.json({
      success: true,
      message: "Match deleted successfully",
      matchId: result.deletedMatch.id,
      deletedCounts: result.deletedCounts,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes("not found")) {
      return c.json({ error: errorMessage }, 404);
    }

    return c.json({ error: errorMessage }, 500);
  }
};
