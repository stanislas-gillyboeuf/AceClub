import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { badge } from "../../../db/schema/reward/schema";
import { createBadgeValidator } from "../validators";
import { z } from "zod";

export const createBadge = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createBadgeValidator>;

  const [created] = await db.insert(badge).values(validated).returning();

  return c.json(created, 201);
};
