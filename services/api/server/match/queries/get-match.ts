import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { match, matchParticipant, set, setScore, matchComment } from "../../../db/schema/match/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";

export const getMatch = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");

    if (!matchId) {
      return c.json({ error: "Match ID is required" }, 400);
    }

    const matchData = await db.select().from(match).where(eq(match.id, matchId)).limit(1);

    if (matchData.length === 0) {
      return c.json({ error: "Match not found" }, 404);
    }

    const foundMatch = matchData[0];

    const [participantsRaw, setsData, commentsRaw] = await Promise.all([
      db
        .select({
          id: matchParticipant.id,
          matchId: matchParticipant.matchId,
          userId: matchParticipant.userId,
          side: matchParticipant.side,
          isWinner: matchParticipant.isWinner,
          createdAt: matchParticipant.createdAt,
          user: user,
        })
        .from(matchParticipant)
        .leftJoin(user, eq(matchParticipant.userId, user.id))
        .where(eq(matchParticipant.matchId, matchId))
        .orderBy(matchParticipant.side),

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

      db
        .select({
          id: matchComment.id,
          matchId: matchComment.matchId,
          userId: matchComment.userId,
          content: matchComment.content,
          createdAt: matchComment.createdAt,
          updatedAt: matchComment.updatedAt,
          user: user,
        })
        .from(matchComment)
        .leftJoin(user, eq(matchComment.userId, user.id))
        .where(eq(matchComment.matchId, matchId))
        .orderBy(matchComment.createdAt),
    ]);

    const participants = participantsRaw.map((p) => ({
      id: p.id,
      matchId: p.matchId,
      userId: p.userId,
      side: p.side,
      isWinner: p.isWinner,
      createdAt: p.createdAt,
      user: p.user,
    }));

    const comments = commentsRaw.map((c) => ({
      id: c.id,
      matchId: c.matchId,
      userId: c.userId,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: c.user,
    }));

    // Group scores by set efficiently
    const setsMap = new Map<
      string,
      {
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
      }
    >();

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
      comments,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
