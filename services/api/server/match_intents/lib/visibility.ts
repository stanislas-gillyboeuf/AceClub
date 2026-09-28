/** Pure club-scoping rules for partner search (no I/O, unit tested). */

export function sharesClub(clubIdsA: string[], clubIdsB: string[]): boolean {
  const set = new Set(clubIdsA);
  return clubIdsB.some((id) => set.has(id));
}

export interface TeammateInfo {
  userId: string;
  isGhost: boolean;
  clubIds: string[];
}

/**
 * A padel teammate may be pre-filled if they exist and either share a club with the caller, are a
 * club-less ghost (a guest created from a match form), or already have an explicit direct relation
 * with the caller (a shared match, or an active direct conversation — see
 * server/user/lib/past-partners.ts `getDirectRelationUserIds`, e.g. someone added via a shared
 * profile link once a match/conversation exists). A real account of another club with none of
 * these is refused.
 */
export function invalidTeammateIds(
  requestedIds: string[],
  callerClubIds: string[],
  found: TeammateInfo[],
  directRelationIds: ReadonlySet<string> = new Set(),
): string[] {
  const byId = new Map(found.map((t) => [t.userId, t]));
  return requestedIds.filter((id) => {
    const t = byId.get(id);
    if (!t) return true;
    if (sharesClub(callerClubIds, t.clubIds)) return false;
    if (directRelationIds.has(id)) return false;
    return !(t.isGhost && t.clubIds.length === 0);
  });
}

/** An intent can be requested only by a member of a club of its owner (or the super-admin). */
export function canRequestIntent(input: {
  isSuperAdmin: boolean;
  requesterClubIds: string[];
  ownerClubIds: string[];
}): boolean {
  return input.isSuperAdmin || sharesClub(input.requesterClubIds, input.ownerClubIds);
}
