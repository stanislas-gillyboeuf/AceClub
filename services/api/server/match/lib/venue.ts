/**
 * Which club a new match is attached to. Deterministic (no "first club found"): a club both
 * players belong to (the creator's preferred one when it is common), otherwise the creator's
 * preferred club, otherwise their alphabetically first club.
 */
export function pickVenueOrganizationId(input: {
  participantIds: readonly string[];
  clubsByUser: ReadonlyMap<string, readonly string[]>;
  creatorId: string;
  creatorPreferredOrgId?: string | null;
}): string | null {
  const [firstId, secondId] = input.participantIds;
  const firstClubs = input.clubsByUser.get(firstId) ?? [];
  const secondClubs = input.clubsByUser.get(secondId) ?? [];
  const common = firstClubs.filter((clubId) => secondClubs.includes(clubId)).sort();

  const creatorClubs = [...(input.clubsByUser.get(input.creatorId) ?? [])].sort();
  const preferred = input.creatorPreferredOrgId ?? null;

  if (common.length > 0) {
    return preferred && common.includes(preferred) ? preferred : common[0];
  }
  if (preferred && creatorClubs.includes(preferred)) return preferred;
  return creatorClubs[0] ?? null;
}

/** An organization may be chosen as a match's venue only if one of the participants belongs to it. */
export function isAllowedVenue(
  organizationId: string | null,
  participantIds: readonly string[],
  clubsByUser: ReadonlyMap<string, readonly string[]>,
): boolean {
  if (organizationId === null) return true;
  return participantIds.some((id) => (clubsByUser.get(id) ?? []).includes(organizationId));
}
