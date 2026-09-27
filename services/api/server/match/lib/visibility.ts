import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { member, matchParticipant, matchFeedback } from "../../../db/schema";
import { canViewMatchPure, isSuperAdmin, type AccessUser } from "../../../lib/club-access-core";
import { getUserClubIds } from "../../../lib/club-access";

/**
 * Batch form of `canViewMatch` (lib/club-access.ts): the same single rule (`canViewMatchPure`),
 * applied to many matches with three queries instead of three per match.
 */
export async function filterViewableMatchIds(
  viewer: AccessUser,
  matchIds: readonly string[],
): Promise<Set<string>> {
  if (matchIds.length === 0) return new Set();
  if (isSuperAdmin(viewer)) return new Set(matchIds);

  const [participants, hiddenRows, viewerClubIds] = await Promise.all([
    db
      .select({ matchId: matchParticipant.matchId, userId: matchParticipant.userId })
      .from(matchParticipant)
      .where(inArray(matchParticipant.matchId, [...matchIds])),
    db
      .select({ matchId: matchFeedback.matchId, userId: matchFeedback.userId })
      .from(matchFeedback)
      .where(and(inArray(matchFeedback.matchId, [...matchIds]), eq(matchFeedback.visibleToClub, false))),
    getUserClubIds(viewer.id),
  ]);

  const participantUserIds = [...new Set(participants.map((row) => row.userId))];
  const memberRows =
    participantUserIds.length === 0
      ? []
      : await db
          .select({ userId: member.userId, organizationId: member.organizationId })
          .from(member)
          .where(inArray(member.userId, participantUserIds));

  const clubsByUser = new Map<string, string[]>();
  for (const row of memberRows) {
    clubsByUser.set(row.userId, [...(clubsByUser.get(row.userId) ?? []), row.organizationId]);
  }

  const participantsByMatch = new Map<string, string[]>();
  for (const row of participants) {
    participantsByMatch.set(row.matchId, [...(participantsByMatch.get(row.matchId) ?? []), row.userId]);
  }
  const hiddenByMatch = new Map<string, Set<string>>();
  for (const row of hiddenRows) {
    const set = hiddenByMatch.get(row.matchId) ?? new Set<string>();
    set.add(row.userId);
    hiddenByMatch.set(row.matchId, set);
  }

  const viewable = new Set<string>();
  for (const matchId of matchIds) {
    const canView = canViewMatchPure(viewer, {
      participantIds: participantsByMatch.get(matchId) ?? [],
      participantClubIds: clubsByUser,
      hiddenFromClub: hiddenByMatch.get(matchId) ?? new Set<string>(),
      viewerClubIds,
    });
    if (canView) viewable.add(matchId);
  }
  return viewable;
}

/** Whether `viewerId` played a match with `targetId`, and whether they share a club. */
export async function relationBetween(
  viewerId: string,
  targetId: string,
): Promise<{ sharesMatch: boolean; sharesClub: boolean }> {
  const [viewerClubIds, targetClubIds, viewerMatches, targetMatches] = await Promise.all([
    getUserClubIds(viewerId),
    getUserClubIds(targetId),
    db.select({ matchId: matchParticipant.matchId }).from(matchParticipant).where(eq(matchParticipant.userId, viewerId)),
    db.select({ matchId: matchParticipant.matchId }).from(matchParticipant).where(eq(matchParticipant.userId, targetId)),
  ]);
  const viewerMatchIds = new Set(viewerMatches.map((row) => row.matchId));
  return {
    sharesMatch: targetMatches.some((row) => viewerMatchIds.has(row.matchId)),
    sharesClub: targetClubIds.some((clubId) => viewerClubIds.includes(clubId)),
  };
}
