import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userE2eeKey } from "../../../db/schema/e2ee/schema";
import { eq } from "drizzle-orm";

export const uploadKeyBackup = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { encryptedPrivateKey, backupSalt } = await c.req.json();

  // User must have uploaded their public key first
  const [existing] = await db
    .select({ id: userE2eeKey.id })
    .from(userE2eeKey)
    .where(eq(userE2eeKey.userId, currentUser.id))
    .limit(1);

  if (!existing) {
    return c.json(
      { error: "BadRequest", message: "Must upload public key before backing up private key" },
      400,
    );
  }

  await db
    .update(userE2eeKey)
    .set({
      encryptedPrivateKey,
      backupSalt,
      updatedAt: new Date(),
    })
    .where(eq(userE2eeKey.userId, currentUser.id));

  return c.json({ success: true });
};
