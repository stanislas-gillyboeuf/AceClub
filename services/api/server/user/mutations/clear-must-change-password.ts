import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user } from "../../../db/schema/auth/schema";

// Called by the web login flow right after a forced first-login password change succeeds —
// clears the one-time flag set when an admin generates a temp password for someone.
export const clearMustChangePassword = async (c: Context<HonoContext>) => {
  const authUser = c.get("user")!;

  await db.update(user).set({ must_change_password: false }).where(eq(user.id, authUser.id));

  return c.json({ success: true });
};
