/**
 * Pure club-access rules — no I/O, so they are unit-testable and shared by every route through
 * `lib/club-access.ts`. Users of several clubs see each club separately; a super-admin
 * (`user.role === "admin"`) bypasses every check here, in one place.
 */

export interface AccessUser {
  id: string;
  role?: string | null;
}

export const isSuperAdmin = (user: AccessUser): boolean => user.role === "admin";

export function dedupeIds(ids: readonly string[]): string[] {
  return [...new Set(ids.filter((id) => typeof id === "string" && id.length > 0))];
}

// --- Membership cache ---

export interface ClubIdsDeps {
  cacheGet: (key: string) => Promise<string[] | null>;
  cacheSet: (key: string, value: string[], ttlSeconds: number) => Promise<void>;
  loadFromDb: (userId: string) => Promise<string[]>;
  key: (userId: string) => string;
  ttlSeconds: number;
}

/** Cache-through read of a user's club ids, always deduplicated (`member` has no unique index). */
export async function getUserClubIdsWith(userId: string, deps: ClubIdsDeps): Promise<string[]> {
  const hit = await deps.cacheGet(deps.key(userId));
  if (hit) return dedupeIds(hit);
  const ids = dedupeIds(await deps.loadFromDb(userId));
  await deps.cacheSet(deps.key(userId), ids, deps.ttlSeconds);
  return ids;
}

// --- Club scope ---

export type ResolvedClub = { clubId: string } | { error: "forbidden" | "no_club" };

/**
 * The club a request is scoped to. An explicit `requested` id must be one of the user's clubs
 * (or the caller a super-admin) — never trusted on its own. Without one, fall back to the
 * user's preferred club, then their first club, so apps that don't send a club yet keep working.
 */
export function resolveClubIdPure(
  user: AccessUser,
  requested: string | null | undefined,
  ctx: { clubIds: readonly string[]; preferredOrgId?: string | null },
): ResolvedClub {
  if (requested) {
    if (isSuperAdmin(user) || ctx.clubIds.includes(requested)) return { clubId: requested };
    return { error: "forbidden" };
  }
  if (ctx.preferredOrgId && ctx.clubIds.includes(ctx.preferredOrgId)) {
    return { clubId: ctx.preferredOrgId };
  }
  if (ctx.clubIds.length > 0) return { clubId: ctx.clubIds[0] };
  return { error: "no_club" };
}

// --- Events ---

export interface EventAccessInfo {
  organizationId: string | null;
  status: string;
}

/**
 * An event attached to a club is visible only to that club's members, whatever its `visibility`
 * says: "public" only means something for an event with no organizationId. Drafts are further
 * limited to the club's admins (`isClubAdmin`), as before.
 */
export function canSeeEvent(
  user: AccessUser,
  event: EventAccessInfo,
  ctx: { clubIds: readonly string[]; isClubAdmin?: boolean },
): boolean {
  if (isSuperAdmin(user)) return true;
  if (event.organizationId === null) return event.status !== "draft";
  if (!ctx.clubIds.includes(event.organizationId)) return false;
  if (event.status === "draft") return ctx.isClubAdmin === true;
  return true;
}

// --- Matches ---

export interface MatchVisibilityData {
  participantIds: readonly string[];
  /** Clubs each participant belongs to. */
  participantClubIds: ReadonlyMap<string, readonly string[]>;
  /** Participants who set `matchFeedback.visibleToClub = false`. */
  hiddenFromClub: ReadonlySet<string>;
  viewerClubIds: readonly string[];
  /**
   * Participants who still owe an explicit cross-club confirmation
   * (`server/match/lib/confirmation.ts`). While any exists, the match is withheld from EVERY club
   * feed — a single unconfirmed participant is enough, regardless of whose club is looking —
   * though it always stays visible in the participants' own personal match views. Omitted (or
   * empty) by callers that don't track confirmation, so existing behavior is unaffected.
   */
  unconfirmedParticipantIds?: ReadonlySet<string>;
}

/**
 * The ONE rule for "who can see this match": its participants; a super-admin; and members of a
 * club that has a participant who kept the match visible to their club, provided no participant is
 * still owed a cross-club confirmation. It is deliberately the single place to extend later
 * ("partners") without touching the routes.
 */
export function canViewMatchPure(
  viewer: AccessUser,
  data: MatchVisibilityData,
): boolean {
  if (isSuperAdmin(viewer)) return true;
  if (data.participantIds.includes(viewer.id)) return true;
  if (data.unconfirmedParticipantIds?.size) {
    if (data.participantIds.some((id) => data.unconfirmedParticipantIds!.has(id))) return false;
  }
  for (const participantId of data.participantIds) {
    if (data.hiddenFromClub.has(participantId)) continue;
    const clubs = data.participantClubIds.get(participantId) ?? [];
    if (clubs.some((clubId) => data.viewerClubIds.includes(clubId))) return true;
  }
  return false;
}
