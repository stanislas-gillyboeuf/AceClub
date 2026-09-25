import type { Context } from "hono";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { member, userPreference, matchParticipant, matchFeedback } from "../db/schema";
import { assertOrgAdmin } from "../middleware/org-member";
import type { HonoContext } from "../types/hono";
import { cacheDel, cacheGet, cacheInvalidatePrefix, cacheSet, CacheKeys, CacheTTL } from "./cache";
import {
  canSeeEvent as canSeeEventPure,
  canViewMatchPure,
  dedupeIds,
  getUserClubIdsWith,
  isSuperAdmin,
  resolveClubIdPure,
  type AccessUser,
  type ClubIdsDeps,
  type EventAccessInfo,
  type ResolvedClub,
} from "./club-access-core";

export { isSuperAdmin, type AccessUser, type ResolvedClub } from "./club-access-core";

const clubIdsDeps: ClubIdsDeps = {
  cacheGet: (key) => cacheGet<string[]>(key),
  cacheSet,
  loadFromDb: async (userId) => {
    const rows = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, userId));
    return rows.map((row) => row.organizationId);
  },
  key: CacheKeys.userClubIds,
  ttlSeconds: CacheTTL.SHORT,
};

/** Ids of every club the user belongs to (Redis, 60 s; deduplicated). */
export function getUserClubIds(userId: string): Promise<string[]> {
  return getUserClubIdsWith(userId, clubIdsDeps);
}

/** Drop the cached club list. Call after ANY write on `member` for that user. */
export async function invalidateUserClubIds(...userIds: Array<string | null | undefined>): Promise<void> {
  await Promise.all(
    dedupeIds(userIds.filter((id): id is string => !!id)).map((id) => cacheDel(CacheKeys.userClubIds(id))),
  );
}

/** For club deletion: every member's cached list is stale. */
export function invalidateAllUserClubIds(): Promise<void> {
  return cacheInvalidatePrefix(CacheKeys.PREFIX_USER_CLUBS);
}

export async function isMemberOfOrg(userId: string, organizationId: string): Promise<boolean> {
  return (await getUserClubIds(userId)).includes(organizationId);
}

/** Member of the club, or super-admin. Handlers answer 403 (club id given) with `forbidden(c)`. */
export async function assertCanViewOrg(user: AccessUser, organizationId: string): Promise<boolean> {
  if (isSuperAdmin(user)) return true;
  return isMemberOfOrg(user.id, organizationId);
}

/** Club a request is scoped to: explicit id (checked), else preferred club, else first club. */
export async function resolveClubId(
  user: AccessUser,
  requested?: string | null,
): Promise<ResolvedClub> {
  const clubIds = await getUserClubIds(user.id);
  let preferredOrgId: string | null = null;
  if (!requested) {
    const [pref] = await db
      .select({ organizationId: userPreference.organizationId })
      .from(userPreference)
      .where(eq(userPreference.userId, user.id))
      .limit(1);
    preferredOrgId = pref?.organizationId ?? null;
  }
  return resolveClubIdPure(user, requested, { clubIds, preferredOrgId });
}

export async function canSeeEvent(user: AccessUser, event: EventAccessInfo): Promise<boolean> {
  if (isSuperAdmin(user)) return true;
  const clubIds = await getUserClubIds(user.id);
  const isDraftOfMyClub =
    event.status === "draft" && event.organizationId !== null && clubIds.includes(event.organizationId);
  const isClubAdmin = isDraftOfMyClub
    ? await assertOrgAdmin(user.id, event.organizationId as string)
    : false;
  return canSeeEventPure(user, event, { clubIds, isClubAdmin });
}

/** Loads participants, their clubs and `visibleToClub`, then applies the single visibility rule. */
export async function canViewMatch(viewer: AccessUser, matchId: string): Promise<boolean> {
  if (isSuperAdmin(viewer)) return true;

  const participants = await db
    .select({ userId: matchParticipant.userId })
    .from(matchParticipant)
    .where(eq(matchParticipant.matchId, matchId));
  const participantIds = participants.map((row) => row.userId);
  if (participantIds.length === 0) return false;

  const viewerClubIds = await getUserClubIds(viewer.id);

  const [memberRows, feedbackRows] = await Promise.all([
    db
      .select({ userId: member.userId, organizationId: member.organizationId })
      .from(member)
      .where(inArray(member.userId, participantIds)),
    db
      .select({ userId: matchFeedback.userId })
      .from(matchFeedback)
      .where(and(eq(matchFeedback.matchId, matchId), eq(matchFeedback.visibleToClub, false))),
  ]);

  const participantClubIds = new Map<string, string[]>();
  for (const row of memberRows) {
    participantClubIds.set(row.userId, [...(participantClubIds.get(row.userId) ?? []), row.organizationId]);
  }

  return canViewMatchPure(viewer, {
    participantIds,
    participantClubIds,
    hiddenFromClub: new Set(feedbackRows.map((row) => row.userId)),
    viewerClubIds,
  });
}

// --- Responses (repo format `{ error, message }`) ---

/** A club id was given and the user is not in it. */
export const forbidden = (c: Context<HonoContext>) =>
  c.json({ error: "Forbidden", message: "You are not a member of this club" }, 403);

/** Access to a resource fetched by id is denied: do not reveal that it exists. */
export const notFound = (c: Context<HonoContext>) =>
  c.json({ error: "NotFound", message: "Not found" }, 404);
