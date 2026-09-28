import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { profileShareToken } from "../../../db/schema";
import { generateShareToken } from "../../../lib/profile-share-token";

/** Creates a new revocable share token. A user may hold several; the client keeps the latest. */
export const createProfileShareToken = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;

  const [created] = await db
    .insert(profileShareToken)
    .values({ userId: currentUser.id, token: generateShareToken() })
    .returning();

  return c.json(
    { token: created.token, deepLink: `aceclub://profile/${created.token}` },
    201,
  );
};
