import { Context } from "hono";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { profileShareToken } from "../../../db/schema";
import { revokeProfileShareTokenValidator } from "../validators";

/** Self-only, idempotent — a token that isn't mine or is already revoked just no-ops. */
export const revokeProfileShareToken = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const { token } = c.req.valid("json") as z.infer<typeof revokeProfileShareTokenValidator>;

  await db
    .update(profileShareToken)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(profileShareToken.token, token),
        eq(profileShareToken.userId, currentUser.id),
        isNull(profileShareToken.revokedAt),
      ),
    );

  return c.json({ success: true });
};
