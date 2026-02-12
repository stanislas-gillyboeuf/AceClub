import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userE2eeKey } from "../../../db/schema/e2ee/schema";
import { eq, sql } from "drizzle-orm";
import { ulid } from "ulid";
import { cacheDel, cacheSet, CacheKeys, CacheTTL } from "../../../lib/cache";

export const uploadKeys = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { publicKey } = await c.req.json();

  // Upsert: insert or update existing key
  const [existing] = await db
    .select({ id: userE2eeKey.id })
    .from(userE2eeKey)
    .where(eq(userE2eeKey.userId, currentUser.id))
    .limit(1);

  const cacheKey = CacheKeys.e2eePublicKey(currentUser.id);

  if (existing) {
    const [updated] = await db
      .update(userE2eeKey)
      .set({
        publicKey,
        keyVersion: sql`${userE2eeKey.keyVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userE2eeKey.userId, currentUser.id))
      .returning();

    const result = { userId: updated.userId, publicKey: updated.publicKey, keyVersion: updated.keyVersion };

    // Invalidate old cache, set new one
    await cacheDel(cacheKey);
    await cacheSet(cacheKey, result, CacheTTL.E2EE_KEY);

    return c.json(result, 200);
  }

  const [created] = await db
    .insert(userE2eeKey)
    .values({
      id: ulid(),
      userId: currentUser.id,
      publicKey,
    })
    .returning();

  const result = { userId: created.userId, publicKey: created.publicKey, keyVersion: created.keyVersion };

  // Warm the cache immediately
  await cacheSet(cacheKey, result, CacheTTL.E2EE_KEY);

  return c.json(result, 201);
};
