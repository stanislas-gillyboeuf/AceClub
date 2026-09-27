import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { searchUsersValidator } from "../validators";
import { db } from "../../../db";
import { member, user, userPreference } from "../../../db/schema";
import { and, eq, ilike, inArray, not, or, sql } from "drizzle-orm";
import { TECHNICAL_EMAIL_LIKE } from "../../../lib/technical-email";
import { forbidden, isSuperAdmin, resolveClubId } from "../../../lib/club-access";
import { createAttemptLimiter } from "../../../lib/attempt-limiter";
import { classifySearchQuery, escapeLike, EXACT_SEARCHES_PER_HOUR } from "../../../lib/user-search";

// Exact lookups outside the club are the only way to reach someone from another club: rate limited.
const exactSearchLimiter = createAttemptLimiter({ max: EXACT_SEARCHES_PER_HOUR, windowMs: 60 * 60 * 1000 });

const publicFields = {
  id: user.id,
  name: user.name,
  image: user.image,
  isGhost: user.is_ghost,
};

/**
 * - Inside the active club: partial search by name (or exact email / phone), members only.
 * - Outside the club: an EXACT email or phone only, at most one result, name + photo + level (never
 *   the club nor contact details), 20 per hour per user.
 * - Platform super-admin: unscoped, as before.
 */
export const searchUsers = async (c: Context<HonoContext>) => {
  try {
    const currentUser = c.get("user")!;
    // @ts-ignore
    const validated = c.req.valid("query") as z.infer<typeof searchUsersValidator>;
    const parsed = classifySearchQuery(validated.query);
    if (parsed.kind === "empty") return c.json({ users: [], count: 0 });

    const resolution = await resolveClubId(currentUser, validated.organizationId);
    if ("error" in resolution && resolution.error === "forbidden") return forbidden(c);
    const clubId = "clubId" in resolution ? resolution.clubId : null;

    const identifierCondition =
      parsed.kind === "email"
        ? eq(sql`lower(${user.email})`, parsed.email)
        : parsed.kind === "phone"
          ? inArray(user.phoneNumber, parsed.candidates)
          : null;
    const textCondition =
      parsed.kind === "text"
        ? or(
            ilike(user.name, `%${escapeLike(parsed.text)}%`),
            and(ilike(user.email, `%${escapeLike(parsed.text)}%`), not(ilike(user.email, TECHNICAL_EMAIL_LIKE))),
          )
        : null;
    const matchCondition = identifierCondition ?? textCondition;
    if (!matchCondition) return c.json({ users: [], count: 0 });

    if (isSuperAdmin(currentUser)) {
      const users = await db
        .select(publicFields)
        .from(user)
        .where(and(matchCondition, eq(user.banned, false)))
        .limit(validated.limit);
      return c.json({ users, count: users.length });
    }

    if (clubId) {
      const clubUsers = await db
        .select(publicFields)
        .from(user)
        .innerJoin(member, and(eq(member.userId, user.id), eq(member.organizationId, clubId)))
        .where(and(matchCondition, eq(user.banned, false)))
        .limit(validated.limit);
      if (clubUsers.length > 0 || !identifierCondition) {
        return c.json({ users: clubUsers, count: clubUsers.length });
      }
    }

    // Not found in the club and the query is an exact identifier: one minimal result, rate limited.
    if (!identifierCondition) return c.json({ users: [], count: 0 });

    const attempt = exactSearchLimiter.hit(currentUser.id);
    if (!attempt.allowed) {
      c.header("Retry-After", String(attempt.retryAfterSeconds));
      return c.json({ error: "TooManyRequests", message: "Too many exact searches, try again later" }, 429);
    }

    const [found] = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        skillLevel: userPreference.skillLevel,
      })
      .from(user)
      .leftJoin(userPreference, eq(userPreference.userId, user.id))
      .where(and(identifierCondition, eq(user.banned, false), eq(user.is_ghost, false)))
      .limit(1);

    const users = found && found.id !== currentUser.id ? [{ ...found, isGhost: false }] : [];
    return c.json({ users, count: users.length });
  } catch (error) {
    return c.json({ error: "Internal server error", message: (error as Error).message }, 500);
  }
};
