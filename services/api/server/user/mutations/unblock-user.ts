import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userBlock } from "../../../db/schema";
import { unblockUserValidator } from "../validators";

export const unblockUser = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof unblockUserValidator>;

  await db
    .delete(userBlock)
    .where(and(eq(userBlock.blockerUserId, currentUser.id), eq(userBlock.blockedUserId, validated.userId)));

  return c.json({ success: true });
};
