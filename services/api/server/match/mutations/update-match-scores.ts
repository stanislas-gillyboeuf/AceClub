import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { updateMatchScoresValidator } from "../validators";
import { db } from "../../../db";
import { match, matchParticipant, set, setScore } from "../../../db/schema/match/schema";
import { eq, and, inArray } from "drizzle-orm";

export const updateMatchScores = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");
    const currentUser = c.get("user");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is a participant of this match
    const [participant] = await db
      .select({ id: matchParticipant.id })
      .from(matchParticipant)
      .where(
        and(
          eq(matchParticipant.matchId, matchId),
          eq(matchParticipant.userId, currentUser.id)
        )
      )
      .limit(1);

    if (!participant) {
      return c.json(
        { error: "Only match participants can update scores" },
        403
      );
    }

    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof updateMatchScoresValidator>;

    // Update scores in an optimized transaction
    const result = await db.transaction(async (tx) => {
      // Check if match exists and is in a valid state for score updates
      const existingMatch = await tx
        .select({ id: match.id, status: match.status })
        .from(match)
        .where(eq(match.id, matchId))
        .limit(1);

      if (existingMatch.length === 0) {
        throw new Error("Match not found");
      }

      if (existingMatch[0].status === "finished") {
        throw new Error("Cannot update scores for a finished match");
      }

      // Get all sets and participants in parallel
      const setNumbers = validated.sets.map((s) => s.setNumber as 1 | 2 | 3 | 4 | 5);
      const userIds = [
        ...new Set(validated.sets.flatMap((s) => s.scores.map((score) => score.userId))),
      ];

      const [existingSets, participants] = await Promise.all([
        tx
          .select()
          .from(set)
          .where(
            and(
              eq(set.matchId, matchId),
              inArray(set.setNumber, setNumbers as readonly (1 | 2 | 3 | 4 | 5)[]),
            ),
          ),
        tx
          .select()
          .from(matchParticipant)
          .where(
            and(eq(matchParticipant.matchId, matchId), inArray(matchParticipant.userId, userIds)),
          ),
      ]);

      // Create missing sets if needed
      const existingSetNumbers = new Set(existingSets.map((s) => s.setNumber));
      const asSetNumber = (n: number) => n as 1 | 2 | 3 | 4 | 5;
      const setsToCreate = validated.sets
        .filter((s) => !existingSetNumbers.has(asSetNumber(s.setNumber)))
        .map((s) => ({
          matchId,
          setNumber: asSetNumber(s.setNumber),
        }));

      let newSets: typeof existingSets = [];
      if (setsToCreate.length > 0) {
        newSets = await tx.insert(set).values(setsToCreate).returning();
      }

      // Combine existing and new sets
      const allSets = [...existingSets, ...newSets];

      // Create lookup maps for better performance
      const setMap = new Map(allSets.map((s) => [s.setNumber, s]));
      const participantMap = new Map(participants.map((p) => [p.userId, p]));

      // Validate all participants exist
      for (const userId of userIds) {
        if (!participantMap.has(userId)) {
          throw new Error(`Participant ${userId} not found in match`);
        }
      }

      // Get all existing scores for these sets in one query
      const setIds = allSets.map((s) => s.id);
      const existingScores = await tx
        .select()
        .from(setScore)
        .where(inArray(setScore.setId, setIds));

      // Create a map of existing scores: setId-participantId -> scoreId
      const existingScoresMap = new Map(
        existingScores.map((score) => [`${score.setId}-${score.participantId}`, score.id]),
      );

      // Prepare batch operations
      const scoresToUpdate: Array<{ id: string; games: number }> = [];
      const scoresToInsert: Array<{ setId: string; participantId: string; games: number }> = [];

      for (const setData of validated.sets) {
        const currentSet = setMap.get(setData.setNumber as 1 | 2 | 3 | 4 | 5)!;

        for (const score of setData.scores) {
          const participant = participantMap.get(score.userId)!;
          const scoreKey = `${currentSet.id}-${participant.id}`;
          const existingScoreId = existingScoresMap.get(scoreKey);

          if (existingScoreId) {
            // Score exists, prepare for update
            scoresToUpdate.push({
              id: existingScoreId,
              games: score.score,
            });
          } else {
            // Score doesn't exist, prepare for insert
            scoresToInsert.push({
              setId: currentSet.id,
              participantId: participant.id,
              games: score.score,
            });
          }
        }
      }

      // Execute batch operations
      const updatedScores = [];

      // Batch update existing scores
      if (scoresToUpdate.length > 0) {
        for (const scoreUpdate of scoresToUpdate) {
          const updated = await tx
            .update(setScore)
            .set({ games: scoreUpdate.games })
            .where(eq(setScore.id, scoreUpdate.id))
            .returning();
          updatedScores.push(updated[0]);
        }
      }

      // Batch insert new scores
      if (scoresToInsert.length > 0) {
        const inserted = await tx.insert(setScore).values(scoresToInsert).returning();
        updatedScores.push(...inserted);
      }

      return updatedScores;
    });

    return c.json({
      success: true,
      updatedScoresCount: result.length,
      updatedScores: result,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Return appropriate status codes
    if (errorMessage.includes("not found")) {
      return c.json({ error: errorMessage }, 404);
    }
    if (errorMessage.includes("Cannot update scores")) {
      return c.json({ error: errorMessage }, 400);
    }

    return c.json({ error: errorMessage }, 500);
  }
};
