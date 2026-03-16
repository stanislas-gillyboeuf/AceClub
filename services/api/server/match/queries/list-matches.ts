import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { db } from "../../../db";
import {
  match,
  matchParticipant,
  set,
  setScore,
  matchComment,
  matchPhoto,
  matchFeedback,
  matchLike,
} from "../../../db/schema/match/schema";
import { user, member } from "../../../db/schema/auth/schema";
import { and, eq, desc, sql, inArray, notInArray, count } from "drizzle-orm";
import { listMatchesQueryValidator } from "../validators";

export const listMatches = async (c: Context<HonoContext>) => {
  try {
    const currentUser = c.get("user");
    const query = c.req.query();
    const validatedQuery = listMatchesQueryValidator.parse(query);

    const { status, userId, organizationId, participantOnly, page, limit } = validatedQuery;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status) {
      conditions.push(eq(match.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let matchIdsFilter: string[] | undefined;

    if (organizationId) {
      // Get all user IDs that are members of this organization
      const orgMembers = await db
        .select({ userId: member.userId })
        .from(member)
        .where(eq(member.organizationId, organizationId));

      const orgMemberUserIds = orgMembers.map((m) => m.userId);

      if (orgMemberUserIds.length === 0) {
        return c.json({
          matches: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      // Get all matches where at least 1 participant is a member of the organization
      const orgMatches = await db
        .select({ matchId: matchParticipant.matchId })
        .from(matchParticipant)
        .where(inArray(matchParticipant.userId, orgMemberUserIds));

      matchIdsFilter = [...new Set(orgMatches.map((m) => m.matchId))];

      if (matchIdsFilter.length === 0) {
        return c.json({
          matches: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      // Filter out matches where the current user set visibleToClub = false
      if (currentUser) {
        const hiddenFeedbacks = await db
          .select({ matchId: matchFeedback.matchId })
          .from(matchFeedback)
          .where(
            and(
              eq(matchFeedback.userId, currentUser.id),
              eq(matchFeedback.visibleToClub, false),
              inArray(matchFeedback.matchId, matchIdsFilter),
            ),
          );

        const hiddenMatchIds = new Set(hiddenFeedbacks.map((f) => f.matchId));
        if (hiddenMatchIds.size > 0) {
          matchIdsFilter = matchIdsFilter.filter((id) => !hiddenMatchIds.has(id));

          if (matchIdsFilter.length === 0) {
            return c.json({
              matches: [],
              pagination: { page, limit, total: 0, totalPages: 0 },
            });
          }
        }
      }
    } else {
      const filterUserId = userId || (participantOnly && currentUser ? currentUser.id : null);

      if (filterUserId) {
        const userMatches = await db
          .select({ matchId: matchParticipant.matchId })
          .from(matchParticipant)
          .where(eq(matchParticipant.userId, filterUserId));

        matchIdsFilter = userMatches.map((m) => m.matchId);

        if (matchIdsFilter.length === 0) {
          return c.json({
            matches: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }
      }
    }

    const finalWhereClause = matchIdsFilter
      ? and(whereClause, inArray(match.id, matchIdsFilter))
      : whereClause;

    const totalCountResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(match)
      .where(finalWhereClause);

    const total = Number(totalCountResult[0]?.count || 0);

    const matches = await db
      .select()
      .from(match)
      .where(finalWhereClause)
      .orderBy(desc(match.createdAt))
      .limit(limit)
      .offset(offset);

    if (matches.length === 0) {
      return c.json({
        matches: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const matchIds = matches.map((m) => m.id);

    const [participantsRaw, setsData, commentsRaw, photosData, likeCounts, userLikes] = await Promise.all([
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
        .where(inArray(matchParticipant.matchId, matchIds))
        .orderBy(matchParticipant.side),

      db
        .select({
          setId: set.id,
          matchId: set.matchId,
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
        .where(inArray(set.matchId, matchIds))
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
        .where(inArray(matchComment.matchId, matchIds))
        .orderBy(matchComment.createdAt),

      db
        .select()
        .from(matchPhoto)
        .where(inArray(matchPhoto.matchId, matchIds)),

      db
        .select({
          matchId: matchLike.matchId,
          count: count(),
        })
        .from(matchLike)
        .where(inArray(matchLike.matchId, matchIds))
        .groupBy(matchLike.matchId),

      currentUser
        ? db
            .select({ matchId: matchLike.matchId })
            .from(matchLike)
            .where(and(eq(matchLike.userId, currentUser.id), inArray(matchLike.matchId, matchIds)))
        : Promise.resolve([]),
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

    type ParticipantWithUser = (typeof participants)[number];
    const participantsByMatch = new Map<string, ParticipantWithUser[]>();
    for (const participant of participants) {
      if (!participantsByMatch.has(participant.matchId)) {
        participantsByMatch.set(participant.matchId, []);
      }
      participantsByMatch.get(participant.matchId)!.push(participant);
    }

    type PhotoRow = (typeof photosData)[number];
    const photosByMatch = new Map<string, PhotoRow[]>();
    for (const photo of photosData) {
      if (!photosByMatch.has(photo.matchId)) {
        photosByMatch.set(photo.matchId, []);
      }
      photosByMatch.get(photo.matchId)!.push(photo);
    }

    const commentsByMatch = new Map<string, typeof commentsRaw>();
    for (const comment of commentsRaw) {
      if (!commentsByMatch.has(comment.matchId)) {
        commentsByMatch.set(comment.matchId, []);
      }
      commentsByMatch.get(comment.matchId)!.push(comment);
    }

    const likeCountByMatch = new Map<string, number>();
    for (const row of likeCounts) {
      likeCountByMatch.set(row.matchId, row.count);
    }

    const userLikedMatchIds = new Set<string>();
    for (const like of userLikes) {
      userLikedMatchIds.add(like.matchId);
    }

    const setsByMatch = new Map<
      string,
      Map<
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
      >
    >();

    for (const row of setsData) {
      if (!setsByMatch.has(row.matchId)) {
        setsByMatch.set(row.matchId, new Map());
      }

      const matchSets = setsByMatch.get(row.matchId)!;

      if (!matchSets.has(row.setId)) {
        matchSets.set(row.setId, {
          id: row.setId,
          matchId: row.matchId,
          setNumber: row.setNumber,
          createdAt: row.setCreatedAt,
          scores: [],
        });
      }

      if (row.scoreId && row.participantId && row.participantUserId && row.participantSide) {
        matchSets.get(row.setId)!.scores.push({
          participantId: row.participantId,
          userId: row.participantUserId,
          side: row.participantSide,
          games: row.scoreGames || 0,
        });
      }
    }

    const matchesWithParticipants = matches.map((matchData) => {
      const matchSetsMap = setsByMatch.get(matchData.id);
      const sets = matchSetsMap ? Array.from(matchSetsMap.values()) : [];

      return {
        ...matchData,
        participants: participantsByMatch.get(matchData.id) || [],
        sets,
        photos: photosByMatch.get(matchData.id) || [],
        comments: commentsByMatch.get(matchData.id) || [],
        likesCount: likeCountByMatch.get(matchData.id) ?? 0,
        hasLiked: userLikedMatchIds.has(matchData.id),
      };
    });

    return c.json({
      matches: matchesWithParticipants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid query parameters", details: error.issues }, 400);
    }
    return c.json({ error: (error as Error).message }, 500);
  }
};
