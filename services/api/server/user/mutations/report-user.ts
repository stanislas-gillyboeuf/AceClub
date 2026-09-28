import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userReport } from "../../../db/schema";
import { reportUserValidator } from "../validators";

export const reportUser = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof reportUserValidator>;

  if (validated.userId === currentUser.id) {
    return c.json({ error: "BadRequest", message: "You cannot report yourself" }, 400);
  }

  try {
    const [created] = await db
      .insert(userReport)
      .values({
        reporterUserId: currentUser.id,
        reportedUserId: validated.userId,
        reason: validated.reason,
        context: validated.context ?? null,
      })
      .returning();

    return c.json(created, 201);
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23503") {
      return c.json({ error: "NotFound", message: "User not found" }, 404);
    }
    throw err;
  }
};
