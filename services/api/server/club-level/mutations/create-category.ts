import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubLevelCategory } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { createCategoryValidator } from "../validators";

export const createCategory = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createCategoryValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  try {
    const [created] = await db
      .insert(clubLevelCategory)
      .values({
        organizationId: validated.organizationId,
        sport: validated.sport,
        name: validated.name.trim(),
      })
      .returning();

    return c.json(created, 201);
  } catch (err: any) {
    if (err?.code === "23505") {
      return c.json({ error: "Conflict", message: "This category already exists" }, 409);
    }
    throw err;
  }
};
