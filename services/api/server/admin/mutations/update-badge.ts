import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { badge } from "../../../db/schema/reward/schema";
import { eq } from "drizzle-orm";
import { updateBadgeValidator } from "../validators";
import { z } from "zod";

export const updateBadge = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateBadgeValidator>;

  const [existing] = await db.select().from(badge).where(eq(badge.id, id)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Badge not found" }, 404);
  }

  const [updated] = await db
    .update(badge)
    .set(validated)
    .where(eq(badge.id, id))
    .returning();

  return c.json(updated);
};
