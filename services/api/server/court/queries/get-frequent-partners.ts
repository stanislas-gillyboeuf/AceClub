import { Context } from "hono";
import { and, count, desc, eq, inArray, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchParticipant, member, user } from "../../../db/schema";
import { assertCanViewOrg, forbidden, getUserClubIds } from "../../../lib/club-access";

/**
 * Co-players the current user has shared the most matches with, most frequent first.
 * Self-join on match_participant over the matches the user took part in. Only partners who are
 * members of the requested club (or of one of the caller's clubs when none is given) are proposed.
 */
export const getFrequentPartners = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;

  const requestedOrganizationId = c.req.query("organizationId");
  let organizationIds: string[];
  if (requestedOrganizationId) {
    if (!(await assertCanViewOrg(currentUser, requestedOrganizationId))) return forbidden(c);
    organizationIds = [requestedOrganizationId];
  } else {
    organizationIds = await getUserClubIds(currentUser.id);
  }
  if (organizationIds.length === 0) return c.json([]);

  const mine = alias(matchParticipant, "mine");
  const other = alias(matchParticipant, "other");

  const rows = await db
    .select({
      userId: user.id,
      name: user.name,
      avatarUrl: user.image,
      sharedMatches: count(other.id),
    })
    .from(mine)
    .innerJoin(other, and(eq(other.matchId, mine.matchId), ne(other.userId, mine.userId)))
    .innerJoin(user, eq(user.id, other.userId))
    .where(
      and(
        eq(mine.userId, currentUser.id),
        inArray(
          other.userId,
          db.select({ userId: member.userId }).from(member).where(inArray(member.organizationId, organizationIds)),
        ),
      ),
    )
    .groupBy(user.id, user.name, user.image)
    .orderBy(desc(count(other.id)))
    .limit(4);

  return c.json(rows);
};
