/**
 * "New member" (pays the entry fee) for a season. An explicit `clubMemberProfile.isNewMember`
 * wins; otherwise fall back to the heuristic "joined after the season started". The heuristic is
 * wrong for a freshly imported existing base (createdAt = import day), which is exactly why the
 * explicit flag exists.
 */
export function resolveIsNew(
  isNewMember: boolean | null | undefined,
  memberSince: Date,
  seasonStart: Date,
): boolean {
  return isNewMember ?? memberSince >= seasonStart;
}
