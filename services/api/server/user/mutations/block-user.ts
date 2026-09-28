import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userBlock } from "../../../db/schema";
import { blockUserValidator } from "../validators";

export const blockUser = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof blockUserValidator>;

  if (validated.userId === currentUser.id) {
    return c.json({ error: "BadRequest", message: "You cannot block yourself" }, 400);
  }

  try {
    const [created] = await db
      .insert(userBlock)
      .values({ blockerUserId: currentUser.id, blockedUserId: validated.userId })
      .onConflictDoNothing()
      .returning();

    return c.json(created ?? { blockerUserId: currentUser.id, blockedUserId: validated.userId }, 201);
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23503") {
      return c.json({ error: "NotFound", message: "User not found" }, 404);
    }
    throw err;
  }
};
