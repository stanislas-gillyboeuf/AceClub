import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createMatchValidator } from "../validators";
import { db } from "../../../db";
import { match, matchParticipant, set, setScore } from "../../../db/schema/match/schema";
import { user } from "../../../db/schema/auth/schema";
import { NewSetScore } from "../../../db/schema/match/type";
import { eq, inArray } from "drizzle-orm";

export const createMatch = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof createMatchValidator>;

    // Business validation: exactly 2 participants
    if (validated.participants.length !== 2) {
      return c.json({
        error: "Invalid participants count",
        message: "A match must have exactly 2 participants"
      }, 400);
    }

    // Business validation: one home, one away
    const homePlayers = validated.participants.filter(p => p.side === "home");
    const awayPlayers = validated.participants.filter(p => p.side === "away");

    if (homePlayers.length !== 1 || awayPlayers.length !== 1) {
      return c.json({
        error: "Invalid sides",
        message: "Must have exactly one home and one away participant"
      }, 400);
    }

    // Business validation: unique user IDs
    const userIds = validated.participants.map(p => p.userId);
    if (new Set(userIds).size !== userIds.length) {
      return c.json({
        error: "Duplicate participants",
        message: "Each participant must be unique"
      }, 400);
    }

    // Business validation: at most one winner
    const winners = validated.participants.filter(p => p.isWinner);
    if (winners.length > 1) {
      return c.json({
        error: "Multiple winners",
        message: "A match can have at most one winner"
      }, 400);
    }

    // Business validation: sets consistency
    if (validated.sets.length === 0 || validated.sets.length > 5) {
      return c.json({
        error: "Invalid sets count",
        message: "A match must have between 1 and 5 sets"
      }, 400);
    }

    // Business validation: set numbers must be sequential starting from 1
    const setNumbers = validated.sets.map(s => s.setNumber).sort((a, b) => a - b);
    for (let i = 0; i < setNumbers.length; i++) {
      if (setNumbers[i] !== i + 1) {
        return c.json({
          error: "Invalid set numbers",
          message: `Set numbers must be sequential starting from 1. Expected ${i + 1}, got ${setNumbers[i]}`
        }, 400);
      }
    }

    // Business validation: each set must have scores for both participants
    for (const setData of validated.sets) {
      if (setData.scores.length !== 2) {
        return c.json({
          error: "Invalid scores count",
          message: `Set ${setData.setNumber} must have exactly 2 scores`
        }, 400);
      }

      const scoreUserIds = setData.scores.map(s => s.userId);
      if (!userIds.every(uid => scoreUserIds.includes(uid))) {
        return c.json({
          error: "Invalid score participants",
          message: `Set ${setData.setNumber} scores must match match participants`
        }, 400);
      }
    }

    // Business validation: score consistency (11 points to win, deuce rules)
    for (const setData of validated.sets) {
      const scores = setData.scores.map(s => s.score).sort((a, b) => b - a);
      const [higher, lower] = scores;

      // Winner must have at least 11 points
      if (higher < 11) {
        return c.json({
          error: "Invalid score",
          message: `Set ${setData.setNumber}: winning score must be at least 11 (got ${higher})`
        }, 400);
      }

      // If score is above 11, must win by 2 points (deuce rule)
      if (higher > 11 && (higher - lower) < 2) {
        return c.json({
          error: "Invalid score",
          message: `Set ${setData.setNumber}: must win by 2 points in deuce (${higher}-${lower})`
        }, 400);
      }

      // Winner must have exactly 2 points more than loser, or loser has max 9 points
      if (higher === 11 && lower >= 10) {
        return c.json({
          error: "Invalid score",
          message: `Set ${setData.setNumber}: invalid score combination (${higher}-${lower})`
        }, 400);
      }
    }

    const result = await db.transaction(async (tx) => {
      // Create match
      const [createdMatch] = await tx.insert(match).values({
        createdBy: validated.createdBy,
        status: validated.status,
        createdAt: new Date(validated.createdAt),
        startedAt: validated.startedAt ? new Date(validated.startedAt) : undefined,
        finishedAt: validated.finishedAt ? new Date(validated.finishedAt) : undefined,
      }).returning();

      // Create participants in batch
      const participants = await tx.insert(matchParticipant).values(
        validated.participants.map(participant => ({
          matchId: createdMatch.id,
          userId: participant.userId,
          side: participant.side,
          isWinner: participant.isWinner || false,
        }))
      ).returning();

      // Create lookup map for participants
      const participantMap = new Map(participants.map(p => [p.userId, p]));

      // Prepare all sets and scores for batch insert
      const setsToInsert = validated.sets.map(setData => ({
        matchId: createdMatch.id,
        setNumber: setData.setNumber as 1 | 2 | 3 | 4 | 5,
      }));

      // Insert all sets at once
      const matchSets = await tx.insert(set).values(setsToInsert).returning();

      // Create lookup map for sets
      const setMap = new Map<number, typeof matchSets[0]>(matchSets.map(s => [s.setNumber, s]));

      // Prepare all scores for batch insert
      const scoresToInsert: Array<NewSetScore> = [];

      for (const setData of validated.sets) {
        const currentSet = setMap.get(setData.setNumber as 1 | 2 | 3 | 4 | 5)!;

        for (const score of setData.scores) {
          const participant = participantMap.get(score.userId);
          if (!participant) {
            throw new Error(`Participant ${score.userId} not found in created participants`);
          }

          scoresToInsert.push({
            setId: currentSet.id,
            participantId: participant.id,
            games: score.score,
          });
        }
      }

      // Insert all scores at once
      const setScores = await tx.insert(setScore).values(scoresToInsert).returning();

      // Fetch participants with user details
      const participantIds = participants.map(p => p.id);
      const participantsWithUsers = await tx
        .select({
          id: matchParticipant.id,
          matchId: matchParticipant.matchId,
          userId: matchParticipant.userId,
          side: matchParticipant.side,
          isWinner: matchParticipant.isWinner,
          createdAt: matchParticipant.createdAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })
        .from(matchParticipant)
        .leftJoin(user, eq(matchParticipant.userId, user.id))
        .where(inArray(matchParticipant.id, participantIds));

      return {
        match: createdMatch,
        participants: participantsWithUsers,
        sets: matchSets,
        scores: setScores,
      };
    });

    return c.json(result, 201);
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Handle specific database errors
    if (errorMessage.includes("foreign key constraint")) {
      return c.json({
        error: "Invalid reference",
        message: "One or more referenced entities (user, match) do not exist"
      }, 400);
    }

    if (errorMessage.includes("unique constraint")) {
      return c.json({
        error: "Duplicate entry",
        message: "A participant is already registered for this match"
      }, 409);
    }

    return c.json({
      error: "Internal server error",
      message: errorMessage
    }, 500);
  }
};
