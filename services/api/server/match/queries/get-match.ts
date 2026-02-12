import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  match,
  matchParticipant,
  set,
  setScore,
  matchComment,
  matchFeedback,
} from "../../../db/schema/match/schema";
import { user, organization, member } from "../../../db/schema/auth/schema";
import { eq, and, inArray } from "drizzle-orm";

export const getMatch = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");
    const currentUser = c.get("user");

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

    // Fetch current user's feedback
    let myFeedback = null;
    if (currentUser) {
      const [feedback] = await db
        .select()
        .from(matchFeedback)
        .where(and(eq(matchFeedback.matchId, matchId), eq(matchFeedback.userId, currentUser.id)))
        .limit(1);
      myFeedback = feedback || null;
    }

    // Fetch venue organization if set
    let venueOrganization = null;
    if (foundMatch.venueOrganizationId) {
      const [org] = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          address: organization.address,
          latitude: organization.latitude,
          longitude: organization.longitude,
        })
        .from(organization)
        .where(eq(organization.id, foundMatch.venueOrganizationId))
        .limit(1);

      venueOrganization = org || null;
    }

    // Fetch participant organizations
    const participantUserIds = participants.map((p) => p.userId);
    const membershipRows = await db
      .select({
        userId: member.userId,
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          address: organization.address,
          latitude: organization.latitude,
          longitude: organization.longitude,
        },
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(inArray(member.userId, participantUserIds));

    // Group by userId, take first org per user
    const orgByUser = new Map<string, typeof membershipRows[0]["organization"]>();
    for (const row of membershipRows) {
      if (!orgByUser.has(row.userId)) {
        orgByUser.set(row.userId, row.organization);
      }
    }

    const participantOrganizations = Array.from(orgByUser.entries()).map(
      ([userId, org]) => ({ userId, organization: org }),
    );

    return c.json({
      match: foundMatch,
      participants,
      sets: setsWithScores,
      comments,
      myFeedback,
      venueOrganization,
      participantOrganizations,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
