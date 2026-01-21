import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { match, matchParticipant, set, setScore } from "../../../db/schema/match/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";

export const getMatch = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    // Get match with all related data in optimized queries
    const matchData = await db
      .select()
      .from(match)
      .where(eq(match.id, matchId))
      .limit(1);

    if (matchData.length === 0) {
      return c.json({ error: "Match not found" }, 404);
    }

    const foundMatch = matchData[0];

    // Get all related data in parallel for better performance
    const [participants, setsData] = await Promise.all([
      // Get participants with user details
      db
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
        .where(eq(matchParticipant.matchId, matchId))
        .orderBy(matchParticipant.side),

      // Get sets with scores in a single query using JOIN
      db
        .select({
          setId: set.id,
          setNumber: set.setNumber,
          setCreatedAt: set.createdAt,
          scoreId: setScore.id,
          scoreGames: setScore.games,
          participantId: matchParticipant.id,
          participantUserId: matchParticipant.userId,
          participantSide: matchParticipant.side,
        })
        .from(set)
        .leftJoin(setScore, eq(setScore.setId, set.id))
        .leftJoin(matchParticipant, eq(setScore.participantId, matchParticipant.id))
        .where(eq(set.matchId, matchId))
        .orderBy(set.setNumber),
    ]);

    // Group scores by set efficiently
    const setsMap = new Map<string, {
      id: string;
      matchId: string;
      setNumber: number;
      createdAt: Date;
      scores: Array<{
        participantId: string;
        userId: string;
        side: "home" | "away";
        games: number;
      }>;
    }>();

    for (const row of setsData) {
      if (!setsMap.has(row.setId)) {
        setsMap.set(row.setId, {
          id: row.setId,
          matchId: matchId,
          setNumber: row.setNumber,
          createdAt: row.setCreatedAt,
          scores: [],
        });
      }

      // Only add score if it exists (leftJoin might return null)
      if (row.scoreId && row.participantId && row.participantUserId && row.participantSide) {
        setsMap.get(row.setId)!.scores.push({
          participantId: row.participantId,
          userId: row.participantUserId,
          side: row.participantSide,
          games: row.scoreGames || 0,
        });
      }
    }

    const setsWithScores = Array.from(setsMap.values());

    return c.json({
      match: foundMatch,
      participants,
      sets: setsWithScores,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
