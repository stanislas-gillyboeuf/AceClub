import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubTag } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { createTagValidator } from "../validators";

export const createTag = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createTagValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  try {
    const [created] = await db
      .insert(clubTag)
      .values({
        organizationId: validated.organizationId,
        name: validated.name.trim(),
      })
      .returning();

    return c.json(created, 201);
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23505") {
      return c.json({ error: "Conflict", message: "This tag already exists" }, 409);
    }
    throw err;
  }
};
