import { Context } from "hono";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchParticipant, user } from "../../../db/schema";

/**
 * Co-players the current user has shared the most matches with, most frequent first.
 * Self-join on match_participant over the matches the user took part in.
 */
export const getFrequentPartners = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;

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
    .where(eq(mine.userId, currentUser.id))
    .groupBy(user.id, user.name, user.image)
    .orderBy(desc(count(other.id)))
    .limit(4);

  return c.json(rows);
};
