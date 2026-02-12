import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userE2eeKey } from "../../../db/schema/e2ee/schema";
import { eq } from "drizzle-orm";

export const getKeyBackup = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [key] = await db
    .select({
      encryptedPrivateKey: userE2eeKey.encryptedPrivateKey,
      backupSalt: userE2eeKey.backupSalt,
    })
    .from(userE2eeKey)
    .where(eq(userE2eeKey.userId, currentUser.id))
    .limit(1);

  if (!key || !key.encryptedPrivateKey) {
    return c.json({ error: "NotFound", message: "No key backup found" }, 404);
  }

  return c.json(key);
};
