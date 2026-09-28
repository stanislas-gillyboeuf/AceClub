import { Context } from "hono";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { profileShareToken, user, userPreference } from "../../../db/schema";
import { notFound } from "../../../lib/club-access";
import { isBlockedEitherWay } from "../../../lib/block";
import { getProfileByTokenValidator } from "../validators";

/**
 * Resolves a shareable profile link to its minimal public profile — name, photo, level only,
 * never the club or contact details. Requires a session (the scanner must be signed in, same as
 * "Add to match" / "Send message" from this profile). Invalid, revoked, banned, or blocked-either-
 * way all answer identically (404) — never reveal which.
 */
export const getProfileByToken = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const { token } = c.req.valid("query") as z.infer<typeof getProfileByTokenValidator>;

  const [row] = await db
    .select({
      userId: profileShareToken.userId,
      name: user.name,
      image: user.image,
      skillLevel: userPreference.skillLevel,
      banned: user.banned,
    })
    .from(profileShareToken)
    .innerJoin(user, eq(user.id, profileShareToken.userId))
    .leftJoin(userPreference, eq(userPreference.userId, profileShareToken.userId))
    .where(and(eq(profileShareToken.token, token), isNull(profileShareToken.revokedAt)))
    .limit(1);

  if (!row || row.banned) return notFound(c);
  if (await isBlockedEitherWay(currentUser.id, row.userId)) return notFound(c);

  return c.json({ id: row.userId, name: row.name, image: row.image, skillLevel: row.skillLevel ?? null });
};
