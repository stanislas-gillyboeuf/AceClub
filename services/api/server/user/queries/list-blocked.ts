import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userBlock, user } from "../../../db/schema";

export const listBlocked = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      blockedAt: userBlock.createdAt,
    })
    .from(userBlock)
    .innerJoin(user, eq(user.id, userBlock.blockedUserId))
    .where(eq(userBlock.blockerUserId, currentUser.id));

  return c.json({ users: rows });
};
