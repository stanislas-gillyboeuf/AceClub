import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { db } from "../../../db";
import { match, matchParticipant } from "../../../db/schema/match/schema";
import { user } from "../../../db/schema/auth/schema";
import { and, eq, desc, sql, inArray } from "drizzle-orm";

const listMatchesQuerySchema = z.object({
  status: z.enum(["scheduled", "ongoing", "finished"]).optional(),
  userId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const listMatches = async (c: Context<HonoContext>) => {
  try {
    const query = c.req.query();
    const validatedQuery = listMatchesQuerySchema.parse(query);

    const { status, userId, page, limit } = validatedQuery;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(match.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // If filtering by userId, get matching match IDs first (more efficient)
    let matchIdsFilter: string[] | undefined;
    if (userId) {
      const userMatches = await db
        .select({ matchId: matchParticipant.matchId })
        .from(matchParticipant)
        .where(eq(matchParticipant.userId, userId));

      matchIdsFilter = userMatches.map(m => m.matchId);

      // If user has no matches, return early
      if (matchIdsFilter.length === 0) {
        return c.json({
          matches: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }

    // Combine filters
    const finalWhereClause = matchIdsFilter
      ? and(whereClause, inArray(match.id, matchIdsFilter))
      : whereClause;

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(match)
      .where(finalWhereClause);

    const total = Number(totalCountResult[0]?.count || 0);

    // Get matches with pagination
    const matches = await db
      .select()
      .from(match)
      .where(finalWhereClause)
      .orderBy(desc(match.createdAt))
      .limit(limit)
      .offset(offset);

    // Return early if no matches
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

    // Get all participants for these matches in one query with user details
    const matchIds = matches.map(m => m.id);
    const participants = await db
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
      .where(inArray(matchParticipant.matchId, matchIds))
      .orderBy(matchParticipant.side);

    const participantsByMatch = new Map<string, typeof participants>();
    for (const participant of participants) {
      if (!participantsByMatch.has(participant.matchId)) {
        participantsByMatch.set(participant.matchId, []);
      }
      participantsByMatch.get(participant.matchId)!.push(participant);
    }

    // Build response
    const matchesWithParticipants = matches.map(matchData => ({
      ...matchData,
      participants: participantsByMatch.get(matchData.id) || [],
    }));

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
