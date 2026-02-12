import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user as userTable } from "../../../db/schema/auth/schema";
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from "../../../lib/cache";

export const me = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const cacheKey = CacheKeys.userMe(authUser!.id);
  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  const [user] = await db.select().from(userTable).where(eq(userTable.id, authUser!.id)).limit(1);

  const response = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
    banned: user.banned,
    banReason: user.banReason,
    banExpires: user.banExpires,
    onboardingCompleted: user.onboarding_completed,
    phoneNumber: user.phoneNumber,
  };

  await cacheSet(cacheKey, response, CacheTTL.SHORT);
  return c.json(response);
};
