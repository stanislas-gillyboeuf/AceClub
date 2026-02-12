import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userE2eeKey } from "../../../db/schema/e2ee/schema";
import { eq } from "drizzle-orm";
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from "../../../lib/cache";

export const getPublicKey = async (c: Context<HonoContext>) => {
  const userId = c.req.param("userId");

  // Try cache first
  const cacheKey = CacheKeys.e2eePublicKey(userId);
  const cached = await cacheGet<{ userId: string; publicKey: string; keyVersion: number }>(cacheKey);
  if (cached) {
    return c.json(cached);
  }

  const [key] = await db
    .select({
      userId: userE2eeKey.userId,
      publicKey: userE2eeKey.publicKey,
      keyVersion: userE2eeKey.keyVersion,
    })
    .from(userE2eeKey)
    .where(eq(userE2eeKey.userId, userId))
    .limit(1);

  if (!key) {
    return c.json({ error: "NotFound", message: "No E2EE key found for this user" }, 404);
  }

  // Cache the result
  await cacheSet(cacheKey, key, CacheTTL.E2EE_KEY);

  return c.json(key);
};
