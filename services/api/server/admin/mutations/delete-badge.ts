import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { badge } from "../../../db/schema/reward/schema";
import { eq } from "drizzle-orm";

export const deleteBadge = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");

  const [existing] = await db.select().from(badge).where(eq(badge.id, id)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Badge not found" }, 404);
  }

  await db.update(badge).set({ isActive: false }).where(eq(badge.id, id));

  return c.json({ success: true });
};
