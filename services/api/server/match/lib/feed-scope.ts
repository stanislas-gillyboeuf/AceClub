/**
 * Pure rules for who may list what. No I/O: the routes load rows, these functions decide.
 */

export interface ParticipantClubPair {
  matchId: string;
  userId: string;
}

/**
 * A match appears in a club's feed when at least one of its participants belongs to that club and
 * did not turn `visibleToClub` off for it. Nobody outside the club ever sees it there.
 */
export function matchIdsPublishedInClub(
  clubParticipants: readonly ParticipantClubPair[],
  hidden: readonly ParticipantClubPair[],
): string[] {
  const hiddenKeys = new Set(hidden.map((pair) => `${pair.matchId}:${pair.userId}`));
  const published = new Set<string>();
  for (const pair of clubParticipants) {
    if (!hiddenKeys.has(`${pair.matchId}:${pair.userId}`)) published.add(pair.matchId);
  }
  return [...published];
}

export type ListScope =
  | { kind: "club"; organizationId: string }
  | { kind: "player"; userId: string }
  | { kind: "mine" }
  | { kind: "rejected"; reason: string };

/**
 * `organizationId` wins (membership is checked by the route); then `userId`; then "my matches".
 * Listing the whole platform (`participantOnly=false` with neither) is refused.
 */
export function resolveListScope(input: {
  organizationId?: string;
  userId?: string;
  participantOnly: boolean;
  viewerId: string;
}): ListScope {
  if (input.organizationId) return { kind: "club", organizationId: input.organizationId };
  if (input.userId && input.userId !== input.viewerId) return { kind: "player", userId: input.userId };
  if (input.userId === input.viewerId || input.participantOnly) return { kind: "mine" };
  return {
    kind: "rejected",
    reason: "organizationId is required to list matches you did not play",
  };
}

/** Another player's history: yourself, a co-participant of one of your matches, or a club mate. */
export function canViewPlayerHistory(input: {
  viewerId: string;
  targetId: string;
  isSuperAdmin: boolean;
  sharesMatch: boolean;
  sharesClub: boolean;
}): boolean {
  if (input.isSuperAdmin || input.viewerId === input.targetId) return true;
  return input.sharesMatch || input.sharesClub;
}
